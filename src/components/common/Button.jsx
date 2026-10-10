import React from 'react';
import { cn } from '../../utils/cn';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    isLoading,
    disabled,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-60 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-brand-primary text-white hover:bg-brand-hover shadow-sm',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
        outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                </span>
            ) : children}
        </button>
    );
}