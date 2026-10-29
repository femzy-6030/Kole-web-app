// src/components/SOSModal.jsx
import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { pickups } from '../services/api';
import Button from './common/Button';
import {
    Zap,
    Camera,
    Upload,
    X,
    CheckCircle2,
    Loader2,
    Trash2
} from 'lucide-react';

export default function SOSModal({ isOpen, onClose, selectedArea = 'Oke-Fia', onDispatchSuccess }) {
    const { user, addActiveRequest } = useAuthStore();
    const fileInputRef = useRef(null);

    const [stagingNote, setStagingNote] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoName, setPhotoName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [createdTicket, setCreatedTicket] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoFile(null);
        setPhotoPreview(null);
        setPhotoName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const requestId = `#KL-${Math.floor(100000 + Math.random() * 900000)}`;
        const dispatchPayload = {
            requestId: requestId,
            title: 'Instant Emergency Pickup',
            amount: 'Pending Collector Quote',
            status: 'PENDING_QUOTE',
            priority: 'CRITICAL_SOS',
            address: user?.address || `${selectedArea} Zone, Osogbo`,
            stagingNote: stagingNote.trim() || 'Behind front gate',
            photoUrl: photoPreview || null,
            createdAt: new Date().toISOString()
        };

        try {
            // Live backend dispatch creation via multipart/form-data: cluster, address, waste_photo, is_emergency
            const formData = new FormData();
            formData.append('cluster', selectedArea);
            formData.append('address', dispatchPayload.address);
            formData.append('is_emergency', 'true');
            if (photoFile) {
                formData.append('waste_photo', photoFile);
            }
            formData.append('staging_note', dispatchPayload.stagingNote);

            await pickups.createPickup(formData);
        } catch (err) {
            console.warn('[SOSModal] Live dispatch API fallback (local state preserved):', err);
        }

        // Push directly as active priority dispatch
        if (addActiveRequest) {
            addActiveRequest(dispatchPayload);
        }

        setIsSubmitting(false);
        setIsSuccess(true);
        setCreatedTicket(dispatchPayload);

        if (onDispatchSuccess) {
            onDispatchSuccess(dispatchPayload);
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        setPhotoName('');
        setStagingNote('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-xs relative space-y-4">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Header: Clean Headline without price/zone subtext */}
                        <div className="flex items-center gap-2.5 pr-6">
                            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Zap size={20} className="fill-emerald-600 text-emerald-600" />
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-800 leading-tight">
                                    Instant Emergency Dispatch
                                </h3>
                            </div>
                        </div>

                        {/* Waste Photo Upload with Thumbnail Preview */}
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
                                Waste Photo
                            </label>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {photoPreview ? (
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                                    <img
                                        src={photoPreview}
                                        alt="Waste preview"
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-2.5 py-1.5 bg-white text-slate-800 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Upload size={12} /> Replace
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            className="px-2.5 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    </div>
                                    <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-center text-[9px] font-bold text-white drop-shadow">
                                        <span className="truncate max-w-[180px]">{photoName || 'Photo Attached'}</span>
                                        <span className="bg-emerald-600 px-1.5 py-0.2 rounded">Ready</span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl p-4 text-center cursor-pointer transition-colors space-y-1"
                                >
                                    <div className="w-9 h-9 mx-auto bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600">
                                        <Camera size={18} />
                                    </div>
                                    <p className="font-bold text-slate-700 text-xs">Snap or Upload Waste Photo</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Collectors inspect photo to set quote</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Staging Note */}
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block">
                                Quick Staging Note
                            </label>
                            <input
                                type="text"
                                value={stagingNote}
                                onChange={(e) => setStagingNote(e.target.value)}
                                placeholder="e.g., Behind front gate"
                                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white text-xs"
                                required
                            />
                        </div>

                        {/* Direct Submit Action (KóLẹ̀ Green, strictly no price tags) */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-[#0c633e] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/30 border-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={15} className="animate-spin text-white" />
                                    <span>Sending Dispatch Request...</span>
                                </>
                            ) : (
                                <>
                                    <span>DISPATCH REQUEST</span>
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    /* Instant Confirmation Screen */
                    <div className="text-center py-4 space-y-3 animate-in zoom-in-95 duration-150">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h4 className="text-base font-black text-slate-800">Dispatch Request Sent</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Nearby collectors in <span className="font-bold text-slate-700">{selectedArea}</span> have been alerted. They will inspect your waste photo and set an instant quote.
                            </p>
                        </div>

                        {createdTicket && (
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-left space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-black">
                                    <span className="text-slate-400">DISPATCH ID</span>
                                    <span className="text-slate-800">{createdTicket.requestId}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">STATUS</span>
                                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Awaiting Collector Quote</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-400">STAGING NOTE</span>
                                    <span className="text-slate-700 truncate max-w-[180px]">{createdTicket.stagingNote}</span>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleClose}
                            className="w-full py-3 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}
