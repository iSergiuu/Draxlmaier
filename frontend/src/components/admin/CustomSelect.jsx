import React, { useState } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder, icon: Icon }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative w-full">
            <div
                className="w-full border border-brand-border rounded-lg p-2.5 text-sm bg-brand-bg text-brand-text flex items-center justify-between cursor-pointer focus:outline-none transition-colors select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {Icon && <Icon size={16} className="text-brand-muted shrink-0" />}
                    <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <svg className={`w-4 h-4 text-brand-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-brand-card border border-brand-border rounded-lg shadow-xl overflow-hidden">
                    {/* Am scos py-1 de aici care cauza acel scroll de 3 pixeli si am pus p-1 la containerul interior */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                className={`px-3 py-2 text-sm cursor-pointer rounded-md hover:bg-brand-primary/10 transition-colors select-none ${value === opt.value ? 'text-brand-primary font-medium bg-brand-primary/5' : 'text-brand-text'}`}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}