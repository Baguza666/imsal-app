import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import SendInvoiceButton from '@/components/invoices/SendInvoiceButton';

export default async function InvoicesPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // 1. Check User Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    // 2. Fetch Invoices with Client Data (Name & Email)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('*, client:clients(name, email)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    {/* Header */}
                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold tracking-tight">MES FACTURES</h2>
                        <Link
                            href="/invoices/new"
                            className="bg-primary text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            CRÉER UNE FACTURE
                        </Link>
                    </header>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1200px] mx-auto w-full">

                            {/* Empty State */}
                            {(!invoices || invoices.length === 0) ? (
                                <div className="text-center py-20 text-text-secondary glass-card rounded-2xl border border-white/5">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">receipt_long</span>
                                    <p className="mb-4">Aucune facture trouvée.</p>
                                    <Link
                                        href="/invoices/new"
                                        className="text-primary hover:underline text-sm font-bold"
                                    >
                                        Créer votre première facture
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {/* Invoice List */}
                                    {invoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="glass-card p-4 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
                                        >
                                            {/* Left Side: Info */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-secondary">
                                                    <span className="material-symbols-outlined">description</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold flex items-center gap-2">
                                                        #{invoice.invoice_number}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase border ${invoice.status === 'paid'
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                            }`}>
                                                            {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                                        </span>
                                                    </h4>
                                                    <p className="text-sm text-text-secondary">
                                                        {invoice.client?.name || 'Client inconnu'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Side: Actions */}
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <span className="block text-primary font-bold text-lg">{invoice.total} Dh</span>
                                                    <span className="text-xs text-text-secondary">
                                                        {new Date(invoice.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className="h-8 w-[1px] bg-white/10"></div>

                                                {/* SEND BUTTON */}
                                                <SendInvoiceButton
                                                    clientEmail={invoice.client?.email}
                                                    clientName={invoice.client?.name}
                                                    invoiceNumber={invoice.invoice_number}
                                                    amount={invoice.total}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}