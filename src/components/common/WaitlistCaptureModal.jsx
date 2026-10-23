// src/components/common/WaitlistCaptureModal.jsx
import React, { useState } from 'react';
import Button from './Button';
import { waitlist } from '../../services/api';
import { MapPin, MessageSquare, CheckCircle2, X } from 'lucide-react';

export default function WaitlistCaptureModal({ isOpen, onClose, userAddress, userName = '', userPhone = '' }) {
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: userName || '',
        phone: userPhone || '',
        accountType: 'household', // household vs commercial
        weeklyBags: '2-3 bags',
        currentDisposal: 'Municipal / Burning'
    });

    React.useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || userName || '',
                phone: prev.phone || userPhone || '',
            }));
        }
    }, [isOpen, userName, userPhone]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await waitlist.registerWaitlist({
                phone: formData.phone,
                area_name: userAddress || 'Oke-Fia',
                full_name: formData.name,
                account_type: formData.accountType,
                weekly_bags: formData.weeklyBags
            });
        } catch (apiErr) {
            console.warn('[Waitlist] API submission fallback:', apiErr);
        } finally {
            setIsSubmitting(false);
            setSubmitted(true);
        }
    };

    // Generate unique referral link for WhatsApp
    const referralCode = Math.random().toString(36).substring(7).toUpperCase();
    const referralLink = `https://kole.ng/waitlist?ref=${referralCode}`;
    const whatsappMessage = encodeURIComponent(
        `Hey! I just joined the KÓLẸ̀ waste collection waitlist for our neighborhood. Join using my link to get priority launch status and a 15% discount voucher: ${referralLink}`
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-xs relative animate-in fade-in zoom-in duration-200">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                >
                    <X size={18} />
                </button>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                                Expansion Zone Notice
                            </span>
                            <h3 className="text-base font-black text-slate-800 mt-2">
                                KóLẹ̀ is expanding to your area! Join waitlist
                            </h3>
                            <p className="text-slate-500 text-[11px] mt-1">
                                Coverage for <span className="font-bold text-slate-700">"{userAddress}"</span> is coming soon. Join our priority neighborhood waitlist to get early access and dispatch notifications.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Olayinka Oluwafemi"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="08012345678"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Account Type</label>
                                    <select
                                        value={formData.accountType}
                                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                                    >
                                        <option value="household">Household</option>
                                        <option value="commercial">Commercial / Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Est. Weekly Bags</label>
                                    <select
                                        value={formData.weeklyBags}
                                        onChange={(e) => setFormData({ ...formData, weeklyBags: e.target.value })}
                                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                                    >
                                        <option value="1-2 bags">1 - 2 bags</option>
                                        <option value="3-5 bags">3 - 5 bags</option>
                                        <option value="5+ bags">5+ bags</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" isLoading={isSubmitting} className="w-full py-3 font-bold text-xs">
                            Join Neighborhood Waitlist
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4 py-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-black text-slate-800">You're on the Waitlist!</h3>
                            <p className="text-slate-500 text-[11px] leading-relaxed">
                                Your zone needs <span className="font-bold text-slate-700">50 households</span> to trigger collector deployment. Speed up our arrival by inviting your neighbors!
                            </p>
                        </div>

                        <a
                            href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <MessageSquare size={16} /> Share via WhatsApp (Unlock 15% Off)
                        </a>

                        <button
                            onClick={onClose}
                            className="text-slate-400 font-bold hover:text-slate-600 text-[11px]"
                        >
                            Close Window
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}