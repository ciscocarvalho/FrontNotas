import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDEQKqVzw0rpARdZgouznNqdFKLBE_Rqh8",
    authDomain: "postdate-8f1b2.firebaseapp.com",
    projectId: "postdate-8f1b2",
    storageBucket: "postdate-8f1b2.appspot.com",
    messagingSenderId: "92053137977",
    appId: "1:92053137977:web:7f68bb30f663d3a45ebbe8"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };