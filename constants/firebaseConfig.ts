// app/constants/firebaseConfig.ts
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyApgQqh3bcs71anX1t0-3rdR6nLxdGLOek",
    authDomain: "cctvguard-46c04.firebaseapp.com",
    projectId: "cctvguard-46c04",
    storageBucket: "cctvguard-46c04.appspot.com",
    messagingSenderId: "513587419431",
    appId: "1:513587419431:web:eb3418cd778d523a587102",
    measurementId: "G-XRYBNE8N2V"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const firestore = firebase.firestore();
