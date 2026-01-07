'use client';

import { useState } from 'react';
import { sendEmail } from '@/app/actions/sendEmail';

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

    const handleSend = async () => {
        if (!clientEmail) {
            alert("Ce client n'a pas d'adresse email enregistrée.");
            return;
        }

        if (!confirm(`Envoyer la facture #${invoiceNumber} à ${clientEmail} ?`)) return;

        setLoading(true);
        const result = await sendEmail({
            to: clientEmail,
            subject: `Facture #${invoiceNumber} - IMSAL Services`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Bonjour ${clientName},</h2>
          <p>Veuillez trouver ci-joint votre facture <strong>#${invoiceNumber}</strong> d'un montant de <strong>${amount} Dh</strong>.</p>
          <br>
          <p>Cordialement,<br><strong>L'équipe IMSAL Services</strong></p>
        </div>
      `
        });
        setLoading(false);

        alert(result.message);
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