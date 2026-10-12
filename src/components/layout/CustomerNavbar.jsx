// src/components/layout/CustomerNavbar.jsx
import React from 'react';
import { Home, CreditCard, User } from 'lucide-react';

export default function CustomerNavbar({ activeTab, setActiveTab }) {
    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 max-w-lg mx-auto shadow-lg">
            <div className="flex justify-around items-center h-16 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 cursor-pointer transition-all ${isActive ? 'text-brand-primary font-black' : 'text-slate-400 font-bold hover:text-slate-600'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                            <span className="text-[10px]">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}