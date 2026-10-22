// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
                set({
                    user: null,
                    role: 'customer',
                    isAuthenticated: false,
                    accessToken: null,
                    refreshToken: null,
                    tokens: null,
                    subscription: null,
                    activeRequests: []
                });
                localStorage.removeItem('kole-auth-storage');
            },
        }),
        {
            name: 'kole-auth-storage',
            storage: createJSONStorage(() => localStorage),
            version: 1,
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