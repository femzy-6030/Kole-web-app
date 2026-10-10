import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function CollectorFeedHeader({ clusterName }) {
    return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-brand-primary text-white text-[10px] font-bold uppercase rounded-full">
                    <ShieldAlert size={12} />
                    Cluster Safety Notice
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{clusterName} Zone</span>
            </div>

            <h3 className="text-sm font-black leading-snug text-slate-100">
                Mandatory Proof Photo Required on All Completed Pickups
            </h3>
            <p className="text-xs text-slate-400">
                Upload a clear camera photo of the cleared site before completing jobs to release wallet credits[cite: 1, 2].
            </p>
        </div>
    );
}