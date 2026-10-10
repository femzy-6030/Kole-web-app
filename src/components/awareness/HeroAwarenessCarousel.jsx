// src/components/awareness/HeroAwarenessCarousel.jsx
import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroAwarenessCarousel() {
    const slides = [
        {
            id: 1,
            badge: 'Public Awareness',
            title: 'Osogbo Clean City Initiative 2026',
            description: 'Sort your recyclable plastics before pickup to support local sorting hubs!',
            bg: 'bg-emerald-900',
        },
        {
            id: 2,
            badge: 'Safety Alert',
            title: 'Flood Prevention Drive',
            description: 'Avoid dumping solid waste in open drainage channels during rainy periods.',
            bg: 'bg-slate-900',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-md transition-all duration-500 ${slides[currentIndex].bg}`}>
            <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-brand-accent border border-white/10">
                    <Megaphone size={12} />
                    {slides[currentIndex].badge}
                </span>
                <div className="flex gap-1">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-5 bg-brand-accent' : 'w-1.5 bg-white/30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <h3 className="text-lg font-black leading-snug mb-1">
                {slides[currentIndex].title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
                {slides[currentIndex].description}
            </p>

            {/* Manual Carousel Controls */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}