import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('kole_token') || null,
    role: null, // 'customer' | 'collector' | 'admin'
    isAuthenticated: false,

    setUserSession: (userData, token) => {
        localStorage.setItem('kole_token', token);
        set({
            user: userData,
            token,
            role: userData.role,
            isAuthenticated: true,
        });
    },

    logout: () => {
        localStorage.removeItem('kole_token');
        set({ user: null, token: null, role: null, isAuthenticated: false });
    },
}));