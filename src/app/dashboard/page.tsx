import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar';
import InvoiceActions from './InvoiceActions';
// ✅ FIX: Import from the components folder using the '@' alias
import DebtCard from '@/components/dashboard/DebtCard';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: workspace } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).single();

  let invoices: any[] = [];
  let recentExpenses: any[] = [];
  let debts: any[] = [];

  let totalRevenue = 0;
  let totalExpenses = 0;
  let pendingCount = 0;
  let pendingAmount = 0;
  let totalDebtRemaining = 0;

  if (workspace) {
    // 1. FETCH INVOICES
    const { data: realInvoices } = await supabase
      .from('invoices')
      .select('*, client:clients(name)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (realInvoices) {
      invoices = realInvoices;
      totalRevenue = realInvoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      pendingAmount = realInvoices.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + Number(inv.total_amount), 0);
      pendingCount = realInvoices.filter(inv => inv.status !== 'Paid').length;
    }

    // 2. FETCH EXPENSES
    const { data: realExpenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('date', { ascending: false });

    if (realExpenses) {
      recentExpenses = realExpenses;
      totalExpenses = realExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    }

    // 3. FETCH ACTIVE DEBTS
    const { data: realDebts } = await supabase
      .from('debts')
      .select('*')
      .eq('workspace_id', workspace.id)
      .eq('status', 'Active')
      .order('due_date', { ascending: true });

    if (realDebts) {
      debts = realDebts;
      totalDebtRemaining = realDebts.reduce((sum, d) => sum + Number(d.remaining_amount), 0);
    }
  }

  // CALCULATE NET TREASURY
  const netTreasury = totalRevenue - totalExpenses;

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

  // --- CHART LOGIC (REVENUE HISTORY) ---
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  }).reverse();

  const chartData = last6Months.map(month => {
    const monthlyTotal = invoices
      .filter(inv => inv.created_at.startsWith(month) && inv.status === 'Paid')
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    return monthlyTotal;
  });

  const maxVal = Math.max(...chartData, 1);
  const points = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1 || 1)) * 100;
    const y = 40 - ((val / maxVal) * 35);
    return `${x},${y}`;
  });

  const strokePath = `M${points.join(' L')}`;
  const fillPath = `${strokePath} L100,40 L0,40 Z`;

  return (
    <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased selection:bg-primary selection:text-black">
      <div className="flex h-full w-full">

        <Sidebar />

        <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

          {/* HEADER */}
          <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-text-secondary text-xs mb-0.5">
                <span>Dashboard</span>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="text-white">Vue d'ensemble</span>
              </div>
              <h2 className="text-white text-xl font-bold leading-tight tracking-tight">VUE D'ENSEMBLE</h2>
            </div>

            <Link href="/invoices/new" className="group flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-gold-gradient text-black text-sm font-bold leading-normal tracking-wide shadow-[0_0_20px_rgba(244,185,67,0.2)] hover:shadow-[0_0_25px_rgba(244,185,67,0.4)] hover:scale-[1.02] transition-all duration-300">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>NOUVELLE FACTURE</span>
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
            <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">

              {/* STATS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. REVENUE CARD (Main Chart) */}
                <div className="lg:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden group min-h-[320px] flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase mb-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Performance Financière
                      </p>
                      <h3 className="text-white text-5xl font-bold tracking-tight mt-2">{formatMoney(totalRevenue)}</h3>
                      <p className="text-text-secondary text-sm mt-1">Revenu Total Encaissé</p>
                    </div>
                  </div>
                  <div className="w-full h-48 mt-auto relative z-10 translate-y-2">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#f4b943" stopOpacity="0.3"></stop>
                          <stop offset="100%" stopColor="#f4b943" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <path d={fillPath} fill="url(#chartGradient)"></path>
                      <path className="chart-glow" d={strokePath} fill="none" stroke="#f4b943" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8"></path>
                    </svg>
                  </div>
                </div>

                {/* 2. SIDE STATS (KPIs) */}
                <div className="flex flex-col gap-6">

                  {/* Pending Invoices */}
                  <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col justify-center gap-3 hover:border-primary/40 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        En cours
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-bold">{pendingCount}</h3>
                      <p className="text-text-secondary text-xs mt-1">Factures en attente ({formatMoney(pendingAmount)})</p>
                    </div>
                  </div>

                  {/* Total Expenses */}
                  <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col justify-center gap-3 hover:border-red-500/40 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined text-[20px]">trending_down</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-bold">{formatMoney(totalExpenses)}</h3>
                      <p className="text-text-secondary text-xs mt-1">Dépenses Totales</p>
                    </div>
                  </div>

                  {/* Net Treasury (Real Profit) */}
                  <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col justify-center gap-3 hover:border-green-500/40 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-2xl bg-gold-gradient flex items-center justify-center text-black shadow-[0_0_15px_rgba(244,185,67,0.15)]">
                        <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white text-2xl font-bold">{formatMoney(netTreasury)}</h3>
                      <p className="text-text-secondary text-xs mt-1">Trésorerie Nette</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* LOWER SECTION: Transactions & Debts */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT: Recent Transactions (Invoices) */}
                <div className="xl:col-span-2 w-full glass-card rounded-3xl overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-border-dark flex items-center justify-between bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-primary"></div>
                      <h3 className="text-white text-lg font-bold">TRANSACTIONS RÉCENTES</h3>
                    </div>
                    <Link href="/invoices" className="text-xs text-primary hover:underline">Voir tout</Link>
                  </div>
                  <div className="w-full overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs text-text-secondary border-b border-border-dark/50 bg-white/[0.02]">
                          <th className="py-4 px-6 font-semibold uppercase tracking-wider">Client</th>
                          <th className="py-4 px-6 font-semibold uppercase tracking-wider">Date</th>
                          <th className="py-4 px-6 font-semibold uppercase tracking-wider">Statut</th>
                          <th className="py-4 px-6 font-semibold uppercase tracking-wider text-right">Montant</th>
                          <th className="py-4 px-6 font-semibold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-border-dark/30">
                        {invoices.slice(0, 5).map((inv) => (
                          <tr key={inv.id} className="group hover:bg-white/[0.03] transition-colors">
                            <td className="py-4 px-6">
                              <Link href={`/invoices/${inv.id}`} className="flex flex-col cursor-pointer group-hover:translate-x-1 transition-transform duration-200">
                                <span className="text-white font-medium group-hover:text-primary transition-colors">{inv.client?.name || 'Unknown'}</span>
                                <span className="text-text-secondary text-xs">Réf: {inv.invoice_number}</span>
                              </Link>
                            </td>
                            <td className="py-4 px-6 text-text-secondary font-medium">
                              {new Date(inv.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${inv.status === 'Paid'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                {inv.status === 'Paid' ? 'PAYÉ' : 'EN COURS'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right text-white font-bold">
                              {formatMoney(inv.total_amount)}
                            </td>
                            <td className="py-4 px-6">
                              <InvoiceActions id={inv.id} status={inv.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RIGHT: Debts & Recent Expenses */}
                <div className="flex flex-col gap-6">

                  {/* DEBTS SECTION */}
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-white font-bold text-sm uppercase tracking-wider">Dettes Actives</h3>
                      <span className="text-xs text-red-400 font-mono bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                        -{formatMoney(totalDebtRemaining)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {debts.length > 0 ? (
                        debts.map(debt => (
                          <DebtCard key={debt.id} debt={debt} workspaceId={workspace?.id || ''} />
                        ))
                      ) : (
                        <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center">
                          <p className="text-text-secondary text-xs">Aucune dette active.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* EXPENSES PREVIEW */}
                  <div className="glass-card p-5 rounded-3xl flex-1 flex flex-col">
                    <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider border-b border-white/5 pb-2">
                      Dernières Dépenses
                    </h3>
                    <div className="flex-1 overflow-y-auto max-h-[300px] flex flex-col gap-3">
                      {recentExpenses.length > 0 ? (
                        recentExpenses.slice(0, 5).map(exp => (
                          <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined text-[16px]">
                                  {exp.category === 'Dette' ? 'account_balance' : 'receipt_long'}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white text-xs font-medium">{exp.category || 'Dépense'}</span>
                                <span className="text-[10px] text-text-secondary truncate max-w-[100px]">{exp.description}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-white text-xs font-bold">-{formatMoney(exp.amount)}</span>
                              {exp.receipt_url && (
                                <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[10px]">attachment</span>
                                  Reçu
                                </a>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-text-secondary text-xs text-center py-4">Aucune dépense récente.</p>
                      )}
                    </div>
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