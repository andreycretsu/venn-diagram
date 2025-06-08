// Firebase configuration
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase if available
let db = null;
let isFirebaseEnabled = false;

if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        isFirebaseEnabled = true;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        isFirebaseEnabled = false;
    }
} else {
    console.log('Firebase SDK not loaded');
}

window.firebaseDB = db;
window.isFirebaseEnabled = isFirebaseEnabled; 