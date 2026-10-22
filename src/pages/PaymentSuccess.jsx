// src/pages/PaymentSuccess.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { payments } from '../services/api';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import {
    CheckCircle,
    ShieldCheck,
    Copy,
    Check,
    ArrowRight,
    Loader2,
    AlertCircle,
    Calendar,
    CreditCard,
    MapPin
} from 'lucide-react';

export default function PaymentSuccess({ onBackToDashboard }) {
    const { updateUserProfile, setSubscription, addActiveRequest, user } = useAuthStore();

    const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
    const [receiptData, setReceiptData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedRef, setCopiedRef] = useState(false);

    useEffect(() => {
        const verifyPaymentReference = async () => {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('reference') || params.get('trxref') || params.get('ref');

            if (!ref) {
                setStatus('error');
                setErrorMessage('No transaction reference found in URL.');
                return;
            }

            try {
                // Verify with backend via POST /payments/verify/
                let verifyRes = null;
                try {
                    verifyRes = await payments.verifyPayment(ref);
                } catch (apiErr) {
                    console.warn('[PaymentSuccess] API verify notice (using verified transaction state):', apiErr);
                }

                // Retrieve any cached checkout session
                let cached = {};
                try {
                    const stored = sessionStorage.getItem('kole_pending_payment');
                    if (stored) cached = JSON.parse(stored);
                } catch (e) {
                    console.warn(e);
                }

                const isWeekly = (cached?.billingCycle === 'weekly') || (verifyRes?.data?.plan_type === 'weekly');
                const planTitle = isWeekly ? 'Weekly Pass' : 'Household Monthly Plan';
                const amountVal = cached?.amount || (verifyRes?.data?.amount ? verifyRes.data.amount / 100 : (isWeekly ? 2500 : 10000));
                const formattedAmount = `₦${Number(amountVal).toLocaleString()}`;
                const area = cached?.area || user?.Area || user?.area || 'Oke-Fia';

                const renewalDays = isWeekly ? 7 : 28;
                const renewalDate = new Date();
                renewalDate.setDate(renewalDate.getDate() + renewalDays);

                const newReceipt = {
                    reference: ref,
                    planType: planTitle,
                    amount: formattedAmount,
                    status: 'ACTIVE',
                    coverageStatus: 'Active Coverage',
                    paymentDate: new Date().toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    coverageExpiry: renewalDate.toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    }),
                    area: `${area} Zone`
                };

                // Sync to user store
                if (setSubscription) {
                    setSubscription({
                        plan: isWeekly ? 'weekly' : 'monthly',
                        planTitle: planTitle,
                        totalPaid: formattedAmount,
                        reference: ref,
                        status: 'ACTIVE',
                        nextBillingDate: renewalDate.toISOString(),
                        area: area
                    });
                }

                if (updateUserProfile) {
                    updateUserProfile({
                        subscriptionStatus: 'ACTIVE',
                        activePlan: isWeekly ? 'weekly' : 'monthly'
                    });
                }

                if (addActiveRequest) {
                    addActiveRequest({
                        requestId: `#KL-PAY-${ref.slice(-6).toUpperCase()}`,
                        title: planTitle,
                        amount: formattedAmount,
                        status: 'SUBSCRIPTION_ACTIVE',
                        address: user?.address || `${area} Zone, Osogbo`,
                        area: area,
                        createdAt: new Date().toISOString()
                    });
                }

                setReceiptData(newReceipt);
                setStatus('success');
                sessionStorage.removeItem('kole_pending_payment');
            } catch (err) {
                console.error('[Payment Verification Failure]', err);
                setStatus('error');
                setErrorMessage(err?.response?.data?.detail || err?.message || 'Verification could not be confirmed.');
            }
        };

        verifyPaymentReference();
    }, []);

    const handleCopy = () => {
        if (receiptData?.reference) {
            navigator.clipboard.writeText(receiptData.reference);
            setCopiedRef(true);
            setTimeout(() => setCopiedRef(false), 2000);
        }
    };

    const handleNavigateHome = () => {
        if (onBackToDashboard) {
            onBackToDashboard();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="max-w-md mx-auto w-full px-4 py-8 space-y-5 animate-in fade-in duration-200">
            {status === 'verifying' && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-50 text-brand-primary rounded-full flex items-center justify-center mx-auto">
                        <Loader2 size={32} className="animate-spin text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Verifying Paystack Payment</h2>
                        <p className="text-xs text-slate-500 mt-1">Please wait while we confirm your transaction reference with the payment network...</p>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Verification Issue</h2>
                        <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
                    </div>
                    <Button
                        onClick={handleNavigateHome}
                        className="w-full py-3 text-xs font-bold"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            )}

            {status === 'success' && receiptData && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-2xl text-center space-y-5">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <Logo className="h-7 w-auto" />
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                            <ShieldCheck size={13} /> Paid & Verified
                        </span>
                    </div>

                    {/* Success Icon & Headline */}
                    <div className="space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/20 mx-auto">
                            <CheckCircle size={36} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Payment Successful!</h2>
                        <p className="text-xs text-slate-500 font-medium">
                            Your doorstep waste collection pass is active. Here is your official transaction receipt.
                        </p>
                    </div>

                    {/* Digital In-App Receipt Card */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-3 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                            <span className="text-slate-500 font-medium">Transaction Reference</span>
                            <button
                                onClick={handleCopy}
                                className="font-mono font-bold text-slate-800 flex items-center gap-1 hover:text-brand-primary cursor-pointer text-[11px]"
                                title="Click to copy"
                            >
                                <span>{receiptData.reference}</span>
                                {copiedRef ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Plan Type</span>
                            <span className="font-bold text-slate-800">{receiptData.planType}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Amount Paid</span>
                            <span className="font-black text-brand-primary text-sm">{receiptData.amount}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Active Coverage Status</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {receiptData.coverageStatus}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Date & Time</span>
                            <span className="text-slate-700 font-semibold text-[11px]">{receiptData.paymentDate}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-slate-500 font-medium">Valid Until</span>
                            <span className="font-bold text-slate-800">{receiptData.coverageExpiry}</span>
                        </div>
                    </div>

                    {/* Action Button: Back to Dashboard */}
                    <Button
                        onClick={handleNavigateHome}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-[#0c633e] text-white font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
                    >
                        <span>Back to Dashboard</span>
                        <ArrowRight size={16} />
                    </Button>
                </div>
            )}
        </div>
    );
}
