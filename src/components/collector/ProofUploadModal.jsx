import React, { useState } from 'react';
import Button from '../common/Button';
import { Camera, X } from 'lucide-react';

export default function ProofUploadModal({ jobId, onCompleteJob, onClose }) {
    const [photoPreview, setPhotoPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!photoPreview) return;
        onCompleteJob(jobId, photoPreview);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <div>
                    <h2 className="text-lg font-black text-slate-800">Upload Completion Proof</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Photo evidence is required to finalize job #{jobId}[cite: 1, 2].
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-brand-primary transition-colors cursor-pointer bg-slate-50">
                        {photoPreview ? (
                            <div className="space-y-2">
                                <img
                                    src={photoPreview}
                                    alt="Proof preview"
                                    className="w-full h-40 object-cover rounded-xl border border-slate-200"
                                />
                                <p className="text-[11px] text-brand-primary font-bold">Photo attached successfully!</p>
                            </div>
                        ) : (
                            <label className="cursor-pointer block space-y-2">
                                <Camera size={32} className="mx-auto text-slate-400" />
                                <span className="text-xs font-bold text-slate-700 block">Tap to Capture / Choose Photo</span>
                                <span className="text-[10px] text-slate-400 block">Ensure the cleared waste site is visible</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!photoPreview}
                    >
                        Submit Proof & Complete Job
                    </Button>

                </form>

            </div>
        </div>
    );
}