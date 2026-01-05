import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import StatusUpdater from '@/components/StatusUpdater'; // Fixed Import
import PrintButton from '@/components/PrintButton';     // Fixed Import
import Sidebar from '@/components/Sidebar';

type Props = {
    params: Promise<{ id: string }>
}

export default async function InvoiceDetails({ params }: Props) {
    const cookieStore = await cookies();
    const { id } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: invoice } = await supabase
        .from('invoices')
        .select('*, client:clients(*), workspace:workspaces(*)')
        .eq('id', id)
        .single();

    if (!invoice) return notFound();

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('fr-FR');

    return (
        <div className="bg-background-dark min-h-screen font-sans text-white">
            <div className="flex">

                {/* 1. SIDEBAR (Hidden when printing) */}
                <div className="print:hidden fixed left-0 top-0 h-screen z-20">
                    <Sidebar />
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <main className="ml-72 w-full p-12 flex flex-col items-center min-h-screen print:ml-0 print:p-0 print:items-start print:w-full">

                    {/* ACTION BAR */}
                    <div className="w-full max-w-3xl flex justify-between items-center mb-8 print:hidden">
                        <Link href="/dashboard" className="text-text-secondary hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                            Retour
                        </Link>
                        <div className="flex gap-3">
                            <StatusUpdater id={invoice.id} currentStatus={invoice.status} />
                            <PrintButton />
                            <button className="px-4 py-2 bg-gold-gradient text-black font-bold text-xs rounded-lg shadow-glow hover:scale-105 transition-transform uppercase tracking-wider">
                                Envoyer au Client
                            </button>
                        </div>
                    </div>

                    {/* 📄 THE PAPER DOCUMENT (Always White) */}
                    <div className="w-full max-w-3xl bg-white text-black p-16 shadow-2xl shadow-black/50 rounded-sm min-h-[800px] relative print:shadow-none print:w-full print:max-w-none print:p-0">

                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-zinc-200 pb-8 mb-12">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-black uppercase">FACTURE</h1>
                                <p className="font-mono text-sm mt-2 text-zinc-500">#{invoice.invoice_number}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="font-bold text-lg text-black">{invoice.workspace?.name}</h2>
                                <p className="text-sm text-zinc-600">{invoice.workspace?.address || 'Adresse non définie'}</p>
                                <p className="text-sm text-zinc-600">{invoice.workspace?.city} {invoice.workspace?.country}</p>
                                <p className="text-xs font-mono text-zinc-400 mt-1">{invoice.workspace?.tax_id}</p>
                            </div>
                        </div>

                        {/* Client & Dates */}
                        <div className="grid grid-cols-2 gap-12 mb-16">
                            <div>
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-3">
                                    Facturé à
                                </span>
                                <p className="font-bold text-xl text-black">{invoice.client?.name}</p>
                                <p className="text-zinc-600">{invoice.client?.email}</p>
                            </div>
                            <div className="text-right">
                                <div className="flex justify-end gap-12">
                                    <div>
                                        <span className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Date</span>
                                        <span className="font-mono text-sm text-black">{formatDate(invoice.created_at)}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Échéance</span>
                                        <span className="font-mono text-sm text-black">{formatDate(invoice.due_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full mb-12">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="text-left py-3 font-bold uppercase text-xs tracking-wider text-black">Description</th>
                                    <th className="text-right py-3 font-bold uppercase text-xs tracking-wider text-black">Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-zinc-200">
                                    <td className="py-6 text-black font-medium">Services Professionnels (Forfait)</td>
                                    <td className="py-6 text-right font-mono text-zinc-700">{formatMoney(invoice.total_amount)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Total Section */}
                        <div className="flex justify-end">
                            <div className="w-1/2">
                                <div className="flex justify-between py-3 border-b border-zinc-200">
                                    <span className="text-zinc-600">Sous-total</span>
                                    <span className="font-mono text-zinc-900">{formatMoney(invoice.total_amount)}</span>
                                </div>
                                <div className="flex justify-between py-6">
                                    <span className="font-bold text-2xl text-black">Total</span>
                                    <span className="font-bold text-2xl font-mono text-black">{formatMoney(invoice.total_amount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-16 left-16 right-16 text-center border-t border-zinc-200 pt-8">
                            <p className="text-xs text-zinc-400 uppercase tracking-widest">
                                Merci de votre confiance. Paiement dû sous 30 jours.
                            </p>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}