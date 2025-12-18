import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// COLE AQUI SUAS CREDENCIAIS DO FIREBASE CONSOLE
const firebaseConfig = {
 apiKey: "AIzaSyBiQPXUAC4MoxXx5_MG4qaj9jclP2LCf1U",

  authDomain: "whatapp-b40b2.firebaseapp.com",

  projectId: "whatapp-b40b2",

  storageBucket: "whatapp-b40b2.firebasestorage.app",

  messagingSenderId: "84517813902",

  appId: "1:84517813902:web:702b5c20a47be6b86453df",

  measurementId: "G-TB923SNVYX"

};

// Fallback para evitar erro se não configurado
const config = Object.keys(firebaseConfig).length > 0 
  ? firebaseConfig 
  : { apiKey: "demo", projectId: "demo" }; 

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'default-app-id';