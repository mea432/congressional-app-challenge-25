"use client";

import { useRouter } from 'next/navigation';
import { auth } from "@/app/firebaseConfig";
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