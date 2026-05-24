import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
    success: <CheckCircle size={18} className="text-green-400 shrink-0" />,
    error:   <XCircle size={18} className="text-red-400 shrink-0" />,
    warning: <AlertCircle size={18} className="text-amber-400 shrink-0" />,
    info:    <Info size={18} className="text-blue-400 shrink-0" />,
};

const BORDERS = {
    success: 'border-green-500/30',
    error:   'border-red-500/30',
    warning: 'border-amber-500/30',
    info:    'border-blue-500/30',
};

export default function Toast({ toasts, onRemove }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
            {toasts.map(t => (
                <div key={t.id}
                    className={`flex items-center gap-3 bg-brand-card border ${BORDERS[t.type] || BORDERS.info} rounded-xl px-4 py-3 shadow-xl min-w-[280px] max-w-sm
                    animate-in slide-in-from-bottom-4 fade-in duration-200`}>
                    {ICONS[t.type] || ICONS.info}
                    <span className="text-sm text-brand-text flex-1">{t.message}</span>
                    <button onClick={() => onRemove(t.id)} className="text-brand-muted hover:text-brand-text transition-colors">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}