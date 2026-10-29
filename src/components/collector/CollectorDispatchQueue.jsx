// src/components/collector/CollectorDispatchQueue.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../common/Button';
import {
    MapPin,
    Zap,
    Navigation,
    Phone,
    CheckCircle2,
    Clock,
    Truck,
    AlertCircle
} from 'lucide-react';

export default function CollectorDispatchQueue() {
    const { activeRequests, user } = useAuthStore();
    const assignedArea = user?.Area || user?.area || 'Oke-Fia';
    const assignedClusterName = user?.assignedCluster || (assignedArea.toLowerCase().endsWith('zone') ? assignedArea : `${assignedArea} Zone`);

    // Store state for managing local job statuses during demo handshake
    const [jobStatuses, setJobStatuses] = useState({});

    const handleUpdateJobStatus = (requestId, newStatus) => {
        setJobStatuses((prev) => ({
            ...prev,
            [requestId]: newStatus
        }));
    };

    // Filter requests strictly to assigned operational cluster
    const filteredRequests = activeRequests ? activeRequests.filter((req) => {
        const reqArea = req.area || req.location?.area || 'Oke-Fia';
        return !reqArea || reqArea.toLowerCase().includes(assignedArea.toLowerCase()) || assignedArea.toLowerCase().includes(reqArea.toLowerCase());
    }) : [];

    return (
        <div className="space-y-4 max-w-lg mx-auto text-xs pb-20">

            {/* Top Stat Bar */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <Truck size={18} />
                        </span>
                        <div>
                            <h2 className="font-black text-sm text-white">Collector Dispatch Bay</h2>
                            <p className="text-[10px] text-slate-400">Live Pickup Queue & Staging Directions</p>
                        </div>
                    </div>

                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase">
                        {filteredRequests.length} Pending
                    </span>
                </div>

                {/* Operating Cluster Display */}
                <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 text-[11px]">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                        <MapPin size={13} className="text-emerald-400" /> Assigned Cluster:
                    </span>
                    <span className="text-emerald-300 font-bold px-3 py-1 bg-slate-900 rounded-xl border border-slate-700">
                        {assignedClusterName}
                    </span>
                </div>
            </div>

            {/* Dispatch Tickets List */}
            <div className="space-y-3">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((req, index) => {
                        const currentStatus = jobStatuses[req.requestId] || req.status || 'PENDING_DISPATCH';
                        const isEmergency = req.priority === 'CRITICAL_SOS' || req.title?.includes('SOS');

                        return (
                            <div
                                key={index}
                                className={`bg-white rounded-3xl p-4 border transition-all shadow-sm space-y-3 ${isEmergency
                                        ? 'border-rose-200 ring-2 ring-rose-500/10'
                                        : 'border-slate-200/80'
                                    }`}
                            >
                                {/* Ticket Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-800 text-xs">{req.requestId}</span>
                                        {isEmergency && (
                                            <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Zap size={10} /> EMERGENCY SOS
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-black text-brand-primary bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                        {req.amount}
                                    </span>
                                </div>

                                {/* Pickup Details */}
                                <div className="space-y-2 text-slate-700 font-medium text-[11px]">
                                    <p className="font-bold text-slate-900 text-xs">{req.title || 'Waste Pickup Request'}</p>

                                    <div className="flex items-start gap-2 text-slate-600">
                                        <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                                        <span>{req.address || req.location?.streetAddress || 'Oke-Fia Junction, Osogbo'}</span>
                                    </div>

                                    {/* Staging Bay Instructions */}
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                                        <Navigation size={13} className="text-brand-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Doorstep Staging Note</p>
                                            <p className="text-[11px] text-slate-700 font-medium italic">
                                                "{req.location?.stagingInstructions || req.stagingNotes || 'Front security gate staging area'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Handshake Actions */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    {currentStatus === 'PENDING_DISPATCH' && (
                                        <Button
                                            onClick={() => handleUpdateJobStatus(req.requestId, 'COLLECTOR_EN_ROUTE')}
                                            className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                        >
                                            <Truck size={14} /> Accept & Start Navigation
                                        </Button>
                                    )}

                                    {currentStatus === 'COLLECTOR_EN_ROUTE' && (
                                        <Button
                                            onClick={() => handleUpdateJobStatus(req.requestId, 'COMPLETED')}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-white"
                                        >
                                            <CheckCircle2 size={14} /> Confirm Waste Picked Up
                                        </Button>
                                    )}

                                    {currentStatus === 'COMPLETED' && (
                                        <div className="w-full py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-1.5">
                                            <CheckCircle2 size={15} className="text-emerald-600" /> Clearance Complete
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                        <AlertCircle size={28} className="text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700 text-xs">No Pending Dispatches</p>
                        <p className="text-slate-400 text-[10px]">There are currently no active requests in the {filterCluster} cluster.</p>
                    </div>
                )}
            </div>

        </div>
    );
}