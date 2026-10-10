import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Logo from '../common/Logo';
import { ShieldCheck, LogOut, LayoutDashboard, Users, Megaphone, DollarSign } from 'lucide-react';

export default function AdminNavbar({ activeTab, setActiveTab }) {
    const { logout } = useAuthStore();

    const navItems = [
        { id: 'overview', label: 'Operations', icon: LayoutDashboard },
        { id: 'collectors', label: 'Collectors', icon: Users },
        { id: 'pricing', label: 'Pricing & Fees', icon: DollarSign },
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    ];

    return (
        <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Brand & Admin Badge */}
                <div className="flex items-center gap-3">
                    <Logo className="h-7 w-auto text-white" />
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck size={12} />
                        Admin Operations
                    </span>
                </div>

                {/* Desktop Navigation Tabs */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === item.id
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout Action */}
                <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Sign Out Admin"
                >
                    <LogOut size={18} />
                </button>

            </div>

            {/* Mobile Tab Bar */}
            <div className="flex md:hidden border-t border-slate-800 px-2 py-1 bg-slate-900/95 overflow-x-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex-1 min-w-[80px] py-2 text-[10px] font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-brand-accent' : 'text-slate-400'
                                }`}
                        >
                            <Icon size={16} />
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </header>
    );
}