// src/pages/collector/CollectorLogin.jsx
import React, { useState } from 'react';
import { useAuthStore, handleAuthSuccess } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import {
    Truck,
    Phone,
    ShieldCheck,
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    Radio
} from 'lucide-react';

export default function CollectorLogin({ onLoginSuccess, onNavigateToOnboarding, onBackToResident }) {
    const { login } = useAuthStore();
    const { registeredCollectors } = useClusterStore();

    const [dispatchPhone, setDispatchPhone] = useState('08012345678');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAuthenticate = (e) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        setTimeout(() => {
            const cleanPhone = dispatchPhone.trim();
            if (!cleanPhone) {
                setIsLoading(false);
                setErrorMsg('Please enter your registered dispatch phone line.');
                return;
            }

            // Find matching collector or fallback to default operator
            const existing = (registeredCollectors || []).find(
                (c) => (c.phone || c.phoneNumber || '').replace(/\D/g, '') === cleanPhone.replace(/\D/g, '')
            );

            const collectorData = existing || {
                id: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
                companyName: 'Osogbo Central Cleaners Ltd',
                collectorName: 'Osogbo Central Cleaners Ltd',
                fullName: 'Osogbo Central Cleaners Ltd',
                phone: cleanPhone,
                phoneNumber: cleanPhone,
                Area: 'Oke-Fia',
                cluster: 'Oke-Fia Zone',
                fleetCount: 2,
                vehicleCount: 2,
                workerCount: 4,
                bankName: 'First Bank of Nigeria',
                accountNumber: '0123456789',
                accountName: 'Osogbo Central Cleaners Ltd',
            };

            const operatorTokens = {
                access: `kole-operator-jwt-${Date.now()}`,
                refresh: `kole-operator-refresh-${Date.now()}`
            };

            // Conditional token storage logic: localStorage if rememberMe is true, sessionStorage if false
            handleAuthSuccess(operatorTokens, rememberMe);

            // Login into auth store with 'collector' role and session persistence flag
            login(collectorData, 'collector', rememberMe, operatorTokens);
            setIsLoading(false);

            if (onLoginSuccess) {
                onLoginSuccess(collectorData);
            } else if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/collector/dashboard');
                window.dispatchEvent(new Event('popstate'));
            }
        }, 500);
    };

    const handleDemoQuickLogin = () => {
        setDispatchPhone('08012345678');
        handleAuthenticate();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 py-8 relative overflow-hidden font-sans">
            {/* Ambient background glows */}
            <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Back button */}
            <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs z-10">
                <button
                    type="button"
                    onClick={onBackToResident || (() => {
                        if (typeof window !== 'undefined') {
                            window.history.pushState({}, '', '/');
                            window.dispatchEvent(new Event('popstate'));
                        }
                    })}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer font-bold"
                >
                    <ArrowLeft size={15} />
                    <span>Resident & Customer Portal</span>
                </button>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                    <Radio size={11} className="animate-pulse text-emerald-400" />
                    DISPATCH NET ACTIVE
                </span>
            </div>

            {/* Main Auth Card */}
            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl mb-1 shadow-inner">
                        <Truck size={28} />
                    </div>
                    <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                        KÓLẸ̀ Operator Portal
                    </h1>
                    <p className="text-xs text-slate-400">
                        Dispatch Command • Cluster Evacuation • Fleet Settlements
                    </p>
                </div>

                {/* 1-Click Quick Demo Pill */}
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                        <p className="font-bold text-emerald-300 text-[11px] flex items-center gap-1">
                            <Sparkles size={12} className="text-emerald-400 shrink-0" />
                            Default Fleet Operator:
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                            08012345678 • Oke-Fia Zone
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleDemoQuickLogin}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-xl shrink-0 cursor-pointer transition-all shadow-sm"
                    >
                        ⚡ 1-Click Sign In
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleAuthenticate} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1.5">
                            Dispatch Phone Line
                        </label>
                        <div className="relative">
                            <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                            <input
                                type="tel"
                                placeholder="08012345678"
                                value={dispatchPhone}
                                onChange={(e) => {
                                    setDispatchPhone(e.target.value);
                                    setErrorMsg('');
                                }}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center my-3 text-sm">
                        <label className="flex items-center text-slate-300 hover:text-white cursor-pointer select-none">
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={(e) => setRememberMe(e.target.checked)} 
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 mr-2 accent-emerald-600 cursor-pointer"
                            />
                            Remember me
                        </label>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-950/50 mt-2 border-none"
                    >
                        Sign In to Operations Portal
                    </Button>
                </form>

                {/* Footer Link to Onboarding */}
                <div className="pt-2 border-t border-slate-800/80 text-center text-xs space-y-2">
                    <p className="text-slate-400">
                        New Waste Operator in Osogbo?
                    </p>
                    <button
                        type="button"
                        onClick={onNavigateToOnboarding || (() => {
                            if (typeof window !== 'undefined') {
                                window.history.pushState({}, '', '/collector-onboard');
                                window.dispatchEvent(new Event('popstate'));
                            }
                        })}
                        className="text-emerald-400 font-bold hover:underline cursor-pointer block mx-auto text-xs"
                    >
                        Register Fleet & Activate Coverage Zone →
                    </button>
                </div>
            </div>
        </div>
    );
}
