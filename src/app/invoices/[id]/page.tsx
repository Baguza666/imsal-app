import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PrintButton from '@/components/PrintButton';
import StatusUpdater from '@/components/StatusUpdater';
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
        new Intl.NumberFormat('en-MA', { style: 'currency', currency: 'MAD' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB');

    return (
        <div className="min-h-screen bg-surface-app flex text-zinc-900">

            {/* 1. SIDEBAR (Hidden when printing) */}
            <div className="print:hidden">
                <Sidebar />
            </div>

            {/* 2. MAIN CONTENT */}
            <main className="ml-64 w-full p-12 flex flex-col items-center print:ml-0 print:p-0 print:items-start print:w-full">

                {/* ACTION BAR (Hidden when printing) */}
                <div className="w-full max-w-3xl flex justify-between items-center mb-8 print:hidden">
                    <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 font-medium text-sm transition-colors flex items-center gap-2">
                        ← Back to Cockpit
                    </Link>
                    <div className="flex gap-3">
                        <StatusUpdater id={invoice.id} currentStatus={invoice.status} />
                        <PrintButton />
                        <button className="px-4 py-2 bg-zinc-900 text-white font-medium text-sm rounded-md shadow-sm hover:bg-zinc-800 transition-colors">
                            Send to Client
                        </button>
                    </div>
                </div>

                {/* 📄 THE PAPER DOCUMENT (Forced Light Mode) */}
                {/* We use specific colors (bg-white, text-black) instead of semantic ones to prevent Dark Mode glitches */}
                <div className="w-full max-w-3xl bg-white text-black p-16 shadow-lg rounded-sm min-h-[800px] relative print:shadow-none print:w-full print:max-w-none print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-zinc-200 pb-8 mb-12">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-black uppercase">INVOICE</h1>
                            <p className="font-mono text-sm mt-2 text-zinc-500">#{invoice.invoice_number}</p>
                        </div>
                        <div className="text-right">
                            {/* DYNAMIC: Uses Settings Data */}
                            <h2 className="font-bold text-lg text-black">{invoice.workspace?.name}</h2>
                            <p className="text-sm text-zinc-600">{invoice.workspace?.address || 'Address not set'}</p>
                            <p className="text-sm text-zinc-600">{invoice.workspace?.city} {invoice.workspace?.country}</p>
                            <p className="text-xs font-mono text-zinc-400 mt-1">{invoice.workspace?.tax_id}</p>
                        </div>
                    </div>

                    {/* Client & Dates */}
                    <div className="grid grid-cols-2 gap-12 mb-16">
                        <div>
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-3">
                                Billed To
                            </span>
                            <p className="font-bold text-xl text-black">{invoice.client?.name}</p>
                            <p className="text-zinc-600">{invoice.client?.email}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-3">
                                Dates
                            </span>
                            <div className="flex justify-end gap-12">
                                <div>
                                    <span className="block text-xs text-zinc-500 mb-1">Issued</span>
                                    <span className="font-mono text-sm text-black">{formatDate(invoice.created_at)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-zinc-500 mb-1">Due</span>
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
                                <th className="text-right py-3 font-bold uppercase text-xs tracking-wider text-black">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-zinc-200">
                                <td className="py-6 text-black font-medium">Professional Services (Fixed Price)</td>
                                <td className="py-6 text-right font-mono text-zinc-700">{formatMoney(invoice.total_amount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Total Section */}
                    <div className="flex justify-end">
                        <div className="w-1/2">
                            <div className="flex justify-between py-3 border-b border-zinc-200">
                                <span className="text-zinc-600">Subtotal</span>
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
                            Payment due within 30 days. Thank you for your business.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}