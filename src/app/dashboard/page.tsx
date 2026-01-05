import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Link from "next/link";

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

  // 1. Security Check (Updated to use getUser for better security)
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

  // 3. Fetch Real Invoices (If workspace exists)
  if (workspace) {
    const { data: realInvoices } = await supabase
      .from('invoices')
      .select('*, client:clients(name)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false });

    if (realInvoices) {
      invoices = realInvoices;
      // Calculate Total Cashflow
      // Only sum up invoices where status is 'Paid'
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
    <div className="min-h-screen bg-surface-app p-8 text-text-body font-sans">

      {/* HEADER */}
      <header className="mb-12 flex justify-between items-end border-b border-border-subtle pb-6">
        <div>
          <h1 className="font-heading text-4xl text-text-hero font-bold tracking-tight">
            COCKPIT
          </h1>
          <p className="text-text-muted font-mono text-xs mt-2 uppercase tracking-widest">
            Owner: {user.email}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="bg-brand-gold text-surface-app px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors rounded-sm inline-block"
        >
          + New Invoice
        </Link>
      </header>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: REAL Net Cashflow */}
        <div className="md:col-span-2 bg-surface-card border border-border-subtle p-8 rounded-sm relative overflow-hidden">
          <span className="text-text-muted font-mono text-xs uppercase tracking-widest">
            Total Revenue
          </span>
          <div className="mt-4 font-heading text-6xl text-text-hero font-bold">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="mt-6 flex gap-8 font-mono text-sm">
            <div className="text-brand-gold">
              Live Data from Database
            </div>
          </div>
        </div>

        {/* CARD 2: Alerts */}
        <div className="bg-surface-card border border-border-subtle p-8 rounded-sm flex flex-col">
          <span className="text-text-muted font-mono text-xs uppercase tracking-widest mb-4">
            System Status
          </span>
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm italic border-l-2 border-border-subtle pl-4">
            "All systems operational."
          </div>
        </div>

        {/* CARD 3: REAL Recent Invoices List */}
        <div className="md:col-span-3 bg-surface-card border border-border-subtle p-8 min-h-[250px] rounded-sm">
          <span className="text-text-muted font-mono text-xs uppercase tracking-widest">
            Recent Invoices
          </span>

          <div className="mt-8 space-y-4">
            {invoices.length === 0 ? (
              <div className="text-center text-text-muted font-mono text-sm py-12">
                -- NO INVOICES FOUND --
              </div>
            ) : (
              // Map through the Real Invoices
              invoices.map((inv) => (
                <Link key={inv.id} href={`/invoices/${inv.id}`} className="block hover:bg-surface-card-hover transition-colors">
                  <div className="flex justify-between items-center border-b border-border-subtle pb-4 last:border-0 cursor-pointer p-4 -mx-4 rounded-sm">
                    <div>
                      <div className="text-text-hero font-bold text-lg">{inv.client?.name || "Unknown Client"}</div>
                      <div className="text-text-muted font-mono text-xs uppercase">
                        ID: {inv.invoice_number} • Due: {inv.due_date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-brand-gold font-mono font-bold">
                        {formatCurrency(inv.total_amount)}
                      </div>
                      <div className="text-xs text-text-muted uppercase tracking-wider bg-surface-input px-2 py-1 rounded-sm inline-block mt-1">
                        {inv.status}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}