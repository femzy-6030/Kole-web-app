// src/pages/collector/CollectorClustersView.jsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import {
    MapPin,
    Truck,
    CheckCircle2,
    Calendar,
    Compass,
    Navigation
} from 'lucide-react';

export default function CollectorClustersView() {
    const { user } = useAuthStore();
    const assignedArea = user?.Area || user?.area || 'Oke-Fia';
    const assignedClusterName = user?.assignedCluster || (assignedArea.toLowerCase().endsWith('zone') ? assignedArea : `${assignedArea} Zone`);

    const clusterMeta = {
        'Oke-Fia': {
            assignedTruck: 'Compactor Unit #1',
            crewCount: '4 Sanitation Staff',
            schedule: 'Daily (Mon - Sat) • 8:00 AM - 5:00 PM',
            routeNotes: 'Oke-Fia Roundabout, FCMB Service Lane, Industrial Hub Corridor',
            gpsCenter: '7.7827°N, 4.5418°E',
        },
        'Sabo': {
            assignedTruck: 'Compactor Unit #2',
            crewCount: '3 Sanitation Staff',
            schedule: 'Tue, Thu, Sat • 9:00 AM - 4:00 PM',
            routeNotes: 'Market Road, Hausa Quarter Staging Bays',
            gpsCenter: '7.7891°N, 4.5620°E',
        },
        'Station Road': {
            assignedTruck: 'Tipper Unit #3',
            crewCount: '3 Sanitation Staff',
            schedule: 'Mon, Wed, Fri • 10:00 AM - 4:00 PM',
            routeNotes: 'Railway Corridor, Union Bank Axis',
            gpsCenter: '7.7690°N, 4.5510°E',
        },
    };

    const currentMeta = clusterMeta[assignedArea] || {
        assignedTruck: 'Compactor Unit #1',
        crewCount: '4 Sanitation Staff',
        schedule: 'Daily (Mon - Sat) • 8:00 AM - 5:00 PM',
        routeNotes: `${assignedClusterName} Municipal Staging Route`,
        gpsCenter: '7.7827°N, 4.5418°E',
    };

    return (
        <div className="space-y-6 text-xs font-sans max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <MapPin size={18} />
                    </span>
                    <div>
                        <h2 className="text-base font-black text-white">Assigned Coverage Zone</h2>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                            Official operational sector and schedule assigned to your fleet
                        </p>
                    </div>
                </div>
            </div>

            {/* Assigned Zone Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                                Active Operational Sector
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mt-1">{assignedClusterName}</h3>
                        <p className="text-slate-400 text-xs font-mono mt-0.5 flex items-center gap-1">
                            <Compass size={12} className="text-emerald-600" /> GPS Center: {currentMeta.gpsCenter}
                        </p>
                    </div>

                    <span className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                        <CheckCircle2 size={24} />
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Truck size={12} className="text-emerald-600" /> Assigned Fleet Unit
                        </p>
                        <p className="font-black text-slate-800 text-sm">{currentMeta.assignedTruck}</p>
                        <p className="text-[11px] text-slate-500">{currentMeta.crewCount}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} className="text-emerald-600" /> Clearance Schedule
                        </p>
                        <p className="font-black text-slate-800 text-sm">{currentMeta.schedule}</p>
                        <p className="text-[11px] text-slate-500">Doorstep evacuation hours</p>
                    </div>

                    <div className="col-span-full p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Navigation size={12} className="text-emerald-600" /> Staging Route & Major Access Points
                        </p>
                        <p className="font-bold text-slate-700 text-xs">{currentMeta.routeNotes}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
