// src/components/customer/ProfileView.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../common/Button';
import ClusterSelector from '../common/ClusterSelector';
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
    Edit2
} from 'lucide-react';

export default function ProfileView() {
    const { user, logout } = useAuthStore();
    const [cluster, setCluster] = useState(user?.cluster || 'Oke-Fia');

    // Editable contact states
    const [phone, setPhone] = useState(user?.phoneNumber || '09014603028');
    const [isEditingPhone, setIsEditingPhone] = useState(false);

    const [email, setEmail] = useState(user?.email || 'olayinka@kole.ng');
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    return (
        <div className="space-y-4 pb-12">

            {/* 1. Identity Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3 shadow-sm">
                <div className="relative w-20 h-20 mx-auto">
                    <div className="w-20 h-20 bg-emerald-50 text-brand-primary rounded-full flex items-center justify-center text-2xl font-black border-2 border-brand-primary">
                        {user?.fullName ? user.fullName[0] : 'O'}
                    </div>
                    <span className="absolute bottom-0 right-0 bg-brand-primary text-white p-1 rounded-full border-2 border-white" title="Verified Customer">
                        <ShieldCheck size={14} />
                    </span>
                </div>

                <div>
                    <h2 className="text-lg font-black text-slate-800">{user?.fullName || 'Olayinka Oluwafemi'}</h2>
                    <p className="text-xs text-slate-400 font-bold mt-0.5">Verified Customer Account</p>
                </div>
            </div>

            {/* 2. Environmental Impact Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-brand-accent text-xs font-bold uppercase">
                        <Trash2 size={14} />
                        <span>Pickups</span>
                    </div>
                    <p className="text-2xl font-black text-slate-100">12</p>
                    <p className="text-[10px] text-slate-400">Total Cleaned Sites</p>
                </div>

                <div className="bg-emerald-50 text-brand-primary rounded-2xl p-4 border border-emerald-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase">
                        <Award size={14} />
                        <span>Impact Score</span>
                    </div>
                    <p className="text-2xl font-black">240 pts</p>
                    <p className="text-[10px] text-brand-primary/80 font-bold">Eco Champion Tier</p>
                </div>
            </div>

            {/* 3. Account Preferences Section */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Account Preferences</h3>

                {/* GPS-Enabled Cluster Selector */}
                <div className="p-3 bg-slate-50 rounded-2xl">
                    <ClusterSelector selectedCluster={cluster} onClusterChange={setCluster} />
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
                                <p className="font-bold text-slate-800">{phone}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditingPhone(!isEditingPhone)}
                        className="text-xs font-bold text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1 shrink-0"
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
                                <p className="font-bold text-slate-800">{email}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                        className="text-xs font-bold text-brand-primary bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1 shrink-0"
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
                            <p className="font-bold text-slate-800">Oke-Fia Junction, Near Station Road</p>
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
                    href="https://wa.me/2348012345678"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs hover:bg-slate-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <HelpCircle size={18} className="text-brand-primary" />
                        <div>
                            <p className="font-bold text-slate-800">Osogbo Operations Support</p>
                            <p className="text-slate-400 text-[11px]">Chat with cluster coordinators on WhatsApp</p>
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