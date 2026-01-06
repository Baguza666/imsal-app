'use client';

import Link from 'next/link';
// Make sure this path points to where you created the server action:
import { markInvoiceAsPaid } from '@/app/actions/invoices';
import { useState } from 'react';
// Import the new modal:
import ConfirmationModal from '@/components/ConfirmationModal';

interface InvoiceActionsProps {
    id: string;
    status: string;
}

export default function InvoiceActions({ id, status }: InvoiceActionsProps) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Open Modal instead of window.confirm
    const handleInitialClick = () => {
        setIsModalOpen(true);
    };

    // 2. Perform Action when Modal is confirmed
    const handleConfirmPaid = async () => {
        setLoading(true);
        await markInvoiceAsPaid(id);
        setLoading(false);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="flex items-center justify-end gap-2">
                {/* PREVIEW BUTTON */}
                <Link
                    href={`/invoices/${id}`}
                    title="Aperçu"
                    className="size-8 rounded-full flex items-center justify-center bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white transition-all border border-transparent hover:border-white/20"
                >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                </Link>

                {/* EDIT BUTTON (Only if not paid) */}
                {status !== 'Paid' && (
                    <Link
                        href={`/invoices/${id}/edit`}
                        title="Modifier"
                        className="size-8 rounded-full flex items-center justify-center bg-white/5 text-text-secondary hover:bg-blue-500/20 hover:text-blue-400 transition-all border border-transparent hover:border-blue-500/30"
                    >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </Link>
                )}

                {/* MARK AS PAID BUTTON */}
                {status !== 'Paid' ? (
                    <button
                        onClick={handleInitialClick}
                        disabled={loading}
                        title="Marquer comme Payé"
                        className="size-8 rounded-full flex items-center justify-center bg-white/5 text-text-secondary hover:bg-green-500/20 hover:text-green-400 transition-all border border-transparent hover:border-green-500/30 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                ) : (
                    <div className="size-8 flex items-center justify-center text-green-500 opacity-50 cursor-default" title="Déjà payé">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                    </div>
                )}
            </div>

            {/* 3. The Branded Popup */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPaid}
                isLoading={loading}
                title="Confirmer le paiement"
                message="Êtes-vous sûr de vouloir marquer cette facture comme PAYÉE ? Cette action mettra à jour la trésorerie et les rapports financiers."
            />
        </>
    );
}