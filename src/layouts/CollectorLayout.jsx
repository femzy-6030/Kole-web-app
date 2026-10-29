// src/layouts/CollectorLayout.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useClusterStore } from '../store/useClusterStore';
import CollectorSidebar from '../components/collector/CollectorSidebar';
import {
    Truck,
    ShieldCheck,
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
    const { registeredCollectors, assistanceTickets } = useClusterStore();
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeCollector = (registeredCollectors && registeredCollectors[0]) || user || {
        companyName: 'YOPPY',
        phone: '08012345678',
        Area: 'Oke-Fia',
        cluster: 'Oke-Fia Zone',
        assignedCluster: 'Oke-Fia Zone',
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
            <CollectorSidebar
                activeSection={activeSection}
                onNavigate={onNavigate}
                activeCollector={activeCollector}
                isOnDuty={isOnDuty}
                onSignOut={handleSignOut}
                onSwitchToResident={handleSwitchToResident}
            />

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
