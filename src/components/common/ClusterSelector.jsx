// src/components/common/ClusterSelector.jsx
import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, Check } from 'lucide-react';

export default function ClusterSelector({ selectedCluster, onClusterChange }) {
    const [isLocating, setIsLocating] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [customCluster, setCustomCluster] = useState('');

    const predefinedClusters = ['Oke-Fia', 'Alekuwodo', 'GRA', 'Ogo-Oluwa', 'Old Garage'];

    // GPS Auto-Detection Handler
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Simulating reverse-geocoding resolution to nearest Osogbo cluster
                setTimeout(() => {
                    setIsLocating(false);
                    // Defaulting to auto-detected cluster based on mockup coordinates
                    const detectedCluster = 'Oke-Fia';
                    onClusterChange(detectedCluster);
                    setIsCustom(false);
                }, 1200);
            },
            (error) => {
                setIsLocating(false);
                alert('Unable to retrieve location. Please type or select your cluster manually.');
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (customCluster.trim()) {
            onClusterChange(customCluster.trim());
        }
    };

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Operating Cluster / Location
                </label>

                {/* GPS Quick Detect Trigger */}
                <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                    {isLocating ? (
                        <>
                            <Loader2 size={12} className="animate-spin" /> Detecting GPS...
                        </>
                    ) : (
                        <>
                            <Navigation size={12} /> Auto-detect Location
                        </>
                    )}
                </button>
            </div>

            {!isCustom ? (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MapPin size={18} className="absolute left-3.5 top-3.5 text-brand-primary" />
                        <select
                            value={selectedCluster}
                            onChange={(e) => {
                                if (e.target.value === 'OTHER') {
                                    setIsCustom(true);
                                } else {
                                    onClusterChange(e.target.value);
                                }
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-primary appearance-none"
                        >
                            {predefinedClusters.map((c) => (
                                <option key={c} value={c}>{c} Zone</option>
                            ))}
                            <option value="OTHER">+ Type New / Custom Location...</option>
                        </select>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type your area or district name..."
                        value={customCluster}
                        onChange={(e) => setCustomCluster(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-primary"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-4 py-3 bg-brand-primary text-white text-xs font-bold rounded-xl flex items-center gap-1"
                    >
                        <Check size={14} /> Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCustom(false)}
                        className="px-3 py-3 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}