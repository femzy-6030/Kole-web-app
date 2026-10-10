import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Save, ShieldAlert } from 'lucide-react';

export default function PricingControls() {
    const [pricing, setPricing] = useState({
        baseCustomerFee: '0.00',
        fixedServiceFee: '0.00',
        largeVolumeSurcharge: '0.00',
    });

    const [isSaved, setIsSaved] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div>
                <h2 className="text-lg font-black text-slate-800">Dynamic Pricing & Fee Rules</h2>
                <p className="text-xs text-slate-500">Configure baseline pickup costs and collector fixed service fees.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Base Customer Pickup Fee (₦)"
                        type="number"
                        step="0.01"
                        value={pricing.baseCustomerFee}
                        onChange={(e) => setPricing({ ...pricing, baseCustomerFee: e.target.value })}
                    />

                    <Input
                        label="Platform Fixed Service Fee (₦)"
                        type="number"
                        step="0.01"
                        value={pricing.fixedServiceFee}
                        onChange={(e) => setPricing({ ...pricing, fixedServiceFee: e.target.value })}
                    />

                    <Input
                        label="Large Volume Surcharge (₦)"
                        type="number"
                        step="0.01"
                        value={pricing.largeVolumeSurcharge}
                        onChange={(e) => setPricing({ ...pricing, largeVolumeSurcharge: e.target.value })}
                    />
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-xs text-brand-primary font-bold">
                    <ShieldAlert size={18} />
                    <span>Setting Base Pickup Fee to ₦0.00 maintains zero-cost public service mode across all clusters.</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button type="submit" className="flex items-center gap-2">
                        <Save size={16} /> Save Pricing Rules
                    </Button>
                    {isSaved && <span className="text-xs font-bold text-emerald-600 animate-in fade-in">Rules updated!</span>}
                </div>
            </form>
        </div>
    );
}