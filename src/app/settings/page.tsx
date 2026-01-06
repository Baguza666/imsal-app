'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
// ... other imports

export default function SettingsPage() {
    const { role, loading, isAdmin } = useUserRole();
    const router = useRouter();

    // 1. Protect the Page
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard'); // Kick them out if not Admin
        }
    }, [loading, isAdmin, router]);

    if (loading) return <div className="bg-black h-screen text-white p-10">Chargement...</div>;
    if (!isAdmin) return null; // Prevent flash of content

    return (
        // ... Your existing Settings Page Code ...
        <div className="...">
            {/* ... */}
        </div>
    );
}