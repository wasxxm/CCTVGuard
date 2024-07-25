import firebase from '@react-native-firebase/app';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

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

// Initialize Firebase if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig).then(() => {
        console.log('Firebase initialized');
    }).catch((error) => {
        console.error('Error initializing Firebase:', error);
    });
}

// Get Firestore instance
const db = firestore();

// Firestore data converter
interface FirestoreDataConverter<T> {
    toFirestore(data: T): FirebaseFirestoreTypes.DocumentData;
    fromFirestore(snapshot: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>): T;
}

const converter = <T>(): FirestoreDataConverter<T> => ({
    toFirestore: (data: T): FirebaseFirestoreTypes.DocumentData => data as FirebaseFirestoreTypes.DocumentData,
    fromFirestore: (snap: FirebaseFirestoreTypes.QueryDocumentSnapshot): T => snap.data() as T,
});

// Typed Firestore collection function
const createCollection = <T>(collectionPath: string) => {
    const collectionRef = db.collection(collectionPath);
    return {
        withConverter: () => {
            return {
                add: (data: T) => collectionRef.add(converter<T>().toFirestore(data)),
                doc: (id: string) => {
                    const docRef = collectionRef.doc(id);
                    return {
                        get: async () => {
                            const docSnap = await docRef.get();
                            return docSnap.exists ? converter<T>().fromFirestore(docSnap) : null;
                        },
                        set: (data: T) => docRef.set(converter<T>().toFirestore(data)),
                        update: (data: Partial<T>) => {
                            const convertedData = Object.keys(data).reduce((acc, key) => {
                                acc[key] = (data as any)[key];
                                return acc;
                            }, {} as FirebaseFirestoreTypes.DocumentData);
                            return docRef.update(convertedData);
                        },
                        delete: () => docRef.delete()
                    };
                }
            };
        }
    };
};

export { db, createCollection };
