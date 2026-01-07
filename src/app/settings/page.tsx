'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Sidebar from '@/components/Sidebar';
import { useUserRole } from '@/hooks/useUserRole';
import TeamManager from '@/components/settings/TeamManager';
import EmailSettingsForm from '@/components/settings/EmailSettingsForm';

export default function SettingsPage() {
    const { role, loading, isAdmin } = useUserRole();
    const router = useRouter();

    // New State for TeamManager Props
    const [profiles, setProfiles] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState('');

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Security Check
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [loading, isAdmin, router]);

    // 2. Fetch Data for TeamManager
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            const { data } = await supabase.from('profiles').select('*');
            if (data) setProfiles(data);
        };

        if (isAdmin) fetchData();
    }, [isAdmin]);

    if (loading) return <div className="p-10 text-white">Chargement...</div>;
    if (!isAdmin) return null;

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold tracking-tight">PARAMÈTRES</h2>
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1000px] mx-auto w-full space-y-8">

                            {/* SECTION 1: TEAM MANAGEMENT */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-4">Gestion de l'équipe</h3>
                                {/* FIX: Pass the props it requires */}
                                <TeamManager profiles={profiles} currentUserId={currentUserId} />
                            </section>

                            {/* SECTION 2: EMAIL CONFIGURATION */}
                            <section>
                                <h3 className="text-lg font-bold text-white mb-4">Configuration Email</h3>
                                <p className="text-sm text-[#a1a1aa] mb-4">
                                    Connectez votre compte email pour envoyer les factures directement depuis l'application.
                                </p>
                                <EmailSettingsForm />
                            </section>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}