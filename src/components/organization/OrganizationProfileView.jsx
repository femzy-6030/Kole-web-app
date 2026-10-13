
// src/components/organization/OrganizationProfileView.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../common/Button';
import AreaSelector from '../common/AreaSelector';
import {
    Building2,
    MapPin,
    Phone,
    UserCheck,
    Clock,
    Package,
    ShieldCheck,
    Save,
    LogOut,
    Navigation
} from 'lucide-react';

export default function OrganizationProfileView() {
    const { user, logout } = useAuthStore();

    const [orgData, setOrgData] = useState({
        orgName: user?.fullName || 'Oroki Innovation Hub',
        category: 'Commercial / Tech Hub',
        Area: user?.Area || 'Oke-Fia',
        address: 'Plot 4, Station Road, Opp. Union Bank, Oke-Fia, Osogbo',
        pickupBay: 'Rear Loading Dock near Generator House',
        managerName: 'Mr. Lukman Adeoti',
        managerPhone: '08034567891',
        preferredHours: '08:00 AM - 11:00 AM',
        wasteType: 'Paper, E-Waste & General Packaging',
        estimatedVolume: '10–15 Large Bags / Week',
    });

    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="space-y-4 pb-20 max-w-lg mx-auto">

            {/* Organization Header */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                        <Building2 size={28} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <ShieldCheck size={12} /> Verified Organization
                        </span>
                        <h2 className="text-lg font-black mt-1 leading-snug">{orgData.orgName}</h2>
                        <p className="text-xs text-slate-400 font-medium">{orgData.category}</p>
                    </div>
                </div>
            </div>

            {/* Operational Details Form */}
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 shadow-sm text-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Collector Dispatch & Logistics Info
                </h3>

                {/* Organization Name & Category */}
                <div className="space-y-3">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Organization / Business Name</label>
                        <input
                            type="text"
                            value={orgData.orgName}
                            onChange={(e) => setOrgData({ ...orgData, orgName: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1">Business Category</label>
                        <select
                            value={orgData.category}
                            onChange={(e) => setOrgData({ ...orgData, category: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        >
                            <option value="Commercial / Tech Hub">Commercial / Tech Hub</option>
                            <option value="Hospital / Healthcare Clinic">Hospital / Healthcare Clinic</option>
                            <option value="Hotel / Restaurant / Eatery">Hotel / Restaurant / Eatery</option>
                            <option value="Educational Institution / School">Educational Institution / School</option>
                            <option value="Supermarket / Retail Store">Supermarket / Retail Store</option>
                            <option value="Factory / Light Industry">Factory / Light Industry</option>
                        </select>
                    </div>
                </div>

                {/* Operating Area Selector */}
                <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700 block">Assigned Operating Area Zone</label>
                    <AreaSelector
                        selectedArea={orgData.Area}
                        onAreaChange={(Area) => setOrgData({ ...orgData, Area })}
                    />
                </div>

                {/* Street Address & Staging Location */}
                <div className="space-y-3 pt-1">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                            <MapPin size={14} className="text-brand-primary" /> Street Address & Landmark
                        </label>
                        <input
                            type="text"
                            value={orgData.address}
                            onChange={(e) => setOrgData({ ...orgData, address: e.target.value })}
                            placeholder="e.g., Plot 4, Station Road, Opp. Union Bank"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                            <Navigation size={14} className="text-brand-primary" /> Waste Pickup Staging Bay
                        </label>
                        <input
                            type="text"
                            value={orgData.pickupBay}
                            onChange={(e) => setOrgData({ ...orgData, pickupBay: e.target.value })}
                            placeholder="e.g., Rear Loading Dock / Gate 2 Bin Area"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>

                {/* Facility Contact & Access Hours */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                            <UserCheck size={14} className="text-slate-400" /> Facility Contact
                        </label>
                        <input
                            type="text"
                            value={orgData.managerName}
                            onChange={(e) => setOrgData({ ...orgData, managerName: e.target.value })}
                            placeholder="Facility Manager Name"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                            <Phone size={14} className="text-slate-400" /> Contact Phone
                        </label>
                        <input
                            type="tel"
                            value={orgData.managerPhone}
                            onChange={(e) => setOrgData({ ...orgData, managerPhone: e.target.value })}
                            placeholder="08034567891"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>

                {/* Preferred Access Window & Waste Category */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                        <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                            <Clock size={14} className="text-slate-400" /> Access Hours
                        </label>
                        <input
                            type="text"
                            value={orgData.preferredHours}
                            onChange={(e) => setOrgData({ ...orgData, preferredHours: e.target.value })}
                            placeholder="e.g., 08:00 AM - 11:00 AM"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>

                    <div>
                        <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                            <Package size={14} className="text-slate-400" /> Waste Scale
                        </label>
                        <input
                            type="text"
                            value={orgData.estimatedVolume}
                            onChange={(e) => setOrgData({ ...orgData, estimatedVolume: e.target.value })}
                            placeholder="e.g., 10-15 Bags / Week"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" className="w-full py-3 flex items-center justify-center gap-2 font-bold">
                        <Save size={16} /> Save Organization Logistics Info
                    </Button>
                </div>

                {isSaved && (
                    <p className="text-center text-xs font-bold text-emerald-600 animate-in fade-in">
                        Logistics details updated successfully!
                    </p>
                )}
            </form>

            {/* Sign Out Button */}
            <Button
                onClick={logout}
                variant="secondary"
                className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 py-3"
            >
                <LogOut size={16} className="mr-2" /> Sign Out Organization Account
            </Button>

        </div>
    );
}