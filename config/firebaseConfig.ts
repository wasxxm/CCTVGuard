// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore, collection, QueryDocumentSnapshot, DocumentData, FirestoreDataConverter } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyApgQqh3bcs71anX1t0-3rdR6nLxdGLOek",
    authDomain: "cctvguard-46c04.firebaseapp.com",
    projectId: "cctvguard-46c04",
    storageBucket: "cctvguard-46c04.appspot.com",
    messagingSenderId: "513587419431",
    appId: "1:513587419431:web:eb3418cd778d523a587102",
    measurementId: "G-XRYBNE8N2V"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// // Firestore data converter
// const converter = <T>() => ({
//     toFirestore: (data: Partial<T>): DocumentData => data,
//     fromFirestore: (snap: QueryDocumentSnapshot): T => snap.data() as T
// });

// Firestore data converter
const converter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
    toFirestore: (data: T): DocumentData => data,
    fromFirestore: (snap: QueryDocumentSnapshot): T => snap.data() as T
});

// Typed Firestore collection function
const createCollection = <T extends DocumentData>(db: Firestore, collectionPath: string) => {
    return collection(db, collectionPath).withConverter(converter<T>());
};

export { db, createCollection };
