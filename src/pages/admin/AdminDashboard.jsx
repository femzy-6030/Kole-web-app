// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Shield, Megaphone, Users, Activity } from 'lucide-react';

// Fallback/Inline Component for Admin Header Navbar
function AdminNavbar() {
    return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Shield className="text-emerald-400" size={20} />
                <span className="font-black text-sm uppercase tracking-wider">KÓLẸ̀ Platform Admin</span>
            </div>
            <span className="text-xs bg-slate-800 text-emerald-400 font-bold px-3 py-1 rounded-full border border-slate-700">
                Live System
            </span>
        </div>
    );
}

// Fallback/Inline Component for Campaign Manager
function CampaignManager() {
    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-brand-primary">
                <Megaphone size={18} />
                <h3 className="font-black text-slate-800 text-sm">Area Announcements & Campaigns</h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manage live awareness carousel cards and pop-up notifications for households and commercial hubs in Osogbo.
            </p>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-slate-100 p-4 max-w-4xl mx-auto space-y-5 text-xs">
            <AdminNavbar />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Registered Users</p>
                    <h2 className="text-2xl font-black text-slate-800">1,248</h2>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Active Collectors</p>
                    <h2 className="text-2xl font-black text-slate-800">14 Operators</h2>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Active Area</p>
                    <h2 className="text-2xl font-black text-emerald-600">6 Zones</h2>
                </div>
            </div>

            <CampaignManager />
        </div>
    );
}