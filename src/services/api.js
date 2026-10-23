// src/services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const API_BASE_URL = import.meta.env.DEV ? '/api/v1/' : 'https://kole-pi.vercel.app/api/v1/';

// Create configured Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000,
});

// Helper: Extract valid JWT access token from Zustand store or localStorage fallback
export const getAuthToken = () => {
    try {
        const state = useAuthStore.getState();
        let token =
            state.accessToken ||
            state.tokens?.access ||
            state.tokens?.access_token ||
            state.user?.access ||
            state.user?.access_token ||
            state.user?.token;

        if (!token) {
            const raw = localStorage.getItem('kole-auth-storage');
            if (raw) {
                const parsed = JSON.parse(raw);
                const s = parsed?.state;
                token =
                    s?.accessToken ||
                    s?.tokens?.access ||
                    s?.tokens?.access_token ||
                    s?.user?.access ||
                    s?.user?.access_token ||
                    s?.user?.token;
            }
        }
        return token || null;
    } catch {
        return null;
    }
};

// Request Interceptor: Automatically attach Bearer token from useAuthStore
api.interceptors.request.use(
    (config) => {
        try {
            const token = getAuthToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (err) {
            console.warn('[API Request Interceptor] Failed to extract token from store:', err);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized cleanly without firing 404 fallback requests
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';

        // If 401 Unauthorized occurs
        if (error.response?.status === 401) {
            // For login or register requests, do not clear store or redirect; let the form handle the error
            if (requestUrl.includes('auth/login') || requestUrl.includes('auth/register')) {
                return Promise.reject(error);
            }

            // For other protected endpoints, clear credentials to prompt re-authentication
            useAuthStore.getState().logout();
        }

        return Promise.reject(error);
    }
);

// ========================================================
// API Service Modules matching backend routes
// ========================================================

export const auth = {
    /**
     * Authenticate user with credentials via standardized POST /auth/login/
     * @param {Object} payload - { username, password, email }
     */
    login: async (payload) => {
        const username = (payload.username || payload.email || '').trim();
        const password = payload.password || '';

        // Standard backend expects email and password
        const email = payload.email || (username.includes('@') ? username : username);

        const loginPayload = {
            email: email,
            username: username,
            password: password,
        };

        const normalizeTokens = (data) => {
            if (!data) return data;
            const access = data.access || data.access_token || data.accessToken || data.token;
            const refresh = data.refresh || data.refresh_token || data.refreshToken;
            return {
                ...data,
                access,
                refresh,
                accessToken: access,
                refreshToken: refresh,
            };
        };

        // Standardized backend login endpoint: POST auth/login/
        // Directly hits live endpoint without probing nonexistent /token/
        const response = await api.post('auth/login/', loginPayload);
        return normalizeTokens(response.data);
    },

    /**
     * Authenticate with Google OAuth via POST /auth/google/
     * @param {Object} payload - { access_token, credential, role }
     */
    googleAuth: async (payload) => {
        const response = await api.post('auth/google/', payload);
        const data = response.data;
        const access = data?.access || data?.access_token || data?.accessToken || data?.token;
        const refresh = data?.refresh || data?.refresh_token || data?.refreshToken;
        return {
            ...data,
            access,
            refresh,
            accessToken: access,
            refreshToken: refresh,
        };
    },

    /**
     * Refresh token method (placeholder, backend sessions re-authenticate via auth/login/)
     */
    refreshToken: async () => {
        return null;
    },

    /**
     * Register a new user account via POST /auth/register/
     * @param {Object} payload - Registration details
     */
    register: async (payload) => {
        // Map role to backend choices: RESIDENT | COLLECTOR_ADMIN | COLLECTOR_DRIVER
        let backendRole = 'RESIDENT';
        const roleLower = (payload.role || '').toLowerCase();
        if (roleLower === 'organization' || roleLower === 'collector_admin' || roleLower === 'collector') {
            backendRole = 'COLLECTOR_ADMIN';
        } else if (roleLower === 'driver' || roleLower === 'collector_driver') {
            backendRole = 'COLLECTOR_DRIVER';
        }

        // Split full name if first_name / last_name are not explicitly provided
        const rawName = (payload.full_name || payload.fullName || payload.name || '').trim();
        let firstName = payload.first_name || '';
        let lastName = payload.last_name || '';
        if (!firstName && rawName) {
            const parts = rawName.split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || firstName;
        }

        const cleanEmail = (payload.email || payload.username || '').trim();
        const cleanPhone = (payload.phone || payload.phone_number || payload.phoneNumber || '').trim();

        const formattedPayload = {
            email: cleanEmail,
            password: payload.password,
            first_name: firstName,
            last_name: lastName,
            phone: cleanPhone,
            role: backendRole,
        };

        if (backendRole === 'COLLECTOR_ADMIN') {
            formattedPayload.collector_profile = {
                organization_name: payload.organization_name || payload.orgName || rawName || 'Fleet Operator',
                operating_license_num: payload.operating_license_num || payload.license || 'LIC-' + Math.floor(1000 + Math.random() * 9000),
            };
        }

        const response = await api.post('auth/register/', formattedPayload);
        return response.data;
    },
};

export const pickups = {
    /**
     * Retrieve available/assigned pickups via GET /pickups/ (or GET /dispatch/queue/)
     */
    getPickups: async () => {
        try {
            const response = await api.get('pickups/');
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                const fallbackRes = await api.get('dispatch/queue/');
                return fallbackRes.data;
            }
            throw err;
        }
    },

    /**
     * Create a new pickup dispatch request via POST /pickups/ (or POST /dispatch/request/)
     * @param {Object} data - Pickup request payload
     */
    createPickup: async (data) => {
        try {
            const response = await api.post('pickups/', data);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                const fallbackRes = await api.post('dispatch/request/', data);
                return fallbackRes.data;
            }
            throw err;
        }
    },

    /**
     * Update/Claim an existing pickup request via PUT/PATCH /pickups/{id}/ (or /dispatch/claim/{id}/)
     * @param {string|number} id - Pickup request ID / UUID
     * @param {Object} data - Update data / claim status
     */
    updatePickup: async (id, data) => {
        try {
            const response = await api.put(`pickups/${id}/`, data);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 405) {
                const fallbackRes = await api.patch(`dispatch/claim/${id}/`, data);
                return fallbackRes.data;
            }
            throw err;
        }
    },
};

export const collectors = {
    /**
     * Register collector operator profile via POST /collectors/ or /collector/register/
     * @param {Object} data - Collector payload
     */
    register: async (data) => {
        try {
            const response = await api.post('collectors/', data);
            return response.data;
        } catch (err) {
            console.warn('[Collector API] Backend registration fallback to local state:', err?.message || err);
            return { success: true, localOnly: true, data };
        }
    },
};

export const waitlist = {
    /**
     * Register a user / address on neighborhood expansion waitlist via POST /waitlist/
     * @param {Object} data - { phone, area_name, full_name, ... }
     */
    registerWaitlist: async (data) => {
        const response = await api.post('waitlist/', data);
        return response.data;
    },
};

export const payments = {
    /**
     * Initialize payment with backend (Paystack initialization) via POST /payments/initialize/
     * Ensures Authorization header: Bearer ${token} is explicitly provided
     * @param {Object} data - { amount: in kobo, plan_type: "monthly", ... }
     * @param {string} [tokenOverride] - Optional JWT token
     */
    initializePayment: async (data, tokenOverride = null) => {
        const token = tokenOverride || getAuthToken();
        const payload = {
            callback_url: data?.callback_url || 'https://app.kole.com.ng/payment-success',
            ...data,
        };
        const config = {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const response = await api.post('payments/initialize/', payload, config);
        return response.data;
    },

    /**
     * Verify completed Paystack payment by transaction reference via POST /payments/verify/
     * @param {string|Object} reference - Transaction reference string or { reference }
     * @param {string} [tokenOverride] - Optional JWT token
     */
    verifyPayment: async (reference, tokenOverride = null) => {
        const token = tokenOverride || getAuthToken();
        const payload = typeof reference === 'string' ? { reference } : reference;
        const config = {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const response = await api.post('payments/verify/', payload, config);
        return response.data;
    },

    /**
     * Retrieve wallet ledger / balance info via GET /wallet/ (or GET /finance/withdraw/)
     */
    getWallet: async () => {
        try {
            const response = await api.get('wallet/');
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                const fallbackRes = await api.get('finance/withdraw/');
                return fallbackRes.data;
            }
            throw err;
        }
    },
};

export default api;
