// src/pages/OrganizationDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { organization } from '../services/api';
import HeaderBar from '../components/layout/HeaderBar';
import Button from '../components/common/Button';
import OrganizationCheckout, { calculateOrganizationFees } from './OrganizationCheckout';
import InternalEnvironmentalServiceLog from '../components/organization/InternalEnvironmentalServiceLog';
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
    Download,
    GraduationCap,
    UtensilsCrossed,
    Briefcase,
    ShoppingBag,
    HeartPulse,
    AlertCircle,
    Sparkles,
    Check,
    Lock
} from 'lucide-react';

export const CATEGORY_TIER_CONFIG = {
    'Schools & Educational': {
        tierName: 'Light Commercial Tier',
        monthlyPrice: 12000,
        monthlyPriceFormatted: '₦12,000 / mo',
        onDemandPriceFormatted: '₦6,000 / order',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        headerIcon: GraduationCap,
        highlightStreams: ['Paper & Textbooks / Exam Scrap', 'Cardboard & Packaging'],
        defaultStreams: ['Paper & Textbooks / Exam Scrap', 'Cardboard & Packaging'],
        mandatoryFrequencyNotice: null,
        allowedFrequencies: [
            { id: 'weekly', label: 'Weekly Evacuation', price: '₦12,000 / mo' },
            { id: 'bi-weekly', label: 'Bi-Weekly (2x/mo)', price: '₦7,500 / mo' },
            { id: 'on-demand', label: 'On-Demand Bulk Dispatch', price: '₦6,000 / order' },
        ],
        defaultFrequency: 'weekly',
        complianceTag: 'Academic Paper & Carton Recycling Standard',
        helperText: 'Pre-configured with light commercial pricing (₦12,000/mo) and prioritized paper/carton recycling stream.',
    },
    'Restaurants & Food Service': {
        tierName: 'Commercial Fleet Tier',
        monthlyPrice: 35000,
        monthlyPriceFormatted: '₦35,000 / mo',
        onDemandPriceFormatted: '₦15,000 / order',
        badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        headerIcon: UtensilsCrossed,
        highlightStreams: ['Organic & Food Scrap'],
        defaultStreams: ['Organic & Food Scrap', 'General Bulk Waste'],
        mandatoryFrequencyNotice: 'Sanitary Regulation: Food service facilities require mandatory multi-weekly organic waste dispatch to prevent public health odor and pest hazards.',
        allowedFrequencies: [
            { id: 'multi-weekly', label: 'Mandatory Multi-Weekly (3x/wk)', price: '₦35,000 / mo' },
            { id: 'daily', label: 'Daily Priority Fleet (7x/wk)', price: '₦65,000 / mo' },
        ],
        defaultFrequency: 'multi-weekly',
        complianceTag: 'State Public Health & Odor Control Protocol',
        helperText: 'Pre-configured with commercial fleet pricing (₦35,000/mo) with mandatory multi-weekly organic pickup schedules.',
    },
    'Corporate Office / Tech Hub': {
        tierName: 'Small Business Tier',
        monthlyPrice: 15000,
        monthlyPriceFormatted: '₦15,000 / mo',
        onDemandPriceFormatted: '₦8,000 / order',
        badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-300',
        headerIcon: Building2,
        highlightStreams: ['Cardboard & Packaging', 'E-Waste & Electronics'],
        defaultStreams: ['Cardboard & Packaging', 'E-Waste & Electronics'],
        mandatoryFrequencyNotice: null,
        allowedFrequencies: [
            { id: 'weekly', label: 'Weekly Evacuation', price: '₦15,000 / mo' },
            { id: 'bi-weekly', label: 'Bi-Weekly (2x/mo)', price: '₦9,000 / mo' },
            { id: 'on-demand', label: 'On-Demand Bulk Dispatch', price: '₦8,000 / order' },
        ],
        defaultFrequency: 'weekly',
        complianceTag: 'Office Carbon Reduction & E-Waste Standard',
        helperText: 'Default standard Small Business tier (₦15,000/mo) tailored for corporate facilities and tech hubs.',
    },
    'Retail / Plaza': {
        tierName: 'Commercial Plaza Tier',
        monthlyPrice: 25000,
        monthlyPriceFormatted: '₦25,000 / mo',
        onDemandPriceFormatted: '₦12,000 / order',
        badgeColor: 'bg-blue-100 text-blue-950 border-blue-300',
        headerIcon: ShoppingBag,
        highlightStreams: ['Cardboard & Packaging', 'Plastic & Polymers'],
        defaultStreams: ['Cardboard & Packaging', 'Plastic & Polymers'],
        mandatoryFrequencyNotice: null,
        allowedFrequencies: [
            { id: 'weekly', label: 'Weekly Evacuation', price: '₦25,000 / mo' },
            { id: 'bi-weekly', label: 'Bi-Weekly (2x/mo)', price: '₦15,000 / mo' },
            { id: 'on-demand', label: 'On-Demand Bulk Dispatch', price: '₦12,000 / order' },
        ],
        defaultFrequency: 'weekly',
        complianceTag: 'High-Density Plaza & Retail Standard',
        helperText: 'Tailored for retail plazas with high packaging volume and retail bulk waste.',
    },
    'Healthcare / Medical': {
        tierName: 'Sanitized Handling Tier',
        monthlyPrice: 40000,
        monthlyPriceFormatted: '₦40,000 / mo',
        onDemandPriceFormatted: '₦20,000 / order',
        badgeColor: 'bg-rose-100 text-rose-950 border-rose-300',
        headerIcon: HeartPulse,
        highlightStreams: ['Sanitized Non-Hazardous Medical', 'Pharmaceutical Packaging'],
        defaultStreams: ['Sanitized Non-Hazardous Medical', 'Pharmaceutical Packaging'],
        mandatoryFrequencyNotice: 'Sanitary Regulation: Non-hazardous medical packaging requires dedicated sealed routes.',
        allowedFrequencies: [
            { id: 'multi-weekly', label: 'Multi-Weekly Sanitized Route (3x/wk)', price: '₦40,000 / mo' },
            { id: 'weekly', label: 'Weekly Sanitized Evacuation', price: '₦30,000 / mo' },
        ],
        defaultFrequency: 'multi-weekly',
        complianceTag: 'Biosecurity & Clinical Packaging Protocol',
        helperText: 'Dedicated sealed route dispatch for healthcare centers and medical clinics.',
    },
};

const ALL_WASTE_STREAMS = [
    'Paper & Textbooks / Exam Scrap',
    'Cardboard & Packaging',
    'Organic & Food Scrap',
    'E-Waste & Electronics',
    'General Bulk Waste',
    'Plastic & Polymers',
    'Sanitized Non-Hazardous Medical',
    'Pharmaceutical Packaging'
];

export default function OrganizationDashboard({ onOpenSettings }) {
    const { user, addActiveRequest, updateUserProfile } = useAuthStore();

    // 1. Resolve Registered Organization Category
    const category = user?.category || user?.organizationCategory || user?.organization_category || 'Corporate Office / Tech Hub';
    const activeConfig = CATEGORY_TIER_CONFIG[category] || CATEGORY_TIER_CONFIG['Corporate Office / Tech Hub'];
    const CategoryIcon = activeConfig.headerIcon || Building2;

    // 2. Pre-configure waste streams & frequency according to category rules
    const [wasteTypes, setWasteTypes] = useState(activeConfig.defaultStreams);
    const [pickupFrequency, setPickupFrequency] = useState(activeConfig.defaultFrequency);
    const [pickupTimeSlot, setPickupTimeSlot] = useState('morning');
    const [stagingBayNotes, setStagingBayNotes] = useState(
        user?.pickupBay || 'Rear loading dock near generator house'
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Checkout & Audit Log States
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [contractStatus, setContractStatus] = useState(() => user?.commercialContract || null);

    // Sync staging config and schedule from backend API on mount
    useEffect(() => {
        let isMounted = true;
        const loadOrgBackendData = async () => {
            try {
                const staging = await organization.getStagingConfig();
                if (isMounted && staging) {
                    if (staging.notes || staging.staging_bay_notes) {
                        setStagingBayNotes(staging.notes || staging.staging_bay_notes);
                    }
                }
            } catch (e) {
                console.warn('[OrganizationDashboard] getStagingConfig notice (offline fallback):', e);
            }

            try {
                const sched = await organization.getSchedules();
                if (isMounted && sched) {
                    if (sched.frequency) setPickupFrequency(sched.frequency);
                    if (sched.time_slot) setPickupTimeSlot(sched.time_slot);
                    if (Array.isArray(sched.waste_streams) && sched.waste_streams.length > 0) {
                        setWasteTypes(sched.waste_streams);
                    }
                }
            } catch (e) {
                console.warn('[OrganizationDashboard] getSchedules notice (offline fallback):', e);
            }
        };
        loadOrgBackendData();
        return () => { isMounted = false; };
    }, []);

    // Re-synchronize when category changes
    useEffect(() => {
        setWasteTypes(activeConfig.defaultStreams);
        setPickupFrequency(activeConfig.defaultFrequency);
    }, [category]);

    // Check for #checkout or /organization/checkout routing
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.location.hash === '#checkout' || window.location.pathname.includes('/organization/checkout')) {
                setIsCheckoutOpen(true);
            }
        }
    }, []);

    // Sync contract status from user if updated elsewhere
    useEffect(() => {
        if (user?.commercialContract) {
            setContractStatus(user.commercialContract);
        }
    }, [user?.commercialContract]);

    const toggleWasteCategory = (stream) => {
        if (wasteTypes.includes(stream)) {
            setWasteTypes(wasteTypes.filter((c) => c !== stream));
        } else {
            setWasteTypes([...wasteTypes, stream]);
        }
    };

    // Calculate current pricing label based on chosen frequency
    const currentFrequencyObj = activeConfig.allowedFrequencies.find((f) => f.id === pickupFrequency) || activeConfig.allowedFrequencies[0];
    const currentPriceLabel = currentFrequencyObj?.price || activeConfig.monthlyPriceFormatted;

    // Trigger Organization Checkout Modal & persist configuration to backend
    const handleScheduleBulkEvacuation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await organization.saveStagingConfig({
                notes: stagingBayNotes,
                category: category,
            });
        } catch (err) {
            console.warn('[OrganizationDashboard] saveStagingConfig notice (offline fallback):', err);
        }

        try {
            await organization.saveSchedule({
                frequency: pickupFrequency,
                time_slot: pickupTimeSlot,
                waste_streams: wasteTypes,
                category: category,
            });
        } catch (err) {
            console.warn('[OrganizationDashboard] saveSchedule notice (offline fallback):', err);
        }
        setIsSubmitting(false);
        setIsCheckoutOpen(true);
    };

    const handlePaymentVerified = (contractRecord) => {
        setContractStatus(contractRecord);
        setSuccessMessage("Payment verified! Monthly schedule locked.");
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-20 text-xs">
            {/* 1. Global Header Bar */}
            <HeaderBar />

            {/* 2. Dynamic Category-Tailored Organization Profile Header */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-md border border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                            <CategoryIcon size={24} />
                        </div>
                        <div>
                            {/* DYNAMIC CATEGORY & TIER BADGE */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${activeConfig.badgeColor}`}>
                                    {category}
                                </span>
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                    {activeConfig.tierName}
                                </span>
                            </div>

                            <h2 className="text-base font-black text-white mt-1 leading-snug">
                                {user?.orgName || user?.fullName || 'Oroki Innovation Hub'}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium">
                                Officer: {user?.officerInCharge || 'Mr. Lukman Adeoti'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onOpenSettings}
                        className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer transition-colors shrink-0"
                    >
                        Edit Facility
                    </button>
                </div>

                {/* Sub-bar with Cluster & Active Pricing */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-400" /> {user?.Area || 'Oke-Fia'} Cluster
                    </span>
                    {contractStatus?.isPaid ? (
                        <span className="bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-400" /> Active Schedule Locked & Paid
                        </span>
                    ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                            {activeConfig.monthlyPriceFormatted} Tier
                        </span>
                    )}
                </div>
            </div>

            {/* 3. Category Tier Information Banner */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex items-start gap-2.5 text-emerald-950">
                <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                    <strong className="font-black text-emerald-900 block">{category} Engine Activated:</strong>
                    {activeConfig.helperText}
                </div>
            </div>

            {/* 4. Category-Driven Dispatch Engine & Scheduler */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-black uppercase text-brand-primary bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                            {activeConfig.tierName} Dispatch Engine
                        </span>
                        <h3 className="text-base font-black text-slate-800 mt-1">Configure Bulk Waste Evacuation</h3>
                        <p className="text-slate-500 text-[10px]">Tailored for {category} logistics and volume capacity.</p>
                    </div>

                    <div className="text-right">
                        <span className="text-sm font-black text-brand-primary block">{currentPriceLabel}</span>
                        <span className="text-[9px] text-slate-400 font-medium">Tailored Commercial Rate</span>
                    </div>
                </div>

                {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-xs flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleScheduleBulkEvacuation} className="space-y-4">
                    {/* 1. Tailored Waste Stream Selection */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
                                1. Select Waste Stream Categories
                            </label>
                            <span className="text-[9.5px] font-bold text-brand-primary">
                                {activeConfig.highlightStreams.length} Recommended Stream(s)
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {ALL_WASTE_STREAMS.map((cat, idx) => {
                                const isSelected = wasteTypes.includes(cat);
                                const isHighlighted = activeConfig.highlightStreams.includes(cat);

                                return (
                                    <button
                                        type="button"
                                        key={idx}
                                        onClick={() => toggleWasteCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl font-bold text-[10.5px] transition-all cursor-pointer border flex items-center gap-1 ${
                                            isSelected
                                                ? isHighlighted
                                                    ? 'bg-brand-primary text-white border-brand-primary shadow-xs ring-2 ring-emerald-200'
                                                    : 'bg-slate-800 text-white border-slate-800'
                                                : isHighlighted
                                                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                        {cat}
                                        {isHighlighted && !isSelected && (
                                            <span className="text-[8px] uppercase font-black bg-amber-200 text-amber-900 px-1 py-0.2 rounded ml-1">
                                                Priority
                                            </span>
                                        )}
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

                    {/* Mandatory Notice if applicable (e.g. Restaurants) */}
                    {activeConfig.mandatoryFrequencyNotice && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[10.5px] flex items-start gap-2">
                            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                            <div>{activeConfig.mandatoryFrequencyNotice}</div>
                        </div>
                    )}

                    {/* Frequency & Time Slot Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1">
                                Pickup Frequency
                            </label>
                            <select
                                value={pickupFrequency}
                                onChange={(e) => setPickupFrequency(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:outline-none focus:border-brand-primary cursor-pointer"
                            >
                                {activeConfig.allowedFrequencies.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1">
                                Preferred Window
                            </label>
                            <select
                                value={pickupTimeSlot}
                                onChange={(e) => setPickupTimeSlot(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-xs focus:outline-none focus:border-brand-primary cursor-pointer"
                            >
                                <option value="morning">Morning (8 AM - 11 AM)</option>
                                <option value="afternoon">Afternoon (1 PM - 4 PM)</option>
                                {category === 'Restaurants & Food Service' && (
                                    <option value="evening">Night Closing (8 PM - 10 PM)</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Submit Action with tailored price */}
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md bg-emerald-700 hover:bg-emerald-800"
                    >
                        <Truck size={15} /> Lock Bulk Schedule ({currentPriceLabel})
                    </Button>
                </form>
            </div>

            {/* 5. Environmental Compliance & Audit Download */}
            <div className={`rounded-3xl p-4 border flex items-center justify-between gap-3 shadow-sm transition-all ${
                contractStatus?.isPaid
                    ? 'bg-emerald-950 text-white border-emerald-800'
                    : 'bg-slate-900 text-white border-slate-800'
            }`}>
                <div className="space-y-1">
                    {contractStatus?.isPaid ? (
                        <span className="text-[9px] font-black uppercase text-emerald-300 bg-emerald-900 border border-emerald-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            Verified Compliance Active
                        </span>
                    ) : (
                        <span className="text-[9px] font-bold uppercase text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <Lock size={10} /> Subscription Required
                        </span>
                    )}
                    <h4 className="font-black text-xs text-white">
                        {contractStatus?.isPaid ? 'Internal Environmental Service Log' : 'Monthly Verified Audit Certificate'}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-medium">
                        {contractStatus?.isPaid
                            ? `Compliant with KóLẹ̀ T&C Section 1.6 — Ref #${contractStatus.reference}`
                            : `Complete monthly schedule payment to unlock the certified environmental clearance audit.`
                        }
                    </p>
                </div>

                {contractStatus?.isPaid ? (
                    <button
                        type="button"
                        onClick={() => setIsAuditModalOpen(true)}
                        className="p-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl shrink-0 cursor-pointer shadow-md flex items-center gap-1.5 text-[11px] transition-colors"
                    >
                        <Download size={15} /> Audit PDF
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsCheckoutOpen(true)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl shrink-0 cursor-pointer shadow-md flex items-center gap-1.5 text-[11px] border border-slate-700 transition-colors"
                    >
                        <Lock size={15} className="text-amber-400" /> Unlock Audit PDF
                    </button>
                )}
            </div>

            {/* CHECKOUT MODAL / POPUP */}
            <OrganizationCheckout
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                checkoutData={{
                    facilityName: user?.orgName || user?.fullName || 'Oroki Innovation Hub',
                    category: category,
                    cluster: `${user?.Area || user?.area || 'Oke-Fia'} Zone`,
                    basePrice: activeConfig.monthlyPrice,
                    planTitle: `${activeConfig.tierName} (${currentFrequencyObj.label})`,
                    wasteTypes: wasteTypes,
                    stagingBayNotes: stagingBayNotes,
                    frequency: pickupFrequency,
                    timeSlot: pickupTimeSlot,
                    officerName: user?.officerInCharge || 'Mr. Lukman Adeoti',
                    email: user?.email || 'operations@kole.ng',
                    phoneNumber: user?.phoneNumber || '08012345678',
                }}
                onSuccess={handlePaymentVerified}
            />

            {/* INTERNAL ENVIRONMENTAL SERVICE LOG & CLEARANCE AUDIT MODAL */}
            <InternalEnvironmentalServiceLog
                isOpen={isAuditModalOpen}
                onClose={() => setIsAuditModalOpen(false)}
                contractData={contractStatus || {
                    facilityName: user?.orgName || user?.fullName || 'Oroki Innovation Hub',
                    category: category,
                    cluster: `${user?.Area || user?.area || 'Oke-Fia'} Zone`,
                    reference: `KL-ORG-${Date.now()}`,
                    paymentRef: `KL-ORG-${Date.now()}`,
                    amountFormatted: '₦15,584',
                    officerName: user?.officerInCharge || 'Mr. Lukman Adeoti',
                    assignedCollector: 'Osogbo Central Cleaners Ltd',
                    wasteTypes: wasteTypes,
                    stagingBay: stagingBayNotes,
                    frequency: currentFrequencyObj.label,
                    timeSlot: pickupTimeSlot,
                    paidAt: new Date().toISOString(),
                }}
            />
        </div>
    );
}
