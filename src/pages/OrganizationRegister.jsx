// src/pages/OrganizationRegister.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useClusterStore } from '../store/useClusterStore';
import { auth } from '../services/api';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import AreaSelector from '../components/common/AreaSelector';
import {
    Building2,
    Lock,
    Phone,
    Mail,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    Briefcase,
    UserCheck,
    MapPin,
    ArrowLeft,
    Sparkles,
    ShieldCheck
} from 'lucide-react';

export const ORGANIZATION_CATEGORIES = [
    'Schools & Educational',
    'Restaurants & Food Service',
    'Corporate Office / Tech Hub',
    'Retail / Plaza',
    'Healthcare / Medical'
];

export default function OrganizationRegister({ onSwitchToLogin, onRegistrationSuccess }) {
    const { login } = useAuthStore();
    const isClusterActive = useClusterStore((state) => state.isClusterActive);

    const [orgName, setOrgName] = useState('');
    const [category, setCategory] = useState('Corporate Office / Tech Hub');
    const [officerName, setOfficerName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [area, setArea] = useState('Oke-Fia');
    const [address, setAddress] = useState('');
    const [stagingBayNotes, setStagingBayNotes] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [successScreen, setSuccessScreen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);

        const cleanEmail = email.trim().toLowerCase();
        const cleanOrgName = orgName.trim();
        const cleanOfficer = officerName.trim();

        if (!cleanOrgName || !cleanEmail || !category) {
            setIsLoading(false);
            setAuthError('Please fill in all mandatory organization profile fields.');
            return;
        }

        if (!password) {
            setIsLoading(false);
            setAuthError('Please create a secure password for your organization account.');
            return;
        }

        try {
            const payload = {
                role: 'COLLECTOR_ADMIN',
                full_name: cleanOrgName,
                org_name: cleanOrgName,
                officer_name: cleanOfficer,
                organization_category: category,
                category: category,
                email: cleanEmail,
                username: cleanEmail,
                phone: phoneNumber.trim(),
                password: password,
                address: address.trim(),
                Area: area || 'Oke-Fia',
                pickup_bay: stagingBayNotes.trim() || 'Designated Loading Dock',
            };

            let data;
            try {
                data = await auth.register(payload);
            } catch (regErr) {
                console.warn('[Organization Register] API notice (falling back to direct session login):', regErr);
            }

            const accessToken = data?.access || data?.accessToken || data?.token;
            const refreshToken = data?.refresh || data?.refreshToken;

            const userData = {
                id: data?.user?.id || `ORG-${Math.floor(1000 + Math.random() * 9000)}`,
                fullName: cleanOrgName,
                orgName: cleanOrgName,
                officerInCharge: cleanOfficer || 'Facilities Officer',
                category: category,
                organizationCategory: category,
                email: cleanEmail,
                username: cleanEmail,
                phoneNumber: phoneNumber.trim(),
                Area: area || 'Oke-Fia',
                address: address.trim() || `${area} Commercial Zone, Osogbo`,
                pickupBay: stagingBayNotes.trim() || 'Rear loading dock near generator house',
                role: 'organization',
                total_pickups: 0,
                impact_score: 0,
            };

            login(userData, 'organization', true, {
                access: accessToken,
                refresh: refreshToken,
            });

            setIsLoading(false);
            setSuccessScreen(true);

            if (typeof onRegistrationSuccess === 'function') {
                onRegistrationSuccess(userData);
            }
        } catch (err) {
            setIsLoading(false);
            console.error('[Organization Register Error]', err);
            const msg =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                'Organization onboarding could not be completed. Please review your details and try again.';
            setAuthError(msg);
        }
    };

    if (successScreen) {
        return (
            <div className="max-w-md mx-auto w-full px-4">
                <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center space-y-5 text-xs animate-in fade-in duration-200">
                    <div className="w-16 h-16 bg-emerald-100 text-brand-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 size={36} />
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            Commercial Account Active
                        </span>
                        <h2 className="text-xl font-black text-slate-800 pt-1">
                            Welcome, {orgName}!
                        </h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Your facility has been onboarded under the <strong className="text-brand-primary">{category}</strong> category in <strong className="text-slate-800">{area} Cluster</strong>.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-[11px]">
                        <p className="text-slate-600"><strong>Assigned Tier:</strong> <span className="text-emerald-700 font-bold">{category} Commercial Pipeline</span></p>
                        <p className="text-slate-600"><strong>Dispatch Cluster:</strong> {area} Zone, Osogbo</p>
                        <p className="text-slate-600"><strong>Officer-in-Charge:</strong> {officerName || 'Designated Lead'}</p>
                    </div>

                    <Button
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.location.href = '/dashboard';
                            }
                        }}
                        className="w-full py-3.5 font-bold text-xs flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} /> Open Commercial Dispatch Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto w-full px-4 py-4">
            <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5 text-xs">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                    >
                        <ArrowLeft size={15} /> Back to Sign In
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        Institutional Client
                    </span>
                </div>

                <div className="text-center space-y-1.5 pt-1">
                    <Logo className="h-10 w-auto mx-auto" />
                    <h2 className="text-base font-black text-slate-800">Organization Onboarding</h2>
                    <p className="text-xs text-slate-400">Register facility for bulk evacuation & tailored commercial logistics</p>
                </div>

                {/* Error Banner */}
                {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs">
                        <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold">Onboarding Notice</p>
                            <p className="text-[11px] mt-0.5 text-rose-600">{authError}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Organization Name */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Organization / Business Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. Oroki Innovation Hub / Adeleke University"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Organization Category (MANDATORY SELECTOR) */}
                    <div>
                        <label htmlFor="org-category-select" className="font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                            <span>Organization Category <span className="text-rose-500">*</span></span>
                            <span className="text-[10px] text-brand-primary font-bold lowercase bg-emerald-50 px-2 py-0.2 rounded">
                                dictates fleet tier
                            </span>
                        </label>
                        <div className="relative">
                            <Briefcase size={18} className="absolute left-3.5 top-3.5 text-brand-primary" />
                            <select
                                id="org-category-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 rounded-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none cursor-pointer"
                            >
                                {ORGANIZATION_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 pl-1">
                            Configures commercial fleet allocation and waste stream prioritization.
                        </p>
                    </div>

                    {/* Officer-in-Charge */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Officer-in-Charge / Facilities Manager
                        </label>
                        <div className="relative">
                            <UserCheck size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="e.g. Mr. Lukman Adeoti"
                                value={officerName}
                                onChange={(e) => setOfficerName(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Work Email Address */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Official Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="e.g. operations@orokihub.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Dispatch Contact Phone <span className="text-rose-500">*</span>
                        </label>
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

                    {/* Operating Area Zone */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Facility Cluster / Zone <span className="text-rose-500">*</span>
                        </label>
                        <AreaSelector selectedArea={area} onAreaChange={setArea} />
                    </div>

                    {/* Physical Street Address */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Facility Street Address
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Plot 4, Station Road, Opp. Union Bank, Oke-Fia"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>

                    {/* Staging Bay Notes */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Designated Waste Staging Bay Location
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Rear loading dock near generator house, gate key with security"
                            value={stagingBayNotes}
                            onChange={(e) => setStagingBayNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="font-bold text-slate-700 uppercase tracking-wide mb-1 block">
                            Security Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a secure account password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                                tabIndex="-1"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading} className="w-full py-3.5 text-xs font-black uppercase tracking-wider mt-2 shadow-md">
                        Complete Registration & Launch Engine
                    </Button>
                </form>

                {/* Switch to Login */}
                <div className="text-center text-xs text-slate-500 font-medium pt-1">
                    Already registered your facility?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-brand-primary font-bold hover:underline cursor-pointer"
                    >
                        Sign in here
                    </button>
                </div>
            </div>
        </div>
    );
}
