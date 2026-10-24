// src/layouts/CollectorLayout.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useClusterStore } from '../store/useClusterStore';
import {
    Truck,
    ShieldCheck,
    Layers,
    LifeBuoy,
    LogOut,
    ExternalLink,
    MapPin,
    Radio,
    Menu,
    X,
    Bell,
    CheckCircle2
} from 'lucide-react';

export default function CollectorLayout({ activeSection = 'requests', onNavigate, children }) {
    const { user, logout } = useAuthStore();
    const { activeClusters, registeredCollectors, assistanceTickets } = useClusterStore();
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeCollector = (registeredCollectors && registeredCollectors[0]) || user || {
        companyName: 'Osogbo Central Cleaners Ltd',
        phone: '08012345678',
        Area: 'Oke-Fia',
        cluster: 'Oke-Fia Zone',
    };

    const navItems = [
        {
            key: 'requests',
            path: '/collector/dashboard',
            label: 'Pickup Requests',
            icon: Truck,
            badge: null,
        },
        {
            key: 'profiles',
            path: '/collector/profiles',
            label: 'Collector Profiles',
            icon: ShieldCheck,
            badge: 'Verified',
        },
        {
            key: 'clusters',
            path: '/collector/clusters',
            label: 'Geographic Clusters',
            icon: Layers,
            badge: `${(activeClusters || []).length} Active`,
        },
        {
            key: 'assistances',
            path: '/collector/assistances',
            label: 'Cluster Assistances',
            icon: LifeBuoy,
            badge: (assistanceTickets || []).filter(t => t.status !== 'Resolved').length || null,
        },
    ];

    const handleTabClick = (item) => {
        if (onNavigate) {
            onNavigate(item.key, item.path);
        } else if (typeof window !== 'undefined') {
            window.history.pushState({}, '', item.path);
            window.dispatchEvent(new Event('popstate'));
        }
        setIsMobileMenuOpen(false);
    };

    const handleSignOut = () => {
        logout();
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/collector');
            window.dispatchEvent(new Event('popstate'));
        }
    };

    const handleSwitchToResident = () => {
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row font-sans text-slate-100 antialiased">
            {/* ======================================================== */}
            {/* DESKTOP SIDEBAR NAVIGATION (md: and up)                 */}
            {/* ======================================================== */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0 sticky top-0 h-screen justify-between p-4 z-30">
                <div className="space-y-6">
                    {/* Brand Header */}
                    <div className="px-2 pt-2 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                    <Truck size={20} />
                                </span>
                                <div>
                                    <h1 className="font-black text-sm text-white tracking-wider">KÓLẸ̀</h1>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                                        Operator Portal
                                    </p>
                                </div>
                            </div>
                        </div>

                        <span className="relative flex h-2.5 w-2.5" title="Live Dispatch Socket Active">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                    </div>

                    {/* Operator Profile Card */}
                    <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Active Fleet
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                                {isOnDuty ? '🟢 On Duty' : '⚪ Standby'}
                            </span>
                        </div>
                        <div>
                            <p className="font-black text-white text-xs truncate">
                                {activeCollector.companyName || 'Osogbo Central Cleaners'}
                            </p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-emerald-400 shrink-0" />
                                <span className="truncate">{activeCollector.Area || 'Oke-Fia'} Zone Base</span>
                            </p>
                        </div>
                    </div>

                    {/* Primary 4 Backend Section Navigation Items */}
                    <nav className="space-y-1.5 text-xs">
                        <p className="px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                            Operations Modules
                        </p>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.key;

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => handleTabClick(item)}
                                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                                        <span>{item.label}</span>
                                    </div>

                                    {item.badge && (
                                        <span
                                            className={`text-[10px] px-2 py-0.5 rounded-md font-black ${
                                                isActive
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-slate-800 text-slate-400'
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Options & Sign Out */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                    <button
                        type="button"
                        onClick={handleSwitchToResident}
                        className="w-full py-2.5 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                    >
                        <ExternalLink size={14} />
                        <span>Resident & Household App</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full py-2.5 px-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                    >
                        <LogOut size={14} />
                        <span>Operator Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* ======================================================== */}
            {/* MOBILE TOP BAR (Phone Viewports < md)                    */}
            {/* ======================================================== */}
            <div className="md:hidden bg-slate-950 border-b border-slate-800 p-3.5 px-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <Truck size={16} />
                    </span>
                    <div>
                        <h1 className="font-black text-xs text-white">KÓLẸ̀ Operator</h1>
                        <p className="text-[10px] text-emerald-400 font-bold truncate max-w-[150px]">
                            {activeCollector.companyName || 'Osogbo Central'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="p-2 text-slate-400 hover:text-rose-400 text-xs font-bold flex items-center gap-1"
                        title="Sign Out"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* MAIN CONTENT AREA                                        */}
            {/* ======================================================== */}
            <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 min-h-screen overflow-y-auto">
                {/* Header Bar inside Main */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                            <span>KÓLẸ̀ Osogbo</span>
                            <span>•</span>
                            <span className="text-emerald-400">{activeCollector.Area || 'Oke-Fia'} Cluster Hub</span>
                        </div>
                        <h2 className="text-xl font-black text-white capitalize">
                            {navItems.find(n => n.key === activeSection)?.label || 'Operations Bay'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOnDuty(!isOnDuty)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                                isOnDuty
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                        >
                            <Radio size={12} className={isOnDuty ? 'animate-pulse text-emerald-400' : ''} />
                            <span>{isOnDuty ? 'Dispatch Stream: LIVE' : 'Dispatch: PAUSED'}</span>
                        </button>
                    </div>
                </div>

                {/* Render active page child component */}
                <div className="animate-in fade-in duration-150">
                    {children}
                </div>
            </main>

            {/* ======================================================== */}
            {/* FIXED MOBILE BOTTOM NAVIGATION BAR (100% Mobile)         */}
            {/* ======================================================== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex justify-around items-center text-[10px]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => handleTabClick(item)}
                            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer relative ${
                                isActive
                                    ? 'text-emerald-400 font-black'
                                    : 'text-slate-400 font-bold hover:text-slate-200'
                            }`}
                        >
                            <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                            <span className="mt-1">{item.label.split(' ')[0]}</span>

                            {/* Active Underline Pill */}
                            {isActive && (
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5" />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
