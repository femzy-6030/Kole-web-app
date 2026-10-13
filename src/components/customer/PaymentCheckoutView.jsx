// src/components/customer/PaymentCheckoutView.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import {
    CheckCircle,
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    ShieldCheck,
    Zap,
    Navigation
} from 'lucide-react';

export default function PaymentCheckoutView({ pickupRequest, onPaymentSuccess }) {
    const { user, addActiveRequest } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // Extract dynamic request values
    const planTitle = pickupRequest?.title || 'One-Time SOS Emergency Pickup';
    const area = pickupRequest?.Area || pickupRequest?.location?.area || user?.Area || user?.area || 'Oke-Fia';
    const street = pickupRequest?.location?.streetAddress || user?.address || 'Oke-Fia Junction, Osogbo';
    const stagingNotes = pickupRequest?.location?.stagingInstructions || user?.pickupBay || 'Front Staging Gate';
    const displayAmount = pickupRequest?.amount || '₦1,500';

    const handleCompletePayment = () => {
        setIsProcessing(true);

        setTimeout(() => {
            // Build the new order object
            const newOrder = {
                requestId: pickupRequest?.requestId || `#KL-${Math.floor(100000 + Math.random() * 900000)}`,
                title: planTitle,
                amount: displayAmount,
                status: 'COLLECTOR_EN_ROUTE',
                address: street,
                area: area,
                createdAt: new Date().toISOString()
            };

            // SYNC TO STORE: Push new order into activeRequests state
            if (addActiveRequest) {
                addActiveRequest(newOrder);
            }

            setIsProcessing(false);
            setIsCompleted(true);
        }, 1200);
    };

    if (isCompleted) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-5 my-6">
                <div className="w-16 h-16 bg-emerald-100 text-brand-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle size={36} className="text-emerald-600" />
                </div>

                <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        Dispatch Confirmed
                    </span>
                    <h2 className="text-xl font-black text-slate-800 mt-2">Request Transmitted!</h2>
                    <p className="text-slate-500 text-xs mt-1">
                        A waste collector in <span className="font-bold text-slate-700">{area}</span> has been dispatched to your staging bay.
                    </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Request ID:</span>
                        <span className="font-black text-slate-800">{pickupRequest?.requestId || '#KL-904102'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Plan Type:</span>
                        <span className="font-bold text-brand-primary">{planTitle}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-bold">Status:</span>
                        <span className="font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px] uppercase">
                            Collector En Route
                        </span>
                    </div>
                </div>

                <Button
                    onClick={onPaymentSuccess}
                    className="w-full py-3.5 font-bold text-xs uppercase tracking-wider"
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-5 text-xs">

            {/* Header Badge */}
            <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    Direct Express Checkout
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-1">Confirm Service & Payment</h2>
            </div>

            {/* Saved Customer Details Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Saved Customer Details
                </span>

                <div className="space-y-2 text-slate-700 font-medium">
                    <div className="flex items-center gap-2.5">
                        <User size={15} className="text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">{user?.fullName || 'Olayinka Oluwafemi'}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Phone size={15} className="text-slate-400 shrink-0" />
                        <span>{user?.phoneNumber || '09014603028'}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Mail size={15} className="text-slate-400 shrink-0" />
                        <span>{user?.email || 'olayinka@kole.ng'}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2.5">
                        <MapPin size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-slate-800">{street}</p>
                            <p className="text-[10px] text-slate-400 font-normal">Operating Zone: {area}</p>
                        </div>
                    </div>

                    {stagingNotes && (
                        <div className="flex items-start gap-2.5 pt-1">
                            <Navigation size={15} className="text-brand-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-600 italic">"{stagingNotes}"</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Summary Box */}
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5">
                        <Zap size={14} className="text-brand-primary" />
                        <p className="font-black text-slate-800 text-xs">{planTitle}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Operating Area: {area}</p>
                </div>

                <div className="text-right">
                    <p className="text-lg font-black text-brand-primary">{displayAmount}</p>
                </div>
            </div>

            {/* Action Button */}
            <Button
                onClick={handleCompletePayment}
                isLoading={isProcessing}
                className="w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
                <CreditCard size={16} /> Complete Request Now ({displayAmount})
            </Button>

            {/* Guarantee Tag */}
            <p className="text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" /> Secure 256-bit encrypted checkout
            </p>

        </div>
    );
}