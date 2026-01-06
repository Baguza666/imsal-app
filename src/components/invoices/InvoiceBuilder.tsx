'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFullInvoice } from '@/app/actions/invoices';
import InvoiceTemplate from './InvoiceTemplate';

interface InvoiceBuilderProps {
    clients: any[];
    products: any[];
    nextInvoiceNumber: string;
    user: any;
    workspace: any;
}

export default function InvoiceBuilder({ clients, products, nextInvoiceNumber, user, workspace }: InvoiceBuilderProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // FORM STATE
    const [clientId, setClientId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    // ITEMS STATE
    const [items, setItems] = useState([
        { id: Date.now(), product_id: '', description: '', quantity: 1, unit_price: 0 }
    ]);

    // CALCULATIONS
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxRate = 0.20; // 20% TVA
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // DERIVED DATA FOR PREVIEW (Matches InvoiceTemplateProps exactly)
    const selectedClient = clients.find(c => c.id === clientId);

    const previewData = {
        invoice_number: nextInvoiceNumber,
        date: invoiceDate,
        due_date: dueDate,
        client: selectedClient,
        workspace: workspace,
        items: items,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total
    };

    // HANDLERS
    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), product_id: '', description: '', quantity: 1, unit_price: 0 }]);
    };

    const handleRemoveItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId);
        const newItems = [...items];
        newItems[index].product_id = productId;

        if (product) {
            newItems[index].description = product.name;
            newItems[index].unit_price = product.price;
        }
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!clientId) return alert('Veuillez sélectionner un client');

        setLoading(true);
        const formData = {
            client_id: clientId,
            invoice_number: nextInvoiceNumber,
            status: 'Pending',
            due_date: dueDate || invoiceDate,
            total_amount: total
        };

        const result = await createFullInvoice(formData, items);

        if (result.success) {
            router.push('/dashboard');
        } else {
            alert('Erreur lors de la création');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">

            {/* LEFT COLUMN: EDITOR (Scrollable) */}
            <div className="flex-1 lg:max-w-[50%] flex flex-col gap-6 overflow-y-auto pb-20 no-scrollbar">

                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <button onClick={() => router.back()} className="text-text-secondary hover:text-white text-sm font-medium">
                        &larr; Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-full bg-gold-gradient text-black font-bold shadow-[0_0_20px_rgba(244,185,67,0.3)] hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {loading ? 'Enregistrement...' : 'ENREGISTRER'}
                    </button>
                </div>

                {/* Configuration Card */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">settings</span>
                        Informations Générales
                    </h3>

                    <div className="space-y-1">
                        <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">Client</label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-colors cursor-pointer appearance-none"
                        >
                            <option value="">Sélectionner un client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">Date Facture</label>
                            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">Échéance</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary" />
                        </div>
                    </div>
                </div>

                {/* Items Card */}
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">shopping_cart</span>
                        Lignes de facture
                    </h3>
                    <div className="flex flex-col gap-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 relative group hover:border-white/10 transition-all">
                                <button onClick={() => handleRemoveItem(item.id)} className="absolute top-2 right-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>

                                <div className="grid grid-cols-1 gap-3">
                                    {/* Product Select */}
                                    <select
                                        value={item.product_id}
                                        onChange={(e) => handleProductSelect(index, e.target.value)}
                                        className="w-full bg-transparent text-primary text-xs font-bold outline-none mb-1 cursor-pointer"
                                    >
                                        <option value="">Sélectionner un produit (Auto-remplissage)...</option>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>

                                    {/* Description */}
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        placeholder="Description du service"
                                        className="w-full bg-transparent text-white border-b border-white/10 pb-1 focus:border-primary outline-none text-sm font-medium placeholder:text-text-secondary/50"
                                    />

                                    {/* Numbers Row */}
                                    <div className="flex gap-4 mt-1">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-text-secondary uppercase">Qté</label>
                                            <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))} className="w-full bg-black/20 rounded-lg px-2 py-1 text-white text-sm text-right border border-white/5 focus:border-primary outline-none" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-text-secondary uppercase">Prix Unit.</label>
                                            <input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))} className="w-full bg-black/20 rounded-lg px-2 py-1 text-white text-sm text-right border border-white/5 focus:border-primary outline-none" />
                                        </div>
                                        <div className="flex-1 text-right">
                                            <label className="text-[10px] text-text-secondary uppercase">Total</label>
                                            <div className="text-sm font-bold text-white pt-1">{(item.quantity * item.unit_price).toFixed(2)} Dh</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button onClick={handleAddItem} className="w-full py-3 rounded-xl border border-dashed border-white/20 text-text-secondary hover:text-white hover:border-primary/50 hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">add</span> Ajouter une ligne
                        </button>
                    </div>
                </div>

            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW (Sticky) */}
            <div className="hidden lg:block flex-1 h-full sticky top-0 overflow-y-auto rounded-xl">
                <div className="sticky top-6">
                    <div className="mb-4 flex justify-between items-center px-2">
                        <span className="text-xs text-text-secondary uppercase tracking-widest font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Aperçu en direct
                        </span>
                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white border border-white/5">Format A4</span>
                    </div>

                    {/* RENDER THE TEMPLATE */}
                    <div className="origin-top transform scale-[0.85] 2xl:scale-100 transition-transform">
                        <InvoiceTemplate data={previewData} />
                    </div>
                </div>
            </div>

        </div>
    );
}