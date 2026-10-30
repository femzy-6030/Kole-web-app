// src/pages/auth/UpdatePassword.jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function UpdatePassword({ onPasswordUpdated, onBackToLogin }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        if (!newPassword || newPassword.length < 6) {
            setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            setIsLoading(false);

            if (error) {
                console.error('Update password error:', error.message);
                setStatusMessage({ type: 'error', text: error.message });
                alert(error.message);
            } else {
                setIsSuccess(true);
                setStatusMessage({
                    type: 'success',
                    text: 'Your password has been successfully updated! You can now sign in with your new credentials.',
                });
                alert('Your password has been updated!');
                if (onPasswordUpdated) {
                    setTimeout(() => onPasswordUpdated(), 1500);
                }
            }
        } catch (err) {
            setIsLoading(false);
            const msg = err?.message || 'An error occurred while updating your password.';
            console.error('Update password error:', msg);
            setStatusMessage({ type: 'error', text: msg });
            alert(msg);
        }
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
                            Security Credentials
                        </span>
                        <h2 className="text-xl font-black text-slate-800 pt-1">Create New Password</h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                            Enter a new, strong password to secure your KÓLẸ̀ account.
                        </p>
                    </div>
                </div>

                {/* Status Banner */}
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

                {!isSuccess ? (
                    <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
                        <div>
                            <label htmlFor="new-password" className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoFocus
                                    required
                                    placeholder="Enter at least 6 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                        <div>
                            <label htmlFor="confirm-password" className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                <input
                                    id="confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            className="w-full py-3.5 text-sm font-bold mt-2"
                        >
                            Update Password
                        </Button>
                    </form>
                ) : (
                    <Button
                        type="button"
                        onClick={onBackToLogin}
                        className="w-full py-3.5 text-sm font-bold"
                    >
                        Proceed to Sign In
                    </Button>
                )}

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

