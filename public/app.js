import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Login dengan Google
document.getElementById("google-login").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("User logged in:", result.user);
  } catch (error) {
    console.error("Login failed:", error);
  }
});

// Upload berkas perkara
document.getElementById("upload-btn").addEventListener("click", async () => {
  const fileInput = document.getElementById("upload-case");
  const file = fileInput.files[0];
  if (!file) return alert("No file selected!");

  const fileRef = ref(storage, `cases/${file.name}`);
  await uploadBytes(fileRef, file);
  alert("File uploaded!");
});

