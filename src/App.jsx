// src/App.jsx
import React from 'react';
import { useAuthStore } from './store/useAuthStore';
import AuthContainer from './pages/auth/AuthContainer';
import CustomerHome from './pages/customer/CustomerHome';
import CollectorHome from './pages/collector/CollectorHome';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
    const { isAuthenticated, role } = useAuthStore();

    if (!isAuthenticated) {
        return <AuthContainer />;
    }

    if (role === 'customer') {
        return <CustomerHome />;
    }

    if (role === 'collector') {
        return <CollectorHome />;
    }

    if (role === 'admin') {
        return <AdminDashboard />;
    }

    return <AuthContainer />;
}