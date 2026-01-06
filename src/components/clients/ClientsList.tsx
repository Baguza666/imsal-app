'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useUserRole } from '@/hooks/useUserRole';

export default function ClientsList({ initialClients }: { initialClients: any[] }) {
    const { isAdmin, isEditor, isViewer } = useUserRole();
    const [clients, setClients] = useState(initialClients);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        if (isAdmin) {
            // ADMIN: Add directly to 'clients'
            const { data, error } = await supabase
                .from('clients')
                .insert([{ ...form, owner_id: user.id }])
                .select()
                .single();

            if (!error && data) {
                setClients([data, ...clients]);
                closeModal();
            } else {
                alert("Erreur lors de l'ajout.");
            }
        }
        else if (isEditor) {
            // EDITOR: Send request to 'resource_requests'
            const { error } = await supabase
                .from('resource_requests')
                .insert({
                    user_id: user.id,
                    type: 'client',
                    details: form,
                    status: 'pending'
                });

            if (!error) {
                alert("Demande envoyée à l'administrateur avec succès !");
                closeModal();
            } else {
                alert("Erreur lors de l'envoi de la demande.");
            }
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return; // Double check security
        if (!confirm('Supprimer ce client ?')) return;

        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (!error) {
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setForm({ name: '', email: '', phone: '', address: '' });
    };

    return (
        <div>
            {/* HEADER: Hide button for Viewers */}
            {!isViewer && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gold-gradient text-black px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isAdmin ? 'person_add' : 'outgoing_mail'}
                        </span>
                        {isAdmin ? 'NOUVEAU CLIENT' : 'DEMANDER AJOUT'}
                    </button>
                </div>
            )}

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors group relative">

                        {/* Delete Button: Only for Admin */}
                        {isAdmin && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-400">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-white font-bold text-lg border border-white/10">
                                {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{client.name}</h3>
                                <p className="text-xs text-text-secondary">Client</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-text-secondary">
                            {client.email && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">mail</span> {client.email}</div>}
                            {client.phone && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">call</span> {client.phone}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {clients.length === 0 && (
                <div className="text-center py-20 text-text-secondary">
                    <p>Aucun client enregistré.</p>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl max-w-md w-full relative">
                        <button onClick={closeModal} className="absolute top-4 right-4 text-text-secondary hover:text-white"><span className="material-symbols-outlined">close</span></button>

                        <h3 className="text-xl font-bold text-white mb-6">
                            {isAdmin ? 'Nouveau Client' : "Demande d'ajout Client"}
                        </h3>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input placeholder="Nom complet" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary" required />
                            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary" />
                            <input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary" />

                            <button disabled={loading} className="mt-2 bg-gold-gradient text-black font-bold py-3 rounded-xl hover:opacity-90">
                                {loading ? 'Traitement...' : (isAdmin ? 'ENREGISTRER' : 'ENVOYER LA DEMANDE')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}