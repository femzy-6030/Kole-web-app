// src/components/collector/ProtectedCollectorRoute.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedCollectorRouteProps {
  children: React.ReactNode;
  loginUrl?: string;
  fallbackUrl?: string;
  requireVerified?: boolean;
}

export default function ProtectedCollectorRoute({
  children,
  loginUrl = '/login',
}: ProtectedCollectorRouteProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isCollector, setIsCollector] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const safeNavigate = (targetPath: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', targetPath);
        window.dispatchEvent(new Event('popstate'));
      }
      navigate(targetPath);
    };

    const verifyCollector = async () => {
      try {
        // 1. Query Supabase authentication session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (session && !sessionError && session.user) {
          // Safe query using maybeSingle() to prevent unhandled row errors
          const { data: collectorData, error: dbError } = await supabase
            .from('collectors')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (dbError) {
            console.warn('Collector profile validation failed:', dbError);
          } else if (collectorData) {
            if (isMounted) {
              setIsCollector(true);
              setLoading(false); // Stop loading only after successful verification
            }
            return;
          }
        }

        // 2. Fallback check for local operator session (Zustand & token storage)
        const authState = useAuthStore.getState();
        const localToken = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
        const sessionToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('access_token') : null;
        const hasActiveToken = Boolean(localToken || sessionToken);

        const isLocalCollector =
          (authState.isAuthenticated && (authState.role === 'collector' || authState.user?.role === 'collector')) ||
          (hasActiveToken && authState.role === 'collector');

        if (isLocalCollector) {
          if (isMounted) {
            setIsCollector(true);
            setLoading(false);
          }
          return;
        }

        // 3. Unauthenticated session: route cleanly to login
        console.warn('Collector profile validation failed: No active collector session');
        if (isMounted) {
          setLoading(false);
          safeNavigate(loginUrl);
        }
      } catch (err) {
        console.error('Unhandled collector verification exception:', err);
        if (isMounted) {
          setLoading(false);
          safeNavigate(loginUrl);
        }
      }
    };

    verifyCollector();

    return () => {
      isMounted = false;
    };
  }, [navigate, loginUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-green-500 font-mono text-sm">
        Verifying KóLẹ̀ Dispatch Credentials...
      </div>
    );
  }

  return isCollector ? <>{children}</> : null;
}
