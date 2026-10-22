// src/components/common/AreaSelector.jsx
import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, Check, AlertCircle } from 'lucide-react';
import { OSOGBO_CLUSTERS, getNearestCluster } from '../../utils/zoneValidator';

export default function AreaSelector({ selectedArea, onAreaChange, compact = false }) {
    const [isLocating, setIsLocating] = useState(false);
    const [isCustom, setIsCustom] = useState(false);
    const [customArea, setCustomArea] = useState('');
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

    const predefinedArea = OSOGBO_CLUSTERS.map(c => c.name);

    // Standard Browser Geolocation Handler
    const handleDetectLocation = () => {
        setStatusMessage(null);

        if (typeof window === 'undefined' || !navigator?.geolocation) {
            setStatusMessage({
                type: 'error',
                text: 'Geolocation is not supported by your browser. Please select manually.'
            });
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                const { latitude, longitude } = position.coords;
                const result = getNearestCluster(latitude, longitude);

                onAreaChange(result.cluster);
                setIsCustom(false);
                setStatusMessage({
                    type: 'success',
                    text: `GPS matched: ${result.cluster} Zone (${result.distanceKm}km)`
                });
            },
            (error) => {
                setIsLocating(false);
                let errText = 'Location detection unavailable. Please select from active Osogbo clusters below.';
                if (error.code === 1) {
                    errText = 'Location permission denied. Please choose your cluster manually.';
                } else if (error.code === 3) {
                    errText = 'Location timed out. Please choose your cluster manually.';
                }
                setStatusMessage({
                    type: 'error',
                    text: errText
                });
            },
            { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
        );
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (customArea.trim()) {
            onAreaChange(customArea.trim());
            setStatusMessage(null);
        }
    };

    return (
        <div className="space-y-2">
            {!compact && (
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Operating Area / Cluster
                    </label>

                    {/* GPS Quick Detect Trigger */}
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
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
            )}

            {/* Status Feedback Notification */}
            {statusMessage && (
                <div
                    className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                >
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{statusMessage.text}</span>
                </div>
            )}

            {!isCustom ? (
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <MapPin size={16} className="absolute left-3.5 top-3 text-brand-primary pointer-events-none" />
                        <select
                            value={selectedArea}
                            onChange={(e) => {
                                setStatusMessage(null);
                                if (e.target.value === 'OTHER') {
                                    setIsCustom(true);
                                } else {
                                    onAreaChange(e.target.value);
                                }
                            }}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                        >
                            {predefinedArea.map((c) => (
                                <option key={c} value={c}>{c} Zone</option>
                            ))}
                            <option value="OTHER">+ Type New / Custom Location...</option>
                        </select>
                    </div>
                    {compact && (
                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isLocating}
                            title="Auto-detect location via GPS"
                            className="p-2.5 bg-emerald-50 text-brand-primary border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                        >
                            {isLocating ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
                        </button>
                    )}
                </div>
            ) : (
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type your area or district name..."
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:outline-none focus:border-brand-primary"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-3 py-2 bg-brand-primary text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                        <Check size={14} /> Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCustom(false)}
                        className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
}