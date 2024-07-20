// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {initializeFirestore} from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// const analytics = getAnalytics(app);

export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});
