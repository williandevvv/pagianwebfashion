// firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyBTBThm-mVNiZegeOh3NSB82LAuxngHMlQ",
    authDomain: "fashioncollectionhn.firebaseapp.com",
    projectId: "fashioncollectionhn",
    storageBucket: "fashioncollectionhn.firebasestorage.app",
    messagingSenderId: "708344016118",
    appId: "1:708344016118:web:1efda662c75fed7f25d0d7",
    measurementId: "G-69R77Y9HMV"
};

// Evitar inicialización duplicada
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    firebase.analytics?.();
}
