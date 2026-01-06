import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
import ClientManager from '@/components/clients/ClientManager';

export default async function ClientsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: workspace } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).single();

    // ✅ FIX: Check if workspace exists before proceeding
    if (!workspace) {
        return null; // or redirect('/onboarding')
    }

    // Now TypeScript knows 'workspace' is not null
    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('workspace_id', workspace.id) // This works now
        .order('created_at', { ascending: false });

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />
                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">
                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold">GESTION CLIENTS</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1200px] mx-auto w-full">
                            {/* This also works now because workspace is verified */}
                            <ClientManager clients={clients || []} workspaceId={workspace.id} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}