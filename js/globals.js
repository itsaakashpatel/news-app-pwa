//Global constants
const FIRESTORE_DB_COLLECTION = "news";
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  //Initialize firebase config
  apiKey: "AIzaSyAgqiLCHyf8QYx5xDdHN_ngXTNT4qVHYKY",
  authDomain: "inbriefs-pwa.firebaseapp.com",
  projectId: "inbriefs-pwa",
  storageBucket: "inbriefs-pwa.appspot.com",
  messagingSenderId: "228649952918",
  appId: "1:228649952918:web:949f14d7b78e86f82504b7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  app,
  db,
  collection,
  addDoc,
  FIRESTORE_DB_COLLECTION,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
};
