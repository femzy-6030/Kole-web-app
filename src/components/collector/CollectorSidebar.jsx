// src/components/collector/CollectorSidebar.jsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import {
    Truck,
    ShieldCheck,
    Layers,
    LifeBuoy,
    LogOut,
    ExternalLink,
    MapPin,
    Radio
} from 'lucide-react';

export default function CollectorSidebar({
    activeSection = 'requests',
    onNavigate,
    activeCollector: propCollector,
    isOnDuty = true,
    onSignOut,
    onSwitchToResident
}) {
    const { user, logout } = useAuthStore();
    const { registeredCollectors, assistanceTickets } = useClusterStore();

    const collector = propCollector || (registeredCollectors && registeredCollectors[0]) || user || {
        companyName: 'YOPPY',
        phone: '08012345678',
        Area: 'Oke-Fia',
        cluster: 'Oke-Fia Zone',
        assignedCluster: 'Oke-Fia Zone',
    };

    const assignedClusterName = collector.assignedCluster || collector.cluster || `${collector.Area || 'Oke-Fia'} Zone`;

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
            // Single-Zone Architecture: Strictly 1 Assigned operating cluster
            badge: '1 Assigned',
            customBadge: (
                <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-medium">
                    1 Assigned
                </span>
            ),
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
    };

    const handleSignOutClick = () => {
        if (onSignOut) {
            onSignOut();
        } else {
            logout();
            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/collector');
                window.dispatchEvent(new Event('popstate'));
            }
        }
    };

    const handleSwitchResidentClick = () => {
        if (onSwitchToResident) {
            onSwitchToResident();
        } else if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
        }
    };

    return (
        <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-slate-950 border-r border-slate-800 shrink-0 sticky top-0 h-screen justify-between p-4 z-30 font-sans text-slate-100">
            <div className="space-y-6">
                {/* Brand Header */}
                <div className="px-2 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <Truck size={20} />
                        </span>
                        <div>
                            <h1 className="font-black text-sm text-white tracking-wider">KÓLẸ̀</h1>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                                Operations Portal
                            </p>
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
                            Active Fleet Lead
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                            {isOnDuty ? '🟢 On Duty' : '⚪ Standby'}
                        </span>
                    </div>
                    <div>
                        <p className="font-black text-white text-xs truncate">
                            {collector.companyName || 'YOPPY Cleaners'}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{assignedClusterName} Base</span>
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

                                {item.customBadge ? (
                                    isActive ? (
                                        <span className="px-2 py-0.5 text-xs bg-white/20 text-white rounded-full font-medium">
                                            1 Assigned
                                        </span>
                                    ) : (
                                        item.customBadge
                                    )
                                ) : item.badge ? (
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-md font-black ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-800 text-slate-400'
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Options & Sign Out */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                <button
                    type="button"
                    onClick={handleSwitchResidentClick}
                    className="w-full py-2.5 px-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                >
                    <ExternalLink size={14} />
                    <span>Resident & Household App</span>
                </button>

                <button
                    type="button"
                    onClick={handleSignOutClick}
                    className="w-full py-2.5 px-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 font-bold flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                >
                    <LogOut size={14} />
                    <span>Operator Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
