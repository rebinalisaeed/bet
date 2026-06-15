import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2ENjViKDRHwwBUGTjrDJMrnrQePGhDqY",
  authDomain: "kurdliga1.firebaseapp.com",
  databaseURL: "https://kurdliga1-default-rtdb.firebaseio.com",
  projectId: "kurdliga1",
  storageBucket: "kurdliga1.firebasestorage.app",
  messagingSenderId: "799164130957",
  appId: "1:799164130957:web:a3ff5ec1ccb026ca59a4c4",
  measurementId: "G-8TCVRT6GNK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
