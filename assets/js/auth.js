import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function protectPage(){
  onAuthStateChanged(auth, user => { if(!user) location.href='login.html'; });
}

export function redirectIfLoggedIn(){
  onAuthStateChanged(auth, user => { if(user) location.href='home.html'; });
}

export async function registerUser(username,email,password){
  const cred = await createUserWithEmailAndPassword(auth,email,password);
  await setDoc(doc(db,'users',cred.user.uid),{
    username,email,points:1000,rank:0,badges:[],avatar:'',isAdmin:false,createdAt:serverTimestamp()
  });
  location.href='home.html';
}

export async function loginUser(email,password){
  await signInWithEmailAndPassword(auth,email,password);
  location.href='home.html';
}

export async function logoutUser(){ await signOut(auth); location.href='login.html'; }

export async function getCurrentUserData(){
  const user = auth.currentUser;
  if(!user) return null;
  const snap = await getDoc(doc(db,'users',user.uid));
  return { uid:user.uid, ...snap.data() };
}
