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

  // Fetch Workspace
  const { data: workspace } = await supabase
    .from('workspaces').select('id').eq('owner_id', user.id).single();

  let invoices: any[] = [];
  let totalRevenue = 0;
  let paidCount = 0;
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
      paidCount = realInvoices.filter(inv => inv.status === 'Paid').length;
    }
  }

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

  return (
    <div className="min-h-screen bg-surface-app text-text-main font-sans selection:bg-brand-gold selection:text-black">
      <Sidebar />

      <main className="ml-64 p-8">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-10 mt-4">
          <h2 className="text-xl font-bold tracking-widest uppercase text-white">Vue d'ensemble</h2>

          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full border border-surface-stroke flex items-center justify-center text-text-muted hover:text-white hover:border-white transition-colors">
              🔔
            </button>
            <Link
              href="/invoices/new"
              className="px-6 py-2 bg-brand-gold text-black font-bold text-sm rounded-full hover:bg-brand-goldHover transition-colors flex items-center gap-2"
            >
              <span>+</span> Nouvelle Facture
            </Link>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-3 gap-6 mb-8">

          {/* MAIN CARD: TOTAL REVENUE */}
          <div className="col-span-2 bg-surface-card border border-surface-stroke p-8 rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-brand-gold opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.05] transition-opacity"></div>

            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Total Revenu</span>
            <div className="mt-4 text-5xl font-bold text-white tracking-tight">
              {formatMoney(totalRevenue)}
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-brand-success font-bold">↗ +12.5%</span>
              <span className="text-text-muted">vs mois dernier</span>
            </div>
          </div>

          {/* SECONDARY CARD: PENDING */}
          <div className="bg-surface-card border border-surface-stroke p-8 rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">En Attente</span>
              <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-brand-gold">🕒</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">{invoices.length - paidCount}</div>
              <div className="text-sm text-text-muted mt-2">{formatMoney(pendingAmount)} à encaisser</div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: RECENT ACTIVITY */}
        <div className="grid grid-cols-3 gap-6">

          {/* CASHFLOW CARD */}
          <div className="bg-surface-card border border-surface-stroke p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Trésorerie</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">🏦</div>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatMoney(totalRevenue * 0.8)}
            </div>
            <p className="text-xs text-text-muted mt-2">Sécurisé (Est.)</p>
          </div>

          {/* RECENT INVOICES LIST */}
          <div className="col-span-2 bg-surface-card border border-surface-stroke p-8 rounded-xl">
            <div className="mb-6 flex justify-between items-end">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Derniers Mouvements</span>
            </div>

            <div className="space-y-4">
              {invoices.slice(0, 5).map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between p-4 bg-surface-app/50 rounded-lg hover:bg-surface-hover transition-colors border border-transparent hover:border-surface-stroke group">
                  <div className="w-1/3">
                    <div className="text-sm font-bold text-white group-hover:text-brand-gold transition-colors">{inv.client?.name}</div>
                    <div className="text-xs text-text-muted">{inv.invoice_number}</div>
                  </div>
                  <div className="text-xs text-text-muted w-1/4">
                    {formatDate(inv.created_at)}
                  </div>
                  <div className="text-sm font-bold text-white w-1/4 text-right">
                    {formatMoney(inv.total_amount)}
                  </div>
                  <div className="w-1/6 flex justify-end">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${inv.status === 'Paid'
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20'
                      }`}>
                      {inv.status === 'Draft' ? 'Brouillon' : inv.status === 'Paid' ? 'Payé' : 'En cours'}
                    </span>
                  </div>
                </Link>
              ))}
              {invoices.length === 0 && (
                <div className="text-center py-10 text-text-muted text-sm">Aucune facture récente.</div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}