import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
// This assumes you moved the builder to the components folder as recommended.
// If you haven't moved it yet, change this to: import InvoiceBuilder from './InvoiceBuilder';
import InvoiceBuilder from '@/components/invoices/InvoiceBuilder';

export default async function NewInvoicePage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    // 1. AUTHENTICATION CHECK
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    // 2. GET WORKSPACE (Critical for data isolation)
    // We select '*' (all fields) so we can pass the company name/address to the invoice template
    const { data: workspace } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (!workspace) {
        // If no workspace exists, we can't create an invoice.
        return null;
    }

    // 3. FETCH DATA FOR THE BUILDER
    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('name');

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('name');

    // 4. GENERATE NEXT INVOICE NUMBER
    const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspace.id);

    const currentYear = new Date().getFullYear();
    const sequenceNumber = String((count || 0) + 1).padStart(3, '0');
    const nextNumber = `INV-${currentYear}-${sequenceNumber}`;

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased selection:bg-primary selection:text-black">
            <div className="flex h-full w-full">

                {/* Navigation */}
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    {/* Header Placeholder (Visual consistency) */}
                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between pointer-events-none">
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        {/* The Interactive Builder Component */}
                        <InvoiceBuilder
                            clients={clients || []}
                            products={products || []}
                            nextInvoiceNumber={nextNumber}
                            user={user}         // Pass user data for email fallback
                            workspace={workspace} // Pass full workspace data for the template header
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}