'use client';

import { useState } from 'react';
import { updateClient } from '@/app/actions/updateClient';
import { useModal } from '@/components/ui/ModalProvider';

export default function ClientsList({ initialClients }: { initialClients: any[] }) {
    const [clients, setClients] = useState(initialClients);
    const [editingClient, setEditingClient] = useState<any | null>(null);
    const { showModal } = useModal();

    // Handle Edit Form Submit
    const handleUpdate = async (formData: FormData) => {
        const result = await updateClient(formData);

        if (result.success) {
            showModal({ title: "Succès", message: "Client mis à jour !", type: "success" });
            setEditingClient(null); // Close modal
            // Optimistic update (refresh data locally)
            setClients(clients.map(c => c.id === formData.get('id') ? {
                ...c,
                name: formData.get('name'),
                email: formData.get('email'),
                address: formData.get('address'),
                ice: formData.get('ice')
            } : c));
        } else {
            showModal({ title: "Erreur", message: result.message, type: "error" });
        }
    };

    return (
        <>
            {/* GRID LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.length === 0 ? (
                    <p className="text-gray-500 text-center col-span-full py-10">Aucun client enregistré.</p>
                ) : (
                    clients.map((client) => (
                        <div key={client.id} className="glass-card p-6 rounded-xl border border-white/5 group relative hover:border-primary/50 transition-colors">

                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>

                                {/* EDIT BUTTON (Visible on Hover) */}
                                <button
                                    onClick={() => setEditingClient(client)}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all"
                                    title="Modifier"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>

                            <h3 className="font-bold text-lg text-white mb-1">{client.name}</h3>
                            <p className="text-sm text-gray-400 mb-4">{client.email || 'Pas d\'email'}</p>

                            <div className="space-y-2 text-xs text-gray-500 border-t border-white/5 pt-4">
                                {client.ice && (
                                    <div className="flex justify-between">
                                        <span>ICE:</span> <span className="text-white">{client.ice}</span>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex justify-between items-start">
                                        <span>Adresse:</span> <span className="text-white text-right max-w-[60%] truncate">{client.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* EDIT MODAL */}
            {editingClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-white mb-6">Modifier le client</h3>

                        <form action={handleUpdate} className="space-y-4">
                            <input type="hidden" name="id" value={editingClient.id} />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Nom Entreprise</label>
                                    <input name="name" defaultValue={editingClient.name} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                                    <input name="email" defaultValue={editingClient.email} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase font-bold">ICE (Identifiant Commun)</label>
                                <input name="ice" defaultValue={editingClient.ice} placeholder="Ex: 123456789" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 uppercase font-bold">Adresse Complète</label>
                                <textarea name="address" defaultValue={editingClient.address} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setEditingClient(null)} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white">Annuler</button>
                                <button type="submit" className="bg-primary text-black px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}