// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBI6ZK_iSrCr8kjVhyxabdvDZN5fBI-3pg",
    authDomain: "expenseflow-87325.firebaseapp.com",
    projectId: "expenseflow-87325",
    storageBucket: "expenseflow-87325.firebasestorage.app",
    messagingSenderId: "167732063060",
    appId: "1:167732063060:web:b19358797fa261c60fb6c1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
