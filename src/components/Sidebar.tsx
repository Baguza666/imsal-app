"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { name: "Tableau de bord", path: "/dashboard", icon: "dashboard" },
        { name: "Clients", path: "/clients", icon: "group" },
        { name: "Services", path: "/products", icon: "inventory_2" }, // Added Services Link
        { name: "Dépenses", path: "/expenses", icon: "account_balance_wallet" }, // Added Expenses Link
        { name: "Rapports", path: "/reports", icon: "bar_chart" },
    ];

    return (
        <aside className="w-72 h-screen fixed left-0 top-0 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">

            {/* LOGO AREA */}
            <div className="h-24 flex flex-col justify-center px-8 border-b border-white/5">
                <h1 className="text-white text-2xl font-black tracking-tighter">
                    IMSAL<span className="text-primary">SERVICES</span>
                </h1>
                <p className="text-[10px] text-text-secondary tracking-widest uppercase mt-1">
                    Travaux Divers & Aménagement
                </p>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 py-8 px-4 flex flex-col gap-2">

                {/* Main Links */}
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive(item.path)
                                ? "bg-primary text-black font-bold shadow-[0_0_20px_rgba(244,185,67,0.3)]"
                                : "text-text-secondary hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        <span className={`material-symbols-outlined text-[22px] transition-colors ${isActive(item.path) ? "text-black" : "group-hover:text-primary"
                            }`}>
                            {item.icon}
                        </span>
                        <span className="text-sm tracking-wide">{item.name}</span>
                    </Link>
                ))}

                {/* 'New Invoice' Shortcut */}
                <div className="mt-4 px-2">
                    <Link
                        href="/invoices/new"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 text-text-secondary hover:border-primary/50 hover:text-primary transition-all duration-300 group"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
                        <span className="text-sm font-medium">Nouvelle Facture</span>
                    </Link>
                </div>
            </nav>

            {/* BOTTOM AREA */}
            <div className="p-4 border-t border-white/5 flex flex-col gap-4">

                {/* Settings Link */}
                <Link
                    href="/settings"
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-text-secondary hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-[22px]">settings</span>
                    <span className="text-sm font-medium">Paramètres</span>
                </Link>

                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="size-9 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                        <span className="text-xs font-bold text-white">IA</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">Imane Assal</span>
                        <span className="text-[10px] text-primary font-medium mt-1">CEO</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}