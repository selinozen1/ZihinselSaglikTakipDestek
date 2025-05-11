import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';

export class ProfileController {
  private db = getFirestore();
  private auth = getAuth();

  async updateUserProfile(userId: string, data: {
    displayName?: string;
    photoURL?: string;
    birthDate?: string;
    gender?: string;
    // Diğer profil alanları buraya eklenebilir
  }) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, data);

      // Firebase Auth profilini güncelle
      if (this.auth.currentUser) {
        await updateProfile(this.auth.currentUser, {
          displayName: data.displayName,
          photoURL: data.photoURL
        });
      }

      return { success: true, message: 'Profil başarıyla güncellendi' };
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw new Error('Profil güncellenirken bir hata oluştu');
    }
  }

  async getUserProfile(userId: string) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      return userDoc.data();
    } catch (error) {
      console.error('Profil bilgileri alınırken hata:', error);
      throw new Error('Profil bilgileri alınırken bir hata oluştu');
    }
  }
} 