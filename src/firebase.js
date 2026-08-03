import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA82ROkukOIYXH8OOIlcVjcT_SzxTDUiQU",
  authDomain: "suoisap3.firebaseapp.com",
  projectId: "suoisap3",
  storageBucket: "suoisap3.firebasestorage.app",
  messagingSenderId: "270298316922",
  appId: "1:270298316922:web:11a5cc2a2b1781f5bdfbc3",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
