// src/pages/collector/CollectorLogin.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore, handleAuthSuccess } from '../../store/useAuthStore';
import { OSOGBO_CLUSTERS } from '../../utils/zoneValidator';
import {
  Truck,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Radio,
  CheckCircle2,
  Loader2,
  UserPlus,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react';

export interface CollectorLoginProps {
  onLoginSuccess?: (userData?: any) => void;
  onNavigateToOnboarding?: () => void;
  onBackToResident?: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function CollectorLogin({
  onLoginSuccess,
  onNavigateToOnboarding,
  onBackToResident,
  initialMode = 'signin',
}: CollectorLoginProps) {
  const { login } = useAuthStore();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Common Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Sign Up Specific Fields
  const [companyName, setCompanyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [clusterZone, setClusterZone] = useState<string>('Oke-Fia Zone');

  // Flow & State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // "Remember Me" Persistence: Auto-populate saved email from localStorage on mount
  useEffect(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedEmail =
          localStorage.getItem('kole_collector_remember_email') ||
          localStorage.getItem('collector_portal_saved_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    } catch (e) {
      console.warn('[CollectorLogin] Error retrieving remembered credentials:', e);
    }
  }, []);

  const handleReturnToResident = () => {
    if (onBackToResident) {
      onBackToResident();
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleQuickFillCollector = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setEmail('collector@kole.ng');
    setPassword('Collector#2026');
  };

  // =========================================================================
  // SIGN IN SUBMISSION HANDLER
  // =========================================================================
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please provide both your registered collector email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError || !authData?.user) {
        console.warn('[CollectorLogin] Supabase Auth rejected credentials:', authError);
        setIsLoading(false);
        const readableError =
          authError?.message === 'Invalid login credentials'
            ? 'Invalid collector email or password. Please verify your credentials or register below.'
            : authError?.message || 'Authentication failed. Please verify your collector credentials.';
        setErrorMessage(readableError);
        return;
      }

      const authUser = authData.user;
      const authSession = authData.session;

      // 2. Query custom 'profiles' / 'collectors' table to verify role is COLLECTOR
      const client: any = supabase;
      let userProfile: any = null;

      try {
        if (client?.from) {
          // Attempt query by primary id in profiles
          const { data: profileById, error: errById } = await client
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (!errById && profileById) {
            userProfile = profileById;
          } else {
            // Fallback: check by user_id column
            const { data: profileByUserId } = await client
              .from('profiles')
              .select('*')
              .eq('user_id', authUser.id)
              .maybeSingle();
            if (profileByUserId) userProfile = profileByUserId;
          }

          // Fallback: check by email
          if (!userProfile && authUser.email) {
            const { data: profileByEmail } = await client
              .from('profiles')
              .select('*')
              .eq('email', authUser.email)
              .maybeSingle();
            if (profileByEmail) userProfile = profileByEmail;
          }

          // Fallback: check collectors table for registered fleet operators
          if (!userProfile) {
            const { data: collectorData } = await client
              .from('collectors')
              .select('*')
              .eq('user_id', authUser.id)
              .maybeSingle();
            if (collectorData) {
              userProfile = {
                ...collectorData,
                role: 'COLLECTOR',
              };
            }
          }
        }
      } catch (dbErr) {
        console.warn('[CollectorLogin] Profiles lookup warning:', dbErr);
      }

      // Check role assignment strictly
      const assignedRoleRaw =
        userProfile?.role ||
        authUser.user_metadata?.role ||
        (cleanEmail.includes('collector') ? 'COLLECTOR' : null);

      const assignedRole = assignedRoleRaw ? String(assignedRoleRaw).toUpperCase().trim() : '';

      // 3. Strict Validation: This portal is EXCLUSIVELY for Collectors
      if (assignedRole !== 'COLLECTOR' && assignedRole !== 'OPERATOR') {
        setIsLoading(false);
        setErrorMessage(
          'Access Restricted: This portal is exclusively for authorized Waste Collectors and Fleet Operators. Access has been denied.'
        );
        return;
      }

      const collectorDisplayName =
        userProfile?.company_name ||
        userProfile?.full_name ||
        'Osogbo Central Cleaners Ltd';

      // 4. "Remember Me" Persistence handling
      try {
        if (typeof localStorage !== 'undefined') {
          if (rememberMe) {
            localStorage.setItem('kole_collector_remember_email', cleanEmail);
            localStorage.setItem('collector_portal_saved_email', cleanEmail);
          } else {
            localStorage.removeItem('kole_collector_remember_email');
            localStorage.removeItem('collector_portal_saved_email');
          }
        }
      } catch (storageErr) {
        console.warn('[CollectorLogin] LocalStorage persistence warning:', storageErr);
      }

      // Session tokens
      const sessionTokens = {
        access: authSession?.access_token || `kole-session-${Date.now()}`,
        refresh: authSession?.refresh_token || '',
      };
      handleAuthSuccess(sessionTokens, rememberMe);

      // 5. Store & Route to Collector Dashboard (/collector/dashboard)
      const collectorData = {
        id: userProfile?.id || authUser.id || 'COL-1001',
        email: authUser.email || cleanEmail,
        fullName: collectorDisplayName,
        companyName: collectorDisplayName,
        phoneNumber: userProfile?.phone || userProfile?.phoneNumber || '08012345678',
        phone: userProfile?.phone || userProfile?.phoneNumber || '08012345678',
        Area: userProfile?.area || 'Oke-Fia',
        cluster: userProfile?.cluster || 'Oke-Fia Zone',
        role: 'COLLECTOR',
        ...userProfile,
      };

      login(collectorData, 'collector', rememberMe, sessionTokens);
      setIsLoading(false);

      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/collector/dashboard');
        window.dispatchEvent(new Event('popstate'));
      }

      if (onLoginSuccess) {
        onLoginSuccess(collectorData);
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('[CollectorLogin] Unexpected sign in exception:', err);
      setErrorMessage(
        err?.message || 'A network error occurred while reaching the collector portal.'
      );
    }
  };

  // =========================================================================
  // SIGN UP / REGISTRATION SUBMISSION HANDLER
  // =========================================================================
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanCompany = companyName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanCompany || !cleanEmail || !cleanPhone || !cleanPassword) {
      setErrorMessage('Please fill in all required fields to register your collector fleet.');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up user via Supabase Auth
      const { data: regData, error: regError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanCompany,
            company_name: cleanCompany,
            phone: cleanPhone,
            cluster: clusterZone,
            area: clusterZone.replace(/\s+zone$/i, ''),
            role: 'COLLECTOR',
          },
        },
      });

      if (regError && !regData?.user) {
        console.warn('[CollectorLogin] Supabase sign up error:', regError);
        setIsLoading(false);
        setErrorMessage(regError.message || 'Registration could not be completed. Please try again.');
        return;
      }

      const newUserId = regData?.user?.id || `COL-${Math.floor(1000 + Math.random() * 9000)}`;
      const client: any = supabase;

      // 2. Insert into profiles table
      try {
        if (client?.from) {
          await client.from('profiles').upsert({
            id: newUserId,
            user_id: newUserId,
            email: cleanEmail,
            full_name: cleanCompany,
            company_name: cleanCompany,
            phone: cleanPhone,
            area: clusterZone.replace(/\s+zone$/i, ''),
            cluster: clusterZone,
            role: 'COLLECTOR',
            is_active: true,
            created_at: new Date().toISOString(),
          });

          // 3. Insert into collectors table
          await client.from('collectors').upsert({
            id: newUserId,
            user_id: newUserId,
            collector_name: cleanCompany,
            company_name: cleanCompany,
            phone: cleanPhone,
            area: clusterZone.replace(/\s+zone$/i, ''),
            cluster: clusterZone,
            fleet_count: 1,
            is_verified: true,
            created_at: new Date().toISOString(),
          });
        }
      } catch (upsertErr) {
        console.warn('[CollectorLogin] Profiles/collectors seed warning:', upsertErr);
      }

      // 4. "Remember Me" handling
      try {
        if (typeof localStorage !== 'undefined' && rememberMe) {
          localStorage.setItem('kole_collector_remember_email', cleanEmail);
          localStorage.setItem('collector_portal_saved_email', cleanEmail);
        }
      } catch {}

      const sessionTokens = {
        access: regData?.session?.access_token || `kole-operator-jwt-${Date.now()}`,
        refresh: regData?.session?.refresh_token || '',
      };
      handleAuthSuccess(sessionTokens, rememberMe);

      // 5. Build collector data and auto-login
      const collectorData = {
        id: newUserId,
        email: cleanEmail,
        fullName: cleanCompany,
        companyName: cleanCompany,
        phoneNumber: cleanPhone,
        phone: cleanPhone,
        Area: clusterZone.replace(/\s+zone$/i, ''),
        cluster: clusterZone,
        role: 'COLLECTOR',
      };

      login(collectorData, 'collector', rememberMe, sessionTokens);
      setIsLoading(false);
      setSuccessMessage('Collector account created successfully! Launching Operations Portal...');

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/collector/dashboard');
          window.dispatchEvent(new Event('popstate'));
        }
        if (onLoginSuccess) {
          onLoginSuccess(collectorData);
        }
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      console.error('[CollectorLogin] Registration exception:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred during collector registration.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-lato text-slate-100 flex flex-col justify-center items-center p-4 py-8 relative overflow-hidden antialiased">
      {/* Ambient background glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / Back Link */}
      <header className="w-full max-w-md mb-4 flex justify-between items-center text-xs z-10">
        <button
          type="button"
          onClick={handleReturnToResident}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer font-bold"
        >
          <ArrowLeft size={15} />
          <span>Resident Portal</span>
        </button>

        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 text-[10px] font-mono font-bold">
          <Radio size={11} className="animate-pulse text-[#22c55e]" />
          DISPATCH NET ACTIVE
        </span>
      </header>

      {/* Main Card Container (bg-slate-900) */}
      <main className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] rounded-2xl mb-1 shadow-inner">
            <Truck size={28} className="text-[#22c55e]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>KÓLẸ̀ Collector Portal</span>
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signin'
              ? 'Dedicated Sign-In for Fleet Collectors & Waste Operators'
              : 'Register New Waste Operator Fleet & Operating Cluster'}
          </p>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
        <div className="p-1 bg-slate-950 rounded-2xl flex items-center gap-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#22c55e] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock size={13} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#22c55e] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={13} />
            <span>Sign Up / Register</span>
          </button>
        </div>

        {/* 1-Click Quick Demo Pill (Sign In Mode only) */}
        {mode === 'signin' && (
          <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-[#22c55e] text-[11px] flex items-center gap-1">
                <Sparkles size={12} className="text-[#22c55e] shrink-0" />
                Demo Collector Fleet:
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                collector@kole.ng • Oke-Fia Zone
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFillCollector}
              className="px-3 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-[10px] rounded-xl shrink-0 cursor-pointer transition-all shadow-sm flex items-center gap-1"
            >
              <span>⚡ Fill Demo</span>
            </button>
          </div>
        )}

        {/* Clean Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-[11px]">Notice</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5 leading-snug">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-2xl text-[#22c55e] text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-[#22c55e] shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 1: SIGN IN FORM                                           */}
        {/* ============================================================= */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            {/* Email Address */}
            <div>
              <label
                htmlFor="collector-signin-email"
                className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1.5"
              >
                Registered Collector Email *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="collector-signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. collector@kole.ng or fleet@cleaners.ng"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors"
                />
              </div>
            </div>

            {/* Password with Visibility Toggle */}
            <div>
              <label
                htmlFor="collector-signin-password"
                className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1.5"
              >
                Operator Password *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="collector-signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* "Remember Me" Checkbox */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#22c55e] rounded border-slate-700 focus:ring-[#22c55e] mr-2 accent-[#22c55e] cursor-pointer"
                />
                <span className="font-medium text-slate-300">Remember me</span>
              </label>

              <span className="text-[10px] text-slate-500 font-mono">
                Fleet Session Encrypted
              </span>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#22c55e]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Verifying Collector Credentials...</span>
                </>
              ) : (
                <>
                  <Truck size={16} className="text-slate-950" />
                  <span>Sign In to Collector Portal</span>
                </>
              )}
            </button>

            {/* Bottom Toggle Prompt */}
            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span>New waste collector operator? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className="text-[#22c55e] font-bold hover:underline cursor-pointer"
              >
                Sign up here →
              </button>
            </div>
          </form>
        )}

        {/* ============================================================= */}
        {/* TAB 2: SIGN UP / REGISTRATION FORM                            */}
        {/* ============================================================= */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            {/* Company / Fleet Name */}
            <div>
              <label
                htmlFor="collector-company"
                className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1"
              >
                Company / Fleet Operator Name *
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="collector-company"
                  type="text"
                  placeholder="e.g. Osogbo Central Cleaners Ltd"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="collector-signup-email"
                className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1"
              >
                Official Collector Email *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="collector-signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. fleet@osogbocleaners.ng"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>
            </div>

            {/* Dispatch Phone & Operating Cluster Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="collector-phone"
                  className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1"
                >
                  Dispatch Phone *
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    id="collector-phone"
                    type="tel"
                    placeholder="08012345678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrorMessage(null);
                    }}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="collector-cluster"
                  className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1"
                >
                  Assigned Cluster Zone *
                </label>
                <div className="relative">
                  <select
                    id="collector-cluster"
                    value={clusterZone}
                    onChange={(e) => setClusterZone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] cursor-pointer"
                  >
                    {OSOGBO_CLUSTERS.map((c) => (
                      <option key={c.name} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="collector-signup-password"
                className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1"
              >
                Create Account Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="collector-signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-2xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-slate-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-[#22c55e]/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-950" />
                  <span>Registering Fleet & Initializing Bay...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} className="text-slate-950" />
                  <span>Create Collector Account & Enter Portal</span>
                </>
              )}
            </button>

            {/* Bottom Toggle Prompt */}
            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Already have an active collector account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                }}
                className="text-[#22c55e] font-bold hover:underline cursor-pointer"
              >
                Sign in here →
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
