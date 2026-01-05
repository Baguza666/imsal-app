import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar';

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
  let totalRevenue = 0;
  let pendingCount = 0;
  let pendingAmount = 0;

  if (workspace) {
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
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

  return (
    <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased selection:bg-primary selection:text-black">
      <div className="flex h-full w-full">

        <Sidebar />

        <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

          {/* GLASS HEADER */}
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. REVENUE CARD (Main) */}
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

                  {/* STATIC CHART VISUAL - FIXED className */}
                  <div className="w-full h-48 mt-auto relative z-10 translate-y-2">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#f4b943" stopOpacity="0.3"></stop>
                          <stop offset="100%" stopColor="#f4b943" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <path d="M0,40 L0,32 C15,35 25,25 40,22 C55,19 65,8 80,12 C90,15 95,5 100,2 L100,40 Z" fill="url(#chartGradient)"></path>
                      <path className="chart-glow" d="M0,32 C15,35 25,25 40,22 C55,19 65,8 80,12 C90,15 95,5 100,2" fill="none" stroke="#f4b943" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8"></path>
                    </svg>
                  </div>
                </div>

                {/* 2. SIDE STATS */}
                <div className="flex flex-col gap-6">

                  {/* PENDING CARD */}
                  <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col justify-center gap-4 hover:border-primary/40 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        En cours
                      </span>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase mb-1">Factures en Attente</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-white text-3xl font-bold">{pendingCount}</h3>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-text-secondary">Montant estimé</span>
                        <span className="text-sm font-semibold text-white">{formatMoney(pendingAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CASH CARD */}
                  <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col justify-center gap-4 hover:border-primary/40 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="size-12 rounded-2xl bg-gold-gradient flex items-center justify-center text-black shadow-[0_0_15px_rgba(244,185,67,0.15)]">
                        <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-text-secondary text-xs font-semibold tracking-wider uppercase mb-1">Trésorerie</p>
                      <h3 className="text-white text-3xl font-bold">{formatMoney(totalRevenue)}</h3>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. RECENT TRANSACTIONS TABLE */}
              <div className="w-full glass-card rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border-dark flex items-center justify-between bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-primary"></div>
                    <h3 className="text-white text-lg font-bold">TRANSACTIONS RÉCENTES</h3>
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-text-secondary border-b border-border-dark/50 bg-white/[0.02]">
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider">Client</th>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider">Date</th>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider">Statut</th>
                        <th className="py-4 px-6 font-semibold uppercase tracking-wider text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-border-dark/30">
                      {invoices.slice(0, 5).map((inv) => (
                        <tr key={inv.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="text-white font-medium group-hover:text-primary transition-colors">{inv.client?.name || 'Unknown'}</span>
                              <span className="text-text-secondary text-xs">Réf: {inv.invoice_number}</span>
                            </div>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}