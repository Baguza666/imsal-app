'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from '@/components/Sidebar'; // 1. Import Sidebar

export default function NewInvoice() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setStatus("Authenticating...");

        const formData = new FormData(e.currentTarget);
        const amount = formData.get("amount");
        const clientName = formData.get("clientName") as string;
        const dueDate = formData.get("dueDate");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setStatus("Error: You are not logged in.");
            setLoading(false);
            return;
        }

        try {
            // 2. GET OR CREATE WORKSPACE
            setStatus("Locating Workspace...");
            let { data: workspace } = await supabase
                .from('workspaces')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!workspace) {
                setStatus("Creating new Workspace...");
                const { data: newWorkspace, error: wsError } = await supabase
                    .from('workspaces')
                    .insert([{ name: 'My Workspace', owner_id: user.id }])
                    .select()
                    .single();
                if (wsError) throw wsError;
                workspace = newWorkspace;
            }

            if (!workspace) throw new Error("Critical: Could not find or create workspace.");

            // 3. GET OR CREATE CLIENT
            setStatus(`Locating Client: ${clientName}...`);
            let { data: client } = await supabase
                .from('clients')
                .select('id')
                .eq('workspace_id', workspace.id)
                .eq('name', clientName)
                .single();

            if (!client) {
                setStatus(`Registering new client: ${clientName}...`);
                const { data: newClient, error: clError } = await supabase
                    .from('clients')
                    .insert([{
                        name: clientName,
                        email: 'pending@example.com',
                        workspace_id: workspace.id
                    }])
                    .select()
                    .single();
                if (clError) throw clError;
                client = newClient;
            }

            if (!client) throw new Error("Critical: Could not find or create client.");

            // 4. CREATE INVOICE
            setStatus("Issuing Invoice...");
            const { error: invError } = await supabase
                .from('invoices')
                .insert([{
                    workspace_id: workspace.id,
                    client_id: client.id,
                    total_amount: amount,
                    due_date: dueDate,
                    status: 'Draft',
                    invoice_number: `INV-${Date.now().toString().slice(-6)}`
                }]);

            if (invError) throw invError;

            setStatus("Success! Redirecting...");
            router.refresh(); // Refresh cache
            router.push("/dashboard");

        } catch (error: any) {
            console.error(error);
            setStatus("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-app">

            {/* 1. SIDEBAR */}
            <Sidebar />

            {/* 2. MAIN CONTENT AREA */}
            <main className="ml-64 p-12 flex justify-center items-start min-h-screen">
                <div className="w-full max-w-2xl bg-surface-card border border-surface-stroke p-8 rounded-lg shadow-subtle mt-10">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 border-b border-surface-stroke pb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-text-main tracking-tight">
                                New Invoice
                            </h1>
                            <p className="text-text-muted text-sm mt-1">Create a new receivable document.</p>
                        </div>
                        <Link href="/dashboard" className="text-text-muted hover:text-brand-accent font-mono text-xs uppercase tracking-wider transition-colors">
                            [ESC] Cancel
                        </Link>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Client Name</label>
                            <input
                                name="clientName"
                                type="text"
                                placeholder="e.g. OCP Group"
                                required
                                className="w-full bg-zinc-50 border border-surface-stroke p-3 text-text-main focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none rounded-md transition-all placeholder:text-zinc-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Amount (MAD)</label>
                                <input
                                    name="amount"
                                    type="number"
                                    placeholder="0.00"
                                    required
                                    className="w-full bg-zinc-50 border border-surface-stroke p-3 text-text-main focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none rounded-md font-mono transition-all placeholder:text-zinc-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Due Date</label>
                                <input
                                    name="dueDate"
                                    type="date"
                                    required
                                    className="w-full bg-zinc-50 border border-surface-stroke p-3 text-text-main focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:outline-none rounded-md font-mono transition-all text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-accent text-white font-medium py-3 rounded-md hover:bg-zinc-800 transition-colors mt-6 disabled:opacity-50 disabled:cursor-wait shadow-subtle"
                        >
                            {loading ? "Processing..." : "Issue Invoice"}
                        </button>

                        {/* Status Message */}
                        {status && (
                            <div className="text-center font-mono text-xs text-text-muted mt-4 animate-pulse">
                                {status}
                            </div>
                        )}

                    </form>
                </div>
            </main>
        </div>
    );
}