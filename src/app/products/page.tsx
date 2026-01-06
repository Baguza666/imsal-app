import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import Sidebar from '@/components/Sidebar';
import ProductManager from '@/components/products/ProductManager';

export default async function ProductsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: workspace } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).single();

    // ✅ FIX: Verify workspace exists before trying to load products
    if (!workspace) {
        return null; // Stop execution if no workspace found
    }

    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('workspace_id', workspace.id) // This is now safe
        .order('name', { ascending: true });

    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />
                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">
                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold">SERVICES & PRODUITS</h2>
                    </header>
                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <div className="max-w-[1200px] mx-auto w-full">
                            {/* This is now safe because we returned null above if workspace was missing */}
                            <ProductManager products={products || []} workspaceId={workspace.id} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}