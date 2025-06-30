"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { useRouter } from 'next/navigation';

const firebaseConfig = {
  apiKey: "AIzaSyAmjMFeuGOHOQlWyjYEKxp-GBEZdaTeNlk",
  authDomain: "class-scribe-8f303.firebaseapp.com",
  projectId: "class-scribe-8f303",
  storageBucket: "class-scribe-8f303.firebasestorage.app",
  messagingSenderId: "702753380407",
  appId: "1:702753380407:web:afcb54477bb11cc39247b2",
  measurementId: "G-VN15QS9X5T",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
const auth = getAuth(app);
const db = getFirestore(app);

import { useEffect } from 'react';

const SignOutPage = () => {
    const router = useRouter();

    useEffect(() => {
        const signOutUser = async () => {
            await auth.signOut();
            router.push('/');
        };

        signOutUser();
    }, [router]);

    return null;
};

export default SignOutPage;