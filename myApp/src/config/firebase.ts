import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase yapılandırma bilgileriniz
const firebaseConfig = {
  apiKey: "AIzaSyDMio-30ktPaZE-CbrCsyXTVUW7L1w-Cks",
  authDomain: "mentalhealth-7cd68.firebaseapp.com",
  projectId: "mentalhealth-7cd68",
  storageBucket: "mentalhealth-7cd68.firebasestorage.app",
  messagingSenderId: "526534931192",
  appId: "1:526534931192:web:d27cb5a4bd8bb6da4e410d",
  measurementId: "G-XS5C3766DC"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Auth ve Firestore örneklerini al
const auth = getAuth(app); 
const db = getFirestore(app);

export { db, auth }; 