// src/pages/auth/ClientLogin.tsx
import React, { useState } from 'react';
import { useAuthStore, handleAuthSuccess } from '../../store/useAuthStore';
import { auth } from '../../services/api';
import Logo from '../../components/common/Logo';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import { Phone, Lock, AlertCircle, Eye, EyeOff, ArrowRight, ShieldCheck, Truck, Sparkles, User, Building2 } from 'lucide-react';
import type { LoginResponse } from '../../types/client';

interface ClientLoginProps {
  onLoginSuccess?: (isTemporary: boolean) => void;
  onSwitchToRegister?: () => void;
  onNavigateToCollector?: () => void;
  onSwitchRole?: (role: 'customer' | 'organization') => void;
  currentRole?: 'customer' | 'organization';
}

export default function ClientLogin({
  onLoginSuccess,
  onSwitchToRegister,
  onNavigateToCollector,
  onSwitchRole,
  currentRole = 'customer',
}: ClientLoginProps) {
  const { login } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Temporary password modal triggered on login response
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [tempPasswordUserPhone, setTempPasswordUserPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    const cleanPhone = phoneNumber.trim();
    const cleanPass = password;

    if (!cleanPhone || !cleanPass) {
      setIsLoading(false);
      setAuthError('Please enter both your phone number and password.');
      return;
    }

    try {
      // POST /api/v1/auth/login with { phone_number, password }
      const data: LoginResponse = await auth.login({
        phone_number: cleanPhone,
        password: cleanPass,
      });

      const accessToken = data.access || data.accessToken || data.token;
      const refreshToken = data.refresh || data.refreshToken;

      if (!accessToken) {
        throw new Error('Authentication completed but no access token was returned.');
      }

      // Check whether user has temporary password
      const isTemporary = Boolean(
        data.user?.is_temporary_password ??
        (data as any).is_temporary_password ??
        false
      );

      // Construct client user payload
      const clientUserData = {
        id: data.user?.id || `USR-${cleanPhone.slice(-4) || '9021'}`,
        phone_number: data.user?.phone_number || cleanPhone,
        phoneNumber: data.user?.phone_number || cleanPhone,
        fullName: data.user?.full_name || data.user?.fullName || 'Resident Client',
        full_name: data.user?.full_name || data.user?.fullName || 'Resident Client',
        email: data.user?.email || `${cleanPhone}@kole.ng`,
        address: data.user?.address || 'Oke-Fia, Osogbo',
        is_temporary_password: isTemporary,
        role: 'customer',
        cluster: data.user?.cluster || {
          id: 1,
          name: 'Oke-Fia Central Zone',
          code: 'OFZ-01',
          schedule: 'Tuesdays & Thursdays • 7:00 AM – 11:00 AM',
          pickup_days: ['Tuesday', 'Thursday'],
          status: 'ACTIVE',
          base_tariff: 2500,
        },
        assigned_collector: data.user?.assigned_collector || {
          id: 'COL-104',
          name: 'Osogbo Central Cleaners Ltd',
          company_name: 'Osogbo Central Cleaners Ltd',
          phone: '08034567890',
          vehicle_info: 'Toyota Dyna Compactor (OSG-442-XA)',
          vehicle_plate: 'OSG-442-XA',
          vehicle_type: 'Compactor Truck',
          status: 'ON_DUTY',
          rating: 4.8,
        },
        total_pickups: data.user?.total_pickups ?? 8,
        impact_score: data.user?.impact_score ?? 92,
      };

      // Persist credentials
      handleAuthSuccess({ access: accessToken, refresh: refreshToken }, rememberMe);
      login(clientUserData, 'customer', rememberMe, {
        access: accessToken,
        refresh: refreshToken,
      });

      setIsLoading(false);

      // Handle Temporary Password vs Normal Routing
      if (isTemporary) {
        setTempPasswordUserPhone(cleanPhone);
        setShowChangePasswordModal(true);
        if (onLoginSuccess) onLoginSuccess(true);
      } else {
        if (onLoginSuccess) {
          onLoginSuccess(false);
        } else if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/dashboard');
          window.dispatchEvent(new Event('popstate'));
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('[Client Login Error]', err);

      let message = 'Unable to sign in. Please verify your phone number and password.';
      if (err.response?.status === 401) {
        message = 'Invalid phone number or password. If this is your first time, use your phone number as your initial password.';
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message && !err.response) {
        message = 'Network connection failed. Please check your internet connection.';
      }

      setAuthError(message);
    }
  };

  // Quick preset autofills for quick verification
  const handleAutoFillDemo = (type: 'temp' | 'standard') => {
    setAuthError('');
    if (type === 'temp') {
      setPhoneNumber('08012345678');
      setPassword('08012345678'); // temporary password equals phone number
    } else {
      setPhoneNumber('08098765432');
      setPassword('SecurePass#2026');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
        
        {/* Brand Logo & Environmental Header */}
        <div className="text-center space-y-2">
          <Logo className="h-12 w-auto mx-auto" />
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-3 py-1 w-max mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D7E8] animate-pulse" />
            <span>Resident & Household Portal</span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Sign in with your registered phone number
          </p>
        </div>

        {/* Role Switcher Pill (Household vs Organization) */}
        {onSwitchRole && (
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSwitchRole('customer')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentRole === 'customer'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={14} />
              <span>Household</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('organization')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentRole === 'organization'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building2 size={14} />
              <span>Organization</span>
            </button>
          </div>
        )}

        {/* Quick Testing Presets */}
        <div className="p-3 bg-slate-50/90 border border-slate-200/70 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-emerald-700">
              <Sparkles size={12} /> Test Presets
            </span>
            <span>Click to Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleAutoFillDemo('temp')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-[11px] font-bold text-left transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="truncate">First-Time Setup (Temp)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAutoFillDemo('standard')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl text-[11px] font-bold text-left transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">Active Account</span>
            </button>
          </div>
        </div>

        {/* Error Alert Banner */}
        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in duration-150">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Sign-In Failed</p>
              <p className="text-[11px] mt-0.5 text-rose-600 leading-tight">{authError}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Phone Number Field */}
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g., 08012345678"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setAuthError('');
                }}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wide">
                Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Default: phone number
              </span>
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError('');
                }}
                required
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Help */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <span className="text-[11px] text-slate-400">
              Cluster Auto-Routed
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-[#00A3B4] hover:from-emerald-700 hover:to-[#008C9A] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying Credentials...
              </span>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Sign In to Client Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2 text-xs text-slate-500">
          {onSwitchToRegister && (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Register now
              </button>
            </div>
          )}

          {onNavigateToCollector && (
            <button
              type="button"
              onClick={onNavigateToCollector}
              className="mt-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Truck size={13} className="text-emerald-600" />
              <span>Switch to Collector & Fleet Portal →</span>
            </button>
          )}
        </div>

      </div>

      {/* Mandatory Change Password Modal if temporary password detected */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          userPhone={tempPasswordUserPhone}
          isMandatory={true}
          onSuccess={() => {
            setShowChangePasswordModal(false);
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new Event('popstate'));
            }
          }}
        />
      )}
    </div>
  );
}
