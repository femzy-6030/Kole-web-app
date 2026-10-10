import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight } from 'lucide-react';

export default function HeroCarousel() {
    const campaigns = [
        {
            id: 1,
            title: 'Osogbo Clean City Campaign 2026',
            description: 'Sort your recyclable plastics before pickup for extra community credits!',
            badge: 'Public Awareness',
            bgGradient: 'from-brand-primary to-emerald-800',
        },
        {
            id: 2,
            title: 'Flood Prevention Notice',
            description: 'Avoid disposing waste in open gutters during heavy rain sessions.',
            badge: 'Safety Alert',
            bgGradient: 'from-teal-700 to-slate-800',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % campaigns.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const current = campaigns[currentIndex];

    return (
        <div className={`w-full rounded-2xl bg-gradient-to-r ${current.bgGradient} p-5 text-white shadow-md relative overflow-hidden transition-all duration-500`}>
            <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Megaphone size={12} />
                    {current.badge}
                </span>
                <h2 className="text-lg font-black leading-tight">{current.title}</h2>
                <p className="text-xs text-emerald-100 mt-1 line-clamp-2">{current.description}</p>
            </div>

            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5 mt-4 relative z-10">
                {campaigns.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}