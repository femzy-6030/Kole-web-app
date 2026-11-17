// src/components/auth/ChangePasswordModal.tsx
import React, { useState } from 'react';
import { auth } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Lock, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import type { ChangePasswordPayload } from '../../types/client';

interface ChangePasswordModalProps {
  isOpen?: boolean;
  userPhone?: string;
  onSuccess?: () => void;
  isMandatory?: boolean; // When true, cannot be dismissed (enforced for temporary password flow)
}

export default function ChangePasswordModal({
  isOpen = true,
  userPhone,
  onSuccess,
  isMandatory = true,
}: ChangePasswordModalProps) {
  const { user, setTemporaryPassword, updateUserProfile } = useAuthStore();
  const effectivePhone = userPhone || user?.phone_number || user?.phoneNumber || '';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Form validations
    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current temporary password (your phone number).');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('Your new password cannot be the same as your temporary password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('The new passwords do not match. Please verify and retype.');
      return;
    }

    setIsLoading(true);

    try {
      const payload: ChangePasswordPayload = {
        current_password: currentPassword.trim(),
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      };

      await auth.changePassword(payload);

      // On success: update is_temporary_password state to false
      setTemporaryPassword(false);
      updateUserProfile({ is_temporary_password: false });

      setSuccessMsg('Password updated successfully! Redirecting to your dashboard...');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new Event('popstate'));
        }
      }, 900);
    } catch (err: any) {
      console.error('[Change Password Error]', err);
      const serverMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 400 ? 'Invalid password provided. Ensure your current temporary password is correct.' : 'Failed to update password. Please check your credentials and try again.');
      setErrorMsg(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-slate-800">
        
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-[#00D7E8] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <KeyRound size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Account Security Requirement
            </span>
            <h2 className="text-xl font-black text-slate-900 pt-1.5 font-heading">
              Update Temporary Password
            </h2>
            <p className="text-xs text-slate-500">
              Set a permanent password to access your cluster pickup dashboard
            </p>
          </div>
        </div>

        {/* Temporary Password Reminder Banner */}
        <div className="p-3.5 bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200/80 rounded-2xl flex items-start gap-3 text-slate-700 text-xs">
          <Sparkles size={18} className="text-[#00A3B4] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-800">Initial Setup Password Notice</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your temporary default password is your registered phone number{' '}
              {effectivePhone ? (
                <span className="font-bold text-emerald-800 bg-emerald-100/70 px-1 py-0.5 rounded">
                  ({effectivePhone})
                </span>
              ) : (
                '(e.g., 080XXXXXXXX)'
              )}
              . Please create a permanent, private password.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in duration-150">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Password Update Error</p>
              <p className="text-[11px] mt-0.5 text-rose-600 leading-tight">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs animate-in fade-in duration-150">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Security Verified</p>
              <p className="text-[11px] mt-0.5 text-emerald-700 leading-tight">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Current Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wide">
                Current Temporary Password <span className="text-rose-500">*</span>
              </label>
              {effectivePhone && (
                <button
                  type="button"
                  onClick={() => setCurrentPassword(effectivePhone)}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline"
                >
                  Auto-fill phone number
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your phone number as temporary password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
              New Permanent Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-type your new password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving Permanent Password...
              </span>
            ) : (
              <>
                <span>Set Password & Access Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Protection Note */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldAlert size={13} className="text-amber-500" />
            <span>Dashboard is locked until temporary password is changed</span>
          </p>
        </div>

      </div>
    </div>
  );
}

