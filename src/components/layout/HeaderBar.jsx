// src/components/layout/HeaderBar.jsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import koleLogo from '../../assets/Kole.png';
import { LogOut } from 'lucide-react';

export default function HeaderBar() {
    const { user, logout } = useAuthStore();

    return (
        <header className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/80 shadow-sm flex items-center justify-between w-full mx-auto mb-4 box-border">
            {/* Brand Logo */}
            <div className="flex items-center gap-2">
                <img
                    src={koleLogo}
                    alt="KÓLẸ̀ Logo"
                    className="h-7 sm:h-9 w-auto object-contain"
                />
            </div>

            {/* User Quick Info & Sign Out */}
            <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-slate-800 leading-none">
                        {user?.fullName || user?.orgName || 'KÓLẸ̀ User'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {user?.Area || 'Oke-Fia'} Area
                    </p>
                </div>

                <button
                    onClick={logout}
                    className="px-2.5 sm:px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-rose-100"
                    title="Sign Out"
                >
                    <LogOut size={13} />
                    <span className="hidden xs:inline">Sign Out</span>
                </button>
            </div>
        </header>
    );
}