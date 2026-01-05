import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PrintButton from '../../../components/PrintButton';
import StatusUpdater from '../../../components/StatusUpdater';

// 1. FIX: Define params as a Promise (Next.js 15+ requirement)
type Props = {
    params: Promise<{ id: string }>
}

export default async function InvoiceDetails({ params }: Props) {
    const cookieStore = await cookies();

    // 2. FIX: You MUST await params before using the ID
    const { id } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // 3. Get User (Secure Method)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    // 4. Fetch Specific Invoice
    const { data: invoice } = await supabase
        .from('invoices')
        .select('*, client:clients(*), workspace:workspaces(*)')
        .eq('id', id)
        .single();

    if (!invoice) return notFound();

    // Format Helpers
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('en-MA', { style: 'currency', currency: 'MAD' }).format(amount);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB');

    return (
        <div className="min-h-screen bg-surface-app p-8 flex flex-col items-center">

            {/* ACTION BAR */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-8 print:hidden">
                <Link href="/dashboard" className="text-text-muted hover:text-white font-mono text-xs uppercase">
                    ← Back to Cockpit
                </Link>
                // ... imports

                // ... inside the component
                <div className="flex gap-4">
                    {/* NEW: Status Engine */}
                    <StatusUpdater id={invoice.id} currentStatus={invoice.status} />

                    {/* Functional Print Button */}
                    <PrintButton />

                    <button className="px-6 py-2 bg-brand-gold text-surface-app font-mono text-xs uppercase font-bold hover:bg-white transition-colors">
                        Send to Client
                    </button>
                </div>
            </div>

            {/* THE PAPER INVOICE */}
            <div className="w-full max-w-3xl bg-white text-black p-12 shadow-2xl rounded-sm min-h-[800px] relative print:shadow-none print:w-full print:max-w-none print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight uppercase">INVOICE</h1>
                        <p className="font-mono text-sm mt-2 text-gray-600">#{invoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-lg">{invoice.workspace?.name}</h2>
                        <p className="text-sm text-gray-500">Casablanca, Morocco</p>
                        {/* FIX: Used 'user.email' instead of 'session.user.email' */}
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>

                {/* Client Details */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                            Billed To
                        </span>
                        <p className="font-bold text-xl">{invoice.client?.name}</p>
                        <p className="text-gray-600">{invoice.client?.email}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                            Dates
                        </span>
                        <div className="flex justify-end gap-8">
                            <div>
                                <span className="block text-xs text-gray-500">Issued</span>
                                <span className="font-mono">{formatDate(invoice.created_at)}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500">Due</span>
                                <span className="font-mono">{formatDate(invoice.due_date)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b border-black">
                            <th className="text-left py-2 font-bold uppercase text-xs">Description</th>
                            <th className="text-right py-2 font-bold uppercase text-xs">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="py-4 text-gray-800">Professional Services (Fixed Price)</td>
                            <td className="py-4 text-right font-mono">{formatMoney(invoice.total_amount)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end">
                    <div className="w-1/2">
                        <div className="flex justify-between py-2 border-b border-gray-300">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-mono">{formatMoney(invoice.total_amount)}</span>
                        </div>
                        <div className="flex justify-between py-4">
                            <span className="font-bold text-xl">Total</span>
                            <span className="font-bold text-xl font-mono">{formatMoney(invoice.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-12 left-12 right-12 text-center border-t border-gray-200 pt-8">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">
                        Thank you for your business
                    </p>
                </div>

            </div>
        </div>
    );
}