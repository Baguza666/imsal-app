'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ui/ModalProvider'; // Import the Modal Hook

export default function InvoiceBuilder() {
    const router = useRouter();
    const { showModal } = useModal(); // Initialize the hook

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Invoice State
    const [selectedClientId, setSelectedClientId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);

    // Fetch Clients & Products on Load
    useEffect(() => {
        const fetchData = async () => {
            const { data: clientsData } = await supabase.from('clients').select('*');
            const { data: productsData } = await supabase.from('products').select('*');
            if (clientsData) setClients(clientsData);
            if (productsData) setProducts(productsData);
        };
        fetchData();
    }, []);

    // Calculations
    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items] as any;
        newItems[index][field] = value;
        setItems(newItems);
    };

    // Select a Pre-defined Product
    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const newItems = [...items];
            newItems[index].description = product.name;
            newItems[index].price = product.price;
            setItems(newItems);
        }
    };

    const handleSave = async () => {
        // Validation: Check Client
        if (!selectedClientId) {
            showModal({
                title: "Oups",
                message: "Veuillez sélectionner un client pour cette facture.",
                type: "error"
            });
            return;
        }

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        // 1. Create Invoice Header
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                owner_id: user?.id,
                client_id: selectedClientId,
                invoice_number: `INV-${Date.now().toString().slice(-6)}`, // Simple auto-number
                status: 'pending',
                issue_date: invoiceDate,
                due_date: dueDate,
                total: calculateTotal()
            })
            .select()
            .single();

        if (invoiceError) {
            showModal({
                title: "Erreur",
                message: "Erreur lors de la création de la facture : " + invoiceError.message,
                type: "error"
            });
            setLoading(false);
            return;
        }

        // 2. Create Invoice Items (Lines)
        const invoiceItems = items.map(item => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.price,
            amount: item.quantity * item.price
        }));

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(invoiceItems);

        if (!itemsError) {
            // SUCCESS: Show Modal then Redirect
            showModal({
                title: "Facture Créée !",
                message: "La facture a été enregistrée avec succès.",
                type: "success",
                confirmText: "Voir les factures",
                onConfirm: () => {
                    router.push('/invoices');
                    router.refresh();
                }
            });
        } else {
            showModal({
                title: "Erreur Détails",
                message: "La facture a été créée mais une erreur est survenue lors de l'ajout des produits.",
                type: "error"
            });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            {/* HEADER INFO */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs text-[#a1a1aa] uppercase font-bold mb-2">Client</label>
                    <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                    >
                        <option value="">Sélectionner un client...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-[#a1a1aa] uppercase font-bold mb-2">Date d'émission</label>
                        <input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#a1a1aa] uppercase font-bold mb-2">Échéance</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* LINE ITEMS */}
            <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Services & Produits</h3>

                <div className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1 space-y-2">
                                {/* Product Select Helper */}
                                <select
                                    onChange={(e) => handleProductSelect(index, e.target.value)}
                                    className="w-full bg-white/5 text-xs text-[#a1a1aa] border border-white/5 rounded-lg p-2 mb-1"
                                >
                                    <option value="">Choisir un produit enregistré...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} Dh)</option>)}
                                </select>

                                <input
                                    placeholder="Description du service"
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                                />
                            </div>

                            <div className="w-24">
                                <input
                                    type="number"
                                    placeholder="Qté"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary text-center"
                                />
                            </div>

                            <div className="w-32">
                                <input
                                    type="number"
                                    placeholder="Prix"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary text-right"
                                />
                            </div>

                            <button
                                onClick={() => handleRemoveItem(index)}
                                className="mt-8 text-red-500 hover:text-red-400"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleAddItem}
                    className="mt-6 text-primary text-sm font-bold flex items-center gap-2 hover:opacity-80"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    AJOUTER UNE LIGNE
                </button>
            </div>

            {/* FOOTER TOTALS */}
            <div className="flex justify-end items-center gap-8 pt-4">
                <div className="text-right">
                    <p className="text-sm text-[#a1a1aa]">Total HT</p>
                    <p className="text-3xl font-bold text-white">{calculateTotal().toFixed(2)} <span className="text-primary text-lg">Dh</span></p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gold-gradient text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform"
                >
                    {loading ? 'ENREGISTREMENT...' : 'CRÉER LA FACTURE'}
                </button>
            </div>
        </div>
    );
}