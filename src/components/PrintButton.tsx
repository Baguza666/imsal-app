'use client';
export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-6 py-2 border border-brand-gold text-brand-gold font-mono text-xs uppercase hover:bg-brand-gold hover:text-surface-app transition-colors"
        >
            Download / Print
        </button>
    );
}