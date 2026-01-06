import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
// This import will work once you move DebtCard.tsx to src/components/dashboard/
import DebtCard from '@/components/dashboard/DebtCard';
import FinanceControls from '@/components/expenses/FinanceControls';

export default async function ExpensesPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: workspace } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).single();

    if (!workspace) return null;

    // FETCH DATA
    const { data: expenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('date', { ascending: false });

    const { data: debts } = await supabase
        .from('debts')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('status', { ascending: true });

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    {/* HEADER */}
                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold">GESTION FINANCIÈRE</h2>
                        <FinanceControls workspaceId={workspace.id} />
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8">

                            {/* SECTION 1: DETTES & EMPRUNTS */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">account_balance</span>
                                    Dettes & Emprunts
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {debts && debts.length > 0 ? (
                                        debts.map(debt => (
                                            <DebtCard key={debt.id} debt={debt} workspaceId={workspace.id} />
                                        ))
                                    ) : (
                                        <div className="col-span-full p-8 rounded-2xl border border-dashed border-white/10 text-center text-text-secondary">
                                            Aucune dette active.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: HISTORIQUE DES DÉPENSES */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-text-secondary">receipt_long</span>
                                    Historique des Dépenses
                                </h3>

                                <div className="glass-card rounded-3xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs text-text-secondary border-b border-border-dark/50 bg-white/[0.02]">
                                                    <th className="py-4 px-6">Description</th>
                                                    <th className="py-4 px-6">Catégorie</th>
                                                    <th className="py-4 px-6">Date</th>
                                                    <th className="py-4 px-6">Preuve</th>
                                                    <th className="py-4 px-6 text-right">Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm divide-y divide-border-dark/30">
                                                {expenses?.map((exp) => (
                                                    <tr key={exp.id} className="group hover:bg-white/[0.03]">
                                                        <td className="py-4 px-6 font-medium text-white">{exp.description}</td>
                                                        <td className="py-4 px-6">
                                                            <span className={`text-[10px] px-2 py-1 rounded-full border ${exp.category === 'Dette'
                                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                                : 'bg-white/5 text-text-secondary border-white/10'
                                                                }`}>
                                                                {exp.category || 'Autre'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-text-secondary">
                                                            {new Date(exp.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            {exp.receipt_url ? (
                                                                <a
                                                                    href={exp.receipt_url}
                                                                    target="_blank"
                                                                    className="flex items-center gap-1 text-primary text-xs hover:underline"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">attachment</span>
                                                                    Voir Reçu
                                                                </a>
                                                            ) : (
                                                                <span className="text-text-secondary text-xs opacity-50">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-right font-bold text-white">
                                                            -{formatMoney(exp.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}