import React, { useState } from 'react';
import Button from '../common/Button';
import { CheckCircle2, XCircle, Shield, Truck, Phone } from 'lucide-react';

export default function CollectorVerificationQueue() {
    const [collectors, setCollectors] = useState([
        {
            id: 'COL-8821',
            fullName: 'Tunde Adewale',
            phone: '08034567891',
            Area: 'Oke-Fia',
            vehiclePlate: 'OS-123-A08',
            status: 'PENDING',
            submittedAt: '2026-10-10 11:30 AM',
        },
        {
            id: 'COL-8824',
            fullName: 'Ganiyu Busari',
            phone: '08129876543',
            Area: 'Alekuwodo',
            vehiclePlate: 'OS-456-B12',
            status: 'PENDING',
            submittedAt: '2026-10-10 12:15 PM',
        },
        {
            id: 'COL-8810',
            fullName: 'Kazeem Oladipo',
            phone: '07051122334',
            Area: 'Ogo-Oluwa',
            vehiclePlate: 'OS-789-C34',
            status: 'VERIFIED',
            submittedAt: '2026-10-09 04:00 PM',
        },
    ]);

    const handleVerify = (id) => {
        setCollectors(collectors.map(c => c.id === id ? { ...c, status: 'VERIFIED' } : c));
    };

    const handleReject = (id) => {
        setCollectors(collectors.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c));
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black text-slate-800">Collector Verification Queue</h2>
                    <p className="text-xs text-slate-500">Audit vehicle details and grant Area dispatch permissions.</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                    {collectors.filter(c => c.status === 'PENDING').length} Pending Audits
                </span>
            </div>

            <div className="divide-y divide-slate-100">
                {collectors.map((collector) => (
                    <div key={collector.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-800">{collector.fullName}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${collector.status === 'VERIFIED' ? 'bg-emerald-100 text-brand-primary' :
                                    collector.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                    {collector.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Phone size={12} /> {collector.phone}</span>
                                <span className="flex items-center gap-1"><Truck size={12} /> Plate: <strong className="text-slate-700">{collector.vehiclePlate}</strong></span>
                                <span className="flex items-center gap-1"><Shield size={12} /> Area: <strong className="text-brand-primary">{collector.Area}</strong></span>
                            </div>
                        </div>

                        {collector.status === 'PENDING' && (
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => handleVerify(collector.id)}
                                >
                                    <CheckCircle2 size={14} className="mr-1" /> Verify
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                                    onClick={() => handleReject(collector.id)}
                                >
                                    <XCircle size={14} className="mr-1" /> Reject
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}