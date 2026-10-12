// src/pages/customer/CustomerHome.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import ClusterSelector from '../../components/common/ClusterSelector';
import AwarenessCarousel from '../../components/common/AwarenessCarousel';
import HeaderBar from '../../components/layout/HeaderBar';
import {
    MapPin,
    Zap,
    Calendar,
    ShieldCheck,
    CreditCard
} from 'lucide-react';

export default function CustomerHome({ onNavigateToCheckout }) {
    const { user, updateUserProfile } = useAuthStore();
    const [selectedCluster, setSelectedCluster] = useState(user?.cluster || 'Oke-Fia');
    const [selectedPlan, setSelectedPlan] = useState('one-time');

    const plans = {
        'one-time': { title: 'One-Time SOS Pickup', price: '₦1,500', desc: 'Pay per single dispatch request' },
        'weekly': { title: 'Weekly Household Pass', price: '₦4,500 / mo', desc: '2 scheduled pickups every week' },
        'monthly': { title: 'Monthly Unlimited Subscription', price: '₦8,000 / mo', desc: 'Unlimited waste dispatches' },
    };

    const handleClusterChange = (newCluster) => {
        setSelectedCluster(newCluster);
        updateUserProfile({ cluster: newCluster });
    };

    const handleTriggerCheckout = (planKey) => {
        const planDetails = plans[planKey];
        if (onNavigateToCheckout) {
            onNavigateToCheckout({
                planKey,
                title: planDetails.title,
                amount: planDetails.price,
                cluster: selectedCluster
            });
        }
    };

    return (
        <div className="space-y-5 max-w-lg mx-auto pb-24">

            {/* 1. Global Brand Header Bar (Contains Logo & User Profile Info) */}
            <HeaderBar />

            {/* 2. Cluster Location Selector Bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400">Operating Cluster Zone</span>
                    <span className="font-black text-brand-primary flex items-center gap-1">
                        <MapPin size={14} /> {selectedCluster} Zone
                    </span>
                </div>
                <ClusterSelector
                    selectedCluster={selectedCluster}
                    onClusterChange={handleClusterChange}
                />
            </div>

            {/* 3. SOS Immediate Dispatch Card */}
            <div className="bg-emerald-950 text-white rounded-3xl p-6 space-y-4 shadow-md relative overflow-hidden text-xs border border-emerald-900">
                <div className="relative z-10 space-y-2">
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-900/80 border border-emerald-700/60 px-2.5 py-0.5 rounded-md">
                        Emergency Response
                    </span>
                    <h2 className="text-xl font-black leading-snug">Need Immediate Waste Pickup?</h2>
                    <p className="text-slate-300 font-medium leading-relaxed">
                        Dispatch an emergency collector directly to your doorstep in <span className="font-bold text-white">{selectedCluster}</span>.
                    </p>

                    <Button
                        onClick={() => handleTriggerCheckout('one-time')}
                        className="w-full py-3.5 text-xs font-black uppercase tracking-wider mt-2 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                        <Zap size={16} /> Request SOS Waste Pickup (₦1,500)
                    </Button>
                </div>
            </div>

            {/* 4. DYNAMIC AWARENESS & ANNOUNCEMENT CAROUSEL */}
            <AwarenessCarousel />

            {/* 5. Pickup & Subscription Plans */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 space-y-4 shadow-sm text-xs">
                <div>
                    <h3 className="text-sm font-black text-slate-800">Select Pickup & Payment Plan</h3>
                    <p className="text-slate-500 text-[11px]">Choose a plan that fits your household's trash frequency.</p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                    {/* One-Time Plan */}
                    <div
                        onClick={() => setSelectedPlan('one-time')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1.5 ${selectedPlan === 'one-time'
                            ? 'border-brand-primary bg-emerald-50/70 ring-2 ring-brand-primary/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <Zap size={18} className="mx-auto text-brand-primary" />
                        <p className="font-black text-slate-800 text-xs">One-Time</p>
                        <p className="text-[10px] text-slate-500">Pay as you go</p>
                        <p className="font-black text-brand-primary text-xs pt-1">₦1,500</p>
                    </div>

                    {/* Weekly Pass */}
                    <div
                        onClick={() => setSelectedPlan('weekly')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1.5 ${selectedPlan === 'weekly'
                            ? 'border-brand-primary bg-emerald-50/70 ring-2 ring-brand-primary/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <Calendar size={18} className="mx-auto text-brand-primary" />
                        <p className="font-black text-slate-800 text-xs">Weekly Pass</p>
                        <p className="text-[10px] text-slate-500">2 Pickups / wk</p>
                        <p className="font-black text-brand-primary text-xs pt-1">₦4,500/mo</p>
                    </div>

                    {/* Monthly Subscription */}
                    <div
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all text-center space-y-1.5 ${selectedPlan === 'monthly'
                            ? 'border-brand-primary bg-emerald-50/70 ring-2 ring-brand-primary/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <ShieldCheck size={18} className="mx-auto text-brand-primary" />
                        <p className="font-black text-slate-800 text-xs">Monthly</p>
                        <p className="text-[10px] text-slate-500">Unlimited / mo</p>
                        <p className="font-black text-brand-primary text-xs pt-1">₦8,000/mo</p>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    onClick={() => handleTriggerCheckout(selectedPlan)}
                    className="w-full py-3.5 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                    <CreditCard size={16} /> Proceed to Pay for {selectedPlan.toUpperCase()} ({plans[selectedPlan].price})
                </Button>
            </div>

            {/* 6. Active Requests */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 space-y-3 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-wider text-slate-400 text-[11px]">Your Active Requests</h3>
                    <span className="font-bold text-brand-primary bg-emerald-50 px-2 py-0.5 rounded-md">1 Active</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="font-black text-slate-800">#KL-904102</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md uppercase">
                            Pending Dispatch
                        </span>
                    </div>
                    <p className="text-slate-500 text-[11px] font-medium">{user?.address || 'Oke-Fia Junction, Near Station Road'}</p>
                </div>
            </div>

        </div>
    );
}