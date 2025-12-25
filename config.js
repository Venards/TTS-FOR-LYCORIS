// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdlefibbnAvbdZ86lPJAdUtifGPP7uQTE",
    authDomain: "tts-projet-fd867.firebaseapp.com",
    databaseURL: "https://tts-projet-fd867-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "tts-projet-fd867",
    storageBucket: "tts-projet-fd867.firebasestorage.app",
    messagingSenderId: "412421975876",
    appId: "1:412421975876:web:bae419fa68b429ba52f111"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}
