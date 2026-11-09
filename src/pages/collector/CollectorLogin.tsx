// src/pages/collector/CollectorLogin.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore, handleAuthSuccess } from '../../store/useAuthStore';
import {
  Truck,
  ShieldCheck,
  ShieldAlert,
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
  KeyRound,
} from 'lucide-react';

export interface CollectorLoginProps {
  onLoginSuccess?: (userData?: any) => void;
  onNavigateToOnboarding?: () => void;
  onBackToResident?: () => void;
}

export default function CollectorLogin({
  onLoginSuccess,
  onNavigateToOnboarding,
  onBackToResident,
}: CollectorLoginProps) {
  const { login } = useAuthStore();

  // Form Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Flow & State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginRoleDetected, setLoginRoleDetected] = useState<string | null>(null);

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

  const handleQuickFill = (roleType: 'SUPER_ADMIN' | 'COLLECTOR') => {
    setErrorMessage(null);
    if (roleType === 'SUPER_ADMIN') {
      setEmail('admin@kole.ng');
      setPassword('Admin#2026');
    } else {
      setEmail('collector@kole.ng');
      setPassword('Collector#2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoginRoleDetected(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Please provide both your registered email address and password.');
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
            ? 'Invalid email or password. Please verify your credentials and try again.'
            : authError?.message || 'Authentication failed. Please verify your credentials.';
        setErrorMessage(readableError);
        return;
      }

      const authUser = authData.user;
      const authSession = authData.session;

      // 2. Query custom 'profiles' table immediately after login to check role
      const client: any = supabase;
      let userProfile: any = null;

      try {
        if (client?.from) {
          // Attempt query by primary id
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

      // Check user_metadata fallback if profiles row is not yet propagated
      const assignedRoleRaw =
        userProfile?.role ||
        authUser.user_metadata?.role ||
        (cleanEmail.includes('admin') || cleanEmail.includes('super')
          ? 'SUPER_ADMIN'
          : cleanEmail.includes('collector')
          ? 'COLLECTOR'
          : null);

      const assignedRole = assignedRoleRaw ? String(assignedRoleRaw).toUpperCase().trim() : '';

      // 3. Validate Role Authorization (Only SUPER_ADMIN or COLLECTOR permitted)
      if (assignedRole !== 'SUPER_ADMIN' && assignedRole !== 'ADMIN' && assignedRole !== 'COLLECTOR') {
        setIsLoading(false);
        setErrorMessage(
          'Access Restricted: Your account does not have authorization as a Collector or Super Admin. Please contact municipal operations.'
        );
        return;
      }

      setLoginRoleDetected(assignedRole);

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

      // 5. Role-Based Routing
      if (assignedRole === 'SUPER_ADMIN' || assignedRole === 'ADMIN') {
        // Super Admin Route -> /admin/dashboard
        const adminData = {
          id: authUser.id,
          email: authUser.email || cleanEmail,
          fullName: userProfile?.full_name || 'System Super Administrator',
          role: 'SUPER_ADMIN',
          isAdmin: true,
          ...userProfile,
        };

        login(adminData, 'admin', rememberMe, sessionTokens);
        setIsLoading(false);

        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/admin/dashboard');
          window.dispatchEvent(new Event('popstate'));
        }

        if (onLoginSuccess) {
          onLoginSuccess(adminData);
        }
      } else {
        // Collector Route -> /collector/dashboard
        const collectorData = {
          id: userProfile?.id || authUser.id || 'COL-1001',
          email: authUser.email || cleanEmail,
          fullName: userProfile?.full_name || userProfile?.company_name || 'Osogbo Central Cleaners Ltd',
          companyName: userProfile?.company_name || userProfile?.full_name || 'Osogbo Central Cleaners Ltd',
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
      }
    } catch (err: any) {
      setIsLoading(false);
      console.error('[CollectorLogin] Unexpected sign in exception:', err);
      setErrorMessage(
        err?.message || 'A network error occurred while reaching the authentication portal.'
      );
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
          COMMAND GATE ACTIVE
        </span>
      </header>

      {/* Main Sign-In Card Container (bg-slate-900) */}
      <main className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] rounded-2xl mb-1 shadow-inner">
            <KeyRound size={26} className="text-[#22c55e]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>KÓLẸ̀ Operations Gate</span>
          </h1>
          <p className="text-xs text-slate-400">
            Dedicated Sign-In for Fleet Collectors & Super Administrators
          </p>
        </div>

        {/* Quick Testing Role Presets */}
        <div className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles size={11} className="text-[#22c55e]" />
              Quick Testing Presets:
            </span>
            <span className="text-[9px] text-[#22c55e] font-mono font-bold bg-[#22c55e]/10 px-1.5 py-0.2 rounded border border-[#22c55e]/20">
              Auto-Fills Form
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('COLLECTOR')}
              className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Truck size={13} className="text-[#22c55e]" />
              <span>Collector Fleet</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('SUPER_ADMIN')}
              className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-700/80 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Super Admin</span>
            </button>
          </div>
        </div>

        {/* Clean Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-[11px]">Authentication Error</p>
              <p className="text-[11px] text-rose-300/90 mt-0.5 leading-snug">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Role Detection Toast */}
        {loginRoleDetected && (
          <div className="p-2.5 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-xl text-[#22c55e] text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#22c55e] shrink-0" />
            <span className="font-bold">
              Role Verified: {loginRoleDetected === 'SUPER_ADMIN' ? 'Super Administrator' : 'Waste Collector'}
            </span>
          </div>
        )}

        {/* Sign-In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email Address */}
          <div>
            <label
              htmlFor="collector-email"
              className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1.5"
            >
              Official Email Address *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="collector-email"
                type="email"
                autoComplete="email"
                placeholder="name@kole.ng or admin@kole.ng"
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
              htmlFor="collector-password"
              className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1.5"
            >
              Password *
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                id="collector-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
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
              Role Auto-Routed
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
                <span>Verifying Credentials & Role...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} className="text-slate-950" />
                <span>Sign In to Operations Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Onboarding */}
        <footer className="pt-2 border-t border-slate-800/80 text-center text-xs space-y-2">
          <p className="text-slate-400">
            New Fleet Operator in Osogbo Municipality?
          </p>
          <button
            type="button"
            onClick={
              onNavigateToOnboarding ||
              (() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/collector-onboard');
                  window.dispatchEvent(new Event('popstate'));
                }
              })
            }
            className="text-[#22c55e] font-bold hover:underline cursor-pointer block mx-auto text-xs"
          >
            Register Fleet & Request Zone Assignment →
          </button>
        </footer>
      </main>
    </div>
  );
}

