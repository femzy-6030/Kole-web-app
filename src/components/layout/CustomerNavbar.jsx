import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, MapPin, LogOut, User } from 'lucide-react';

export default function CustomerNavbar() {
    const { user, logout } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(2); // Mock unread notification counter
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">

                {/* Brand & Cluster Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-brand-primary tracking-tight">KÓLẸ̀</span>
                    <div className="flex items-center gap-1 bg-emerald-50 text-brand-primary px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-100">
                        <MapPin size={12} />
                        <span>{user?.cluster || 'Oke-Fia'}</span>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-3">

                    {/* Notification Bell Badge */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

            </div>

            {/* Notification Drawer Dropdown */}
            {showNotifications && (
                <div className="absolute right-4 top-14 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Notifications</h3>
                        <button
                            onClick={() => setUnreadCount(0)}
                            className="text-[10px] text-brand-primary font-bold hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                            <p className="text-xs font-bold text-slate-800">Collector Assigned 🟢</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Tunde Adewale has been assigned to your Oke-Fia cluster request.</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-800">Public Awareness Update 📣</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">New plastic sorting rules are active in Osogbo urban clusters.</p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}