// src/components/customer/PaymentModal.jsx
import React, { useState } from 'react';
import Button from '../common/Button';
import { ShieldCheck, CreditCard, Wallet, X, CheckCircle2 } from 'lucide-react';

export default function PaymentModal({ orderDetails, onPaymentSuccess, onClose }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('zero_cost'); // 'zero_cost' | 'cash' | 'transfer'

    const totalAmount = orderDetails?.amount ?? 0.00;

    const handleConfirmPayment = () => {
        setIsProcessing(true);

        // Simulate instant transaction verification
        setTimeout(() => {
            setIsProcessing(false);
            onPaymentSuccess({
                transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                amount: totalAmount,
                method: paymentMethod,
                timestamp: new Date().toISOString(),
            });
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X size={20} />
                </button>

                {/* Modal Header */}
                <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-emerald-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
                        <CreditCard size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Checkout & Dispatch</h2>
                    <p className="text-xs text-slate-500">Review breakdown for pickup request #{orderDetails?.id}</p>
                </div>

                {/* Receipt Breakdown Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Cluster Zone:</span>
                        <span className="font-bold text-slate-800">{orderDetails?.cluster || 'Oke-Fia'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Waste Size:</span>
                        <span className="font-bold text-slate-800">{orderDetails?.wasteVolume || 'Medium (3-5 Bags)'}</span>
                    </div>

                    <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-slate-700">Total Payable:</span>
                        <span className="text-2xl font-black text-brand-primary">₦{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Method Selector (For paid or zero-cost flows) */}
                {totalAmount === 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2.5">
                        <CheckCircle2 size={20} className="text-brand-primary shrink-0" />
                        <div className="text-xs">
                            <p className="font-bold text-brand-primary">Zero-Cost Service Active</p>
                            <p className="text-slate-500 text-[11px]">No charge required for this cluster request.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Select Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${paymentMethod === 'cash'
                                    ? 'border-brand-primary bg-emerald-50 text-brand-primary shadow-sm'
                                    : 'border-slate-200 text-slate-600'
                                    }`}
                            >
                                Cash on Pickup
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('transfer')}
                                className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${paymentMethod === 'transfer'
                                    ? 'border-brand-primary bg-emerald-50 text-brand-primary shadow-sm'
                                    : 'border-slate-200 text-slate-600'
                                    }`}
                            >
                                Bank Transfer
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck size={16} className="text-brand-primary shrink-0" />
                    <span>Encrypted dispatch confirmation locking collector within zone.</span>
                </div>

                <Button
                    onClick={handleConfirmPayment}
                    isLoading={isProcessing}
                    className="w-full"
                >
                    {totalAmount === 0 ? 'Confirm Free Dispatch' : `Pay ₦${totalAmount.toFixed(2)} & Dispatch`}
                </Button>

            </div>
        </div>
    );
}