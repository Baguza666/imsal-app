'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 border-r border-surface-stroke bg-surface-card h-screen fixed left-0 top-0 flex flex-col p-6 z-10">
            {/* LOGO */}
            <div className="mb-12">
                <h1 className="font-bold text-2xl tracking-tighter text-brand-accent">
                    IMSAL<span className="text-brand-gold">.</span>
                </h1>
                <p className="text-xs text-text-muted font-mono mt-1">v1.0 Production</p>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 space-y-2">
                <NavItem href="/dashboard" label="Cockpit" active={isActive('/dashboard')} />
                <NavItem href="/invoices/new" label="New Invoice" active={isActive('/invoices/new')} />
                <div className="pt-8">
                    <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4 pl-3">Settings</p>

                    {/* Linked Settings Page */}
                    <NavItem
                        href="/settings"
                        label="Workspace Settings"
                        active={isActive('/settings')}
                    />

                    <NavItem href="#" label="Integration" active={false} />
                </div>
            </nav>

            {/* USER */}
            <div className="border-t border-surface-stroke pt-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-500">
                        ME
                    </div>
                    <div className="text-xs text-text-body font-medium">
                        My Account
                    </div>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ href, label, active }: { href: string, label: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${active
                    ? 'bg-zinc-100 text-brand-accent'
                    : 'text-text-body hover:bg-zinc-50 hover:text-brand-accent'
                }`}
        >
            {label}
        </Link>
    );
}