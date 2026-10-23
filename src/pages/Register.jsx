// src/pages/Register.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../services/api';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AreaSelector from '../components/common/AreaSelector';
import { User, Building2, Lock, Phone, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
    const { login } = useAuthStore();

    const [role, setRole] = useState('customer'); // 'customer' (Household) | 'organization'
    const [fullName, setFullName] = useState('');
    const [orgName, setOrgName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [area, setArea] = useState('Oke-Fia');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = (role === 'organization' ? orgName : fullName).trim();

        if (!cleanEmail || !password || !cleanName) {
            setIsLoading(false);
            setAuthError('Please fill in all required registration fields.');
            return;
        }

        try {
            const payload = {
                role: role === 'organization' ? 'COLLECTOR_ADMIN' : 'RESIDENT',
                full_name: cleanName,
                email: cleanEmail,
                username: cleanEmail,
                phone: phoneNumber.trim(),
                password: password,
                address: address.trim(),
                Area: area || 'Oke-Fia',
            };

            const data = await auth.register(payload);

            const accessToken = data?.access || data?.accessToken || data?.token;
            const refreshToken = data?.refresh || data?.refreshToken;

            const userData = {
                id: data?.user?.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
                fullName: cleanName,
                email: cleanEmail,
                username: cleanEmail,
                phoneNumber: phoneNumber.trim(),
                Area: area || 'Oke-Fia',
                address: address.trim(),
                role: role === 'organization' ? 'organization' : 'customer',
                total_pickups: 0,
                impact_score: 0,
            };

            login(userData, role === 'organization' ? 'organization' : 'customer', true, {
                access: accessToken,
                refresh: refreshToken,
            });

            setIsLoading(false);
            if (typeof window !== 'undefined') {
                window.history.pushState({}, '', '/dashboard');
            }
        } catch (err) {
            setIsLoading(false);
            console.error('[Registration Error]', err);
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                'Registration could not be completed. Please review your details and try again.';
            setAuthError(msg);
        }
    };

    const handleSwitchLogin = () => {
        if (onSwitchToLogin) {
            onSwitchToLogin();
        } else if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return (
        <div className="max-w-md mx-auto w-full px-4">
            <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
                {/* Brand Logo Header */}
                <div className="text-center space-y-1.5">
                    <Logo className="h-10 w-auto mx-auto" />
                    <h2 className="text-base font-black text-slate-800">Create New Account</h2>
                    <p className="text-xs text-slate-400">Join KÓLẸ̀ Doorstep Evacuation Network</p>
                </div>

                {/* Role Toggle: Household vs Organization */}
                <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => { setRole('customer'); setAuthError(''); }}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            role === 'customer'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <User size={16} />
                        <span>Household</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => { setRole('organization'); setAuthError(''); }}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            role === 'organization'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Building2 size={16} />
                        <span>Organization</span>
                    </button>
                </div>

                {/* Error Banner */}
                {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
                        <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold">Registration Notice</p>
                            <p className="text-[11px] mt-0.5 text-rose-600">{authError}</p>
                        </div>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    {role === 'customer' ? (
                        <div>
                            <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Adeola Adeleke"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Organization Name</label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="e.g. Oroki Innovation Hub"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Email Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="e.g. name@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Phone Number</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="tel"
                                placeholder="e.g. 08012345678"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Operating Cluster / Zone</label>
                        <AreaSelector selectedArea={area} onAreaChange={setArea} />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="w-full py-3.5 text-sm font-bold mt-2">
                        Create Account
                    </Button>
                </form>

                {/* Single-Line Flex Divider */}
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-gray-200" />
                    <span className="px-3 text-xs text-gray-400 uppercase tracking-wider font-medium">OR</span>
                    <hr className="flex-grow border-gray-200" />
                </div>

                {/* Instant Google Sign-Up Button */}
                <GoogleAuthButton
                    role={role === 'organization' ? 'organization' : 'household'}
                    isSignUp={true}
                    buttonText="Sign up with Google"
                />

                {/* Switch to Login */}
                <div className="text-center text-xs text-slate-500 font-medium pt-1">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={handleSwitchLogin}
                        className="text-brand-primary font-bold hover:underline cursor-pointer"
                    >
                        Sign in here
                    </button>
                </div>
            </div>
        </div>
    );
}
