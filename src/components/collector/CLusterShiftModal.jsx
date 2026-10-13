import React, { useState } from 'react';
import Button from '../common/Button';
import { ShieldCheck, Truck } from 'lucide-react';

export default function AreahiftModal({ currentArea, onConfirmArea, onClose }) {
    const [selectedArea, setSelectedArea] = useState(currentArea || 'Oke-Fia');

    const handleConfirm = () => {
        onConfirmArea(selectedArea);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">

                <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
                        <Truck size={24} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Start Shift / Select Area</h2>
                    <p className="text-xs text-slate-500">
                        Select your government-assigned operating Area for this shift[cite: 1, 2].
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Operating Area
                    </label>
                    <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold focus:outline-none focus:border-brand-primary"
                    >
                        <option value="Oke-Fia">Oke-Fia Area</option>
                        <option value="Alekuwodo">Alekuwodo Area</option>
                        <option value="GRA">GRA Area</option>
                        <option value="Ogo-Oluwa">Ogo-Oluwa Area</option>
                        <option value="Old Garage">Old Garage Area</option>
                        <option value="Testing Ground">Testing Ground Area</option>
                    </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-brand-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-tight">
                        Job feed visibility is locked strictly to requests originating in your confirmed Area[cite: 1, 2].
                    </p>
                </div>

                <Button onClick={handleConfirm} className="w-full">
                    Confirm Shift & View Feed
                </Button>

            </div>
        </div>
    );
}