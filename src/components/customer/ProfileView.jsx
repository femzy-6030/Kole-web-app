// src/components/customer/ProfileView.jsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../common/Button';
import { User, Phone, MapPin, LogOut, ShieldCheck } from 'lucide-react';

export default function ProfileView() {
    const { user, logout } = useAuthStore();

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-50 text-brand-primary rounded-full flex items-center justify-center mx-auto text-xl font-black shadow-sm">
                    {user?.fullName ? user.fullName[0] : 'U'}
                </div>
                <div>
                    <h2 className="text-base font-black text-slate-800">{user?.fullName || 'Customer User'}</h2>
                    <span className="text-xs text-slate-400 font-bold">Registered Account</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <Phone size={18} className="text-slate-400" />
                    <div>
                        <p className="text-slate-400 font-medium">Phone Number</p>
                        <p className="font-bold text-slate-800">{user?.phoneNumber || '08012345678'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <MapPin size={18} className="text-slate-400" />
                    <div>
                        <p className="text-slate-400 font-medium">Assigned Operating Cluster</p>
                        <p className="font-bold text-brand-primary">{user?.cluster || 'Oke-Fia Zone'}</p>
                    </div>
                </div>
            </div>

            <Button onClick={logout} variant="secondary" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50">
                <LogOut size={16} className="mr-2" /> Sign Out Account
            </Button>
        </div>
    );
}