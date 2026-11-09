// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder')
);

// Chainable mock builder for unconfigured environments with local storage persistence
const createQueryBuilder = (tableName = '') => {
    let filterField = null;
    let filterValue = null;

    const getStoredRows = () => {
        try {
            if (typeof localStorage !== 'undefined') {
                const raw = localStorage.getItem(`kole-mock-db-${tableName}`);
                if (raw) return JSON.parse(raw);
            }
        } catch {
            // Ignore parse errors
        }
        return [];
    };

    const saveRows = (rows) => {
        try {
            if (typeof localStorage !== 'undefined') {
                const current = getStoredRows();
                const toAdd = Array.isArray(rows) ? rows : [rows];
                const updated = [...current, ...toAdd];
                localStorage.setItem(`kole-mock-db-${tableName}`, JSON.stringify(updated));
            }
        } catch {
            // Ignore storage errors
        }
    };

    const builder = {
        _table: tableName,
        select: () => builder,
        insert: async (rows) => {
            saveRows(rows);
            return { data: Array.isArray(rows) ? rows : [rows], error: null };
        },
        update: () => builder,
        upsert: async (rows) => {
            saveRows(rows);
            return { data: Array.isArray(rows) ? rows : [rows], error: null };
        },
        delete: () => builder,
        eq: (field, val) => {
            filterField = field;
            filterValue = val;
            return builder;
        },
        neq: () => builder,
        gt: () => builder,
        gte: () => builder,
        lt: () => builder,
        lte: () => builder,
        like: () => builder,
        ilike: () => builder,
        is: () => builder,
        in: () => builder,
        contains: () => builder,
        containedBy: () => builder,
        order: () => builder,
        limit: () => builder,
        range: () => builder,
        single: async () => {
            const rows = getStoredRows();
            if (filterField && filterValue !== undefined) {
                const found = rows.find((r) => r[filterField] === filterValue);
                return { data: found || null, error: null };
            }
            return { data: rows[0] || null, error: null };
        },
        maybeSingle: async () => {
            const rows = getStoredRows();
            if (filterField && filterValue !== undefined) {
                const found = rows.find((r) => r[filterField] === filterValue);
                return { data: found || null, error: null };
            }
            return { data: rows[0] || null, error: null };
        },
        // Thenable support so "await supabase.from(...).select(...)" resolves safely
        then(onfulfilled, onrejected) {
            const rows = getStoredRows();
            let result = { data: rows, error: null };
            if (filterField && filterValue !== undefined) {
                result = { data: rows.filter((r) => r[filterField] === filterValue), error: null };
            }
            return Promise.resolve(result).then(onfulfilled, onrejected);
        },
    };
    return builder;
};

// Fallback client when Supabase is not configured
const mockSupabaseClient = {
    auth: {
        getSession: async () => {
            return { data: { session: null }, error: null };
        },
        getUser: async () => {
            return { data: { user: null }, error: null };
        },
        onAuthStateChange: (callback) => {
            return {
                data: {
                    subscription: {
                        unsubscribe: () => {},
                    },
                },
                error: null,
            };
        },
        signUp: async ({ email, password, options }) => {
            const cleanEmail = (email || '').trim().toLowerCase();
            const fullName = options?.data?.full_name || 'Waste Collector Operator';
            const role = options?.data?.role || 'COLLECTOR';
            const userId = `COL-${Math.floor(1000 + Math.random() * 9000)}`;

            const user = {
                id: userId,
                email: cleanEmail,
                user_metadata: {
                    full_name: fullName,
                    role: role,
                    ...options?.data,
                },
            };

            const session = {
                access_token: `mock-supabase-jwt-${Date.now()}`,
                refresh_token: `mock-supabase-refresh-${Date.now()}`,
                user: user,
            };

            try {
                if (typeof localStorage !== 'undefined') {
                    const raw = localStorage.getItem('kole-mock-db-profiles');
                    let profiles = raw ? JSON.parse(raw) : [];
                    profiles.push({
                        id: userId,
                        user_id: userId,
                        email: cleanEmail,
                        full_name: fullName,
                        role: role,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    });
                    localStorage.setItem('kole-mock-db-profiles', JSON.stringify(profiles));
                }
            } catch {}

            return { data: { user, session }, error: null };
        },
        signInWithPassword: async ({ email, password }) => {
            const cleanEmail = (email || '').trim().toLowerCase();
            if (!cleanEmail || !password) {
                return {
                    data: { user: null, session: null },
                    error: new Error('Invalid email or password credentials provided.'),
                };
            }

            // Determine role: super admin vs collector
            const isSuperAdmin = cleanEmail.includes('admin') || cleanEmail.includes('super');
            const role = isSuperAdmin ? 'SUPER_ADMIN' : 'COLLECTOR';
            const userId = isSuperAdmin ? 'ADM-SUP-001' : 'COL-1001';

            const user = {
                id: userId,
                email: cleanEmail,
                user_metadata: {
                    full_name: isSuperAdmin ? 'System Super Administrator' : 'Osogbo Central Cleaners Ltd',
                    role: role,
                },
            };

            const session = {
                access_token: `mock-supabase-jwt-${Date.now()}`,
                refresh_token: `mock-supabase-refresh-${Date.now()}`,
                user: user,
            };

            // Seed profiles table in mock database so .from('profiles').select('*') returns the record
            try {
                if (typeof localStorage !== 'undefined') {
                    const raw = localStorage.getItem('kole-mock-db-profiles');
                    let profiles = raw ? JSON.parse(raw) : [];
                    const existingIdx = profiles.findIndex((p) => p.id === userId || p.email === cleanEmail);
                    const profileData = {
                        id: userId,
                        user_id: userId,
                        email: cleanEmail,
                        full_name: user.user_metadata.full_name,
                        role: role,
                        is_active: true,
                        created_at: new Date().toISOString(),
                    };
                    if (existingIdx >= 0) {
                        profiles[existingIdx] = { ...profiles[existingIdx], ...profileData };
                    } else {
                        profiles.push(profileData);
                    }
                    localStorage.setItem('kole-mock-db-profiles', JSON.stringify(profiles));
                }
            } catch {}

            return { data: { user, session }, error: null };
        },
        signOut: async () => {
            return { error: null };
        },
        resetPasswordForEmail: async (email, options) => {
            console.warn('[Supabase Client] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.');
            return {
                data: null,
                error: new Error('Supabase client is not fully configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'),
            };
        },
        updateUser: async (attributes) => {
            console.warn('[Supabase Client] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.');
            return {
                data: null,
                error: new Error('Supabase client is not fully configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'),
            };
        },
    },
    from: (table) => createQueryBuilder(table),
    storage: {
        from: () => ({
            upload: async () => ({ data: null, error: new Error('Supabase storage not configured') }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
    },
};

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : mockSupabaseClient;

export default supabase;
