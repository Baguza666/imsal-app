import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
import ClientsList from '@/components/clients/ClientsList'; // Ensure this path is correct

export default async function ClientsPage() {
    // 1. Setup Supabase with Cookies (Crucial for Auth)
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // 2. Check if User is Logged In
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    // 3. Fetch Clients (Now fully authenticated)
    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) console.error("Error fetching clients:", error);

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold tracking-tight">MES CLIENTS</h2>
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1200px] mx-auto w-full">
                            {/* Pass the data to the List Component */}
                            <ClientsList initialClients={clients || []} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}