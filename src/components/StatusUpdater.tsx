'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StatusUpdater({ id, currentStatus }: { id: string, currentStatus: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        // 1. Update DB
        await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
        // 2. Refresh the current page data instantly
        router.refresh();
        setLoading(false);
    };

    if (currentStatus === 'Paid') {
        return (
            <button
                onClick={() => updateStatus('Draft')}
                disabled={loading}
                className="px-4 py-2 border border-green-600 bg-green-50 text-green-700 font-mono text-xs uppercase font-bold rounded-sm flex items-center gap-2 hover:bg-green-100 transition-colors"
            >
                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                PAID
            </button>
        );
    }

    return (
        <button
            onClick={() => updateStatus('Paid')}
            disabled={loading}
            className="px-4 py-2 border border-dashed border-gray-400 text-gray-500 font-mono text-xs uppercase hover:border-green-600 hover:text-green-600 hover:bg-green-50 transition-colors"
        >
            {loading ? "SAVING..." : "MARK AS PAID"}
        </button>
    );
}