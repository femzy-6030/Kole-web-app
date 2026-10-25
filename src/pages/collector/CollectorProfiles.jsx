// src/pages/collector/CollectorProfiles.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import Button from '../../components/common/Button';
import {
    Truck,
    Users,
    CreditCard,
    Building2,
    Phone,
    ShieldCheck,
    CheckCircle2,
    Save,
    AlertCircle,
    MapPin,
    ExternalLink,
    Lock,
    Radio,
    HardHat
} from 'lucide-react';

export default function CollectorProfiles() {
    const { user, updateUserProfile } = useAuthStore();
    const { registeredCollectors, updateCollectorProfile } = useClusterStore();

    // Current collector profile from store or user session (Single-Zone Architecture)
    const activeCollector = (registeredCollectors && registeredCollectors[0]) || {
        companyName: user?.companyName || user?.fullName || 'YOPPY',
        phone: user?.phone || user?.phoneNumber || '08012345678',
        Area: user?.Area || user?.area || 'Oke-Fia',
        cluster: 'Oke-Fia Zone',
        assignedCluster: 'Oke-Fia Zone',
        vehicleCount: 2,
        fleetCount: 2,
        workerCount: 4,
        crewLeadName: 'Adeyemi Quadri (Chief Driver)',
        crewPhone: '08098765432',
        bankName: 'First Bank of Nigeria',
        accountNumber: '0123456789',
        accountName: 'YOPPY Waste Logistics Ltd',
        hqAddress: 'Plot 8, Oke-Fia Industrial Estate, Osogbo',
    };

    const assignedClusterName = activeCollector.assignedCluster || activeCollector.cluster || `${activeCollector.Area || 'Oke-Fia'} Zone`;

    const [formData, setFormData] = useState({
        companyName: activeCollector.companyName || 'YOPPY',
        phone: activeCollector.phone || activeCollector.phoneNumber || '08012345678',
        Area: activeCollector.Area || 'Oke-Fia',
        assignedCluster: assignedClusterName,
        vehicleCount: activeCollector.vehicleCount || activeCollector.fleetCount || 2,
        workerCount: activeCollector.workerCount || 4,
        crewLeadName: activeCollector.crewLeadName || 'Adeyemi Quadri (Chief Driver)',
        crewPhone: activeCollector.crewPhone || '08098765432',
        bankName: activeCollector.bankName || 'First Bank of Nigeria',
        accountNumber: activeCollector.accountNumber || '0123456789',
        accountName: activeCollector.accountName || 'YOPPY Waste Logistics Ltd',
        hqAddress: activeCollector.hqAddress || 'Plot 8, Oke-Fia Industrial Estate, Osogbo',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSavedNotice(false);

        setTimeout(() => {
            const updated = {
                ...formData,
                vehicleCount: Number(formData.vehicleCount),
                fleetCount: Number(formData.vehicleCount),
                workerCount: Number(formData.workerCount),
                assignedCluster: formData.assignedCluster || 'Oke-Fia Zone',
            };

            // Update stores
            updateCollectorProfile(updated);
            updateUserProfile({
                fullName: formData.companyName,
                companyName: formData.companyName,
                phone: formData.phone,
                phoneNumber: formData.phone,
                Area: formData.Area,
                assignedCluster: updated.assignedCluster,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName,
                vehicleCount: updated.vehicleCount,
                workerCount: updated.workerCount,
                crewLeadName: formData.crewLeadName,
                crewPhone: formData.crewPhone,
                hqAddress: formData.hqAddress,
            });

            setIsSaving(false);
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 4000);
        }, 500);
    };

    return (
        <div className="space-y-6 text-xs font-sans max-w-4xl mx-auto pb-16">
            {/* Header Badge */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                        <Truck size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-white">{formData.companyName}</h2>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck size={12} /> VERIFIED OPERATOR
                            </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                            Primary Hub: <strong className="text-emerald-300">{formData.assignedCluster}</strong> (1 Assigned Zone)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl text-[11px]">
                        Paystack Split: 70% Active
                    </span>
                </div>
            </div>

            {/* Notification Banner */}
            {savedNotice && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 animate-in fade-in duration-200">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <div>
                        <p className="font-bold">Profile & Sanitation Crew Contacts Updated</p>
                        <p className="text-[11px] text-emerald-700">
                            Your fleet specifications, field worker details, and Paystack settlement account have been synchronized.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* 1. Fleet Vehicle & Crew Section */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <Truck size={16} />
                            </span>
                            <h3 className="font-black text-slate-800 text-sm">Fleet Specifications & Crew Capacity</h3>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Single-Zone Allocation</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                                Active Fleet Vehicle Count
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formData.vehicleCount}
                                    onChange={(e) => setFormData({ ...formData, vehicleCount: e.target.value })}
                                    required
                                    className="w-24 p-3 bg-white border border-slate-300 rounded-xl font-black text-lg text-slate-800 focus:outline-none focus:border-emerald-600 text-center"
                                />
                                <div className="text-[11px] text-slate-500">
                                    <p className="font-bold text-slate-700">Compactor / Tipper Trucks</p>
                                    <p className="text-[10px] text-emerald-700 font-bold">
                                        Assigned strictly to {formData.assignedCluster || 'Oke-Fia Zone'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                            <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">
                                Total Crew / Staff Members
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="1"
                                    max="150"
                                    value={formData.workerCount}
                                    onChange={(e) => setFormData({ ...formData, workerCount: e.target.value })}
                                    required
                                    className="w-24 p-3 bg-white border border-slate-300 rounded-xl font-black text-lg text-slate-800 focus:outline-none focus:border-emerald-600 text-center"
                                />
                                <div className="text-[11px] text-slate-500">
                                    <p className="font-bold text-slate-700">Sanitation Crew & Drivers</p>
                                    <p className="text-[10px] text-slate-400">Certified for door-to-door residential pickup</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Operator Identity & Sanitation Workers Dispatch Contacts */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <Building2 size={16} />
                            </span>
                            <div>
                                <h3 className="font-black text-slate-800 text-sm">Operator Identity & Dispatch Contacts</h3>
                                <p className="text-[11px] text-slate-400">Distinguishing Company Leadership from On-Duty Field Sanitation Workers</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <Radio size={12} className="animate-pulse text-emerald-600" /> Live Field Net
                        </span>
                    </div>

                    {/* Part A: Company & Lead Operator Details */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            A. Company Lead & Assigned Cluster Base
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                    Operator / Fleet Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. YOPPY"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">Registered operating entity name</span>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                    Assigned Cluster Base (Single-Zone Locked)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.assignedCluster}
                                        onChange={(e) => setFormData({ ...formData, assignedCluster: e.target.value })}
                                        required
                                        className="w-full p-3 pl-9 bg-emerald-50/50 border border-emerald-200 rounded-xl font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
                                    />
                                    <Lock size={14} className="absolute left-3 top-3.5 text-emerald-600" />
                                </div>
                                <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                                    Single-zone architecture: {formData.assignedCluster} Base
                                </span>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                    Dispatch Lead Line (Primary Household Dispatches)
                                </label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="08012345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Primary operational hotline used by Osogbo control room & households for urgent staging coordination
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Part B: Sanitation Crew & Field Workers on Duty */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                            <div className="flex items-center gap-2">
                                <HardHat size={16} className="text-amber-600" />
                                <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-wider">
                                    B. Sanitation Crew & Drivers (On-Duty Direct Coordination)
                                </h4>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                {formData.workerCount} Active Crew Members
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                    Sanitation Field Supervisor / Driver Lead
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Adeyemi Quadri (Chief Driver)"
                                    value={formData.crewLeadName}
                                    onChange={(e) => setFormData({ ...formData, crewLeadName: e.target.value })}
                                    required
                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">Compactor unit team lead on duty</span>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                    Direct Sanitation Field Crew Phone
                                </label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="e.g. 08098765432"
                                        value={formData.crewPhone}
                                        onChange={(e) => setFormData({ ...formData, crewPhone: e.target.value })}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">Truck cab direct line for gate access & curb clearance</span>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                    Fleet Yard Depot Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Plot 8, Oke-Fia Industrial Estate, Osogbo"
                                    value={formData.hqAddress}
                                    onChange={(e) => setFormData({ ...formData, hqAddress: e.target.value })}
                                    required
                                    className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">Truck parking yard & staging equipment depot</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Paystack Settlement Bank Account Details */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                                <CreditCard size={16} />
                            </span>
                            <h3 className="font-black text-slate-800 text-sm">Paystack Automated Split Settlement Account</h3>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            NUBAN Verified
                        </span>
                    </div>

                    <p className="text-slate-500 text-[11px]">
                        Cleared customer dispatches and SOS emergency payments are split directly into this bank account upon pickup confirmation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                Settlement Bank Name
                            </label>
                            <select
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
                            >
                                <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                                <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                                <option value="Zenith Bank">Zenith Bank</option>
                                <option value="Access Bank">Access Bank</option>
                                <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                                <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                                <option value="Opay Digital Services">Opay Digital Services</option>
                                <option value="Moniepoint Microfinance Bank">Moniepoint Microfinance Bank</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                10-Digit NUBAN Account Number
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block font-bold text-slate-700 uppercase tracking-wide text-[10px] mb-1">
                                Account Holder Name (Must match CAC / Registration)
                            </label>
                            <input
                                type="text"
                                value={formData.accountName}
                                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        isLoading={isSaving}
                        className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                    >
                        <Save size={15} /> Save Fleet Profile & Crew Contacts
                    </Button>
                </div>
            </form>
        </div>
    );
}
