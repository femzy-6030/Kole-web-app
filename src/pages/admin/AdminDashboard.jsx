// src/pages/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import HeaderBar from '../../components/layout/HeaderBar';
import Button from '../../components/common/Button';
import {
    TrendingUp,
    Users,
    Truck,
    DollarSign,
    MapPin,
    CheckCircle2,
    AlertTriangle,
    Download,
    RefreshCw,
    ShieldCheck,
    CreditCard
} from 'lucide-react';

export default function AdminDashboard() {
    const { activeRequests, logout } = useAuthStore();
    const [selectedClusterFilter, setSelectedClusterFilter] = useState('All');
    const [isSettling, setIsSettling] = useState(false);
    const [settlementSuccess, setSettlementSuccess] = useState('');

    // Mock Collectors for Settlement Table
    const [collectors, setCollectors] = useState([
        { id: 'COL-101', name: 'Adebayo Tiamiyu', zone: 'Oke-Fia', trips: 14, gross: 42000, bank: 'OPay - 0803***112', status: 'UNSETTLED' },
        { id: 'COL-102', name: 'Rasheed Busari', zone: 'Sabo', trips: 9, gross: 27000, bank: 'Kuda - 0901***402', status: 'SETTLED' },
        { id: 'COL-103', name: 'Sikiru Adepoju', zone: 'Station Road', trips: 18, gross: 54000, bank: 'Palmpay - 0812***890', status: 'UNSETTLED' },
    ]);

    // Mock Waitlist Demand Heatmap Data
    const waitlistRequests = [
        { area: 'Agowande / Biket', requests: 48, demandLevel: 'HIGH' },
        { area: 'Ede Road / Osun Shrine', requests: 32, demandLevel: 'MEDIUM' },
        { area: 'Ring Road / Offa Time', requests: 19, demandLevel: 'MODERATE' },
    ];

    const handleSettleCollector = (collectorId) => {
        setIsSettling(true);
        setTimeout(() => {
            setCollectors((prev) =>
                prev.map((c) => (c.id === collectorId ? { ...c, status: 'SETTLED' } : c))
            );
            setIsSettling(false);
            setSettlementSuccess(`Payout successfully processed for ${collectorId}!`);
            setTimeout(() => setSettlementSuccess(''), 3000);
        }, 800);
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-20 text-xs">

            {/* 1. Global System Header Bar & Logout */}
            <div className="flex justify-between items-center bg-slate-900 text-white p-3.5 rounded-2xl shadow-sm border border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-brand-primary text-white rounded-lg font-black text-[10px]">
                        ADMIN
                    </span>
                    <div>
                        <h2 className="font-black text-xs text-white">Central Operations Tower</h2>
                        <p className="text-[9.5px] text-slate-400">Osogbo Waste Ecosystem Control</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                >
                    Sign Out
                </button>
            </div>

            {/* 2. Top Metric Cards (Revenue, Tonnage & Active Volume) */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                    <span className="text-slate-400 text-[9.5px] font-bold uppercase tracking-wider block">
                        Total Gross Revenue
                    </span>
                    <p className="text-lg font-black text-brand-primary">₦123,500</p>
                    <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                        <TrendingUp size={11} /> +18.4% this week
                    </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                    <span className="text-slate-400 text-[9.5px] font-bold uppercase tracking-wider block">
                        Tonnage Cleared
                    </span>
                    <p className="text-lg font-black text-slate-800">4.2 Tons</p>
                    <p className="text-[9px] text-slate-500 font-medium">
                        Oke-Fia & Sabo Clusters
                    </p>
                </div>
            </div>

            {/* 3. Collector Revenue Settlement Engine (80/20 Split) */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-[9px] font-black uppercase text-brand-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Financial Operations
                        </span>
                        <h3 className="font-black text-xs text-slate-800 mt-1">Collector Settlement Engine (80/20)</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">80% Collector / 20% KÓLẸ̀</span>
                </div>

                {settlementSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold rounded-xl flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>{settlementSuccess}</span>
                    </div>
                )}

                <div className="space-y-2">
                    {collectors.map((col) => {
                        const collectorShare = col.gross * 0.8;
                        const platformShare = col.gross * 0.2;

                        return (
                            <div key={col.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-black text-slate-800 text-[11px]">{col.name}</p>
                                        <p className="text-[9.5px] text-slate-400 font-medium">{col.zone} Cluster • {col.trips} Evacuations</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${col.status === 'SETTLED'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {col.status}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-200/60">
                                    <div>
                                        <span className="text-slate-400 font-medium">Payout (80%): </span>
                                        <span className="font-black text-slate-800">₦{collectorShare.toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 font-medium">Commission (20%): </span>
                                        <span className="font-bold text-brand-primary">₦{platformShare.toLocaleString()}</span>
                                    </div>
                                </div>

                                {col.status === 'UNSETTLED' && (
                                    <Button
                                        onClick={() => handleSettleCollector(col.id)}
                                        isLoading={isSettling}
                                        className="w-full py-2 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                                    >
                                        <CreditCard size={13} /> Settle Payout to {col.bank.split(' - ')[0]}
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 4. Out-of-Zone Expansion Demand Heatmap */}
            <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 shadow-md space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-[9px] font-black uppercase text-emerald-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                            Cluster Expansion Radar
                        </span>
                        <h3 className="font-black text-xs text-white mt-1">Unserved Cluster Demand Heatmap</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">99 Waitlisted Users</span>
                </div>

                <div className="space-y-2">
                    {waitlistRequests.map((item, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-emerald-400 shrink-0" />
                                <div>
                                    <p className="font-bold text-white">{item.area}</p>
                                    <p className="text-[9.5px] text-slate-400">{item.requests} Households Waiting</p>
                                </div>
                            </div>

                            <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                                {item.demandLevel} DEMAND
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-[9.5px] text-slate-400 text-center italic">
                    Demand scores are computed automatically from out-of-zone customer waitlist captures.
                </p>
            </div>

        </div>
    );
}