import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar'; // Import the new Sidebar

export default async function Dashboard() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Security Check
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 2. Fetch Workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  let invoices: any[] = [];
  let totalRevenue = 0;

  // 3. Fetch Real Invoices
  if (workspace) {
    const { data: realInvoices } = await supabase
      .from('invoices')
      .select('*, client:clients(name)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (realInvoices) {
      invoices = realInvoices;
      // Calculate Total Cashflow (Paid only)
      totalRevenue = realInvoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0);
    }
  }

  // Format Currency Helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MA', { style: 'currency', currency: 'MAD' }).format(amount);
  };

  return (
    <div className="min-h-screen bg-surface-app">

      {/* 1. THE SIDEBAR (Fixed Left) */}
      <Sidebar />

      {/* 2. MAIN CONTENT (Pushed Right) */}
      <main className="ml-64 p-12 text-text-body font-sans">

        {/* PAGE TITLE */}
        <header className="mb-12 flex justify-between items-end border-b border-surface-stroke pb-6">
          <div>
            <h1 className="font-bold text-3xl text-text-main tracking-tight">
              Cockpit
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Overview of your financial performance.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="bg-brand-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors shadow-subtle"
          >
            + New Invoice
          </Link>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* CARD 1: Total Revenue */}
          <div className="md:col-span-2 bg-surface-card border border-surface-stroke p-8 rounded-lg shadow-subtle relative overflow-hidden">
            <span className="text-text-muted font-mono text-xs uppercase tracking-widest">
              Total Revenue (Paid)
            </span>
            <div className="mt-4 font-mono text-5xl text-text-main font-bold tracking-tighter">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse"></span>
              <span className="text-xs text-brand-success font-medium uppercase tracking-wide">
                Live System Data
              </span>
            </div>
          </div>

          {/* CARD 2: System Status */}
          <div className="bg-surface-card border border-surface-stroke p-8 rounded-lg shadow-subtle flex flex-col justify-center">
            <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-4">
              System Status
            </span>
            <div className="flex items-center gap-3 text-sm text-text-body">
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-gold h-full w-full" style={{ width: '100%' }}></div>
              </div>
              <span className="font-mono text-xs">100%</span>
            </div>
            <p className="mt-4 text-xs text-text-muted italic">
              "All systems operational."
            </p>
          </div>

          {/* CARD 3: Recent Invoices List */}
          <div className="md:col-span-3 bg-surface-card border border-surface-stroke rounded-lg shadow-subtle overflow-hidden">
            <div className="p-6 border-b border-surface-stroke bg-surface-hover/50">
              <h3 className="text-sm font-medium text-text-main">Recent Invoices</h3>
            </div>

            <div className="divide-y divide-surface-stroke">
              {invoices.length === 0 ? (
                <div className="text-center text-text-muted font-mono text-sm py-12">
                  -- NO DATA --
                </div>
              ) : (
                // Map through Invoices
                invoices.map((inv) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="block hover:bg-surface-hover transition-colors group">
                    <div className="flex justify-between items-center p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-text-main font-medium text-sm group-hover:text-brand-accent transition-colors">
                          {inv.client?.name || "Unknown Client"}
                        </span>
                        <span className="text-text-muted font-mono text-xs uppercase">
                          {inv.invoice_number}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-text-main font-mono text-sm font-bold">
                          {formatCurrency(inv.total_amount)}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-500'
                          }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}