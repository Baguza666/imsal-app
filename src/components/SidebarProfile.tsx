'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function SidebarProfile() {
    const [profile, setProfile] = useState<any>(null);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
        };

        fetchProfile();
    }, []);

    if (!profile) return <div className="h-12 w-full bg-white/5 animate-pulse rounded-xl"></div>;

    return (
        <div className="mt-auto pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center text-black font-bold text-sm">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-white text-sm font-bold truncate">
                        {profile.full_name || 'Utilisateur'}
                    </h4>
                    <p className="text-xs text-[#a1a1aa] truncate">
                        {profile.role || 'Membre'}
                    </p>
                </div>
            </div>
        </div>
    );
}