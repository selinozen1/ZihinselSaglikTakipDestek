import { db } from '../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

class FirebaseService {
  private auth = getAuth();

  // Kullanıcı kaydı
  async register(email: string, password: string, name: string) {
    try {
      // Authentication ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Firestore'a kullanıcı bilgilerini kaydet
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        name: name,
        createdAt: new Date().toISOString()
      });

      return user;
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      throw this.handleAuthError(error);
    }
  }

  // Kullanıcı girişi
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      throw this.handleAuthError(error);
    }
  }

  // Çıkış yap
  async logout() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  }

  // Hata mesajlarını Türkçeleştir
  private handleAuthError(error: any) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new Error('Bu e-posta adresi zaten kullanımda');
      case 'auth/invalid-email':
        throw new Error('Geçersiz e-posta adresi');
      case 'auth/operation-not-allowed':
        throw new Error('Bu işlem şu anda kullanılamıyor');
      case 'auth/weak-password':
        throw new Error('Şifre çok zayıf');
      case 'auth/user-disabled':
        throw new Error('Bu hesap devre dışı bırakılmış');
      case 'auth/user-not-found':
        throw new Error('Kullanıcı bulunamadı');
      case 'auth/wrong-password':
        throw new Error('Yanlış şifre');
      case 'auth/invalid-credential':
        throw new Error('Geçersiz e-posta veya şifre');
      default:
        throw new Error('Bir hata oluştu, lütfen tekrar deneyin');
    }
  }

  // Yeni bir döküman ekle
  async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error('Döküman eklenirken hata oluştu:', error);
      throw error;
    }
  }

  // Tüm dökümanları getir
  async getDocuments(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Dökümanlar getirilirken hata oluştu:', error);
      throw error;
    }
  }

  // Belirli bir dökümanı güncelle
  async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error('Döküman güncellenirken hata oluştu:', error);
      throw error;
    }
  }

  // Belirli bir dökümanı sil
  async deleteDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Döküman silinirken hata oluştu:', error);
      throw error;
    }
  }

  // Belirli bir koşula göre dökümanları getir
  async getDocumentsByCondition(collectionName: string, field: string, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, '==', value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Koşullu dökümanlar getirilirken hata oluştu:', error);
      throw error;
    }
  }
}

export default new FirebaseService(); 