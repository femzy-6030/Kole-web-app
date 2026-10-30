// src/pages/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const handleResetPassword = async (emailToReset) => {
        const cleanEmail = (emailToReset || '').trim();
        if (!cleanEmail) {
            setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }

        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });

        const redirectUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? `${window.location.origin}/update-password`
            : 'https://app.kole.com.ng/update-password';

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
                redirectTo: redirectUrl,
            });

            setIsLoading(false);

            if (error) {
                console.error('Reset error:', error.message);
                setStatusMessage({ type: 'error', text: error.message });
                alert(error.message);
            } else {
                setStatusMessage({
                    type: 'success',
                    text: 'Check your email for the password reset link!',
                });
                alert('Check your email for the password reset link!');
            }
        } catch (err) {
            setIsLoading(false);
            const msg = err?.message || 'An unexpected error occurred while requesting password reset.';
            console.error('Reset error:', msg);
            setStatusMessage({ type: 'error', text: msg });
            alert(msg);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleResetPassword(email);
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-1">
                        <Logo className="h-10 w-auto" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-brand-primary bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                            Account Recovery
                        </span>
                        <h2 className="text-xl font-black text-slate-800 pt-1">Forgot Password?</h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                            Enter your registered email to receive a password reset link.
                        </p>
                    </div>
                </div>

                {/* Status Banners */}
                {statusMessage.text && (
                    <div
                        className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                            statusMessage.type === 'error'
                                ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        }`}
                    >
                        {statusMessage.type === 'error' ? (
                            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                        ) : (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-relaxed font-semibold">
                            {statusMessage.text}
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label htmlFor="reset-email" className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                            Registered Email Address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                id="reset-email"
                                type="email"
                                autoFocus
                                required
                                placeholder="e.g. name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (statusMessage.text) setStatusMessage({ type: '', text: '' });
                                }}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full py-3.5 text-sm font-bold mt-2"
                    >
                        Send Reset Link
                    </Button>
                </form>

                {/* Back to Login Action */}
                <div className="pt-2 text-center">
                    <button
                        type="button"
                        onClick={onBackToLogin}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Sign In
                    </button>
                </div>

            </div>
        </div>
    );
}

