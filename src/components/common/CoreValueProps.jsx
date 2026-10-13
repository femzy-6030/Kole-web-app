import React from 'react';
import { Zap, ShieldCheck, MapPin } from 'lucide-react';

export default function CoreValueProps() {
    const pillars = [
        {
            icon: <Zap size={16} className="text-emerald-600" />,
            title: 'On-Demand Reliability',
            desc: 'Rapid emergency response & verified collectors'
        },
        {
            icon: <ShieldCheck size={16} className="text-emerald-600" />,
            title: 'Transparent Pricing',
            desc: 'Clear upfront fees with cashless options'
        },
        {
            icon: <MapPin size={16} className="text-emerald-600" />,
            title: 'Optimized Dispatch',
            desc: 'Smart geo-matching for faster pickups'
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3 text-xs">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider text-slate-400">
                Why Choose KÓLẸ̀
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
                {pillars.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="p-2 bg-emerald-100/60 rounded-xl shrink-0 mt-0.5">
                            {item.icon}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                            <p className="text-slate-500 text-[10px] leading-tight mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}