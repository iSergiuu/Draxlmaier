import React from 'react';
import { UserCheck, Clock } from 'lucide-react';

export default function EmployeeSummaryCards({ totalEmployees, activeCount, generatedCount, deptStats }) {
    // Calculăm gradientul pentru graficul rotund bazat pe departamente
    let currentAngle = 0;
    const gradientStops = deptStats.map(stat => {
        if (stat.count === 0 || totalEmployees === 0) return '';
        const percentage = (stat.count / totalEmployees) * 360;
        const stop = `${stat.hex} ${currentAngle}deg ${currentAngle + percentage}deg`;
        currentAngle += percentage;
        return stop;
    }).filter(Boolean).join(', ');

    const donutBackground = totalEmployees > 0 ? `conic-gradient(${gradientStops})` : 'transparent';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
                <div className="flex-1 pr-4">
                    <h4 className="text-brand-text font-bold mb-3">Distribuție pe Departamente</h4>
                    <div className="flex flex-wrap gap-2">
                        {deptStats.filter(s => s.count > 0).map((stat, idx) => (
                            <div key={idx} className={`px-2 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 ${stat.class}`}>
                                <span>{stat.name}</span>
                                <span className="bg-brand-bg/60 px-1.5 py-0.5 rounded text-[10px]">{stat.count}</span>
                            </div>
                        ))}
                        {deptStats.every(s => s.count === 0) && (
                            <span className="text-brand-muted text-sm">Niciun angajat înregistrat.</span>
                        )}
                    </div>
                </div>

                {/* Graficul Rotund (Donut Chart) */}
                <div
                    className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner shrink-0"
                    style={{ background: donutBackground, border: totalEmployees === 0 ? '4px solid var(--brand-border)' : 'none' }}
                >
                    <div className="w-16 h-16 bg-brand-card rounded-full flex flex-col items-center justify-center relative z-10">
                        <span className="text-brand-text font-bold text-lg leading-none">{totalEmployees}</span>
                        <span className="text-[10px] text-brand-muted uppercase">Total</span>
                    </div>
                </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex items-center col-span-1">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500"><UserCheck className="w-8 h-8" /></div>
                <div className="ml-4">
                    <p className="text-brand-muted text-sm font-medium">Conturi Active</p>
                    <h4 className="text-2xl font-bold text-brand-text">{activeCount}</h4>
                </div>
            </div>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex items-center col-span-1">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500"><Clock className="w-8 h-8" /></div>
                <div className="ml-4">
                    <p className="text-brand-muted text-sm font-medium">Conturi Generate</p>
                    <h4 className="text-2xl font-bold text-brand-text">{generatedCount}</h4>
                </div>
            </div>
        </div>
    );
}