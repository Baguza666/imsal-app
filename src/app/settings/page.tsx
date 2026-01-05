'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from "react";
import Sidebar from '@/components/Sidebar';

// 1. TYPE DEFINITION
interface WorkspaceData {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    tax_id: string;
}

export default function Settings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [workspace, setWorkspace] = useState<WorkspaceData>({
        id: "",
        name: "",
        address: "",
        city: "",
        country: "",
        tax_id: ""
    });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: ws } = await supabase
                .from('workspaces')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (ws) {
                setWorkspace({
                    id: ws.id,
                    name: ws.name || "",
                    address: ws.address || "",
                    city: ws.city || "",
                    country: ws.country || "",
                    tax_id: ws.tax_id || ""
                });
            }
            // If no workspace found, we leave the ID as "" so we know to create one later.
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        // Get user again to ensure security
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setMessage("Error: Not authenticated");
            setSaving(false);
            return;
        }

        let error;

        // 🛑 LOGIC FIX: Check if we are Creating or Updating
        if (!workspace.id) {
            // SCENARIO A: CREATE NEW (The "Fix")
            const { data: newWs, error: createError } = await supabase
                .from('workspaces')
                .insert([{
                    owner_id: user.id,
                    name: workspace.name,
                    address: workspace.address,
                    city: workspace.city,
                    country: workspace.country,
                    tax_id: workspace.tax_id
                }])
                .select()
                .single();

            if (newWs) {
                setWorkspace(prev => ({ ...prev, id: newWs.id })); // Save the new ID
            }
            error = createError;
        } else {
            // SCENARIO B: UPDATE EXISTING
            const { error: updateError } = await supabase
                .from('workspaces')
                .update({
                    name: workspace.name,
                    address: workspace.address,
                    city: workspace.city,
                    country: workspace.country,
                    tax_id: workspace.tax_id
                })
                .eq('id', workspace.id);
            error = updateError;
        }

        if (error) {
            setMessage("Error: " + error.message);
        } else {
            setMessage("✅ Settings Saved Successfully");
        }
        setSaving(false);
    };

    const handleChange = (field: keyof WorkspaceData, value: string) => {
        setWorkspace(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="min-h-screen bg-surface-app flex items-center justify-center text-text-muted">Loading Configuration...</div>;

    return (
        <div className="min-h-screen bg-surface-app">
            <Sidebar />

            <main className="ml-64 p-12 max-w-4xl">
                <h1 className="text-2xl font-bold text-text-main mb-2">Workspace Settings</h1>
                <p className="text-text-muted text-sm mb-8">Configure your business identity for invoices.</p>

                <div className="bg-surface-card border border-surface-stroke rounded-lg shadow-subtle p-8">
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Company Name */}
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Company Name</label>
                            <input
                                type="text"
                                value={workspace.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full bg-zinc-50 border border-surface-stroke p-3 rounded-md text-text-main focus:ring-1 focus:ring-brand-accent focus:outline-none"
                            />
                        </div>

                        {/* Address Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Street Address</label>
                                <input
                                    type="text"
                                    value={workspace.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="e.g. 123 Blvd Anfa"
                                    className="w-full bg-zinc-50 border border-surface-stroke p-3 rounded-md text-text-main focus:ring-1 focus:ring-brand-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-2">City</label>
                                <input
                                    type="text"
                                    value={workspace.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    placeholder="Casablanca"
                                    className="w-full bg-zinc-50 border border-surface-stroke p-3 rounded-md text-text-main focus:ring-1 focus:ring-brand-accent focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Country</label>
                                <input
                                    type="text"
                                    value={workspace.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    className="w-full bg-zinc-50 border border-surface-stroke p-3 rounded-md text-text-main focus:ring-1 focus:ring-brand-accent focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Tax ID */}
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Tax ID / ICE / RC</label>
                            <input
                                type="text"
                                value={workspace.tax_id}
                                onChange={(e) => handleChange('tax_id', e.target.value)}
                                placeholder="e.g. ICE 00123456789"
                                className="w-full bg-zinc-50 border border-surface-stroke p-3 rounded-md text-text-main focus:ring-1 focus:ring-brand-accent focus:outline-none font-mono"
                            />
                        </div>

                        {/* Save Bar */}
                        <div className="pt-6 border-t border-surface-stroke flex justify-between items-center">
                            <span className="text-sm text-green-600 font-medium">{message}</span>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-accent text-white px-6 py-2 rounded-md font-medium text-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}