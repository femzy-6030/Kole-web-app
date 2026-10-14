// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import CustomerHome from './pages/customer/CustomerHome';
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
    ShieldAlert,
    Truck
} from 'lucide-react';

// ==========================================
// SECURITY AUTO-LOCK MODAL
// ==========================================
function AppLockModal({ correctPin = '1234', onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleUnlock = (e) => {
        e.preventDefault();
        if (pin === correctPin || pin.length === 4) {
            onUnlock();
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-100">
                <div className="w-16 h-16 bg-emerald-100 text-brand-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <Lock size={32} />
                </div>

                <div>
                    <h2 className="text-lg font-black text-slate-800">App Locked</h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Enter your 4-digit PIN to access KÓLẸ̀
                    </p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value);
                            setError(false);
                        }}
                        autoFocus
                        className="w-full text-center tracking-widest text-xl font-black py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-brand-primary"
                    />

                    {error && (
                        <p className="text-xs font-bold text-rose-500 flex items-center justify-center gap-1">
                            <ShieldAlert size={14} /> Incorrect PIN. Try again.
                        </p>
                    )}

                    <Button type="submit" className="w-full py-3.5 font-bold text-xs uppercase tracking-wider">
                        Unlock App
                    </Button>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// MAIN APP ENTRY POINT
// ==========================================
export default function App() {
    const { isAuthenticated, role, login } = useAuthStore();

    // Auth View State: 'login' | 'register' | 'collector-onboard'
    const [authMode, setAuthMode] = useState('login');
    const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'organization' | 'collector'

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

    // Security Auto-Lock State
    const [isAppLocked, setIsAppLocked] = useState(false);

    // Navigation State for Customer
    const [customerActiveTab, setCustomerActiveTab] = useState('home');
    const [checkoutData, setCheckoutData] = useState(null);

    // Organization Settings Toggle
    const [showOrgSettings, setShowOrgSettings] = useState(false);

    // Auto-lock when user minimizes app
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && isAuthenticated) {
                setIsAppLocked(true);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated]);

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            let userData = {};

            if (selectedRole === 'organization') {
                userData = {
                    id: `ORG-${Math.floor(1000 + Math.random() * 9000)}`,
                    orgName: orgName || 'Oroki Innovation Hub',
                    officerInCharge: officerName || 'Mr. Lukman Adeoti',
                    phoneNumber: phoneNumber || '08034567891',
                    Area: Area,
                    address: address || 'Plot 4, Station Road, Opp. Union Bank, Oke-Fia, Osogbo',
                    pickupBay: pickupBay || 'Rear Loading Dock near Generator House',
                };
            } else if (selectedRole === 'collector') {
                userData = {
                    id: `COL-${Math.floor(1000 + Math.random() * 9000)}`,
                    fullName: fullName || 'Collector Operator',
                    phoneNumber: phoneNumber || '09014603028',
                    Area: Area,
                };
            } else {
                userData = {
                    id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
                    fullName: fullName || 'Olayinka Oluwafemi',
                    phoneNumber: phoneNumber || '09014603028',
                    Area: Area,
                    address: address || 'Oke-Fia Junction, Near Station Road, Osogbo',
                };
            }

            login(userData, selectedRole, rememberMe);
            setShowAnnouncement(true);
        }, 600);
    };

    // 1. DIRECT COLLECTOR ONBOARDING VIEW
    if (authMode === 'collector-onboard') {
        return (
            <div>
                <div className="bg-slate-900 text-white p-3 text-xs flex justify-between items-center max-w-lg mx-auto rounded-b-2xl shadow-md">
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
                        console.log('Collector Registered:', collectorData);
                        setAuthMode('login');
                    }}
                />
            </div>
        );
    }

    // 2. AUTHENTICATION / REGISTRATION VIEW
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-8">
                <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">

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

                    {/* Role Switcher */}
                    <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setSelectedRole('customer')}
                            className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedRole === 'customer'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <User size={14} />
                            <span>Customer</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole('organization')}
                            className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedRole === 'organization'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Building2 size={14} />
                            <span>Org</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole('collector')}
                            className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${selectedRole === 'collector'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Truck size={14} />
                            <span>Collector</span>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                        {authMode === 'register' && selectedRole !== 'collector' && (
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
                                ? `Sign In as ${selectedRole === 'organization' ? 'Organization' : selectedRole === 'collector' ? 'Collector' : 'Customer'}`
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

    // 3. ADMIN ROLE
    if (role === 'admin') {
        return <AdminDashboard />;
    }

    // 4. ORGANIZATION ROLE
    if (role === 'organization') {
        return (
            <div className="min-h-screen bg-slate-100 p-4">
                {isAppLocked && <AppLockModal correctPin="1234" onUnlock={() => setIsAppLocked(false)} />}
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

    // 5. COLLECTOR ROLE (NEWLY ADDED QUEUE HANDSHAKE VIEW)
    if (role === 'collector') {
        return (
            <div className="min-h-screen bg-slate-100 p-4">
                {isAppLocked && <AppLockModal correctPin="1234" onUnlock={() => setIsAppLocked(false)} />}

                {/* Top Header Bar with Logout option */}
                <div className="max-w-lg mx-auto mb-4 flex justify-between items-center bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200">
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

    // 6. CUSTOMER ROLE
    return (
        <div className="min-h-screen bg-slate-100 p-4 pb-20">
            {isAppLocked && <AppLockModal correctPin="1234" onUnlock={() => setIsAppLocked(false)} />}
            <AnnouncementModal isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} announcement={activeAnnouncement} />

            {customerActiveTab === 'checkout' && (
                <div className="max-w-lg mx-auto mb-3">
                    <button onClick={() => setCustomerActiveTab('home')} className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        <ArrowLeft size={16} /> Back to Customer Dashboard
                    </button>
                </div>
            )}

            {customerActiveTab === 'home' && (
                <CustomerHome onNavigateToCheckout={(data) => { setCheckoutData(data); setCustomerActiveTab('checkout'); }} />
            )}

            {customerActiveTab === 'checkout' && (
                <PaymentCheckoutView pickupRequest={checkoutData} onPaymentSuccess={() => setCustomerActiveTab('home')} />
            )}

            {customerActiveTab === 'payments' && (
                <PaymentCheckoutView pickupRequest={{ title: 'Household Subscription Plan', amount: '₦4,500 / mo' }} onPaymentSuccess={() => setCustomerActiveTab('home')} />
            )}
            {customerActiveTab === 'profile' && <ProfileView />}

            <CustomerNavbar activeTab={customerActiveTab === 'checkout' ? 'home' : customerActiveTab} setActiveTab={setCustomerActiveTab} />
        </div>
    );
}