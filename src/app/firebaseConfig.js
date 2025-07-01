import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXyjDL1YFtjho68s5hmcUy4n_putgoXdU",
  authDomain: "reverse-social-app.firebaseapp.com",
  projectId: "reverse-social-app",
  storageBucket: "reverse-social-app.firebasestorage.app",
  messagingSenderId: "845141928150",
  appId: "1:845141928150:web:49349b76cdd1a934500177",
  measurementId: "G-RWXYKW5980"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default firebaseConfig;
