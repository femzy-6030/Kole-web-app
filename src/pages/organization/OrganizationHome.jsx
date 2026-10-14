// src/pages/organization/OrganizationHome.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import HeaderBar from '../../components/layout/HeaderBar';
import Button from '../../components/common/Button';
import {
    Building2,
    Calendar,
    Clock,
    Truck,
    Layers,
    CheckCircle2,
    FileText,
    MapPin,
    ArrowRight,
    Zap,
    Download
} from 'lucide-react';

export default function OrganizationHome({ onOpenSettings }) {
    const { user, addActiveRequest } = useAuthStore();

    // Form State
    const [wasteTypes, setWasteTypes] = useState(['Cardboard & Packaging', 'General Bulk']);
    const [pickupFrequency, setPickupFrequency] = useState('weekly');
    const [pickupTimeSlot, setPickupTimeSlot] = useState('morning');
    const [stagingBayNotes, setStagingBayNotes] = useState(
        user?.pickupBay || 'Rear loading dock near generator house'
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const availableCategories = [
        'Cardboard & Packaging',
        'General Bulk Waste',
        'E-Waste & Electronics',
        'Organic & Food Scrap',
        'Plastic & Polymers'
    ];

    const toggleWasteCategory = (category) => {
        if (wasteTypes.includes(category)) {
            setWasteTypes(wasteTypes.filter((c) => c !== category));
        } else {
            setWasteTypes([...wasteTypes, category]);
        }
    };

    const handleScheduleBulkEvacuation = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            const bulkPayload = {
                requestId: `#KL-ORG-${Math.floor(100000 + Math.random() * 900000)}`,
                title: `Bulk Commercial Evacuation (${pickupFrequency.toUpperCase()})`,
                amount: pickupFrequency === 'weekly' ? '₦25,000 / mo' : '₦15,000 / order',
                status: 'SCHEDULED_EVACUATION',
                address: user?.address || 'Plot 4, Station Road, Oke-Fia, Osogbo',
                area: user?.Area || 'Oke-Fia',
                wasteTypes: wasteTypes,
                stagingBay: stagingBayNotes,
                timeSlot: pickupTimeSlot,
                createdAt: new Date().toISOString()
            };

            if (addActiveRequest) {
                addActiveRequest(bulkPayload);
            }

            setIsSubmitting(false);
            setSuccessMessage('Bulk waste evacuation schedule successfully logged! Fleet dispatch updated.');

            setTimeout(() => setSuccessMessage(''), 4000);
        }, 1000);
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-20 text-xs">

            {/* 1. Global Header Bar */}
            <HeaderBar />

            {/* 2. Organization Commercial Profile Header */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-md border border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                            <Building2 size={22} />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                Institutional Client
                            </span>
                            <h2 className="text-base font-black text-white mt-1">
                                {user?.orgName || 'Oroki Innovation Hub'}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium">
                                Officer: {user?.officerInCharge || 'Mr. Lukman Adeoti'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onOpenSettings}
                        className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
                    >
                        Edit Facility
                    </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-400" /> {user?.Area || 'Oke-Fia'} Cluster
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
                        Active Bulk Contract
                    </span>
                </div>
            </div>

            {/* 3. Bulk Staging Bay & Schedule Configurator */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div>
                    <span className="text-[10px] font-black uppercase text-brand-primary bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        Commercial Dispatch Engine
                    </span>
                    <h3 className="text-base font-black text-slate-800 mt-1">Configure Bulk Waste Evacuation</h3>
                    <p className="text-slate-500 text-[10px]">Specify facility staging bay details and recurring pickup schedules.</p>
                </div>

                {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleScheduleBulkEvacuation} className="space-y-4">

                    {/* Bulk Waste Categories Multi-Select */}
                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
                            1. Select Waste Stream Categories
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {availableCategories.map((cat, idx) => {
                                const isSelected = wasteTypes.includes(cat);
                                return (
                                    <button
                                        type="button"
                                        key={idx}
                                        onClick={() => toggleWasteCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-[10.5px] transition-all cursor-pointer border ${isSelected
                                                ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {isSelected ? '✓ ' : '+ '}{cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Staging Bay Instructions */}
                    <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
                            2. Designated Facility Staging Bay Notes
                        </label>
                        <textarea
                            value={stagingBayNotes}
                            onChange={(e) => setStagingBayNotes(e.target.value)}
                            rows={2}
                            placeholder="e.g. Rear loading dock near generator house. Access gate key with security guard."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium text-xs focus:outline-none focus:border-brand-primary resize-none"
                            required
                        />
                    </div>

                    {/* Pickup Frequency & Time Slot Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1">
                                Frequency
                            </label>
                            <select
                                value={pickupFrequency}
                                onChange={(e) => setPickupFrequency(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:outline-none focus:border-brand-primary"
                            >
                                <option value="bi-weekly">Bi-Weekly (2x/mo)</option>
                                <option value="weekly">Weekly Evacuation</option>
                                <option value="on-demand">On-Demand Bulk</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1">
                                Preferred Window
                            </label>
                            <select
                                value={pickupTimeSlot}
                                onChange={(e) => setPickupTimeSlot(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:outline-none focus:border-brand-primary"
                            >
                                <option value="morning">Morning (8 AM - 11 AM)</option>
                                <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                        <Truck size={15} /> Lock Bulk Schedule & Transmit Payload
                    </Button>
                </form>
            </div>

            {/* 4. Environmental Compliance & Audit Download */}
            <div className="bg-emerald-950 text-white rounded-3xl p-4 border border-emerald-900 flex items-center justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-900 border border-emerald-700 px-2 py-0.5 rounded">
                        Environmental Compliance
                    </span>
                    <h4 className="font-black text-xs text-white">Monthly Clearance Audit</h4>
                    <p className="text-[10px] text-slate-300 font-medium">Download verified waste disposal certificate for regulatory compliance.</p>
                </div>

                <button
                    onClick={() => alert('Downloading Verified Environmental Compliance Certificate (PDF)...')}
                    className="p-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl shrink-0 cursor-pointer shadow-md flex items-center gap-1.5 text-[11px]"
                >
                    <Download size={15} /> Audit PDF
                </button>
            </div>

        </div>
    );
}