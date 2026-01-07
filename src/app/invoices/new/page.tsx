import Sidebar from '@/components/Sidebar';
import InvoiceBuilder from '@/components/invoices/InvoiceBuilder';

export default function NewInvoicePage() {
    return (
        <div className="bg-background-dark text-white font-sans overflow-hidden min-h-screen antialiased">
            <div className="flex h-full w-full">
                <Sidebar />

                <main className="flex-1 flex flex-col relative overflow-hidden bg-background-dark ml-72">

                    <header className="absolute top-0 left-0 right-0 z-10 glass-header px-8 h-20 flex items-center justify-between">
                        <h2 className="text-white text-xl font-bold tracking-tight">NOUVELLE FACTURE</h2>
                    </header>

                    <div className="flex-1 overflow-y-auto pt-28 pb-10 px-8">
                        <InvoiceBuilder />
                    </div>
                </main>
            </div>
        </div>
    );
}