import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuración de Firebase (extraído de la versión anterior)
const firebaseConfig = {
  apiKey: "AIzaSyBTBThm-mVNiZegeOh3NSB82LAuxngHMlQ",
  authDomain: "fashioncollectionhn.firebaseapp.com",
  projectId: "fashioncollectionhn",
  storageBucket: "fashioncollectionhn.firebasestorage.app",
  messagingSenderId: "708344016118",
  appId: "1:708344016118:web:1efda662c75fed7f25d0d7",
  measurementId: "G-69R77Y9HMV"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const storage = getStorage(app)
