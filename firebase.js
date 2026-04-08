import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0eCuuP8FH4gyiT856KAzhRUZy_DgZOwk",
  authDomain: "cybrly-vercel.firebaseapp.com",
  projectId: "cybrly-vercel",
  storageBucket: "cybrly-vercel.firebasestorage.app",
  messagingSenderId: "322035818477",
  appId: "1:322035818477:web:7de402099a6a372d0fd1e4",
};

const app = initializeApp(firebaseConfig);

export { app, firebaseConfig };
