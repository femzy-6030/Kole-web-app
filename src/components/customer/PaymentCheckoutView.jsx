// src/components/customer/PaymentCheckoutView.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../common/Button';
import { CreditCard, CheckCircle2, MapPin, User, Mail, Phone, ShieldCheck } from 'lucide-react';

export default function PaymentCheckoutView({ pickupRequest, onPaymentSuccess }) {
    const { user } = useAuthStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);

    const handlePay = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);
            setPaymentComplete(true);
            if (onPaymentSuccess) onPaymentSuccess();
        }, 1200);
    };

    if (paymentComplete) {
        return (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                </div>
                <h2 className="text-xl font-black text-slate-800">Payment Confirmed!</h2>
                <p className="text-xs text-slate-500">
                    Your dispatch request for <span className="font-bold text-slate-800">{user?.address}</span> has been confirmed. A collector is en route.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5 shadow-sm max-w-md mx-auto text-xs">
            <div>
                <span className="text-[10px] font-black uppercase text-brand-primary bg-emerald-50 px-2 py-0.5 rounded">
                    Direct Express Checkout
                </span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Confirm Service & Payment</h2>
            </div>

            {/* Auto-Filled Customer Details Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <h3 className="font-black uppercase tracking-wider text-slate-400 text-[10px]">
                    Saved Customer Details
                </h3>

                <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                    <User size={15} className="text-slate-400 shrink-0" />
                    <span>{user?.fullName || 'Olayinka Oluwafemi'}</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                    <Phone size={15} className="text-slate-400 shrink-0" />
                    <span>{user?.phoneNumber || '09014603028'}</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-800 font-bold">
                    <Mail size={15} className="text-slate-400 shrink-0" />
                    <span>{user?.email || 'olayinka@kole.ng'}</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-800 font-bold pt-1 border-t border-slate-200">
                    <MapPin size={15} className="text-brand-primary shrink-0" />
                    <span>{user?.address || 'Oke-Fia Junction, Near Station Road, Osogbo'}</span>
                </div>
            </div>

            {/* Order Summary */}
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex justify-between items-center">
                <div>
                    <p className="font-bold text-slate-800">SOS Emergency Pickup Fee</p>
                    <p className="text-[10px] text-slate-500">Operating Cluster: {user?.cluster || 'Oke-Fia'}</p>
                </div>
                <p className="text-lg font-black text-brand-primary">₦0.00</p>
            </div>

            {/* Payment Action */}
            <Button onClick={handlePay} isLoading={isProcessing} className="w-full py-3.5 font-bold text-sm">
                <CreditCard size={18} className="mr-2" /> Complete Request Now
            </Button>
        </div>
    );
}