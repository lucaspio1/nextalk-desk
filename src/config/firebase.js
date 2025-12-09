import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// COLE AQUI SUAS CREDENCIAIS DO FIREBASE CONSOLE
const firebaseConfig = {
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // ...
};

// Fallback para evitar erro se não configurado
const config = Object.keys(firebaseConfig).length > 0 
  ? firebaseConfig 
  : { apiKey: "demo", projectId: "demo" }; 

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'default-app-id';