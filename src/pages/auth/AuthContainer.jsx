// src/pages/auth/AuthContainer.jsx
import React, { useState } from 'react';
import Login from './Login';
import ForgotPassword from './ForgotPassword';

export default function AuthContainer() {
    const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot-password'

    if (view === 'forgot-password') {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <ForgotPassword onBackToLogin={() => setView('login')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            {view === 'login' ? (
                <Login
                    onSwitchToRegister={() => setView('register')}
                    onForgotPassword={() => setView('forgot-password')}
                />
            ) : (
                <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Registration Coming Soon</h2>
                    <button
                        onClick={() => setView('login')}
                        className="text-xs font-bold text-brand-primary underline"
                    >
                        Back to Login
                    </button>
                </div>
            )}
        </div>
    );
}
