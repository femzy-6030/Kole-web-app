// src/pages/customer/PickupRequestFlow.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { checkZoneCoverage } from '../../utils/zoneValidator';
import {
    Zap,
    Calendar,
    ShieldCheck,
    MapPin,
    AlertCircle,
    ArrowRight,
    Navigation,
    CheckCircle2
} from 'lucide-react';

export default function PickupRequestFlow({ initialPlan = 'one-time', onProceedToCheckout }) {
    const { user, updateUserProfile } = useAuthStore();

    // Request State
    const [selectedPlan, setSelectedPlan] = useState(initialPlan);
    const [selectedArea, setSelectedArea] = useState(user?.Area || user?.area || 'Oke-Fia');
    const [streetAddress, setStreetAddress] = useState(user?.address || '');
    const [stagingInstructions, setStagingInstructions] = useState(user?.pickupBay || '');
    const [isEmergencySOS, setIsEmergencySOS] = useState(initialPlan === 'one-time');

    // Validation
    const [areaError, setAreaError] = useState('');

    const plans = {
        'one-time': {
            id: 'one-time',
            title: 'One-Time SOS Pickup',
            price: '₦1,500',
            numericPrice: 1500,
            desc: 'Immediate emergency dispatch within 30-60 minutes',
            quota: 'Single Dispatch',
            priority: 'HIGH_PRIORITY_SOS'
        },
        'weekly': {
            id: 'weekly',
            title: 'Weekly Household Pass',
            price: '₦4,500 / mo',
            numericPrice: 4500,
            desc: '2 scheduled waste clearances per week',
            quota: '8 Pickups / Month',
            priority: 'STANDARD_SCHEDULED'
        },
        'monthly': {
            id: 'monthly',
            title: 'Monthly Unlimited Pass',
            price: '₦8,000 / mo',
            numericPrice: 8000,
            desc: 'Unlimited waste clearance on demand all month',
            quota: 'Unlimited Pickups',
            priority: 'VIP_UNLIMITED'
        }
    };

    const handlePlanChange = (planKey) => {
        setSelectedPlan(planKey);
        setIsEmergencySOS(planKey === 'one-time');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check Zone Coverage
        const coverage = checkZoneCoverage(selectedArea);
        if (!coverage.active) {
            setAreaError(`KÓLẸ̀ operates waitlist-only in ${selectedArea}. Please select an active cluster like Oke-Fia or Station Road.`);
            return;
        }

        const activePlanDetails = plans[selectedPlan];

        // Structured Dispatch Payload
        const dispatchPayload = {
            requestId: `KL-${Math.floor(100000 + Math.random() * 900000)}`,
            planKey: selectedPlan,
            title: activePlanDetails.title,
            amount: activePlanDetails.price,
            numericAmount: activePlanDetails.numericPrice,
            quota: activePlanDetails.quota,
            priority: isEmergencySOS ? 'CRITICAL_SOS' : activePlanDetails.priority,
            location: {
                area: selectedArea,
                streetAddress: streetAddress || 'Oke-Fia Junction, Osogbo',
                stagingInstructions: stagingInstructions || 'Front Staging Gate'
            },
            status: 'PENDING_DISPATCH',
            createdAt: new Date().toISOString()
        };

        // Sync location state if updated
        updateUserProfile({
            Area: selectedArea,
            area: selectedArea,
            address: streetAddress,
            pickupBay: stagingInstructions
        });

        if (onProceedToCheckout) {
            onProceedToCheckout(dispatchPayload);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-6 text-xs">

            {/* Header Title */}
            <div>
                <span className="text-[10px] font-black uppercase text-brand-primary bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    Step 1 of 2: Configure Dispatch
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-1.5">Configure Waste Pickup Request</h2>
                <p className="text-slate-500 font-medium text-[11px]">Select your plan type and specify exact doorstep staging instructions.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* 1. Plan Selector Cards */}
                <div className="space-y-2">
                    <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">Select Plan & Dispatch Urgency</label>
                    <div className="grid grid-cols-1 gap-2.5">

                        {/* One-time SOS */}
                        <div
                            onClick={() => handlePlanChange('one-time')}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedPlan === 'one-time'
                                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 text-brand-primary rounded-xl">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-slate-800 text-xs">One-Time Instant SOS</p>
                                        <span className="text-[9px] bg-rose-100 text-rose-700 font-extrabold px-1.5 py-0.2 rounded">EMERGENCY</span>
                                    </div>
                                    <p className="text-slate-500 text-[10px] mt-0.5">{plans['one-time'].desc}</p>
                                </div>
                            </div>
                            <p className="font-black text-brand-primary text-sm shrink-0">₦1,500</p>
                        </div>

                        {/* Weekly Pass */}
                        <div
                            onClick={() => handlePlanChange('weekly')}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedPlan === 'weekly'
                                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 text-brand-primary rounded-xl">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-xs">Weekly Household Pass</p>
                                    <p className="text-slate-500 text-[10px] mt-0.5">{plans['weekly'].desc}</p>
                                </div>
                            </div>
                            <p className="font-black text-brand-primary text-sm shrink-0">₦4,500/mo</p>
                        </div>

                        {/* Monthly Unlimited */}
                        <div
                            onClick={() => handlePlanChange('monthly')}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${selectedPlan === 'monthly'
                                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-100 text-brand-primary rounded-xl">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-xs">Monthly Unlimited Subscription</p>
                                    <p className="text-slate-500 text-[10px] mt-0.5">{plans['monthly'].desc}</p>
                                </div>
                            </div>
                            <p className="font-black text-brand-primary text-sm shrink-0">₦8,000/mo</p>
                        </div>

                    </div>
                </div>

                {/* 2. Location & Staging Bay Notes */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">Location & Staging Instructions</label>

                    {/* Area Cluster */}
                    <div>
                        <label className="text-slate-500 text-[11px] font-bold block mb-1">Operating Zone</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={selectedArea}
                                onChange={(e) => {
                                    setSelectedArea(e.target.value);
                                    setAreaError('');
                                }}
                                placeholder="e.g. Oke-Fia, Osogbo"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                required
                            />
                        </div>
                        {areaError && (
                            <p className="text-rose-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {areaError}
                            </p>
                        )}
                    </div>

                    {/* Street Address */}
                    <div>
                        <label className="text-slate-500 text-[11px] font-bold block mb-1">Street Address</label>
                        <div className="relative">
                            <Navigation size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value)}
                                placeholder="e.g. Station Road, Opp Union Bank"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Staging Bay Instructions */}
                    <div>
                        <label className="text-slate-500 text-[11px] font-bold block mb-1">Staging Instructions for Driver</label>
                        <input
                            type="text"
                            value={stagingInstructions}
                            onChange={(e) => setStagingInstructions(e.target.value)}
                            placeholder="e.g. Green trash bin placed beside outer security gate"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>

                {/* Submit Action */}
                <Button type="submit" className="w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2">
                    <span>Proceed to Payment ({plans[selectedPlan].price})</span>
                    <ArrowRight size={16} />
                </Button>

            </form>
        </div>
    );
}