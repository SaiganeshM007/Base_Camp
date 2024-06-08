// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCA9m0uhecZKZTHJOXSngrxzhM8C-pxj-c",
  authDomain: "basecamp-4e486.firebaseapp.com",
  projectId: "basecamp-4e486",
  storageBucket: "basecamp-4e486.appspot.com",
  messagingSenderId: "583903998231",
  appId: "1:583903998231:web:435607ec8880030cb7c752",
  measurementId: "G-Q3RB924DS5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Enable session persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence enabled");
  })
  .catch((error) => {
    console.error("Error enabling session persistence:", error);
  });

export { auth, db };
