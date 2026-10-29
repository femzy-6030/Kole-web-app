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

// Helper: Extract valid JWT access token dynamically checking localStorage, sessionStorage and Zustand store
export const getAccessToken = () => {
    try {
        // 1. Direct storage check (conditional token storage logic)
        const directToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (directToken) return directToken;

        // 2. Zustand auth store check
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

export const getAuthToken = getAccessToken;

// Conditional Token Storage Handler (as per Task 2)
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

// Request Interceptor: Automatically attach Bearer token checking both storages dynamically
api.interceptors.request.use(
    (config) => {
        try {
            const token = getAccessToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            // Allow browser to calculate boundary for FormData payloads
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
            }
        } catch (err) {
            console.warn('[API Request Interceptor] Failed to extract token:', err);
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

// Helper function to normalize JWT token format
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

// ========================================================
// 1. Authentication & Onboarding (/auth/)
// ========================================================
export const auth = {
    /**
     * Standard login via POST /api/v1/auth/login/
     * @param {Object} payload - { email, password, username }
     * @returns {Promise<Object>} Returns JWT access/refresh tokens
     */
    login: async (payload) => {
        const email = (payload.email || (payload.username && payload.username.includes('@') ? payload.username : '') || payload.username || '').trim();
        const username = (payload.username || payload.email || '').trim();
        const password = payload.password || '';

        const loginPayload = {
            email: email,
            username: username,
            password: password,
        };

        const response = await api.post('auth/login/', loginPayload);
        return normalizeTokens(response.data);
    },

    /**
     * Register standard user via POST /api/v1/auth/register/
     * @param {Object} payload - { username, email, password, role, ... }
     * @returns {Promise<Object>}
     */
    register: async (payload) => {
        let backendRole = 'RESIDENT';
        const roleLower = (payload.role || '').toLowerCase();
        if (roleLower === 'organization' || roleLower === 'collector_admin' || roleLower === 'collector') {
            backendRole = 'COLLECTOR_ADMIN';
        } else if (roleLower === 'driver' || roleLower === 'collector_driver') {
            backendRole = 'COLLECTOR_DRIVER';
        }

        const rawName = (payload.full_name || payload.fullName || payload.name || '').trim();
        let firstName = payload.first_name || '';
        let lastName = payload.last_name || '';
        if (!firstName && rawName) {
            const parts = rawName.split(' ');
            firstName = parts[0] || '';
            lastName = parts.slice(1).join(' ') || firstName;
        }

        const cleanEmail = (payload.email || payload.username || '').trim();
        const cleanUsername = (payload.username || payload.email || cleanEmail.split('@')[0] || '').trim();
        const cleanPhone = (payload.phone || payload.phone_number || payload.phoneNumber || '').trim();

        const formattedPayload = {
            username: cleanUsername,
            email: cleanEmail,
            password: payload.password,
            role: backendRole,
            first_name: firstName,
            last_name: lastName,
            phone: cleanPhone,
            ...payload,
        };

        if (backendRole === 'COLLECTOR_ADMIN' && !formattedPayload.collector_profile) {
            formattedPayload.collector_profile = {
                organization_name: payload.organization_name || payload.orgName || rawName || 'Fleet Operator',
                operating_license_num: payload.operating_license_num || payload.license || 'LIC-' + Math.floor(1000 + Math.random() * 9000),
            };
        }

        const response = await api.post('auth/register/', formattedPayload);
        return normalizeTokens(response.data);
    },

    /**
     * Google OAuth verification via POST /api/v1/auth/google/
     * @param {Object} payload - { credential: <google_id_token>, access_token, role }
     * @returns {Promise<Object>} Returns JWT tokens, email, and role
     */
    googleAuth: async (payload) => {
        const credential = payload.credential || payload.access_token || payload.token;
        const googlePayload = {
            credential,
            ...(payload.role ? { role: payload.role } : {}),
            ...payload,
        };
        const response = await api.post('auth/google/', googlePayload);
        return normalizeTokens(response.data);
    },

    /**
     * Refresh token method
     */
    refreshToken: async (refreshToken) => {
        try {
            const token = refreshToken || useAuthStore.getState().refreshToken;
            if (!token) return null;
            const response = await api.post('auth/token/refresh/', { refresh: token });
            return normalizeTokens(response.data);
        } catch {
            return null;
        }
    },
};

// ========================================================
// 2. Pickups & Dispatch Operations (/pickups/)
// ========================================================
export const pickups = {
    /**
     * Fetch list of user or cluster collector pickups via GET /api/v1/pickups/
     * @param {Object} params - Query parameters (e.g. { cluster, status })
     */
    getPickups: async (params = {}) => {
        try {
            const response = await api.get('pickups/', { params });
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
     * Create new pickup / emergency request via multipart/form-data
     * FormData fields: cluster, address, waste_photo, is_emergency
     * POST /api/v1/pickups/
     * @param {FormData|Object} data - Form data or plain JS object
     */
    createPickup: async (data) => {
        let payload = data;
        if (!(data instanceof FormData) && typeof data === 'object' && data !== null) {
            const formData = new FormData();
            const clusterVal = data.cluster || data.area || data.Area || 'Oke-Fia';
            const addressVal = data.address || data.streetAddress || '';
            const isEmergency = data.is_emergency !== undefined
                ? Boolean(data.is_emergency)
                : (data.pickup_type === 'EMERGENCY_SOS' || data.isEmergency || data.priority === 'CRITICAL_SOS');

            formData.append('cluster', clusterVal);
            formData.append('address', addressVal);
            formData.append('is_emergency', isEmergency ? 'true' : 'false');

            const file = data.waste_photo || data.wastePhoto || data.photo || data.file;
            if (file instanceof File || file instanceof Blob) {
                formData.append('waste_photo', file);
            }

            // Append optional metadata
            const excludedKeys = ['cluster', 'address', 'is_emergency', 'waste_photo', 'wastePhoto', 'photo', 'file'];
            Object.keys(data).forEach((key) => {
                if (!excludedKeys.includes(key) && data[key] !== undefined && data[key] !== null) {
                    formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
                }
            });
            payload = formData;
        }

        try {
            const response = await api.post('pickups/', payload);
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
     * Retrieve a specific pickup request via GET /api/v1/pickups/<uuid:pk>/
     * @param {string} pk - Pickup UUID / primary key
     */
    getPickup: async (pk) => {
        const response = await api.get(`pickups/${pk}/`);
        return response.data;
    },

    /**
     * Update a specific pickup request via PUT /api/v1/pickups/<uuid:pk>/
     * @param {string} pk - Pickup UUID / primary key
     * @param {Object} data - Update payload
     */
    updatePickup: async (pk, data) => {
        try {
            const response = await api.put(`pickups/${pk}/`, data);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 405) {
                try {
                    const patchRes = await api.patch(`pickups/${pk}/`, data);
                    return patchRes.data;
                } catch {
                    const fallbackRes = await api.patch(`dispatch/claim/${pk}/`, data);
                    return fallbackRes.data;
                }
            }
            throw err;
        }
    },

    /**
     * Cancel a specific pickup request via DELETE /api/v1/pickups/<uuid:pk>/
     * @param {string} pk - Pickup UUID / primary key
     */
    cancelPickup: async (pk) => {
        const response = await api.delete(`pickups/${pk}/`);
        return response.data;
    },

    /**
     * Submit custom price quote for emergency jobs via POST /api/v1/pickups/<uuid:pk>/quote/
     * @param {string} pk - Pickup UUID / primary key
     * @param {number|Object} price - { price } or number
     */
    submitQuote: async (pk, price) => {
        const payload = typeof price === 'object' ? price : { price: Number(price) };
        const response = await api.post(`pickups/${pk}/quote/`, payload);
        return response.data;
    },

    /**
     * Send real-time GPS coordinates for live tracking via POST /api/v1/pickups/<uuid:pk>/update-location/
     * @param {string} pk - Pickup UUID / primary key
     * @param {Object} coords - { latitude, longitude }
     */
    updateLocation: async (pk, coords) => {
        const payload = {
            latitude: coords.latitude ?? coords.lat,
            longitude: coords.longitude ?? coords.lng ?? coords.long,
        };
        const response = await api.post(`pickups/${pk}/update-location/`, payload);
        return response.data;
    },

    /**
     * Mark pickup job as completed and disposed via POST /api/v1/pickups/<uuid:pk>/complete/
     * @param {string} pk - Pickup UUID / primary key
     * @param {Object} [data] - Completion metadata or proof
     */
    completePickup: async (pk, data = {}) => {
        const response = await api.post(`pickups/${pk}/complete/`, data);
        return response.data;
    },
};

// ========================================================
// 3. Legacy Dispatch & Cluster APIs (/dispatch/)
// ========================================================
export const dispatch = {
    /**
     * Alternative legacy dispatch creation via POST /api/v1/dispatch/request/
     * @param {Object} data - Dispatch payload
     */
    createRequest: async (data) => {
        const response = await api.post('dispatch/request/', data);
        return response.data;
    },

    /**
     * View unassigned cluster requests for available collectors via GET /api/v1/dispatch/queue/
     */
    getQueue: async () => {
        const response = await api.get('dispatch/queue/');
        return response.data;
    },

    /**
     * Collectors claim a specific pickup request from the queue via POST /api/v1/dispatch/claim/<uuid:requestId>/
     * @param {string} requestId - Request UUID
     * @param {Object} [data] - Optional claim metadata
     */
    claimRequest: async (requestId, data = {}) => {
        const response = await api.post(`dispatch/claim/${requestId}/`, data);
        return response.data;
    },
};

// ========================================================
// 4. Finance & Paystack Integration (/finance/ & /payments/)
// ========================================================
export const finance = {
    /**
     * Collector onboarding / subaccount creation via POST /api/v1/finance/subaccount/
     * @param {Object} payload - { bank_code, account_number, account_name }
     */
    createSubaccount: async ({ bank_code, account_number, account_name }) => {
        const response = await api.post('finance/subaccount/', {
            bank_code,
            account_number,
            account_name,
        });
        return response.data;
    },

    /**
     * List supported Nigerian banks via GET /api/v1/finance/banks/
     */
    getBanks: async () => {
        const response = await api.get('finance/banks/');
        return response.data;
    },

    /**
     * Payout request via POST /api/v1/finance/withdraw/
     * @param {number|Object} amount - { amount } or number
     */
    requestWithdrawal: async (amount) => {
        const payload = typeof amount === 'object' ? amount : { amount: Number(amount) };
        const response = await api.post('finance/withdraw/', payload);
        return response.data;
    },

    /**
     * Retrieve wallet ledger / balance info via GET /wallet/ (fallback: /finance/withdraw/)
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

export const payments = {
    /**
     * Initialize payment with backend via POST /api/v1/payments/initialize/
     * @param {Object} data - { email, amount, ... }
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
     * Verify completed Paystack payment by transaction reference via POST /api/v1/payments/verify/
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
     * Retrieve wallet ledger via payments alias
     */
    getWallet: async () => {
        return finance.getWallet();
    },
};

// ========================================================
// 5. Growth, Waitlist & Organization (/waitlist/ & /organization/)
// ========================================================
export const waitlist = {
    /**
     * Register a user / address on neighborhood expansion waitlist via POST /api/v1/waitlist/
     * @param {Object} data - { email, cluster_id, location, ... }
     */
    registerWaitlist: async (data) => {
        const payload = {
            email: data.email || data.phone || 'waitlist@kole.com.ng',
            cluster_id: data.cluster_id || data.cluster || data.area_name || data.area || 'Oke-Fia',
            location: data.location || data.area_name || data.address || data.cluster || 'Oke-Fia',
            ...data,
        };
        const response = await api.post('waitlist/', payload);
        return response.data;
    },
};

export const organization = {
    /**
     * Retrieve staging bay configuration via GET /api/v1/organization/staging-config/
     * @param {string} [tokenOverride] - Optional JWT token
     */
    getStagingConfig: async (tokenOverride = null) => {
        const token = tokenOverride || getAccessToken();
        const config = {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const response = await api.get('organization/staging-config/', config);
        return response.data;
    },

    /**
     * Configure staging bays via POST /api/v1/organization/staging-config/
     * @param {Object} data - Staging bay config payload
     * @param {string} [tokenOverride] - Optional JWT token
     */
    saveStagingConfig: async (data, tokenOverride = null) => {
        const token = tokenOverride || getAccessToken();
        const payload = {
            notes: data.notes || data.staging_notes || data.stagingBayNotes || '',
            staging_notes: data.staging_notes || data.notes || data.stagingBayNotes || '',
            staging_bay: data.staging_bay || data.notes || '',
            category: data.category || '',
            cluster: data.cluster || '',
            ...data,
        };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        try {
            const response = await api.post('organization/staging-config/', payload, config);
            return response.data;
        } catch (err) {
            // Handle 405 Method Not Allowed by falling back to PUT / PATCH if update route is configured
            if (err.response?.status === 405) {
                try {
                    const putRes = await api.put('organization/staging-config/', payload, config);
                    return putRes.data;
                } catch {
                    const patchRes = await api.patch('organization/staging-config/', payload, config);
                    return patchRes.data;
                }
            }
            throw err;
        }
    },

    /**
     * Manage evacuation schedules via GET /api/v1/organization/schedule/
     * @param {string} [tokenOverride] - Optional JWT token
     */
    getSchedules: async (tokenOverride = null) => {
        const token = tokenOverride || getAccessToken();
        const config = {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        const response = await api.get('organization/schedule/', config);
        return response.data;
    },

    /**
     * Save evacuation schedule via POST /api/v1/organization/schedule/
     * @param {Object} data - Schedule payload
     * @param {string} [tokenOverride] - Optional JWT token
     */
    saveSchedule: async (data, tokenOverride = null) => {
        const token = tokenOverride || getAccessToken();
        const payload = {
            frequency: data.frequency || 'weekly',
            time_slot: data.time_slot || data.timeSlot || 'morning',
            waste_streams: Array.isArray(data.waste_streams) ? data.waste_streams : (data.wasteTypes || []),
            waste_types: Array.isArray(data.waste_streams) ? data.waste_streams : (data.wasteTypes || []),
            category: data.category || '',
            ...data,
        };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
        try {
            const response = await api.post('organization/schedule/', payload, config);
            return response.data;
        } catch (err) {
            // Handle 405 Method Not Allowed by falling back to PUT / PATCH if update route is configured
            if (err.response?.status === 405) {
                try {
                    const putRes = await api.put('organization/schedule/', payload, config);
                    return putRes.data;
                } catch {
                    const patchRes = await api.patch('organization/schedule/', payload, config);
                    return patchRes.data;
                }
            }
            throw err;
        }
    },
};

// ========================================================
// 6. Admin Dashboard APIs (/admin/)
// ========================================================
export const admin = {
    /**
     * Geospatial waste accumulation heatmaps via GET /api/v1/admin/heatmap/
     */
    getHeatmap: async () => {
        const response = await api.get('admin/heatmap/');
        return response.data;
    },

    /**
     * Summary metrics and platform stats via GET /api/v1/admin/metrics/
     */
    getMetrics: async () => {
        const response = await api.get('admin/metrics/');
        return response.data;
    },

    /**
     * Automated split payouts and financials via GET /api/v1/admin/settlements/
     */
    getSettlements: async () => {
        const response = await api.get('admin/settlements/');
        return response.data;
    },
};

// ========================================================
// Backward Compatibility / Helpers
// ========================================================
export const collectors = {
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

export default api;
