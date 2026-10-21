// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import CustomerHome from './pages/customer/CustomerHome';
import PaymentPage from './components/PaymentPage';
import PaymentCheckoutView from './components/customer/PaymentCheckoutView';
import ProfileView from './components/customer/ProfileView';
import CustomerNavbar from './components/layout/CustomerNavbar';
import OrganizationHome from './pages/organization/OrganizationHome';
import OrganizationProfileView from './components/organization/OrganizationProfileView';
import CollectorOnboarding from './pages/collector/CollectorOnboarding';
import CollectorDispatchQueue from './components/collector/CollectorDispatchQueue';
import AdminDashboard from './pages/admin/AdminDashboard';
import AreaSelector from "./components/common/AreaSelector";
import { AnnouncementModal } from './components/common/AwarenessCarousel';
import koleLogo from './assets/Kole.png';
import Button from './components/common/Button';
import {
    User,
    Building2,
    Lock,
    Phone,
    ArrowLeft,
    Truck,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';

// ==========================================
// MAIN APP ENTRY POINT
// ==========================================
export default function App() {
    const { isAuthenticated, role, login } = useAuthStore();

    // URL Query & Hash listener for Hidden Admin Route (?admin=true or #admin)
    const checkIsAdminRoute = () => {
        if (typeof window === 'undefined') return false;
        return window.location.search.includes('admin=true') || window.location.hash === '#admin';
    };
    const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

    useEffect(() => {
        const handleUrlChange = () => {
            setIsAdminRoute(checkIsAdminRoute());
        };
        window.addEventListener('popstate', handleUrlChange);
        window.addEventListener('hashchange', handleUrlChange);
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
            window.removeEventListener('hashchange', handleUrlChange);
        };
    }, []);

    // Auth View State: 'login' | 'register' | 'collector-onboard'
    const [authMode, setAuthMode] = useState('login');
    const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'organization'

    // Announcement Pop-Up State
    const [showAnnouncement, setShowAnnouncement] = useState(false);
    const activeAnnouncement = {
        title: 'Welcome to KÓLẸ̀ Osogbo!',
        message: 'Scheduled pickups for Oke-Fia and Sabo Area run daily between 8:00 AM and 5:00 PM. Keep your staging bay accessible!'
    };

    // Shared Auth Form Fields
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pin, setPin] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // New User Form Fields
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [Area, setArea] = useState('Oke-Fia');
    const [orgName, setOrgName] = useState('');
    const [officerName, setOfficerName] = useState('');
    const [pickupBay, setPickupBay] = useState('');

    // Navigation State for Customer
    const [customerActiveTab, setCustomerActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('reference') || params.get('trxref')) {
                return 'payments';
            }
        }
        return 'home';
    });
    const [checkoutData, setCheckoutData] = useState(null);

    // Organization Settings Toggle
    const [showOrgSettings, setShowOrgSettings] = useState(false);

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            let userData = {};

            if (selectedRole === 'organization') {
                userData = {
                    id: `ORG-${Math.floor(1000 + Math.random() * 9000)}`,
                    orgName: orgName.trim() || (authMode === 'login' ? 'Organization Account' : 'Registered Organization'),
                    officerInCharge: officerName.trim() || 'Officer-in-Charge',
                    phoneNumber: phoneNumber.trim(),
                    Area: Area || 'Oke-Fia',
                    address: address.trim(),
                    pickupBay: pickupBay.trim(),
                };
            } else {
                // Customer role
                userData = {
                    id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                    fullName: fullName.trim() || (phoneNumber.trim() ? `Customer (${phoneNumber.trim().slice(-4)})` : 'Valued Customer'),
                    phoneNumber: phoneNumber.trim(),
                    Area: Area || 'Oke-Fia',
                    address: address.trim(),
                };
            }

            login(userData, selectedRole, rememberMe);
            setShowAnnouncement(true);
        }, 600);
    };

    const handleAdminLoginSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            const adminData = {
                id: 'ADM-001',
                fullName: fullName.trim() || 'System Administrator',
                phoneNumber: phoneNumber.trim() || '09014603028',
            };
            login(adminData, 'admin', rememberMe);
            setShowAnnouncement(true);
        }, 600);
    };

    const renderView = () => {
        // 1. DIRECT COLLECTOR ONBOARDING VIEW
        if (authMode === 'collector-onboard') {
            return (
                <div className="flex-1 flex flex-col">
                    <div className="bg-slate-900 text-white p-3 text-xs flex justify-between items-center w-full shadow-md">
                        <span className="font-bold flex items-center gap-1">
                            <Truck size={14} className="text-brand-primary" /> Collector Portal Mode
                        </span>
                        <button
                            onClick={() => setAuthMode('login')}
                            className="text-slate-300 hover:text-white font-bold underline cursor-pointer"
                        >
                            ← Back to Login
                        </button>
                    </div>

                    <CollectorOnboarding
                        onOnboardingComplete={(collectorData) => {
                            const userData = {
                                id: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
                                fullName: collectorData.collectorName || 'Collector Operator',
                                phoneNumber: collectorData.phone || '',
                                Area: collectorData.Area || 'Oke-Fia',
                                bankName: collectorData.bankName,
                                accountNumber: collectorData.accountNumber,
                                accountName: collectorData.accountName,
                                vehicleCount: collectorData.vehicleCount,
                                workerCount: collectorData.workerCount,
                            };
                            login(userData, 'collector', true);
                            setAuthMode('login');
                        }}
                    />
                </div>
            );
        }

        // 2. HIDDEN ADMIN LOGIN VIEW (Only when visiting /?admin=true or #admin and not authenticated)
        if (!isAuthenticated && isAdminRoute) {
            return (
                <div className="flex-1 flex items-center justify-center p-4 py-8">
                    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 bg-slate-900 text-brand-accent rounded-3xl flex items-center justify-center mx-auto shadow-md">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-brand-primary bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                                    Restricted System Gate
                                </span>
                                <h2 className="text-lg font-black text-slate-800 pt-1">Administrator Portal</h2>
                                <p className="text-xs font-bold text-slate-400">
                                    Operations Management Console
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">Admin Phone / ID</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="09014603028"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">4-Digit Admin PIN</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="password"
                                        maxLength={4}
                                        placeholder="••••"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary tracking-widest"
                                    />
                                </div>
                            </div>

                            <Button type="submit" isLoading={isLoading} className="w-full py-3.5 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white mt-2">
                                Authenticate as Administrator
                            </Button>
                        </form>

                        <div className="text-center pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.hash = '';
                                    window.history.replaceState(null, '', window.location.pathname);
                                    setIsAdminRoute(false);
                                }}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                ← Return to Public Customer App
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // 3. PUBLIC AUTHENTICATION / REGISTRATION VIEW (Strictly Customer & Org)
        if (!isAuthenticated) {
            return (
                <div className="flex-1 flex items-center justify-center p-4 py-8">
                    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">

                        {/* Brand Logo Header */}
                        <div className="text-center space-y-2">
                            <img
                                src={koleLogo}
                                alt="KÓLẸ̀ Logo"
                                className="h-12 w-auto mx-auto object-contain"
                            />
                            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                {authMode === 'login' ? 'Smart Pickup. Zero Hassle.' : 'Create New Account'}
                            </p>
                        </div>

                        {/* Public Role Switcher (Customer & Org Only) */}
                        <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('customer')}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedRole === 'customer'
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <User size={15} />
                                <span>Customer</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedRole('organization')}
                                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedRole === 'organization'
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <Building2 size={15} />
                                <span>Organization</span>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                            {authMode === 'register' && (
                                <>
                                    {selectedRole === 'customer' ? (
                                        <div>
                                            <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Full Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Olayinka Oluwafemi"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Organization Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Oroki Innovation Hub"
                                                    value={orgName}
                                                    onChange={(e) => setOrgName(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Officer-in-Charge</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Mr. Lukman Adeoti"
                                                    value={officerName}
                                                    onChange={(e) => setOfficerName(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700 uppercase tracking-wide block">Operating Area Zone</label>
                                        <AreaSelector selectedArea={Area} onAreaChange={(c) => setArea(c)} />
                                    </div>

                                    <div>
                                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">Street Address</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Station Road, Near Union Bank, Oke-Fia"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">Phone Number</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="08012345678"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 uppercase tracking-wide mb-1.5 block">4-Digit Security PIN</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                                    <input
                                        type="password"
                                        maxLength={4}
                                        placeholder="••••"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary tracking-widest"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary accent-brand-primary cursor-pointer"
                                    />
                                    <span>Remember me</span>
                                </label>

                                {authMode === 'login' && (
                                    <button type="button" className="text-brand-primary font-bold hover:underline">
                                        Forgot PIN?
                                    </button>
                                )}
                            </div>

                            <Button type="submit" isLoading={isLoading} className="w-full py-3.5 text-sm font-bold mt-2">
                                {authMode === 'login'
                                    ? `Sign In as ${selectedRole === 'organization' ? 'Organization' : 'Customer'}`
                                    : `Create Account`
                                }
                            </Button>
                        </form>

                        {/* Account Toggle */}
                        <div className="text-center text-xs text-slate-500 font-medium space-y-3">
                            <div>
                                {authMode === 'login' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('register')}
                                            className="text-brand-primary font-bold hover:underline cursor-pointer"
                                        >
                                            Register now
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('login')}
                                            className="text-brand-primary font-bold hover:underline cursor-pointer"
                                        >
                                            Sign in here
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* HIDDEN / DISCRETE ACCESS LINK FOR COLLECTOR PARTNERS */}
                            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                                Waste Operator Partner?{' '}
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('collector-onboard')}
                                    className="text-brand-primary font-bold hover:underline cursor-pointer"
                                >
                                    Register Fleet & Settlement Bank
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            );
        }

        // 4. ADMIN ROLE (Only renders when visiting /?admin=true or #admin)
        if (role === 'admin') {
            if (!isAdminRoute) {
                return (
                    <div className="flex-1 flex items-center justify-center p-6 text-center">
                        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200 max-w-sm w-full space-y-4">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-base font-black text-slate-800">Restricted Route</h2>
                            <p className="text-xs text-slate-500">
                                Administrator console is only accessible via authorized secure URL parameter (<code>?admin=true</code> or <code>#admin</code>).
                            </p>
                            <div className="space-y-2 pt-2">
                                <a
                                    href="#admin"
                                    onClick={() => setIsAdminRoute(true)}
                                    className="block w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs"
                                >
                                    Enter Secure Admin Route
                                </a>
                                <button
                                    onClick={() => useAuthStore.getState().logout()}
                                    className="block w-full py-2 text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            return (
                <div className="flex-1 bg-slate-100 p-4">
                    <AdminDashboard />
                </div>
            );
        }

        // 5. ORGANIZATION ROLE
        if (role === 'organization') {
            return (
                <div className="flex-1 bg-slate-100 p-4">
                    <AnnouncementModal isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} announcement={activeAnnouncement} />

                    {showOrgSettings ? (
                        <div>
                            <button onClick={() => setShowOrgSettings(false)} className="text-xs font-bold text-brand-primary mb-3 flex items-center gap-1 cursor-pointer hover:underline">
                                <ArrowLeft size={16} /> Back to Dashboard
                            </button>
                            <OrganizationProfileView />
                        </div>
                    ) : (
                        <OrganizationHome onOpenSettings={() => setShowOrgSettings(true)} />
                    )}
                </div>
            );
        }

        // 6. COLLECTOR ROLE
        if (role === 'collector') {
            return (
                <div className="flex-1 bg-slate-100 p-4">
                    {/* Top Header Bar with Logout option */}
                    <div className="w-full mb-4 flex justify-between items-center bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200">
                        <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                            <Truck size={16} className="text-brand-primary" /> Collector Fleet Portal
                        </span>
                        <button
                            onClick={() => useAuthStore.getState().logout()}
                            className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                            Sign Out
                        </button>
                    </div>

                    <CollectorDispatchQueue />
                </div>
            );
        }

        // 7. CUSTOMER ROLE
        return (
            <div className="flex-1 bg-slate-100 p-4 pb-24 flex flex-col">
                <AnnouncementModal isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} announcement={activeAnnouncement} />

                {customerActiveTab === 'checkout' && checkoutData?.planKey === 'one-time' && (
                    <div className="w-full mb-3">
                        <button onClick={() => setCustomerActiveTab('home')} className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <ArrowLeft size={16} /> Back to Customer Dashboard
                        </button>
                    </div>
                )}

                {customerActiveTab === 'home' && (
                    <CustomerHome onNavigateToCheckout={(data) => { setCheckoutData(data); setCustomerActiveTab('checkout'); }} />
                )}

                {customerActiveTab === 'checkout' && (
                    checkoutData?.planKey === 'one-time' ? (
                        <PaymentCheckoutView pickupRequest={checkoutData} onPaymentSuccess={() => setCustomerActiveTab('home')} />
                    ) : (
                        <PaymentPage checkoutData={checkoutData} onPaymentSuccess={() => setCustomerActiveTab('home')} onBack={() => setCustomerActiveTab('home')} />
                    )
                )}

                {customerActiveTab === 'payments' && (
                    <PaymentPage checkoutData={{ planKey: 'monthly', title: 'Standard Household Monthly Plan' }} onPaymentSuccess={() => setCustomerActiveTab('home')} onBack={() => setCustomerActiveTab('home')} />
                )}
                {customerActiveTab === 'profile' && <ProfileView />}

                <CustomerNavbar activeTab={customerActiveTab === 'checkout' ? 'home' : customerActiveTab} setActiveTab={setCustomerActiveTab} />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-100 md:bg-slate-200/70 flex justify-center items-start md:py-8 md:px-4">
            <div className="w-full max-w-md bg-white min-h-screen md:min-h-[860px] md:max-h-[92vh] md:rounded-[3rem] md:border md:border-slate-200 md:shadow-2xl relative flex flex-col md:overflow-y-auto overflow-x-hidden">
                {/* Desktop Speaker Notch */}
                <div className="hidden md:flex justify-center pt-3 pb-1 select-none pointer-events-none shrink-0">
                    <div className="w-20 h-1.5 bg-slate-300 rounded-full" />
                </div>

                {/* Render active application view */}
                <div className="flex-1 flex flex-col">
                    {renderView()}
                </div>
            </div>
        </div>
    );
}