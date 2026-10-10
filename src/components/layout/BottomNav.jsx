// src/components/layout/BottomNav.jsx
import React from 'react';
import { Home, Receipt, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'payments', label: 'Payments', icon: Receipt },
        { id: 'me', label: 'Me', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg">
            <div className="max-w-md mx-auto flex justify-around items-center h-16 px-6">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-all ${isActive
                                    ? 'text-brand-primary font-bold scale-105'
                                    : 'text-slate-400 hover:text-slate-600 font-medium'
                                }`}
                        >
                            <Icon size={22} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                            <span className="text-xs mt-1 tracking-tight">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}