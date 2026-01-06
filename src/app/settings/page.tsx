import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
import SettingsForm from '@/components/settings/SettingsForm';
import TeamManager from '@/components/settings/TeamManager'; // Import the new component

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    // 1. Fetch User Profile to check Role
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // If user is pending, show a "Waiting" screen or redirect
    if (userProfile?.role === 'pending') {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-primary mb-4">lock_clock</span>
                <h1 className="text-2xl font-bold mb-2">Compte en attente de validation</h1>
                <p className="text-text-secondary max-w-md">
                    Votre demande d'accès a été envoyée à l'administrateur.
                    Vous recevrez un accès une fois votre rôle attribué.
                </p>
            </div>
        );
    }

    // 2. Fetch Workspace
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    // 3. Fetch All Profiles (Only if Admin)
    let allProfiles = [];
    if (userProfile?.role === 'admin') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        allProfiles = data || [];
    }

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased selection:bg-primary selection:text-black">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold">PARAMÈTRES</h2>
                        <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/10">
                            Rôle: <span className="text-primary uppercase">{userProfile?.role}</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[800px] mx-auto w-full flex flex-col gap-10">

                            {/* Show Team Manager ONLY to Admins */}
                            {userProfile?.role === 'admin' && (
                                <TeamManager profiles={allProfiles} currentUserId={user.id} />
                            )}

                            <SettingsForm workspace={workspace} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}