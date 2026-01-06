'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import OnboardingModal from './OnboardingModal';
import SidebarProfile from './SidebarProfile';

const menuItems = [
    { name: 'Tableau de bord', icon: 'dashboard', path: '/dashboard' },
    { name: 'Clients', icon: 'groups', path: '/clients' },
    { name: 'Services', icon: 'inventory_2', path: '/products' },
    { name: 'Dépenses', icon: 'account_balance_wallet', path: '/expenses' },
    { name: 'Factures', icon: 'receipt_long', path: '/invoices' },
    { name: 'Rapports', icon: 'bar_chart', path: '/reports' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return (
        <aside className="w-72 h-screen bg-black border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
            {/* 1. Onboarding Popup (Only shows if user has no name set) */}
            <OnboardingModal />

            {/* 2. Logo Section */}
            <div className="p-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    IMSAL<span className="text-primary">SERVICES</span>
                </h1>
                <p className="text-[10px] text-[#a1a1aa] uppercase tracking-[0.2em] mt-1">
                    Travaux Divers & Aménagement
                </p>
            </div>

            {/* 3. Navigation Menu */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-white/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(244,185,67,0.1)]'
                                    : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'group-hover:text-white'
                                    }`}
                            >
                                {item.icon}
                            </span>
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}

                {/* New Invoice Button */}
                <div className="pt-4 pb-2">
                    <Link
                        href="/invoices/new"
                        className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl hover:bg-white/10 hover:border-primary/30 transition-all group"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">add</span>
                        <span className="font-bold text-sm">Nouvelle Facture</span>
                    </Link>
                </div>
            </nav>

            {/* 4. Settings & Dynamic Profile Section */}
            <div className="p-4 space-y-2 bg-black/50 backdrop-blur-xl">
                <Link
                    href="/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/settings'
                            ? 'text-primary bg-white/5'
                            : 'text-[#a1a1aa] hover:text-white'
                        }`}
                >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    <span className="font-medium text-sm">Paramètres</span>
                </Link>

                {/* ✅ This component replaces the static "Imane Assal" HTML */}
                <SidebarProfile />
            </div>
        </aside>
    );
}