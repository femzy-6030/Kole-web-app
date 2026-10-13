// src/components/common/AwarenessCarousel.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Megaphone, Leaf, ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react';

// ====================================================
// 1. SIGN-IN ANNOUNCEMENT POP-UP MODAL
// ====================================================
export function AnnouncementModal({ isOpen, onClose, announcement }) {
    if (!isOpen || !announcement) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 text-xs animate-in zoom-in-95">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-100 text-brand-primary rounded-xl">
                            <Megaphone size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                Important Notice
                            </span>
                            <h3 className="font-black text-slate-800 text-sm mt-0.5">{announcement.title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-slate-600 leading-relaxed font-medium">
                    {announcement.message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                    <CheckCircle2 size={16} /> Got It, Proceed to Dashboard
                </button>
            </div>
        </div>
    );
}

// ====================================================
// 2. DYNAMIC AWARENESS & ANNOUNCEMENT CAROUSEL
// ====================================================
export default function AwarenessCarousel({ customItems }) {
    const defaultItems = [
        {
            id: 1,
            tag: 'Eco Tip',
            tagBg: 'bg-amber-100 text-amber-800',
            icon: Sparkles,
            iconBg: 'bg-amber-500 text-white',
            border: 'border-amber-200/60',
            title: 'Separate Organic & Plastics',
            description: 'Sorting plastic bottles and cardboard speeds up evacuation times across Osogbo Area!',
        },
        {
            id: 2,
            tag: 'System Update',
            tagBg: 'bg-blue-100 text-blue-800',
            icon: Megaphone,
            iconBg: 'bg-blue-600 text-white',
            border: 'border-blue-200/60',
            title: 'Extended Evening Pickups',
            description: 'Truck dispatch teams in Oke-Fia and Sabo now operate extended night clearance hours until 8:00 PM.',
        },
        {
            id: 3,
            tag: 'Community',
            tagBg: 'bg-emerald-100 text-emerald-800',
            icon: Leaf,
            iconBg: 'bg-emerald-600 text-white',
            border: 'border-emerald-200/60',
            title: 'Keep Staging Bays Clear',
            description: 'Ensure bulk waste bags are placed near main access gates for faster truck loading.',
        },
    ];

    const slides = customItems || defaultItems;
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 6 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const CurrentIcon = slides[currentIndex].icon;

    return (
        <div className={`bg-white rounded-3xl p-5 border ${slides[currentIndex].border} shadow-sm space-y-3 text-xs relative overflow-hidden transition-all duration-300`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl shadow-sm ${slides[currentIndex].iconBg}`}>
                        <CurrentIcon size={16} />
                    </div>
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md ${slides[currentIndex].tagBg}`}>
                            {slides[currentIndex].tag}
                        </span>
                        <h4 className="font-black text-slate-800 text-xs mt-0.5">{slides[currentIndex].title}</h4>
                    </div>
                </div>

                {/* Carousel Navigation Buttons */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                        className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                {slides[currentIndex].description}
            </p>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-1.5 pt-1">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentIndex ? 'w-5 bg-brand-primary' : 'w-1.5 bg-slate-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}