// src/components/common/WhatsAppInviteCard.jsx
import React, { useState } from 'react';
import { Gift, Users, MessageSquare, Copy, Check } from 'lucide-react';

export default function WhatsAppInviteCard({ userId, userCluster = 'Oke-Fia' }) {
    const [copied, setCopied] = useState(false);

    const refCode = userId || 'KL-REF';
    const referralLink = `https://kole.ng/waitlist?ref=${refCode}`;

    const whatsappMsg = encodeURIComponent(
        `Hey! I'm using KÓLẸ̀ for fast, reliable waste collection in ${userCluster}. Join through my link so we can get priority collector response and unlock a 15% discount voucher: ${referralLink}`
    );

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-5 border border-emerald-800/80 shadow-md space-y-4 text-xs relative overflow-hidden my-4">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-900/90 border border-emerald-700/60 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Gift size={12} /> Viral Neighborhood Reward
                    </span>
                    <h3 className="text-base font-black text-white pt-1">
                        Invite 3 Neighbors, Get 15% Off
                    </h3>
                    <p className="text-emerald-200 text-[11px] leading-relaxed">
                        Bring KÓLẸ̀ to more streets in <span className="font-bold text-white">{userCluster}</span>. Unlock priority launch status & discount vouchers!
                    </p>
                </div>
            </div>

            <div className="bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/80 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                        <Users size={14} /> Referral Progress
                    </span>
                    <span className="font-black text-emerald-400">1 / 3 Neighbors Joined</span>
                </div>
                <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-emerald-400 rounded-full transition-all duration-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                    href={`https://api.whatsapp.com/send?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                    <MessageSquare size={16} className="fill-emerald-950" />
                    <span>Share on WhatsApp</span>
                </a>

                <button
                    onClick={handleCopy}
                    className="w-full py-3 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 font-bold rounded-xl border border-emerald-700/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                    {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
            </div>
        </div>
    );
}