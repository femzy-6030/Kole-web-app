// src/pages/auth/AuthContainer.jsx
import React, { useState } from 'react';
import Login from './Login';

export default function AuthContainer() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            {isLogin ? (
                <Login onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
                <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full space-y-4">
                    <h2 className="text-lg font-black text-slate-800">Registration Coming Soon</h2>
                    <button
                        onClick={() => setIsLogin(true)}
                        className="text-xs font-bold text-brand-primary underline"
                    >
                        Back to Login
                    </button>
                </div>
            )}
        </div>
    );
}