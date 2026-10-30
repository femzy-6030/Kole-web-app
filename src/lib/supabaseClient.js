// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase Client with graceful fallback for unconfigured environments
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        auth: {
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
    };

export default supabase;

