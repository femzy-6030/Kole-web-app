// src/pages/Auth.jsx
import React, { useState } from 'react';
import Login from './auth/Login';
import Register from './Register';

export default function Auth({ initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode); // 'login' | 'register'

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center py-8">
            {mode === 'login' ? (
                <Login onSwitchToRegister={() => setMode('register')} />
            ) : (
                <Register onSwitchToLogin={() => setMode('login')} />
            )}
        </div>
    );
}
