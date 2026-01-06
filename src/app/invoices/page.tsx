import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default async function InvoicesPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    // Fetch invoices (we'll assume the table exists, or show empty state)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*, client:clients(name)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold tracking-tight">MES FACTURES</h2>
                        <Link
                            href="/invoices/new"
                            className="bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90"
                        >
                            + CRÉER UNE FACTURE
                        </Link>
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1200px] mx-auto w-full">

                            {/* Empty State */}
                            {(!invoices || invoices.length === 0) ? (
                                <div className="text-center py-20 text-text-secondary glass-card rounded-2xl border border-white/5">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">receipt_long</span>
                                    <p>Aucune facture trouvée.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {/* We will add the list here later */}
                                    <p>Liste des factures ({invoices.length})</p>
                                </div>
                            )}

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}