'use client';
import { useState } from 'react';
import { createClient, deleteClient } from '@/app/actions/data';

export default function ClientManager({ clients, workspaceId }: { clients: any[], workspaceId: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        await createClient(new FormData(e.currentTarget));
        setLoading(false);
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Supprimer ce client ?')) await deleteClient(id);
    };

    return (
        <>
            {/* HEADER ACTION */}
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 h-10 px-6 rounded-full bg-gold-gradient text-black text-sm font-bold shadow-lg hover:scale-[1.02] transition-transform">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    NOUVEAU CLIENT
                </button>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => (
                    <div key={client.id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {client.name.charAt(0).toUpperCase()}
                            </div>
                            <button onClick={() => handleDelete(client.id)} className="text-text-secondary hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                        <h3 className="text-white font-bold text-lg">{client.name}</h3>
                        <div className="mt-4 space-y-2 text-sm text-text-secondary">
                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">email</span> {client.email || '-'}</p>
                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">call</span> {client.phone || '-'}</p>
                            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">location_on</span> {client.address || '-'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-text-secondary hover:text-white"><span className="material-symbols-outlined">close</span></button>
                        <h3 className="text-white text-xl font-bold mb-6">Nouveau Client</h3>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <input type="hidden" name="workspace_id" value={workspaceId} />
                            <input name="name" required placeholder="Nom du client / Entreprise" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                            <input name="email" type="email" placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                            <input name="phone" placeholder="Téléphone" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                            <input name="address" placeholder="Adresse complète" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none" />
                            <button disabled={loading} className="mt-2 w-full h-12 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors">{loading ? '...' : 'Créer Client'}</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}