// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { User, Building2, Lock, Phone } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
    const { login } = useAuthStore();

    const [role, setRole] = useState('customer'); // 'customer' | 'organization'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            const dummyUser = {
                id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
                fullName: role === 'organization' ? 'Oroki Hub Operations' : 'Olayinka Oluwafemi',
                phoneNumber: phoneNumber || '08012345678',
                Area: 'Oke-Fia',
            };
            login(dummyUser, role, rememberMe);
        }, 800);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">

            {/* Logo & Tagline */}
            <div className="text-center space-y-2">
                <Logo className="h-12 w-auto mx-auto" />
                <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    Smart Pickup. Zero Hassle.
                </p>
            </div>

            {/* Role Toggle: Customer vs Organization */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${role === 'customer'
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <User size={16} />
                    <span>Customer</span>
                </button>

                <button
                    type="button"
                    onClick={() => setRole('organization')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${role === 'organization'
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Building2 size={16} />
                    <span>Organization</span>
                </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                        Phone Number
                    </label>
                    <div className="relative">
                        <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                            type="tel"
                            placeholder="08012345678"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                        4-Digit Security PIN
                    </label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                            type="password"
                            maxLength={4}
                            placeholder="••••"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary tracking-widest"
                        />
                    </div>
                </div>

                {/* Remember Me Checkbox & Forgot PIN */}
                <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary accent-brand-primary cursor-pointer"
                        />
                        <span>Remember me</span>
                    </label>

                    <button
                        type="button"
                        className="text-brand-primary font-bold hover:underline"
                    >
                        Forgot PIN?
                    </button>
                </div>

                <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3.5 text-sm font-bold mt-2"
                >
                    Sign In
                </Button>
            </form>

            {/* Switch to Register */}
            <div className="text-center text-xs text-slate-500 font-medium">
                Don't have an account?{' '}
                <button
                    onClick={onSwitchToRegister}
                    className="text-brand-primary font-bold hover:underline cursor-pointer"
                >
                    Register now
                </button>
            </div>

        </div>
    );
}