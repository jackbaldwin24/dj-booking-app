import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAXwMecZK4KPo7lZhOwRyGjhLmn7pkVtCE",
    authDomain: "dj-booking-app-bba74.firebaseapp.com",
    projectId: "dj-booking-app-bba74",
    storageBucket: "dj-booking-app-bba74.firebasestorage.app",
    messagingSenderId: "496258616973",
    appId: "1:496258616973:web:6c5a9369da674287e75cc4",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);