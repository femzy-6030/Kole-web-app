import React from 'react';
import { cn } from '../../utils/cn';

export default function Input({ label, error, className, ...props }) {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    'w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all',
                    error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
        </div>
    );
}