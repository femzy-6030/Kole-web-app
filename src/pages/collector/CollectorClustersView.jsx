// src/pages/collector/CollectorClustersView.jsx
import React, { useState } from 'react';
import { useClusterStore, normalizeCluster } from '../../store/useClusterStore';
import { OSOGBO_CLUSTERS } from '../../utils/zoneValidator';
import Button from '../../components/common/Button';
import {
    MapPin,
    Layers,
    CheckCircle2,
    ToggleLeft,
    ToggleRight,
    Truck,
    Users,
    AlertCircle,
    Calendar,
    Compass,
    Plus
} from 'lucide-react';

export default function CollectorClustersView() {
    const { activeClusters, toggleClusterStatus, addActiveCluster } = useClusterStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionNotice, setActionNotice] = useState(null);

    // Cluster metadata enriching OSOGBO_CLUSTERS
    const clusterMeta = {
        'Oke-Fia': {
            assignedTruck: 'Compactor Unit #1',
            crewCount: '4 Crew',
            households: 184,
            waitlisted: 12,
            schedule: 'Daily (Mon - Sat) • 8:00 AM',
            routeNotes: 'Roundabout, FCMB lane, industrial hub access'
        },
        'Sabo': {
            assignedTruck: 'Compactor Unit #2',
            crewCount: '3 Crew',
            households: 142,
            waitlisted: 28,
            schedule: 'Tue, Thu, Sat • 9:00 AM',
            routeNotes: 'Market road, Hausa quarter staging bays'
        },
        'Station Road': {
            assignedTruck: 'Tipper Unit #3',
            crewCount: '3 Crew',
            households: 96,
            waitlisted: 19,
            schedule: 'Mon, Wed, Fri • 10:00 AM',
            routeNotes: 'Railway corridor, Union bank axis'
        },
        'Alekuwodo': {
            assignedTruck: 'Compactor Unit #1',
            crewCount: '4 Crew',
            households: 110,
            waitlisted: 34,
            schedule: 'Mon, Thu, Sat • 7:30 AM',
            routeNotes: 'Alekuwodo street, hospital junction'
        },
        'GRA': {
            assignedTruck: 'Compactor Unit #2',
            crewCount: '4 Crew',
            households: 210,
            waitlisted: 8,
            schedule: 'Daily • 8:30 AM',
            routeNotes: 'Residential estates, VIP gated pickups'
        },
        'Ogo-Oluwa': {
            assignedTruck: 'Compactor Unit #2',
            crewCount: '3 Crew',
            households: 135,
            waitlisted: 45,
            schedule: 'Wed, Sat • 9:00 AM',
            routeNotes: 'Secretariat avenue, state hospital line'
        },
        'Old Garage': {
            assignedTruck: 'Tipper Unit #3',
            crewCount: '2 Crew',
            households: 78,
            waitlisted: 52,
            schedule: 'Tue, Fri • 11:00 AM',
            routeNotes: 'Motor park staging, central garage alley'
        },
        'Agowande': {
            assignedTruck: 'Tipper Unit #3',
            crewCount: '2 Crew',
            households: 64,
            waitlisted: 40,
            schedule: 'Mon, Thu • 1:00 PM',
            routeNotes: 'Agowande residential line'
        },
    };

    const handleToggle = (cluster) => {
        const zoneName = cluster.label || `${cluster.name} Zone`;
        toggleClusterStatus(zoneName);
        const willBeActive = !isClusterActiveLocal(zoneName);

        setActionNotice({
            cluster: zoneName,
            status: willBeActive ? 'ACTIVATED' : 'DEACTIVATED',
        });
        setTimeout(() => setActionNotice(null), 3000);
    };

    const isClusterActiveLocal = (zoneName) => {
        const clean = normalizeCluster(zoneName);
        return (activeClusters || []).some((c) => normalizeCluster(c) === clean);
    };

    const filteredClusters = OSOGBO_CLUSTERS.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = OSOGBO_CLUSTERS.filter((c) => isClusterActiveLocal(c.label)).length;

    return (
        <div className="space-y-6 text-xs font-sans max-w-5xl mx-auto">
            {/* Top Overview Ribbon */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                <Layers size={18} />
                            </span>
                            <h2 className="text-base font-black text-white">Geographic Cluster Management</h2>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                            Activate or pause door-to-door coverage zones for your fleet in Osogbo
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-[11px] flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-400" />
                            {activeCount} of {OSOGBO_CLUSTERS.length} Active Zones
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                    <input
                        type="text"
                        placeholder="Search clusters (e.g. Oke-Fia, Sabo, GRA)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:max-w-xs p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-bold focus:outline-none focus:border-emerald-500 text-xs"
                    />

                    <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                        Toggling a cluster immediately updates customer dispatch availability
                    </span>
                </div>
            </div>

            {/* Action Feedback Banner */}
            {actionNotice && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>
                            <strong className="font-black">{actionNotice.cluster}</strong> has been{' '}
                            <strong>{actionNotice.status.toLowerCase()}</strong> for live customer dispatches.
                        </span>
                    </div>
                </div>
            )}

            {/* Clusters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClusters.map((cluster) => {
                    const isActive = isClusterActiveLocal(cluster.label);
                    const meta = clusterMeta[cluster.name] || {
                        assignedTruck: 'Compactor Unit #1',
                        crewCount: '3 Crew',
                        households: 90,
                        waitlisted: 20,
                        schedule: 'Mon, Wed, Fri • 9:00 AM',
                        routeNotes: 'General municipal route'
                    };

                    return (
                        <div
                            key={cluster.name}
                            className={`bg-white rounded-3xl p-5 border transition-all shadow-sm space-y-4 ${
                                isActive
                                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                                    : 'border-slate-200/80 opacity-90'
                            }`}
                        >
                            {/* Cluster Card Header with Toggle Switch */}
                            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                                        <h3 className="font-black text-slate-900 text-sm">{cluster.label}</h3>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        GPS Center: {cluster.lat.toFixed(4)}°N, {cluster.lng.toFixed(4)}°E
                                    </p>
                                </div>

                                {/* Active Toggle Switch Button */}
                                <button
                                    type="button"
                                    onClick={() => handleToggle(cluster)}
                                    className={`px-3 py-1.5 rounded-2xl font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {isActive ? (
                                        <>
                                            <ToggleRight size={18} />
                                            <span>ACTIVE</span>
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft size={18} />
                                            <span>PAUSED</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Status Indicator */}
                            <div className="flex items-center justify-between text-[11px]">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                                    }`}
                                >
                                    {isActive ? '● Live Dispatch Coverage Active' : '○ Waitlist Mode Only'}
                                </span>

                                <span className="text-slate-500 text-[10px] font-bold">
                                    {meta.assignedTruck}
                                </span>
                            </div>

                            {/* Metrics & Route Details */}
                            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-2xl text-[10px]">
                                <div>
                                    <p className="text-slate-400 font-bold uppercase">Active Households</p>
                                    <p className="font-black text-slate-800 text-xs mt-0.5">{meta.households} Homes</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase">Waitlist Demand</p>
                                    <p className="font-black text-amber-700 text-xs mt-0.5">{meta.waitlisted} Captures</p>
                                </div>
                                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                                    <p className="text-slate-400 font-bold uppercase flex items-center gap-1">
                                        <Calendar size={10} /> Pickup Schedule:
                                    </p>
                                    <p className="font-bold text-slate-700 mt-0.5">{meta.schedule}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
