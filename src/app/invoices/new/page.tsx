'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewInvoice() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(""); // Feedback text

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

        // 1. Get User
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

            // SAFETY CHECK 1: Ensure workspace exists
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
                        email: 'pending@example.com', // Placeholder
                        workspace_id: workspace.id
                    }])
                    .select()
                    .single();
                if (clError) throw clError;
                client = newClient;
            }

            // SAFETY CHECK 2: Ensure client exists (This fixes your error!)
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
                    invoice_number: `INV-${Date.now().toString().slice(-6)}` // Auto-generate simple ID
                }]);

            if (invError) throw invError;

            setStatus("Success! Redirecting...");
            router.push("/dashboard"); // Go back to Cockpit

        } catch (error: any) {
            console.error(error);
            setStatus("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-app p-8 flex justify-center items-center">
            <div className="w-full max-w-2xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-border-subtle pb-4">
                    <h1 className="text-3xl font-heading font-bold text-text-hero">
                        NEW INVOICE
                    </h1>
                    <Link href="/dashboard" className="text-text-muted hover:text-white font-mono text-xs uppercase">
                        [ESC] Cancel
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-brand-gold uppercase tracking-widest">Client Name</label>
                        <input
                            name="clientName"
                            type="text"
                            placeholder="e.g. OCP Group"
                            required
                            className="w-full bg-surface-card border border-border-subtle p-4 text-text-hero focus:border-brand-gold focus:outline-none rounded-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-brand-gold uppercase tracking-widest">Total Amount (MAD)</label>
                            <input
                                name="amount"
                                type="number"
                                placeholder="0.00"
                                required
                                className="w-full bg-surface-card border border-border-subtle p-4 text-text-hero focus:border-brand-gold focus:outline-none rounded-sm font-mono text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-brand-gold uppercase tracking-widest">Due Date</label>
                            <input
                                name="dueDate"
                                type="date"
                                required
                                className="w-full bg-surface-card border border-border-subtle p-4 text-text-hero focus:border-brand-gold focus:outline-none rounded-sm font-mono"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-gold text-surface-app font-bold py-4 uppercase tracking-widest hover:bg-white transition-colors mt-8 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {loading ? "PROCESSING..." : "ISSUE INVOICE"}
                    </button>

                    {/* Status Message */}
                    {status && (
                        <div className="text-center font-mono text-xs text-text-muted mt-4">
                            {status}
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
}