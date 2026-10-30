// src/components/PaystackCheckoutButton.tsx
import React, { useState } from 'react';
import PaystackPop from '@paystack/inline-js';
import { CreditCard, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';

export interface PaystackSplitDetails {
    basePrice: number;
    owmaLevy: number; // 3% OWMA Government Levy
    techFee: number;  // ₦200 KóLẹ̀ Tech Fee
    totalAmount: number;
    totalAmountInKobo: number;
    owmaLevyInKobo: number;
    koleNetShareInKobo: number;
    owmaSubaccount: string;
}

/**
 * Utility function to compute the exact multi-split fee schedule
 * Base Subscription + 3% OWMA Government Levy + ₦200 KóLẹ̀ Tech Fee
 */
export const calculateMultiSplitFees = (
    basePrice: number,
    customOwmaSubaccount?: string
): PaystackSplitDetails => {
    const safeBase = Math.max(0, Number(basePrice) || 0);
    const owmaLevy = Math.round(safeBase * 0.03);
    const techFee = 200;
    const totalAmount = safeBase + owmaLevy + techFee;

    const totalAmountInKobo = Math.round(totalAmount * 100);
    const owmaLevyInKobo = Math.round(owmaLevy * 100);
    const koleNetShareInKobo = Math.round((safeBase + techFee) * 100);

    const owmaSubaccount =
        customOwmaSubaccount ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OWMA_PAYSTACK_SUBACCOUNT) ||
        'ACCT_owmatreasury123';

    return {
        basePrice: safeBase,
        owmaLevy,
        techFee,
        totalAmount,
        totalAmountInKobo,
        owmaLevyInKobo,
        koleNetShareInKobo,
        owmaSubaccount,
    };
};

export interface PaystackCheckoutButtonProps {
    basePrice: number;
    email: string;
    organizationName?: string;
    businessCategory?: string;
    clearanceFrequency?: string;
    facilityAddress?: string;
    customOwmaSubaccount?: string;
    buttonText?: string;
    className?: string;
    disabled?: boolean;
    onSuccess?: (reference: string, response: any) => void;
    onClose?: () => void;
    onError?: (error: any) => void;
    showFeeBreakdown?: boolean;
}

export default function PaystackCheckoutButton({
    basePrice,
    email,
    organizationName = 'Commercial Organization',
    businessCategory = 'Commercial Entity',
    clearanceFrequency = '1x/week',
    facilityAddress = '',
    customOwmaSubaccount,
    buttonText,
    className = '',
    disabled = false,
    onSuccess,
    onClose,
    onError,
    showFeeBreakdown = false,
}: PaystackCheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [configError, setConfigError] = useState<string | null>(null);

    const feeDetails = calculateMultiSplitFees(basePrice, customOwmaSubaccount);

    const handlePaystackCheckout = () => {
        setConfigError(null);

        const PAYSTACK_PUBLIC_KEY =
            (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PAYSTACK_PUBLIC_KEY) || '';

        // Validate public key before initializing
        if (
            !PAYSTACK_PUBLIC_KEY ||
            typeof PAYSTACK_PUBLIC_KEY !== 'string' ||
            PAYSTACK_PUBLIC_KEY.trim() === '' ||
            PAYSTACK_PUBLIC_KEY.includes('xxxxxxxx')
        ) {
            const err = 'Paystack Public Key is missing or unconfigured. Please configure VITE_PAYSTACK_PUBLIC_KEY.';
            console.error('[Paystack Multi-Split Checkout Error]', err);
            setConfigError(err);
            if (onError) onError(new Error(err));
            alert(err);
            return;
        }

        const cleanEmail = (email || '').trim();
        if (!cleanEmail || !cleanEmail.includes('@')) {
            const err = 'A valid official organization email is required to initialize checkout.';
            setConfigError(err);
            if (onError) onError(new Error(err));
            return;
        }

        setIsLoading(true);

        const metadata = {
            custom_fields: [
                {
                    display_name: 'Organization Name',
                    variable_name: 'organization_name',
                    value: organizationName,
                },
                {
                    display_name: 'Business Category',
                    variable_name: 'business_category',
                    value: businessCategory,
                },
                {
                    display_name: 'Clearance Frequency',
                    variable_name: 'clearance_frequency',
                    value: clearanceFrequency,
                },
                {
                    display_name: 'Base Subscription Tariff',
                    variable_name: 'base_tariff',
                    value: `₦${feeDetails.basePrice.toLocaleString()}`,
                },
                {
                    display_name: '3% OWMA Government Levy',
                    variable_name: 'owma_levy',
                    value: `₦${feeDetails.owmaLevy.toLocaleString()}`,
                },
                {
                    display_name: 'KóLẹ̀ Tech & Audit Fee',
                    variable_name: 'kole_tech_fee',
                    value: `₦${feeDetails.techFee.toLocaleString()}`,
                },
                {
                    display_name: 'OWMA Settlement Subaccount',
                    variable_name: 'owma_subaccount',
                    value: feeDetails.owmaSubaccount,
                },
                {
                    display_name: 'Facility Address',
                    variable_name: 'facility_address',
                    value: facilityAddress || 'Osogbo Municipality',
                },
            ],
            split: {
                type: 'flat',
                currency: 'NGN',
                subaccounts: [
                    {
                        subaccount: feeDetails.owmaSubaccount,
                        share: feeDetails.owmaLevyInKobo,
                    },
                ],
                bearer_type: 'account',
                main_account_share: feeDetails.koleNetShareInKobo,
            },
        };

        try {
            // Initialize Paystack with @paystack/inline-js
            const paystack = new PaystackPop();

            paystack.newTransaction({
                key: PAYSTACK_PUBLIC_KEY,
                email: cleanEmail,
                amount: feeDetails.totalAmountInKobo,
                subaccount: feeDetails.owmaSubaccount,
                transaction_charge: feeDetails.koleNetShareInKobo,
                bearer: 'subaccount',
                metadata,
                onSuccess: (transaction: any) => {
                    setIsLoading(false);
                    const ref = transaction?.reference || transaction?.trxref || `TRX-${Date.now()}`;
                    console.info('[Paystack Multi-Split Payment Verified]', ref, transaction);
                    if (onSuccess) {
                        onSuccess(ref, transaction);
                    }
                },
                onCancel: () => {
                    setIsLoading(false);
                    console.info('[Paystack Multi-Split] Checkout closed by user.');
                    if (onClose) onClose();
                },
            });
        } catch (initErr: any) {
            setIsLoading(false);
            console.error('[Paystack Pop Initialization Error]', initErr);

            // Fallback to window.PaystackPop setup if loaded via inline script
            if (typeof window !== 'undefined' && (window as any).PaystackPop?.setup) {
                try {
                    const handler = (window as any).PaystackPop.setup({
                        key: PAYSTACK_PUBLIC_KEY,
                        email: cleanEmail,
                        amount: feeDetails.totalAmountInKobo,
                        subaccount: feeDetails.owmaSubaccount,
                        transaction_charge: feeDetails.koleNetShareInKobo,
                        bearer: 'subaccount',
                        metadata,
                        callback: (response: any) => {
                            const ref = response?.reference || response?.trxref || `TRX-${Date.now()}`;
                            if (onSuccess) onSuccess(ref, response);
                        },
                        onClose: () => {
                            if (onClose) onClose();
                        },
                    });
                    handler.openIframe();
                    return;
                } catch (fallbackErr) {
                    console.error('[Paystack Window Fallback Error]', fallbackErr);
                }
            }

            const message = initErr?.message || 'Unable to open Paystack payment window.';
            setConfigError(message);
            if (onError) onError(initErr);
        }
    };

    const defaultButtonLabel = `Proceed to Paystack Multi-Split (₦${feeDetails.totalAmount.toLocaleString()})`;

    return (
        <div className="w-full space-y-3 font-sans">
            {configError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
                    <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                    <span className="font-medium leading-tight">{configError}</span>
                </div>
            )}

            {showFeeBreakdown && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                        <span>Base Subscription Tariff:</span>
                        <span className="font-bold text-white">₦{feeDetails.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400">
                        <span>3% OWMA Government Levy:</span>
                        <span className="font-bold">₦{feeDetails.owmaLevy.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                        <span>KóLẹ̀ Tech & Infrastructure Fee:</span>
                        <span className="font-bold text-white">₦{feeDetails.techFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-black text-sm text-white">
                        <span>Total Due:</span>
                        <span className="text-emerald-400">₦{feeDetails.totalAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">
                        * Split settlement: 3% OWMA levy is automatically settled to subaccount ({feeDetails.owmaSubaccount}).
                    </p>
                </div>
            )}

            <button
                type="button"
                onClick={handlePaystackCheckout}
                disabled={disabled || isLoading}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                    disabled || isLoading
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white shadow-green-900/20'
                } ${className}`}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Initializing Paystack Split Gateway...</span>
                    </>
                ) : (
                    <>
                        <CreditCard size={16} />
                        <span>{buttonText || defaultButtonLabel}</span>
                    </>
                )}
            </button>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-green-600" />
                    OWMA Treasury Multi-Split
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                    <Lock size={12} className="text-slate-400" />
                    PCI-DSS 256-Bit SSL
                </span>
            </div>
        </div>
    );
}

