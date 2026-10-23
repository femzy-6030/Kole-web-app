// src/components/customer/ProfileView.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { pickups } from '../../services/api';
import Button from '../common/Button';
import AreaSelector from '../common/AreaSelector';
import {
    Phone,
    LogOut,
    ShieldCheck,
    Award,
    Trash2,
    Lock,
    HelpCircle,
    Mail,
    ChevronRight,
    Home,
    Check,
    Edit2,
    Loader2
} from 'lucide-react';

export default function ProfileView() {
    const { user, logout, updateUserProfile } = useAuthStore();
    const [Area, setArea] = useState(user?.Area || user?.area || 'Oke-Fia');

    // Dynamic clean-slate stats fetched from GET /api/v1/pickups/
    const [totalPickups, setTotalPickups] = useState(typeof user?.total_pickups === 'number' ? user.total_pickups : 0);
    const [impactScore, setImpactScore] = useState(typeof user?.impact_score === 'number' ? user.impact_score : 0);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Editable contact states
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const [email, setEmail] = useState(user?.email || (user?.fullName ? `${user.fullName.toLowerCase().replace(/\s+/g, '')}@kole.ng` : 'user@kole.ng'));
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // Fetch live pickup records to calculate dynamic stats
    useEffect(() => {
        let isMounted = true;

        const fetchDynamicStats = async () => {
            setIsLoadingStats(true);
            try {
                const data = await pickups.getPickups();
                if (!isMounted) return;

                // Support both standard arrays and paginated DRF responses { results: [...] }
                const pickupList = Array.isArray(data)
                    ? data
                    : (Array.isArray(data?.results)
                        ? data.results
                        : (Array.isArray(data?.data) ? data.data : []));

                // Filter for current user if records contain ownership keys, or use returned array
                const userPickups = pickupList.filter((p) => {
                    if (!user) return true;
                    if (p.user_id && user.id && String(p.user_id) === String(user.id)) return true;
                    if (p.customer_id && user.id && String(p.customer_id) === String(user.id)) return true;
                    if (p.customerName && user.fullName && p.customerName.toLowerCase() === user.fullName.toLowerCase()) return true;
                    if (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase()) return true;
                    return true;
                });

                const count = userPickups.length;
                const score = (typeof user?.impact_score === 'number' && user.impact_score > 0)
                    ? user.impact_score
                    : count * 20;

                setTotalPickups(count);
                setImpactScore(score);

                // Sync back to store
                updateUserProfile({
                    total_pickups: count,
                    impact_score: score
                });
            } catch (err) {
                console.warn('[ProfileView] Could not fetch real pickups, maintaining clean slate:', err);
                if (isMounted) {
                    setTotalPickups(typeof user?.total_pickups === 'number' ? user.total_pickups : 0);
                    setImpactScore(typeof user?.impact_score === 'number' ? user.impact_score : 0);
                }
            } finally {
                if (isMounted) setIsLoadingStats(false);
            }
        };

        fetchDynamicStats();

        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.email]);

    const getTierLabel = (score) => {
        if (!score || score === 0) return 'Starter Tier';
        if (score < 100) return 'Eco Contributor';
        return 'Eco Champion Tier';
    };

    return (
        <div className="space-y-4 pb-12">

            {/* 1. Identity Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 shadow-sm">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 bg-emerald-50 text-brand-primary rounded-full flex items-center justify-center text-2xl font-black border-2 border-brand-primary">
                        {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="absolute bottom-0 right-0 bg-brand-primary text-white p-1 rounded-full border-2 border-white" title="Verified Household">
                        <ShieldCheck size={14} />
                    </span>
                </div>

                <div>
                    <h2 className="text-lg font-black text-slate-800">{user?.fullName || user?.name || user?.username || 'Household Account'}</h2>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Verified Account</p>
                </div>
            </div>

            {/* 2. Environmental Impact Cards (Dynamic Clean Slate) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-brand-accent text-xs font-bold uppercase">
                        <Trash2 size={14} />
                        <span>Pickups</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-slate-100">{totalPickups}</p>
                        {isLoadingStats && <Loader2 size={13} className="animate-spin text-slate-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Total Cleaned Sites</p>
                </div>

                <div className="bg-emerald-50 text-brand-primary rounded-2xl p-4 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                        <Award size={14} />
                        <span>Impact Score</span>
                    </div>
                    <p className="text-2xl font-black">{impactScore} pts</p>
                    <p className="text-[10px] text-brand-primary/80 font-bold">{getTierLabel(impactScore)}</p>
                </div>
            </div>

            {/* 3. Account Preferences Section */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Account Preferences</h3>

                {/* GPS-Enabled Area Selector */}
                <div className="p-3 bg-slate-50 rounded-2xl">
                    <AreaSelector selectedArea={Area} onAreaChange={(newArea) => {
                        setArea(newArea);
                        updateUserProfile({ Area: newArea, area: newArea });
                    }} />
                </div>

                {/* Editable Phone Number */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs">
                    <div className="flex items-center gap-3 flex-1 pr-2">
                        <Phone size={18} className="text-slate-400 shrink-0" />
                        <div className="w-full">
                            <p className="text-slate-400 font-medium">Phone Number</p>
                            {isEditingPhone ? (
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-0.5 w-full focus:outline-none focus:border-brand-primary mt-0.5"
                                />
                            ) : (
                                <p className="font-bold text-slate-800">{phone || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (isEditingPhone) {
                                updateUserProfile({ phoneNumber: phone });
                            }
                            setIsEditingPhone(!isEditingPhone);
                        }}
                        className="text-xs font-bold text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                        {isEditingPhone ? (
                            <>
                                <Check size={12} /> Save
                            </>
                        ) : (
                            <>
                                <Edit2 size={12} /> Update
                            </>
                        )}
                    </button>
                </div>

                {/* Editable Email Address */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs">
                    <div className="flex items-center gap-3 flex-1 pr-2">
                        <Mail size={18} className="text-slate-400 shrink-0" />
                        <div className="w-full">
                            <p className="text-slate-400 font-medium">Email Address</p>
                            {isEditingEmail ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-0.5 w-full focus:outline-none focus:border-brand-primary mt-0.5"
                                />
                            ) : (
                                <p className="font-bold text-slate-800">{email || 'Not provided'}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (isEditingEmail) {
                                updateUserProfile({ email });
                            }
                            setIsEditingEmail(!isEditingEmail);
                        }}
                        className="text-xs font-bold text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                        {isEditingEmail ? (
                            <>
                                <Check size={12} /> Save
                            </>
                        ) : (
                            <>
                                <Edit2 size={12} /> Update
                            </>
                        )}
                    </button>
                </div>

                {/* Saved Default Address */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                        <Home size={18} className="text-slate-400" />
                        <div>
                            <p className="text-slate-400 font-medium">Default Address</p>
                            <p className="font-bold text-slate-800">{user?.address || (user?.Area ? `${user.Area} Zone, Osogbo` : 'Oke-Fia Zone, Osogbo')}</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                </div>

                {/* Security PIN Change */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                        <Lock size={18} className="text-slate-400" />
                        <div>
                            <p className="text-slate-400 font-medium">Security PIN</p>
                            <p className="font-bold text-slate-800">•••• (4-Digit PIN)</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-brand-primary">Update</span>
                </div>
            </div>

            {/* 4. Support & Operations Center */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Support & Help</h3>

                <a
                    href="https://wa.me/2349014603028"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs hover:bg-slate-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <HelpCircle size={18} className="text-brand-primary" />
                        <div>
                            <p className="font-bold text-slate-800">Osogbo Operations Support</p>
                            <p className="text-slate-400 text-[11px]">Chat with Area coordinators on WhatsApp</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                </a>
            </div>

            {/* 5. Sign Out */}
            <Button
                onClick={logout}
                variant="secondary"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 py-3.5"
            >
                <LogOut size={16} className="mr-2" /> Sign Out Account
            </Button>

        </div>
    );
}