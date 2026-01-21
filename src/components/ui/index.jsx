import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5',
        secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
        outline: 'border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600',
        ghost: 'hover:bg-slate-100 text-slate-600',
        danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5'
    };

    const sizes = {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-2 flex items-center justify-center'
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});

export const Input = React.forwardRef(({ className, icon: Icon, ...props }, ref) => {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon size={18} />
                </div>
            )}
            <input
                ref={ref}
                className={cn(
                    'flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                    Icon && 'pl-10',
                    className
                )}
                {...props}
            />
        </div>
    );
});

export const Label = React.forwardRef(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            'text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 mb-2 block uppercase tracking-wide',
            className
        )}
        {...props}
    />
));

export const Select = React.forwardRef(({ className, icon: Icon, options = [], ...props }, ref) => {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon size={18} />
                </div>
            )}
            <select
                ref={ref}
                className={cn(
                    'flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none',
                    Icon && 'pl-10',
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4"><path d="m6 9 6 6 6-6" /></svg>
            </div>
        </div>
    );
});
