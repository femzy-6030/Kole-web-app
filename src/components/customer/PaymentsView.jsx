// src/components/customer/PaymentsView.jsx
import React from 'react';
import { Receipt, CheckCircle2, CreditCard } from 'lucide-react';

export default function PaymentsView({ jobs }) {
    return (
        <div className="space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment History & Ledger</span>
                <div className="text-3xl font-black text-brand-accent">₦0.00</div>
                <p className="text-xs text-slate-300">Total spent on zero-cost public pickup services.</p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Transaction Receipts</h3>
                {jobs.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No completed pickup transactions yet.</p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {jobs.map((job) => (
                            <div key={job.id} className="py-3 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                        <Receipt size={14} className="text-brand-primary" />
                                        <span className="text-xs font-black text-slate-800">#{job.id}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">{job.address}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-brand-primary">₦{(job.customerFee || 0).toFixed(2)}</span>
                                    <p className="text-[10px] text-emerald-600 font-bold">Paid / Zero-Cost</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}