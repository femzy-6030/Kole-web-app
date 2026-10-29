// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Conditional Token Storage Logic:
 * If rememberMe is true, tokens persist across browser sessions in localStorage.
 * If rememberMe is false, tokens persist only for current browser session in sessionStorage.
 */
export const handleAuthSuccess = (tokens, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clear potential stale tokens from both storages first
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');

    const access = tokens?.access || tokens?.accessToken || tokens?.access_token || (typeof tokens === 'string' ? tokens : '');
    const refresh = tokens?.refresh || tokens?.refreshToken || tokens?.refresh_token || '';

    // Save to selected storage
    if (access) storage.setItem('access_token', access);
    if (refresh) storage.setItem('refresh_token', refresh);
};

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            role: 'customer', // 'customer' | 'organization' | 'collector' | 'admin'
            isAuthenticated: false,
            rememberMe: true,
            accessToken: null,
            refreshToken: null,
            tokens: null,
            subscription: null,

            // Active Requests State (Phase 2 Dispatch Pipeline) - Clean Slate
            activeRequests: [],

            login: (userData, role, remember = true, tokens = null) => {
                const access = tokens?.access || tokens?.accessToken || tokens?.access_token || userData?.access || userData?.accessToken || userData?.access_token || userData?.token || null;
                const refresh = tokens?.refresh || tokens?.refreshToken || tokens?.refresh_token || userData?.refresh || userData?.refreshToken || userData?.refresh_token || null;

                // Conditional token storage logic: localStorage vs sessionStorage
                if (access || refresh) {
                    handleAuthSuccess({ access, refresh }, remember);
                }

                // Clean slate defaults: newly registered and logged-in users start with 0 pickups & 0 impact score
                const cleanUser = userData ? {
                    ...userData,
                    total_pickups: typeof userData.total_pickups === 'number' ? userData.total_pickups : 0,
                    impact_score: typeof userData.impact_score === 'number' ? userData.impact_score : 0,
                } : null;

                set({
                    user: cleanUser,
                    role: role,
                    isAuthenticated: true,
                    rememberMe: remember,
                    accessToken: access,
                    refreshToken: refresh,
                    tokens: access ? { access, refresh } : null,
                });
            },

            setTokens: (tokens) => {
                const access = tokens?.access || tokens?.access_token || (typeof tokens === 'string' ? tokens : null);
                const refresh = tokens?.refresh || tokens?.refresh_token || null;
                set((state) => ({
                    accessToken: access || state.accessToken,
                    refreshToken: refresh || state.refreshToken,
                    tokens: {
                        access: access || state.accessToken,
                        refresh: refresh || state.refreshToken,
                    },
                }));
            },

            setSubscription: (subData) => {
                set((state) => ({
                    subscription: subData,
                    user: state.user ? { ...state.user, subscription: subData } : state.user,
                }));
            },

            updateUserProfile: (updatedFields) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedFields } : null,
                }));
            },

            // Action to dynamically push new dispatches to state
            addActiveRequest: (newRequest) => {
                set((state) => ({
                    activeRequests: [newRequest, ...(state.activeRequests || [])],
                }));
            },

            logout: () => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');
                localStorage.removeItem('kole-auth-storage');
                set({
                    user: null,
                    role: 'customer',
                    isAuthenticated: false,
                    rememberMe: true,
                    accessToken: null,
                    refreshToken: null,
                    tokens: null,
                    subscription: null,
                    activeRequests: []
                });
            },
        }),
        {
            name: 'kole-auth-storage',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            onRehydrateStorage: () => (state) => {
                if (state && state.isAuthenticated) {
                    const localToken = localStorage.getItem('access_token');
                    const sessionToken = sessionStorage.getItem('access_token');

                    // If logged in with rememberMe === false and sessionToken is missing (tab was closed), clear session
                    if (state.rememberMe === false && !sessionToken) {
                        state.user = null;
                        state.isAuthenticated = false;
                        state.accessToken = null;
                        state.refreshToken = null;
                        state.tokens = null;
                        localStorage.removeItem('kole-auth-storage');
                    } else if (state.rememberMe === true && !localToken && state.accessToken) {
                        // Restore tokens to localStorage if rememberMe was true
                        localStorage.setItem('access_token', state.accessToken);
                        if (state.refreshToken) localStorage.setItem('refresh_token', state.refreshToken);
                    }
                }
            },
            migrate: (persistedState) => {
                if (!persistedState) return persistedState;
                const activeRequests = (persistedState.activeRequests || []).filter(
                    (r) => r.requestId !== '#KL-904102'
                );
                const user = persistedState.user
                    ? {
                        ...persistedState.user,
                        total_pickups: typeof persistedState.user.total_pickups === 'number' ? persistedState.user.total_pickups : 0,
                        impact_score: typeof persistedState.user.impact_score === 'number' ? persistedState.user.impact_score : 0,
                    }
                    : null;
                return {
                    ...persistedState,
                    activeRequests,
                    user,
                };
            },
        }
    )
);
