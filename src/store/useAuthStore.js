// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            role: 'customer', // 'customer' | 'organization' | 'admin'
            isAuthenticated: false,
            rememberMe: true,

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

            logout: () => {
                set({ user: null, role: 'customer', isAuthenticated: false });
                localStorage.removeItem('kole-auth-storage');
            },
        }),
        {
            name: 'kole-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);