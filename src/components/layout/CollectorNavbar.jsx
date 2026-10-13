import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Truck, MapPin, LogOut, Wallet } from 'lucide-react';
import Logo from '../common/Logo';

export default function CollectorNavbar({ activeTab, setActiveTab, activeArea, onChangeArea }) {
    const { logout } = useAuthStore();

    return (
        <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">

                {/* Brand & Operating Area Selector Button */}
                <div className="flex items-center gap-2">
                    <Logo className="h-7 w-auto text-white" />
                    <button
                        onClick={onChangeArea}
                        className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full text-xs font-bold transition-all border border-white/10"
                        title="Switch Operating Area"
                    >
                        <MapPin size={12} className="text-brand-accent" />
                        <span>{activeArea}</span>
                    </button>
                </div>

                {/* Tab Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'jobs' ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        <Truck size={16} />
                        Jobs
                    </button>

                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${activeTab === 'wallet' ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        <Wallet size={16} />
                        Wallet
                    </button>

                    <button
                        onClick={logout}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

            </div>
        </header>
    );
}