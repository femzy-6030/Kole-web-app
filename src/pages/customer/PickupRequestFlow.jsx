// src/pages/customer/PickupRequestFlow.jsx
import React, { useState } from 'react';
import Button from '../../components/common/Button';
import WaitlistCaptureModal from '../../components/common/WaitlistCaptureModal';
import { checkZoneCoverage } from '../../utils/zoneValidator';
import { MapPin, Navigation, ArrowLeft, AlertCircle, Zap } from 'lucide-react';

export default function PickupRequestFlow({ onBack, onProceedToPayment }) {
    const [address, setAddress] = useState('');
    const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
    const [outOfZoneWarning, setOutOfZoneWarning] = useState(false);
    const [allowSpecialDispatch, setAllowSpecialDispatch] = useState(false);

    const handleAddressSubmit = (e) => {
        e.preventDefault();

        const coverage = checkZoneCoverage(address);

        if (!coverage.active && !allowSpecialDispatch) {
            // Address is outside primary cluster zones!
            setOutOfZoneWarning(true);
            return;
        }

        // Proceed to payment/checkout if address is valid OR user accepted special dispatch
        if (onProceedToPayment) {
            onProceedToPayment({
                address,
                cluster: coverage.matchedZone || 'OUT-OF-ZONE (SPECIAL DISPATCH)',
                isSpecialDispatch: !coverage.active
            });
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 space-y-5 text-xs">

            {/* Header Bar */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl shadow-sm border border-slate-200/80"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Step 1: Location Setup
                </span>
            </div>

            {/* Main Address Form Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                <div>
                    <h2 className="text-base font-black text-slate-800">Where should we collect the waste?</h2>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                        Enter your exact pickup address in Osogbo.
                    </p>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 text-brand-primary" size={18} />
                        <input
                            type="text"
                            required
                            placeholder="e.g. No 14, Station Road, Oke-Fia, Osogbo"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                setOutOfZoneWarning(false); // Reset warning on edit
                            }}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary text-xs font-medium text-slate-800"
                        />
                    </div>

                    {/* Out-of-Zone Choices Banner (Triggers if address isn't in active clusters) */}
                    {outOfZoneWarning && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-start gap-2 text-amber-900 font-bold">
                                <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                                <p className="text-[11px] leading-tight">
                                    Your address is currently outside our primary cluster zones in Osogbo.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 pt-1">
                                {/* Choice 1: Request Special Dispatch */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAllowSpecialDispatch(true);
                                        setOutOfZoneWarning(false);
                                    }}
                                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-left hover:bg-amber-100/50 transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-black text-amber-950">Request Out-of-Zone Special Dispatch</p>
                                        <p className="text-[10px] text-amber-800 font-medium">
                                            Dispatch from nearest cluster (Oke-Fia). Distance surcharge may apply.
                                        </p>
                                    </div>
                                    <Zap size={16} className="text-amber-600 shrink-0" />
                                </button>

                                {/* Choice 2: Join Neighborhood Waitlist */}
                                <button
                                    type="button"
                                    onClick={() => setIsWaitlistOpen(true)}
                                    className="w-full p-3 bg-emerald-600 text-white rounded-xl text-left hover:bg-emerald-700 transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-black">Join Neighborhood Expansion Waitlist</p>
                                        <p className="text-[10px] text-emerald-100 font-medium">
                                            Help open a full cluster here & earn a 15% WhatsApp discount voucher!
                                        </p>
                                    </div>
                                    <Navigation size={16} className="shrink-0" />
                                </button>
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full py-3.5 font-bold text-xs">
                        {allowSpecialDispatch ? 'Proceed with Special Dispatch' : 'Continue to Service Plan'}
                    </Button>
                </form>
            </div>

            {/* Waitlist Modal Integration */}
            <WaitlistCaptureModal
                isOpen={isWaitlistOpen}
                onClose={() => setIsWaitlistOpen(false)}
                userAddress={address || 'Osogbo Neighborhood'}
            />

        </div>
    );
}