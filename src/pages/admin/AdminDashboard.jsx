// src/pages/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import AdminNavbar from '../../components/layout/AdminNavbar';
import CollectorVerificationQueue from '../../components/admin/CollectorVerificationQueue';
import PricingControls from '../../components/admin/PricingControls';
import CampaignManager from '../../components/admin/CampaignManager';
import { Truck, MapPin, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'collectors' | 'pricing' | 'campaigns'

    return (
        <div className="min-h-screen bg-slate-100 pb-12">
            <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">

                {/* Metric Cards Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-primary flex items-center justify-center shrink-0">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 font-bold uppercase">Active Clusters</span>
                            <p className="text-2xl font-black text-slate-800">6 Zones</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <Truck size={24} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 font-bold uppercase">Live Pickups</span>
                            <p className="text-2xl font-black text-slate-800">14 Active</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Users size={24} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 font-bold uppercase">Verified Collectors</span>
                            <p className="text-2xl font-black text-slate-800">28 On Duty</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 font-bold uppercase">Base Pricing Mode</span>
                            <p className="text-2xl font-black text-brand-primary">₦0.00 Free</p>
                        </div>
                    </div>
                </div>

                {/* Tab Views */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <CollectorVerificationQueue />
                        <PricingControls />
                    </div>
                )}

                {activeTab === 'collectors' && <CollectorVerificationQueue />}
                {activeTab === 'pricing' && <PricingControls />}
                {activeTab === 'campaigns' && <CampaignManager />}

            </main>
        </div>
    );
}