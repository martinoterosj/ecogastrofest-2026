/**
 * ECOGASTROFEST 2026 - FIREBASE CONFIGURATION (ACTIVE & CONNECTED)
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCd3oq7AWSpwrM5KkDkvvKlXfXLDSUv_ro",
  authDomain: "ecogastrofest-2026.firebaseapp.com",
  databaseURL: "https://ecogastrofest-2026-default-rtdb.firebaseio.com",
  projectId: "ecogastrofest-2026",
  storageBucket: "ecogastrofest-2026.firebasestorage.app",
  messagingSenderId: "30768883257",
  appId: "1:30768883257:web:79a5d667d02cc0c1f3cfe8"
};

// Verifica si el usuario ya configuró credenciales válidas
function isFirebaseConfigured() {
  return FIREBASE_CONFIG && 
         FIREBASE_CONFIG.apiKey && 
         FIREBASE_CONFIG.apiKey.startsWith("AIzaSy") && 
         FIREBASE_CONFIG.projectId === "ecogastrofest-2026";
}
