// src/services/api.js
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const API_BASE_URL = 'https://kole-pi.vercel.app/api/v1/';

// Create configured Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000,
});

// Request Interceptor: Automatically attach Bearer token from useAuthStore
api.interceptors.request.use(
    (config) => {
        try {
            const state = useAuthStore.getState();
            const token =
                state.accessToken ||
                state.tokens?.access ||
                state.tokens?.access_token ||
                state.user?.access ||
                state.user?.access_token ||
                state.user?.token;

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

// Response Interceptor: Handle 401 Unauthorized by attempting token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if 401 Unauthorized and request has not already been retried
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            const requestUrl = originalRequest.url || '';

            // Do not retry refresh requests or login requests to avoid infinite loops
            if (requestUrl.includes('token/refresh') || requestUrl.includes('token/') || requestUrl.includes('auth/login')) {
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            const state = useAuthStore.getState();
            const refreshToken =
                state.refreshToken ||
                state.tokens?.refresh ||
                state.tokens?.refresh_token ||
                state.user?.refresh ||
                state.user?.refresh_token;

            if (!refreshToken) {
                // No refresh token available in store
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt token refresh via POST /token/refresh/ with the refresh token
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}token/refresh/`,
                    { refresh: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const data = refreshResponse.data;
                const newAccessToken = data?.access || data?.access_token;
                const newRefreshToken = data?.refresh || data?.refresh_token || refreshToken;

                if (newAccessToken) {
                    useAuthStore.getState().setTokens({
                        access: newAccessToken,
                        refresh: newRefreshToken,
                    });

                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);

                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error('No access token returned from refresh endpoint');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ========================================================
// API Service Modules matching backend routes
// ========================================================

export const auth = {
    /**
     * Authenticate user with credentials via POST /token/ or fallback /auth/login/
     * @param {Object} payload - { email/username, password }
     */
    login: async (payload) => {
        try {
            const response = await api.post('token/', payload);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                const fallbackRes = await api.post('auth/login/', payload);
                return fallbackRes.data;
            }
            throw err;
        }
    },

    /**
     * Refresh expired JWT access token via POST /token/refresh/
     * @param {Object|string} payload - { refresh: string }
     */
    refreshToken: async (payload) => {
        const body = typeof payload === 'string' ? { refresh: payload } : payload;
        const response = await api.post('token/refresh/', body);
        return response.data;
    },

    /**
     * Register a new user account via POST /auth/register/
     * @param {Object} payload - Registration details
     */
    register: async (payload) => {
        const response = await api.post('auth/register/', payload);
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
     * @param {Object} data - { amount: in kobo, plan_type: "monthly", ... }
     */
    initializePayment: async (data) => {
        const response = await api.post('payments/initialize/', data);
        return response.data;
    },

    /**
     * Verify completed Paystack payment by transaction reference via POST /payments/verify/
     * @param {string|Object} reference - Transaction reference string or { reference }
     */
    verifyPayment: async (reference) => {
        const payload = typeof reference === 'string' ? { reference } : reference;
        const response = await api.post('payments/verify/', payload);
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
