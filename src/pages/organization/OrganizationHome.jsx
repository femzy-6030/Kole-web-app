// src/pages/organization/OrganizationHome.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import {
    Building2,
    Truck,
    Calendar,
    FileText,
    Clock,
    Plus,
    MapPin,
    LogOut,
    X,
    CheckCircle2,
    AlertCircle,
    Download
} from 'lucide-react';

export default function OrganizationHome({ onOpenSettings }) {
    const { user, logout } = useAuthStore();

    // Active Modals State
    const [activeModal, setActiveModal] = useState(null); // 'instant' | 'schedule' | 'manifests' | 'selectedManifest'
    const [selectedManifestData, setSelectedManifestData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Form states
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleNotes, setScheduleNotes] = useState('');

    // Live Pickup History State
    const [pickupHistory, setPickupHistory] = useState([
        {
            id: 'KL-ORG-8821',
            date: '10 Oct, 2026',
            wasteType: 'Paper, Packaging & E-Waste',
            volume: '12 Heavy Bags',
            status: 'Evacuated',
            officer: user?.officerInCharge || 'Mr. Lukman Adeoti',
            bay: user?.pickupBay || 'Rear Loading Dock',
            fee: '₦12,500'
        },
        {
            id: 'KL-ORG-8410',
            date: '03 Oct, 2026',
            wasteType: 'Commercial General Waste',
            volume: '15 Heavy Bags',
            status: 'Evacuated',
            officer: user?.officerInCharge || 'Mr. Lukman Adeoti',
            bay: user?.pickupBay || 'Rear Loading Dock',
            fee: '₦15,000'
        },
    ]);

    // Handle Instant Evacuation Trigger
    const handleInstantEvacuation = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const newPickup = {
                id: `KL-ORG-${Math.floor(1000 + Math.random() * 9000)}`,
                date: 'Today (Just Now)',
                wasteType: user?.wasteCategory || 'Commercial Bulk Waste',
                volume: user?.estimatedVolume || '10-15 Bags',
                status: 'Dispatched',
                officer: user?.officerInCharge || 'Mr. Lukman Adeoti',
                bay: user?.pickupBay || 'Rear Loading Dock',
                fee: '₦0.00 (Retainer Covered)'
            };

            setPickupHistory([newPickup, ...pickupHistory]);
            setIsSubmitting(false);
            setActiveModal(null);
            setSuccessMessage('Emergency truck dispatched! Expected arrival in 25 mins.');
            setTimeout(() => setSuccessMessage(''), 5000);
        }, 1000);
    };

    // Handle Scheduled Pickup
    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            const newScheduled = {
                id: `KL-ORG-${Math.floor(1000 + Math.random() * 9000)}`,
                date: scheduleDate || 'Scheduled Date',
                wasteType: 'Scheduled Facility Clear',
                volume: 'Bulk Evacuation',
                status: 'Scheduled',
                officer: user?.officerInCharge || 'Mr. Lukman Adeoti',
                bay: user?.pickupBay || 'Rear Loading Dock',
                fee: '₦0.00 (Retainer Covered)'
            };

            setPickupHistory([newScheduled, ...pickupHistory]);
            setIsSubmitting(false);
            setActiveModal(null);
            setSuccessMessage(`Pickup successfully scheduled for ${scheduleDate}!`);
            setTimeout(() => setSuccessMessage(''), 5000);
        }, 1000);
    };

    return (
        <div className="space-y-5 max-w-lg mx-auto pb-20">

            {/* Toast Alert Notification */}
            {successMessage && (
                <div className="p-4 bg-emerald-900 text-white rounded-2xl border border-emerald-700 shadow-lg flex items-center gap-3 animate-in fade-in text-xs">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <span className="font-bold">{successMessage}</span>
                </div>
            )}

            {/* 1. Header Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3 shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            Institutional Account
                        </span>
                        <h2 className="text-xl font-black mt-1">{user?.orgName || user?.fullName || 'Oroki Innovation Hub'}</h2>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={13} className="text-brand-primary" /> {user?.Area || 'Oke-Fia'} Area Zone
                        </p>
                    </div>

                    <button
                        onClick={onOpenSettings}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
                    >
                        Settings
                    </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                    <span>Officer: <strong className="text-slate-200">{user?.officerInCharge || 'Mr. Lukman Adeoti'}</strong></span>
                    <span>Bay: <strong className="text-slate-200">{user?.pickupBay || 'Rear Loading Dock'}</strong></span>
                </div>
            </div>

            {/* 2. Dispatch Bulk Pickup Actions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-black text-slate-800">Dispatch Commercial Pickup</h3>
                        <p className="text-xs text-slate-500">Schedule bulk waste clearance for your facility.</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-brand-primary rounded-2xl">
                        <Truck size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                        onClick={() => setActiveModal('instant')}
                        className="py-3 px-3 bg-brand-primary hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                        <Plus size={16} /> Instant Evacuation
                    </button>

                    <button
                        onClick={() => setActiveModal('schedule')}
                        className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
                    >
                        <Calendar size={16} /> Schedule Pickup
                    </button>
                </div>
            </div>

            {/* 3. Retainer Status Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black uppercase text-brand-accent">Retainer Status</span>
                        <h4 className="text-base font-black mt-0.5">Monthly Bulk Retainer</h4>
                        <p className="text-xs text-slate-300">Bi-weekly evacuation included</p>
                    </div>
                    <span className="text-xs font-black bg-brand-primary text-white px-2.5 py-1 rounded-xl">
                        Active
                    </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Next Scheduled Clearance:</span>
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                        <Clock size={14} className="text-brand-accent" /> Oct 16, 2026 (08:00 AM)
                    </span>
                </div>
            </div>

            {/* 4. Evacuation History & Manifests */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Evacuation History & Manifests
                    </h3>
                    <button
                        onClick={() => setActiveModal('manifests')}
                        className="text-xs font-bold text-brand-primary cursor-pointer hover:underline"
                    >
                        View All
                    </button>
                </div>

                <div className="space-y-2.5">
                    {pickupHistory.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-800">{log.id}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${log.status === 'Dispatched' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-brand-primary'
                                        }`}>
                                        {log.status}
                                    </span>
                                </div>
                                <p className="text-slate-500">{log.wasteType} • {log.volume}</p>
                                <p className="text-[10px] text-slate-400">{log.date}</p>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedManifestData(log);
                                    setActiveModal('selectedManifest');
                                }}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-sm cursor-pointer"
                                title="View Manifest Document"
                            >
                                <FileText size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sign Out Button */}
            <Button
                onClick={logout}
                variant="secondary"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 py-3 text-xs"
            >
                <LogOut size={16} className="mr-2" /> Sign Out Account
            </Button>

            {/* ================= MODALS ================= */}

            {/* 1. Instant Evacuation Modal */}
            {activeModal === 'instant' && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-base text-slate-800">Confirm Instant Evacuation</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1.5">
                            <p className="font-bold text-slate-800">Dispatch Details:</p>
                            <p className="text-slate-600"><strong>Facility:</strong> {user?.orgName || 'Oroki Innovation Hub'}</p>
                            <p className="text-slate-600"><strong>Staging Area:</strong> {user?.pickupBay || 'Rear Loading Dock'}</p>
                            <p className="text-slate-600"><strong>Contact:</strong> {user?.officerInCharge} ({user?.phoneNumber})</p>
                        </div>

                        <p className="text-slate-500 text-[11px]">
                            An emergency heavy truck will be assigned from the <strong>{user?.Area || 'Oke-Fia'}</strong> Area queue.
                        </p>

                        <Button
                            onClick={handleInstantEvacuation}
                            isLoading={isSubmitting}
                            className="w-full py-3.5 font-bold text-sm"
                        >
                            Confirm & Dispatch Truck Now
                        </Button>
                    </div>
                </div>
            )}

            {/* 2. Schedule Pickup Modal */}
            {activeModal === 'schedule' && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleScheduleSubmit} className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-base text-slate-800">Schedule Facility Clearance</h3>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Select Date</label>
                                <input
                                    type="date"
                                    required
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Logistics Notes for Truck Driver</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g., Gate 2 access required after 9 AM..."
                                    value={scheduleNotes}
                                    onChange={(e) => setScheduleNotes(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-brand-primary"
                                ></textarea>
                            </div>
                        </div>

                        <Button type="submit" isLoading={isSubmitting} className="w-full py-3.5 font-bold text-sm">
                            Confirm Scheduled Pickup
                        </Button>
                    </form>
                </div>
            )}

            {/* 3. Manifest Details / Download Modal */}
            {(activeModal === 'selectedManifest' || activeModal === 'manifests') && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-xs">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-base text-slate-800">Environmental Manifest</h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {selectedManifestData ? (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                <p className="font-black text-slate-800 text-sm">Manifest #{selectedManifestData.id}</p>
                                <p className="text-slate-600"><strong>Evacuation Date:</strong> {selectedManifestData.date}</p>
                                <p className="text-slate-600"><strong>Category:</strong> {selectedManifestData.wasteType}</p>
                                <p className="text-slate-600"><strong>Volume Cleared:</strong> {selectedManifestData.volume}</p>
                                <p className="text-slate-600"><strong>Officer-in-Charge:</strong> {selectedManifestData.officer}</p>
                                <p className="text-slate-600"><strong>Status:</strong> {selectedManifestData.status}</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {pickupHistory.map(item => (
                                    <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-slate-800">{item.id}</p>
                                            <p className="text-[10px] text-slate-500">{item.date} • {item.volume}</p>
                                        </div>
                                        <span className="text-[10px] font-bold bg-emerald-100 text-brand-primary px-2 py-0.5 rounded">
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => {
                                alert('Downloading Environmental Compliance Receipt (PDF)...');
                                setActiveModal(null);
                            }}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Download size={16} /> Download Official Receipt (PDF)
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}