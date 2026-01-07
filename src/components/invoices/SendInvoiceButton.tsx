'use client';

import { useState } from 'react';
import { sendEmail } from '@/app/actions/sendEmail';
import { useModal } from '@/components/ui/ModalProvider'; // Import Hook

export default function SendInvoiceButton({
    clientEmail,
    clientName,
    invoiceNumber,
    amount
}: {
    clientEmail: string,
    clientName: string,
    invoiceNumber: string,
    amount: number
}) {
    const [loading, setLoading] = useState(false);
    const { showModal } = useModal(); // Use the hook

    const handleSend = () => {
        if (!clientEmail) {
            showModal({
                title: "Email manquant",
                message: "Ce client n'a pas d'adresse email enregistrée.",
                type: "error"
            });
            return;
        }

        // Replace native confirm() with showModal()
        showModal({
            title: "Confirmer l'envoi",
            message: `Envoyer la facture #${invoiceNumber} (${amount} Dh) à ${clientEmail} ?`,
            type: "confirm",
            confirmText: "Envoyer l'email",
            onConfirm: async () => {
                setLoading(true);
                const result = await sendEmail({
                    to: clientEmail,
                    subject: `Facture #${invoiceNumber} - IMSAL Services`,
                    html: `...your html code...`
                });
                setLoading(false);

                // Show success/error result
                showModal({
                    title: result.success ? "Email Envoyé" : "Erreur",
                    message: result.message,
                    type: result.success ? "success" : "error"
                });
            }
        });
    };

    return (
        <button
            onClick={handleSend}
            disabled={loading}
            className="text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
            title="Envoyer par email"
        >
            <span className="material-symbols-outlined text-[20px]">
                {loading ? 'hourglass_top' : 'send'}
            </span>
        </button>
    );
}