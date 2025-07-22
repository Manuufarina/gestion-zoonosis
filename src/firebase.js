import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ▼▼▼ PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyARsAA2twbbN8shB96gUH1le_MEfHg-L5E",
  authDomain: "gestion-zoonosis-san-isidro.firebaseapp.com",
  projectId: "gestion-zoonosis-san-isidro",
  storageBucket: "gestion-zoonosis-san-isidro.firebasestorage.app",
  messagingSenderId: "659840358297",
  appId: "1:659840358297:web:24b0c92240cf00299ee508"
};
// ▲▲▲ FIN DE TU CONFIGURACIÓN ▲▲▲

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);