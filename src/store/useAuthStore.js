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

            // Active Requests State (Phase 2 Dispatch Pipeline)
            activeRequests: [
                {
                    requestId: '#KL-904102',
                    title: 'One-Time SOS Pickup',
                    amount: '₦1,500',
                    status: 'PENDING_DISPATCH',
                    address: 'Oke-Fia Junction, Near Station Road',
                    createdAt: new Date().toISOString()
                }
            ],

            login: (userData, role, remember = true, tokens = null) => {
                const access = tokens?.access || tokens?.access_token || userData?.access || userData?.access_token || userData?.token || null;
                const refresh = tokens?.refresh || tokens?.refresh_token || userData?.refresh || userData?.refresh_token || null;
                set({
                    user: userData,
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
        }
    )
);