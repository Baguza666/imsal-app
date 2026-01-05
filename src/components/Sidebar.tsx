'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    // Helper to check active state
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    return (
        <aside className="w-64 bg-surface-app border-r border-surface-stroke h-screen fixed left-0 top-0 flex flex-col z-20">

            {/* 1. LOGO AREA */}
            <div className="p-8 pb-12">
                <h1 className="font-bold text-2xl tracking-tighter text-white">
                    IMSAL<span className="text-brand-gold">SERVICES</span>
                </h1>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] mt-1">
                    Travaux Divers & Aménagement
                </p>
            </div>

            {/* 2. NAVIGATION LINKS */}
            <nav className="flex-1 flex flex-col gap-2 px-4">
                <NavItem
                    href="/dashboard"
                    label="Tableau de bord"
                    active={isActive('/dashboard')}
                    icon="📊"
                />
                <NavItem
                    href="/invoices/new"
                    label="Nouvelle Facture"
                    active={false} // Always inactive action
                    icon="📄"
                    isAction={true} // Special styling for "New"
                />
                {/* SEPARATOR */}
                <div className="h-px bg-surface-stroke my-4 mx-2"></div>

                <NavItem
                    href="/clients"
                    label="Clients"
                    active={isActive('/clients')}
                    icon="👥"
                />
                <NavItem
                    href="#"
                    label="Rapports"
                    active={false}
                    icon="📈"
                />
                <div className="mt-auto"></div> {/* Push settings down */}
                <NavItem
                    href="/settings"
                    label="Paramètres"
                    active={isActive('/settings')}
                    icon="⚙️"
                />
            </nav>

            {/* 3. PROFILE (Bottom Fixed) */}
            <div className="p-6 border-t border-surface-stroke mt-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-gold text-black font-bold flex items-center justify-center text-sm border-2 border-white/10">
                        IA
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">Imane Assal</span>
                        <span className="text-xs text-text-muted mt-1">CEO</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

// NAVIGATION COMPONENT
function NavItem({ href, label, active, icon, isAction }: any) {
    if (isAction) {
        return (
            <Link
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-black bg-brand-gold hover:bg-brand-goldHover transition-all shadow-glow mb-4"
            >
                <span>+</span>
                {label}
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={`relative flex items-center gap-4 px-4 py-3 text-sm font-medium transition-colors group ${active
                    ? 'text-brand-gold'
                    : 'text-text-muted hover:text-white'
                }`}
        >
            {/* Active Indicator (Left Border) */}
            {active && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-brand-gold rounded-r-full"></div>
            )}

            <span className={`text-lg ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                {icon}
            </span>
            {label}
        </Link>
    );
}