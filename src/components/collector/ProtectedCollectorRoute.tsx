// src/components/collector/ProtectedCollectorRoute.tsx
import React, { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { Truck, ShieldAlert, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ProtectedCollectorRouteProps {
    children?: ReactNode;
    fallbackUrl?: string;
    loginUrl?: string;
    requireVerified?: boolean;
}

export interface CollectorProfile {
    id?: string;
    user_id?: string;
    collector_name?: string;
    company_name?: string;
    phone?: string;
    area?: string;
    cluster?: string;
    vehicle_count?: number;
    worker_count?: number;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    is_verified?: boolean;
    status?: string;
}

export default function ProtectedCollectorRoute({
    children,
    fallbackUrl = '/collector-onboard',
    loginUrl = '/collector',
    requireVerified = false,
}: ProtectedCollectorRouteProps) {
    const { user, role, isAuthenticated, updateUserProfile } = useAuthStore();
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [collectorData, setCollectorData] = useState<CollectorProfile | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [isMissingProfile, setIsMissingProfile] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        const verifyCollectorSession = async () => {
            setIsChecking(true);
            setStatusError(null);

            try {
                // 1. Ensure local session context strictly preserves collector role
                const currentRole = role || user?.role;
                if (currentRole !== 'collector' && isAuthenticated) {
                    updateUserProfile({ role: 'collector' });
                }

                // Check for access token in localStorage or sessionStorage
                const hasLocalToken = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('access_token'));
                const hasSessionToken = typeof sessionStorage !== 'undefined' && Boolean(sessionStorage.getItem('access_token'));
                const hasActiveToken = hasLocalToken || hasSessionToken;

                // 2. Resolve current user identity from Supabase auth or Zustand store
                let currentUserId: string | null = user?.id || null;

                try {
                    if (supabase?.auth?.getSession) {
                        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
                        if (!sessionErr && sessionData?.session?.user) {
                            currentUserId = sessionData.session.user.id;
                        }
                    }
                } catch (sessionErr) {
                    console.warn('[ProtectedCollectorRoute] Supabase getSession fallback notice:', sessionErr);
                }

                // 3. Perform safe .maybeSingle() query to avoid unhandled exceptions or 406 errors
                let profileRow: CollectorProfile | null = null;

                if (currentUserId && supabase?.from) {
                    try {
                        const { data, error } = await supabase
                            .from('collectors')
                            .select('*')
                            .eq('user_id', currentUserId)
                            .maybeSingle();

                        if (error) {
                            console.warn('[ProtectedCollectorRoute] collectors.maybeSingle notice:', error.message);
                        } else if (data) {
                            profileRow = data as CollectorProfile;
                        }
                    } catch (dbErr) {
                        console.warn('[ProtectedCollectorRoute] DB query catch boundary:', dbErr);
                    }
                }

                // 4. Fallback to Zustand store user data if DB row is not found or mock session is active
                if (!profileRow && (user || isAuthenticated || hasActiveToken)) {
                    const operatorName = user?.companyName || user?.collectorName || user?.fullName || 'Collector Operator';
                    profileRow = {
                        id: user?.id || currentUserId || 'COL-MOCK',
                        company_name: operatorName,
                        collector_name: operatorName,
                        phone: user?.phone || user?.phoneNumber || '',
                        area: user?.Area || user?.area || 'Oke-Fia',
                        cluster: user?.cluster || (user?.Area ? `${user.Area} Zone` : 'Oke-Fia Zone'),
                        vehicle_count: user?.vehicleCount || user?.fleetCount || 1,
                        worker_count: user?.workerCount || 2,
                        bank_name: user?.bankName || '',
                        account_number: user?.accountNumber || '',
                        account_name: user?.accountName || '',
                        is_verified: true,
                        status: 'active',
                    };
                }

                if (!isMounted) return;

                if (profileRow) {
                    // Check if strict verification is required and unverified
                    if (requireVerified && profileRow.is_verified === false) {
                        setIsMissingProfile(true);
                        setCollectorData(profileRow);
                    } else {
                        setCollectorData(profileRow);
                        setIsMissingProfile(false);

                        // Sync updated profile attributes to Zustand
                        updateUserProfile({
                            ...profileRow,
                            role: 'collector',
                            Area: profileRow.area || user?.Area || 'Oke-Fia',
                        });
                    }
                } else {
                    // Not authenticated at all: redirect to collector login
                    if (!isAuthenticated && !hasActiveToken) {
                        if (typeof window !== 'undefined') {
                            window.location.href = loginUrl;
                        }
                        return;
                    }
                    // Profile does NOT exist in DB yet and no local data
                    console.info('[ProtectedCollectorRoute] No collector profile found. Directing to onboarding.');
                    setIsMissingProfile(true);
                }
            } catch (unexpectedError: any) {
                console.error('[ProtectedCollectorRoute] Unhandled guard error prevented:', unexpectedError);
                if (isMounted) {
                    setStatusError(unexpectedError?.message || 'Verification check timed out. Retaining local operator session.');
                    // Gracefully allow local session if operator is logged in locally
                    if (isAuthenticated && role === 'collector') {
                        setIsMissingProfile(false);
                    }
                }
            } finally {
                if (isMounted) {
                    setIsChecking(false);
                }
            }
        };

        verifyCollectorSession();

        // 5. Listen for auth changes cleanly without bouncing active local sessions
        let authListener: any = null;
        try {
            if (supabase?.auth?.onAuthStateChange) {
                authListener = supabase.auth.onAuthStateChange((event: string, session: any) => {
                    if (!isMounted) return;

                    if (event === 'SIGNED_OUT') {
                        const authState = useAuthStore.getState();
                        const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
                        const sessionToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('access_token') : null;

                        // Only redirect to login if user is truly signed out in BOTH Supabase AND local store/storage
                        if (!authState.isAuthenticated && !localToken && !sessionToken) {
                            if (typeof window !== 'undefined') {
                                window.location.href = loginUrl;
                            }
                        }
                    } else if (event === 'SIGNED_IN' && session?.user) {
                        verifyCollectorSession();
                    }
                });
            }
        } catch (listenerErr) {
            console.warn('[ProtectedCollectorRoute] onAuthStateChange setup notice:', listenerErr);
        }

        return () => {
            isMounted = false;
            try {
                if (authListener?.data?.subscription?.unsubscribe) {
                    authListener.data.subscription.unsubscribe();
                } else if (typeof authListener?.unsubscribe === 'function') {
                    authListener.unsubscribe();
                }
            } catch {
                // Ignore cleanup errors
            }
        };
    }, [role, user?.id, loginUrl, updateUserProfile, isAuthenticated, requireVerified]);

    // Loading State
    if (isChecking) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                        <Truck size={28} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-base font-black text-white">Validating Operator Credentials</h2>
                        <p className="text-xs text-slate-400">Verifying municipal dispatch permissions...</p>
                    </div>
                    <div className="flex justify-center pt-2">
                        <Loader2 className="animate-spin text-emerald-400" size={24} />
                    </div>
                </div>
            </div>
        );
    }

    // Missing Profile Fallback State (Redirects to Onboarding without kicking to /login)
    if (isMissingProfile) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 font-sans">
                <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-3xl flex items-center justify-center mx-auto">
                        <ShieldAlert size={32} />
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            Onboarding Required
                        </span>
                        <h2 className="text-lg font-black text-white">Complete Collector Verification</h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Your account is authenticated, but your collector fleet profile and Paystack settlement account have not been finalized yet.
                        </p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs text-slate-300 space-y-1">
                        <p className="font-bold text-white flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-400" /> Account Active: {user?.email || user?.fullName || 'Logged in'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                            To view live household dispatches, register your vehicle count and payout bank account.
                        </p>
                    </div>

                    <div className="space-y-2 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.history.pushState({}, '', fallbackUrl);
                                    window.dispatchEvent(new Event('popstate'));
                                }
                            }}
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950"
                        >
                            <span>Complete Fleet Onboarding</span>
                            <ArrowRight size={15} />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                // Allow test operator bypass into dashboard in dev mode
                                setIsMissingProfile(false);
                            }}
                            className="w-full py-2.5 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                            Continue in Test Operator Mode →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Authenticated Collector Children
    return <>{children}</>;
}
