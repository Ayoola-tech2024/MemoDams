
"use client";
import { useRouter } from 'next/navigation';
// This file is intentionally left blank as it is no longer needed for the custom phone verification flow.
// You may delete this file.
export default function VerifyMfaPage() {
    const router = useRouter();
    if (typeof window !== 'undefined') {
        router.replace('/dashboard');
    }
    return null;
}
