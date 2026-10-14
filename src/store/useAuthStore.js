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

            login: (userData, role, remember = true) => {
                set({
                    user: userData,
                    role: role,
                    isAuthenticated: true,
                    rememberMe: remember,
                });
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
                set({ user: null, role: 'customer', isAuthenticated: false, activeRequests: [] });
                localStorage.removeItem('kole-auth-storage');
            },
        }),
        {
            name: 'kole-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);