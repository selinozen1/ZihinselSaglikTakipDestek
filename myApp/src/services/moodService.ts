import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Mood, MoodSummary } from '../models/Mood';

class MoodService {
  private readonly COLLECTION_NAME = 'moods';

  // Yeni ruh hali kaydı ekle
  async addMood(mood: Mood): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...mood,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error: unknown) {
      console.error('Ruh hali eklenirken hata oluştu:', error);
      throw error;
    }
  }

  // Ruh hali kaydını güncelle
  async updateMood(id: string, mood: Partial<Mood>): Promise<void> {
    try {
      const moodRef = doc(db, this.COLLECTION_NAME, id);
      await updateDoc(moodRef, {
        ...mood,
        updatedAt: Timestamp.fromDate(new Date())
      });
    } catch (error: unknown) {
      console.error('Ruh hali güncellenirken hata oluştu:', error);
      throw error;
    }
  }

  // Ruh hali kaydını sil
  async deleteMood(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, id));
    } catch (error: unknown) {
      console.error('Ruh hali silinirken hata oluştu:', error);
      throw error;
    }
  }

  // Kullanıcının son 7 günlük ruh hali kayıtlarını getir
  async getWeeklyMoods(userId: string): Promise<Mood[]> {
    try {
      if (!userId) {
        console.warn('Kullanıcı ID\'si eksik');
        return [];
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const moodCollection = collection(db, this.COLLECTION_NAME);
      const q = query(
        moodCollection,
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.info('Son 7 günde kayıtlı ruh hali verisi bulunamadı');
        return [];
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        updatedAt: doc.data().updatedAt.toDate().toISOString()
      })) as Mood[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Haftalık ruh hali kayıtları getirilirken hata:', error.message);
        if (error.message.includes('requires an index')) {
          console.error('Firebase indeksi gerekiyor. Lütfen Firebase konsolundan indeks oluşturun.');
        }
      }
      return [];
    }
  }

  // Kullanıcının son 30 günlük ruh hali kayıtlarını getir
  async getMonthlyMoods(userId: string): Promise<Mood[]> {
    try {
      if (!userId) {
        console.warn('Kullanıcı ID\'si eksik');
        return [];
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const moodCollection = collection(db, this.COLLECTION_NAME);
      const q = query(
        moodCollection,
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.info('Son 30 günde kayıtlı ruh hali verisi bulunamadı');
        return [];
      }

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
        updatedAt: doc.data().updatedAt.toDate().toISOString()
      })) as Mood[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Aylık ruh hali kayıtları getirilirken hata:', error.message);
        if (error.message.includes('requires an index')) {
          console.error('Firebase indeksi gerekiyor. Lütfen Firebase konsolundan indeks oluşturun.');
        }
      }
      return [];
    }
  }

  // Ruh hali özeti oluştur
  calculateMoodSummary(data: Mood[]): MoodSummary {
    if (!data || data.length === 0) {
      return {
        totalEntries: 0,
        moodDistribution: {
          'Çok İyi': 0,
          'İyi': 0,
          'Normal': 0,
          'Kötü': 0,
          'Çok Kötü': 0
        },
        averageMood: 0,
        mostCommonTags: [],
        lastUpdated: new Date().toISOString()
      };
    }

    const moodValues = {
      'Çok İyi': 5,
      'İyi': 4,
      'Normal': 3,
      'Kötü': 2,
      'Çok Kötü': 1
    };

    const moodCounts = {
      'Çok İyi': 0,
      'İyi': 0,
      'Normal': 0,
      'Kötü': 0,
      'Çok Kötü': 0
    };

    const tagCounts: { [key: string]: number } = {};
    let totalMoodValue = 0;

    data.forEach(item => {
      moodCounts[item.mood]++;
      totalMoodValue += moodValues[item.mood];

      if (item.tags) {
        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const mostCommonTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      totalEntries: data.length,
      moodDistribution: moodCounts,
      averageMood: totalMoodValue / data.length,
      mostCommonTags,
      lastUpdated: data[0].updatedAt
    };
  }

  // Veri doğrulama yardımcı fonksiyonu
  private validateMoodData(data: Partial<Mood>) {
    if (data.mood && !['Çok İyi', 'İyi', 'Normal', 'Kötü', 'Çok Kötü'].includes(data.mood)) {
      throw new Error('Geçersiz ruh hali değeri');
    }
    if (data.note && data.note.length > 500) {
      throw new Error('Not 500 karakterden uzun olamaz');
    }
    if (data.tags && data.tags.length > 10) {
      throw new Error('En fazla 10 etiket eklenebilir');
    }
  }
}

export default new MoodService(); 