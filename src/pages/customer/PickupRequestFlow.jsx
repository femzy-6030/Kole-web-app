// src/pages/customer/PickupRequestFlow.jsx
import React, { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PaymentModal from '../../components/customer/PaymentModal';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PickupRequestFlow({ onCancel, onRequestCreated }) {
    const [step, setStep] = useState(1);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const [requestData, setRequestData] = useState({
        address: 'Oke-Fia Junction, Near Station Road, Osogbo',
        cluster: 'Oke-Fia',
        wasteVolume: 'Medium (3-5 Bags)',
        scheduleWindow: 'ASAP',
        notes: '',
        customerFee: 0.0, // Default ₦0.00 base price
    });

    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);

    // Triggered when user clicks "Proceed to Checkout" in Step 3
    const handleOpenCheckout = (e) => {
        e.preventDefault();
        setShowPaymentModal(true);
    };

    // Called after payment/zero-cost confirmation succeeds inside PaymentModal
    const handlePaymentCompleted = (paymentReceipt) => {
        setShowPaymentModal(false);
        const newRequest = {
            id: `KL-${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'SEARCHING_FOR_COLLECTOR',
            createdAt: new Date().toISOString(),
            payment: paymentReceipt,
            ...requestData,
        };
        onRequestCreated(newRequest);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

            {/* Step Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <button
                    onClick={step === 1 ? onCancel : handleBack}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                >
                    <ArrowLeft size={18} />
                </button>
                <span className="text-xs font-black uppercase tracking-wider text-brand-primary">
                    Step {step} of 3
                </span>
            </div>

            {/* STEP 1: Location & Cluster Selection */}
            {step === 1 && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Confirm Location</h2>
                        <p className="text-xs text-slate-500">Pickups are routed strictly within your selected cluster[cite: 1, 2].</p>
                    </div>

                    <Input
                        label="Pickup Address"
                        value={requestData.address}
                        onChange={(e) => setRequestData({ ...requestData, address: e.target.value })}
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Selected Government Cluster
                        </label>
                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold flex items-center justify-between">
                            <span>{requestData.cluster}</span>
                            <span className="text-[10px] bg-emerald-100 text-brand-primary px-2 py-0.5 rounded-md uppercase">Locked Cluster</span>
                        </div>
                    </div>

                    <Button onClick={handleNext} className="w-full mt-4">
                        Continue to Waste Details
                    </Button>
                </div>
            )}

            {/* STEP 2: Waste Volume & Schedule Window */}
            {step === 2 && (
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Waste Volume & Timing</h2>
                        <p className="text-xs text-slate-500">Select estimated size and preferred window[cite: 1, 2].</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Estimated Waste Volume</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Small (1-2 Bags)', 'Medium (3-5 Bags)', 'Large (6+ Bags)'].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setRequestData({ ...requestData, wasteVolume: size })}
                                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${requestData.wasteVolume === size
                                        ? 'border-brand-primary bg-emerald-50 text-brand-primary shadow-sm'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pickup Window</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['ASAP (Immediate)', 'Scheduled Today'].map((windowOption) => (
                                <button
                                    key={windowOption}
                                    type="button"
                                    onClick={() => setRequestData({ ...requestData, scheduleWindow: windowOption })}
                                    className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${requestData.scheduleWindow === windowOption
                                        ? 'border-brand-primary bg-emerald-50 text-brand-primary'
                                        : 'border-slate-200 text-slate-600'
                                        }`}
                                >
                                    {windowOption}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button onClick={handleNext} className="w-full mt-4">
                        Review Order Summary
                    </Button>
                </div>
            )}

            {/* STEP 3: Order Review & Checkout Modal Trigger */}
            {step === 3 && (
                <form onSubmit={handleOpenCheckout} className="space-y-4">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Order Summary</h2>
                        <p className="text-xs text-slate-500">Review order details before launching checkout[cite: 1, 2].</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-medium">Location:</span>
                            <span className="font-bold text-slate-800 text-right">{requestData.address}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-medium">Cluster:</span>
                            <span className="font-bold text-brand-primary">{requestData.cluster}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-medium">Volume:</span>
                            <span className="font-bold text-slate-800">{requestData.wasteVolume}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-slate-700">Total Price:</span>
                            <span className="text-xl font-black text-brand-primary">₦{requestData.customerFee.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-emerald-50 text-brand-primary rounded-xl text-xs font-bold">
                        <ShieldCheck size={18} />
                        <span>Guaranteed dispatch to verified cluster collector[cite: 1, 2].</span>
                    </div>

                    <Button type="submit" className="w-full mt-2">
                        Proceed to Checkout & Dispatch
                    </Button>
                </form>
            )}

            {/* Payment Checkout Modal */}
            {showPaymentModal && (
                <PaymentModal
                    orderDetails={{
                        id: `KL-${Math.floor(100000 + Math.random() * 900000)}`,
                        amount: requestData.customerFee,
                        cluster: requestData.cluster,
                        wasteVolume: requestData.wasteVolume,
                    }}
                    onPaymentSuccess={handlePaymentCompleted}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}

        </div>
    );
}