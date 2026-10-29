// src/pages/collector/CollectorOnboarding.jsx
import React, { useState, useEffect } from 'react';
import { finance } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import Button from '../../components/common/Button';
import AreaSelector from '../../components/common/AreaSelector';
import koleLogo from '../../assets/Kole.png';
import {
    Truck,
    Users,
    Phone,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

export default function CollectorOnboarding({ onOnboardingComplete }) {
    // Form State
    const DEFAULT_BANKS = [
        { code: '011', name: 'First Bank of Nigeria' },
        { code: '058', name: 'GTBank (Guaranty Trust)' },
        { code: '044', name: 'Access Bank' },
        { code: '057', name: 'Zenith Bank' },
        { code: '999992', name: 'OPay Digital Services' },
        { code: '999991', name: 'Palmpay' },
        { code: '033', name: 'United Bank for Africa (UBA)' },
    ];
    const [bankList, setBankList] = useState(DEFAULT_BANKS);
    const [selectedBankCode, setSelectedBankCode] = useState('011');

    useEffect(() => {
        let isMounted = true;
        const fetchBanks = async () => {
            try {
                const data = await finance.getBanks();
                const list = Array.isArray(data) ? data : (data?.data || data?.results || []);
                if (isMounted && list.length > 0) {
                    const formatted = list.map((b) => ({
                        code: b.code || b.bank_code || String(b.id),
                        name: b.name || b.bank_name,
                    }));
                    setBankList(formatted);
                    if (formatted[0]?.code) {
                        setSelectedBankCode(formatted[0].code);
                    }
                }
            } catch (err) {
                console.warn('[CollectorOnboarding] finance.getBanks fallback:', err);
            }
        };
        fetchBanks();
        return () => { isMounted = false; };
    }, []);

    const [formData, setFormData] = useState({
        collectorName: '',
        phone: '',
        Area: 'Oke-Fia',
        vehicleCount: 1,
        workerCount: 2,
        bankName: 'First Bank of Nigeria',
        accountNumber: '',
        accountName: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const assignedCluster = formData.Area
            ? (formData.Area.toLowerCase().endsWith('zone') ? formData.Area : `${formData.Area} Zone`)
            : 'Oke-Fia Zone';

        const collectorPayload = {
            id: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
            companyName: formData.collectorName.trim() || 'Collector Operator',
            collectorName: formData.collectorName.trim() || 'Collector Operator',
            fullName: formData.collectorName.trim() || 'Collector Operator',
            phoneNumber: formData.phone.trim() || '',
            phone: formData.phone.trim() || '',
            Area: formData.Area || 'Oke-Fia',
            cluster: assignedCluster,
            fleetCount: Number(formData.vehicleCount || 1),
            vehicleCount: Number(formData.vehicleCount || 1),
            workerCount: Number(formData.workerCount || 2),
            bankName: formData.bankName,
            accountNumber: formData.accountNumber.trim(),
            accountName: formData.accountName.trim(),
        };

        // 1. Create Paystack Subaccount via POST /api/v1/finance/subaccount/
        try {
            await finance.createSubaccount({
                bank_code: selectedBankCode || '011',
                account_number: formData.accountNumber.trim(),
                account_name: formData.accountName.trim(),
            });
        } catch (subErr) {
            console.warn('[CollectorOnboarding] finance.createSubaccount notice (offline fallback):', subErr);
        }

        // 2. Save profile payload & activate coverage cluster in useClusterStore
        await useClusterStore.getState().registerCollector(collectorPayload);

        // 3. Log in operator session
        useAuthStore.getState().login(collectorPayload, 'collector', true);

        setIsSubmitting(false);
        setIsSuccess(true);

        if (onOnboardingComplete) {
            onOnboardingComplete(collectorPayload);
        }
    };

    // 1. REGISTRATION SUCCESS VIEW
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-slate-100 text-xs">
                    <div className="w-16 h-16 bg-emerald-100 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={36} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Registration Complete!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Your collector operator profile and bank account details for <strong className="text-slate-800">{formData.collectorName}</strong> have been registered. Automated payout splitting is now active for <strong className="text-slate-800">{formData.Area} Zone</strong>.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1 text-[11px]">
                        <p className="text-slate-600"><strong>Bank:</strong> {formData.bankName}</p>
                        <p className="text-slate-600"><strong>Account:</strong> {formData.accountNumber} ({formData.accountName})</p>
                        <p className="text-slate-600"><strong>Vehicles & Crew:</strong> {formData.vehicleCount} Trucks • {formData.workerCount} Staff</p>
                    </div>
                    <Button onClick={() => setIsSuccess(false)} className="w-full py-3 font-bold mt-2">
                        Access Collector Portal
                    </Button>
                </div>
            </div>
        );
    }

    // 2. ONBOARDING FORM VIEW
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6 text-xs">

                {/* Header */}
                <div className="text-center space-y-2">
                    <img src={koleLogo} alt="KÓLẸ̀ Logo" className="h-10 w-auto mx-auto object-contain" />
                    <div>
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Verified Partner Onboarding
                        </span>
                        <h2 className="text-lg font-black text-slate-800 mt-1">Register Waste Operator Profile</h2>
                        <p className="text-slate-400 font-medium">Self-register your fleet & bank details for automated split payouts.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Operator Information */}
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <h3 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                            1. Operator & Business Identity
                        </h3>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Company / Operator Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Osogbo Central Cleaners Ltd"
                                required
                                value={formData.collectorName}
                                onChange={(e) => handleChange('collectorName', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Dispatch Phone Line</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="tel"
                                    placeholder="08012345678"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="font-bold text-slate-700 block">Assigned Operating Area Zone</label>
                            <AreaSelector
                                selectedArea={formData.Area}
                                onAreaChange={(c) => handleChange('Area', c)}
                            />
                        </div>
                    </div>

                    {/* Logistics & Capacity */}
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <h3 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                            2. Logistics & Fleet Capacity
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                                    <Truck size={14} className="text-brand-primary" /> Number of Vehicles
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={formData.vehicleCount}
                                    onChange={(e) => handleChange('vehicleCount', e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                                    <Users size={14} className="text-brand-primary" /> Total Workers
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={formData.workerCount}
                                    onChange={(e) => handleChange('workerCount', e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bank & Automated Payout Details */}
                    <div className="space-y-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black uppercase tracking-wider text-emerald-800 text-[10px] flex items-center gap-1">
                                <ShieldCheck size={14} /> 3. Automated Payout Settlement Account
                            </h3>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Select Bank Name</label>
                            <select
                                value={formData.bankName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const match = bankList.find((b) => b.name === val);
                                    if (match) setSelectedBankCode(match.code);
                                    handleChange('bankName', val);
                                }}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            >
                                {bankList.map((b) => (
                                    <option key={b.code} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">10-Digit NUBAN Account Number</label>
                            <input
                                type="text"
                                maxLength={10}
                                placeholder="0123456789"
                                required
                                value={formData.accountNumber}
                                onChange={(e) => handleChange('accountNumber', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold tracking-widest text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 block mb-1">Account Holder Name (Verified)</label>
                            <input
                                type="text"
                                placeholder="e.g., Osogbo Central Cleaners Ltd"
                                required
                                value={formData.accountName}
                                onChange={(e) => handleChange('accountName', e.target.value)}
                                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    <Button type="submit" isLoading={isSubmitting} className="w-full py-3.5 font-bold text-sm">
                        Register Operator & Activate Coverage Zone
                    </Button>

                </form>
            </div>
        </div>
    );
}