// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { auth } from '../../services/api';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { User, Building2, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
    const { login } = useAuthStore();

    const [role, setRole] = useState('customer'); // 'customer' | 'organization'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);

        // Autofill sync: extract directly from form elements in case browser autofill didn't trigger React onChange
        const form = e.currentTarget;
        const enteredUsername = (form.elements.username?.value || username).trim();
        const enteredPassword = form.elements.password?.value || password;

        if (!enteredUsername || !enteredPassword) {
            setIsLoading(false);
            setAuthError('Please enter both your username/email and password.');
            return;
        }

        try {
            // Live backend authentication via standardized POST /auth/login/
            const data = await auth.login({
                username: enteredUsername,
                password: enteredPassword,
            });

            // Strict response verification: 200 OK with access and refresh tokens
            const accessToken = data?.access || data?.accessToken || data?.access_token || data?.token;
            const refreshToken = data?.refresh || data?.refreshToken || data?.refresh_token;

            if (!accessToken) {
                throw new Error('Authentication succeeded but no access token was returned.');
            }

            const userData = {
                id: data?.user?.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
                fullName: data?.user?.fullName || data?.user?.name || (role === 'organization' ? 'Organization Account' : enteredUsername),
                email: data?.user?.email || (enteredUsername.includes('@') ? enteredUsername : `${enteredUsername.toLowerCase()}@kole.ng`),
                username: enteredUsername,
                role: role,
                Area: 'Oke-Fia',
            };

            // Save tokens & user session to store and localStorage
            login(userData, role, rememberMe, {
                access: accessToken,
                refresh: refreshToken,
            });

            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            console.error('[Login Error]', err);

            // Graceful 401 Unauthorized error handling
            const errorMsg =
                err.response?.status === 401
                    ? 'No active account found with the given credentials. Please check your details or register first.'
                    : (err.response?.data?.detail ||
                        err.response?.data?.message ||
                        'No active account found with the given credentials. Please check your details or register first.');

            setAuthError(errorMsg);
        }
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
                    onClick={() => { setRole('customer'); setAuthError(''); }}
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
                    onClick={() => { setRole('organization'); setAuthError(''); }}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${role === 'organization'
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Building2 size={16} />
                    <span>Organization</span>
                </button>
            </div>

            {/* Visible Error Message Banner */}
            {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 animate-in fade-in duration-150">
                    <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <p className="font-bold">Authentication Failed</p>
                        <p className="text-[11px] mt-0.5 text-rose-600 leading-tight">{authError}</p>
                        {(authError.includes('register first') || authError.toLowerCase().includes('no active account')) && onSwitchToRegister && (
                            <button
                                type="button"
                                onClick={() => { setAuthError(''); onSwitchToRegister(); }}
                                className="mt-2 text-xs font-bold text-brand-primary underline hover:text-brand-dark block cursor-pointer"
                            >
                                Don't have an account yet? Click here to Register
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                    <label htmlFor="login-username" className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                        Username or Email
                    </label>
                    <div className="relative">
                        <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                            id="login-username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="e.g., admin or user@kole.ng"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setAuthError('');
                            }}
                            onBlur={(e) => setUsername(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="login-password" className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                        Password
                    </label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setAuthError('');
                            }}
                            onBlur={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            tabIndex="-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Remember Me Checkbox & Forgot Password */}
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
                        Forgot Password?
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