// src/pages/customer/CustomerHome.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import AreaSelector from '../../components/common/AreaSelector';
import AwarenessCarousel from '../../components/common/AwarenessCarousel';
import HeaderBar from '../../components/layout/HeaderBar';
import WaitlistCaptureModal from '../../components/common/WaitlistCaptureModal';
import WhatsAppInviteCard from '../../components/common/WhatsAppInviteCard';
import CoreValueProps from '../../components/common/CoreValueProps';
import { checkZoneCoverage } from '../../utils/zoneValidator';
import {
    MapPin,
    Zap,
    Calendar,
    ShieldCheck,
    CreditCard
} from 'lucide-react';

export default function CustomerHome({ onNavigateToCheckout }) {
    const { user, updateUserProfile, activeRequests } = useAuthStore();
    // ... existing states ...    const { user, updateUserProfile, activeRequests } = useAuthStore();
    const [selectedArea, setSelectedArea] = useState(user?.Area || user?.area || 'Oke-Fia');
    const [selectedPlan, setSelectedPlan] = useState('monthly');

    // Out-of-Zone Waitlist Modal State
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [unsupportedAddress, setUnsupportedAddress] = useState('');

    // Service Plans with explicit pricing
    const plans = {
        'one-time': {
            title: 'One-Time SOS Pickup',
            price: '₦1,500',
            desc: 'Pay per single emergency dispatch request'
        },
        'weekly': {
            title: 'Weekly Pass',
            price: '₦2,500 / wk',
            desc: 'Includes ₦500 fee, renewable weekly'
        },
        'monthly': {
            title: 'Household Monthly Plan',
            price: 'From ₦10,000 / mo',
            desc: '₦2,500/wk × 4 weeks with volume upgrades'
        },
    };

    const handleAreaChange = (newArea) => {
        setSelectedArea(newArea);

        // Validate area against active clusters
        const coverage = checkZoneCoverage(newArea);

        if (!coverage.active) {
            setUnsupportedAddress(newArea);
            setIsWaitlistOpen(true);
        } else {
            updateUserProfile({ Area: newArea, area: newArea });
        }
    };

    const handleTriggerCheckout = (planKey) => {
        // Double-check location coverage before opening checkout
        const coverage = checkZoneCoverage(selectedArea);

        if (!coverage.active) {
            setUnsupportedAddress(selectedArea);
            setIsWaitlistOpen(true);
            return;
        }

        const planDetails = plans[planKey] || plans['monthly'];
        if (onNavigateToCheckout) {
            onNavigateToCheckout({
                planKey,
                billingCycle: planKey,
                title: planDetails.title,
                amount: planDetails.price,
                Area: selectedArea
            });
        }
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto pb-24 px-1">

            {/* 1. Global Brand Header Bar */}
            <HeaderBar />

            {/* 2. COMPACT Operating Area Zone Selector */}
            <div className="bg-white rounded-2xl p-2.5 px-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 shrink-0">
                    <span className="p-1.5 bg-emerald-50 text-brand-primary rounded-lg">
                        <MapPin size={15} />
                    </span>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 leading-none">Operating Cluster</p>
                        <p className="font-black text-slate-800 text-xs mt-0.5">{selectedArea} Zone</p>
                    </div>
                </div>

                <div className="w-56">
                    <AreaSelector
                        selectedArea={selectedArea}
                        onAreaChange={handleAreaChange}
                        compact={true}
                    />
                </div>
            </div>

            {/* 3. SOS Immediate Dispatch Hero Card */}
            <div className="bg-emerald-950 text-white rounded-3xl p-5 space-y-3 shadow-md relative overflow-hidden text-xs border border-emerald-900">
                <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-900/80 border border-emerald-700/60 px-2 py-0.5 rounded-md">
                            Emergency Response
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                            Live Coverage <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        </span>
                    </div>

                    <h2 className="text-lg font-black leading-snug pt-0.5">Need Immediate Waste Pickup?</h2>
                    <p className="text-slate-300 font-medium text-[11px] leading-relaxed">
                        Dispatch a collector directly to your doorstep in <span className="font-bold text-white">{selectedArea}</span>.
                    </p>

                    <Button
                        onClick={() => handleTriggerCheckout('one-time')}
                        className="w-full py-3 text-xs font-black uppercase tracking-wider mt-1 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                        <Zap size={15} /> Request Instant SOS Pickup ({plans['one-time'].price})
                    </Button>
                </div>
            </div>

            {/* 4. CORE SERVICES: Select Pickup & Payment Plan */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xs font-black text-slate-800">Select Service Plan</h3>
                        <p className="text-slate-500 text-[10px]">Choose a plan that fits your household volume.</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        Flexible Billing
                    </span>
                </div>

                {/* 2-Column Quick Action Plan Grid (Weekly Pass & Monthly Plan) */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Weekly Pass */}
                    <div
                        onClick={() => setSelectedPlan('weekly')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1.5 relative overflow-hidden ${selectedPlan === 'weekly'
                            ? 'border-brand-primary bg-emerald-50/70 ring-2 ring-brand-primary/20 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <div className="p-2 bg-emerald-100/80 text-brand-primary rounded-xl w-fit mx-auto">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-xs">Weekly Pass</p>
                            <p className="text-[10px] text-brand-primary font-black mt-0.5">{plans['weekly'].price}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Renewable weekly</p>
                        </div>
                    </div>

                    {/* Monthly Subscription */}
                    <div
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1.5 relative overflow-hidden ${selectedPlan === 'monthly'
                            ? 'border-brand-primary bg-emerald-50/70 ring-2 ring-brand-primary/20 shadow-sm'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <span className="absolute top-2 right-2 text-[8px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                            Popular
                        </span>
                        <div className="p-2 bg-emerald-100/80 text-brand-primary rounded-xl w-fit mx-auto">
                            <ShieldCheck size={18} />
                        </div>
                        <div>
                            <p className="font-black text-slate-800 text-xs">Monthly Plan</p>
                            <p className="text-[10px] text-brand-primary font-black mt-0.5">{plans['monthly'].price}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">4-week calculated tier</p>
                        </div>
                    </div>
                </div>

                {/* Primary Proceed Action */}
                <Button
                    onClick={() => handleTriggerCheckout(selectedPlan)}
                    className="w-full py-3.5 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                    <CreditCard size={15} /> Proceed to Payment & Subscription ({plans[selectedPlan]?.price})
                </Button>
            </div>

            {/* 5. Core Value Pillars */}
            <CoreValueProps />

            {/* 6. WhatsApp Referral Engine */}
            <WhatsAppInviteCard userId={user?.id} userCluster={selectedArea} />

            {/* 7. Awareness & Announcement Carousel */}
            <AwarenessCarousel />

            {/* 8. DYNAMIC ACTIVE REQUESTS TRACKING */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 space-y-2.5 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">Your Active Requests</h3>
                    <span className="font-bold text-brand-primary bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                        {activeRequests?.length || 0} Active
                    </span>
                </div>

                <div className="space-y-2">
                    {activeRequests && activeRequests.length > 0 ? (
                        activeRequests.map((req, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-800">{req.requestId}</span>
                                        <span className="text-[9px] font-bold text-brand-primary bg-emerald-100/60 px-1.5 py-0.2 rounded">
                                            {req.amount}
                                        </span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${req.status === 'CRITICAL_SOS' || req.status === 'PENDING_DISPATCH'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                        {req.status?.replace('_', ' ') || 'Pending Dispatch'}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-[10px] font-semibold">{req.title || 'SOS Waste Pickup'}</p>
                                <p className="text-slate-400 text-[9.5px] font-medium truncate">
                                    {req.address || user?.address || 'Oke-Fia Zone, Osogbo'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center py-2 text-[10px]">No active waste pickup requests.</p>
                    )}
                </div>
            </div>
            {/* Out-of-Zone Waitlist & WhatsApp Referral Modal */}
            <WaitlistCaptureModal
                isOpen={isWaitlistOpen}
                onClose={() => setIsWaitlistOpen(false)}
                userAddress={unsupportedAddress || selectedArea}
            />

        </div>
    );
}