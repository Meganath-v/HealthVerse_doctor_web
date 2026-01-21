import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAXBjNkNUxCsYupDx6Iqtr7LoKrCKx8hpg",
    authDomain: "healthcare-92dd8.firebaseapp.com",
    projectId: "healthcare-92dd8",
    storageBucket: "healthcare-92dd8.firebasestorage.app",
    messagingSenderId: "290923451140",
    appId: "1:290923451140:web:704cacb07746ef507b7651"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
