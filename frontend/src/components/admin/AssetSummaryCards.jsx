import React from 'react';
import { Package, Laptop, Target } from 'lucide-react';

// Culori corporative pentru statusuri (Verde, Albastru, Rosu)
const STATUS_COLORS = {
    AVAILABLE: '#22c55e', // Green 500
    ASSIGNED: '#3b82f6',  // Blue 500
    DEFECTIVE: '#ef4444'  // Red 500
};

// Paleta de culori pentru categorii (8 culori distincte)
const CAT_COLORS = [
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#64748b'  // Slate
];

export default function AssetSummaryCards({
                                              totalAssets, availableAssetsCount, assignedAssetsCount, defectiveAssetsCount,
                                              assets, normalizeCategory
                                          }) {
    // === 1. LOGICA PENTRU GRAFICUL DE STATUSURI (Stanga) ===
    const statusCounts = [
        { name: 'Disponibile', value: availableAssetsCount, color: STATUS_COLORS.AVAILABLE },
        { name: 'Atribuite', value: assignedAssetsCount, color: STATUS_COLORS.ASSIGNED },
        { name: 'Defecte', value: defectiveAssetsCount, color: STATUS_COLORS.DEFECTIVE },
    ];

    let currentStatusAngle = 0;
    const statusGradient = statusCounts.map(item => {
        if (item.value === 0 || totalAssets === 0) return '';
        const percentage = (item.value / totalAssets) * 360;
        const stop = `${item.color} ${currentStatusAngle}deg ${currentStatusAngle + percentage}deg`;
        currentStatusAngle += percentage;
        return stop;
    }).filter(Boolean).join(', ');

    const statusDonutBackground = totalAssets > 0 ? `conic-gradient(${statusGradient})` : 'transparent';

    // === 2. LOGICA PENTRU GRAFICUL DE CATEGORII (Dreapta - adaugat inapoi conform schitei) ===
    const categoryStats = {};
    assets.forEach(a => {
        const cat = normalizeCategory(a.category) || 'Altele';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    const catArray = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

    let currentCatAngle = 0;
    const categoryGradient = catArray.map((cat, idx) => {
        if (cat[1] === 0 || totalAssets === 0) return '';
        const percentage = (cat[1] / totalAssets) * 360;
        const color = CAT_COLORS[idx % CAT_COLORS.length];
        const stop = `${color} ${currentCatAngle}deg ${currentCatAngle + percentage}deg`;
        currentCatAngle += percentage;
        return stop;
    }).filter(Boolean).join(', ');

    const categoryDonutBackground = totalAssets > 0 ? `conic-gradient(${categoryGradient})` : 'transparent';

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

            {/* CARD STANGA: STATUS (Cu Pie Chart si TOTAL mare in centru - conform schitei tale) */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-between col-span-1 md:col-span-2 relative">
                <div className="w-full flex justify-between items-center mb-4">
                    <h4 className="text-brand-text font-bold text-base">Status Echipamente</h4>
                    <Target size={18} className="text-brand-muted" />
                </div>

                <div className="flex items-center gap-6 w-full flex-1">
                    {/* Donut Chart Status */}
                    <div
                        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner shrink-0"
                        style={{ background: statusDonutBackground, border: totalAssets === 0 ? '4px solid var(--brand-border)' : 'none' }}
                    >
                        {/* Centrul cercului: Afiseaza numarul TOTAL mare (cum ai desenat) */}
                        <div className="w-24 h-24 bg-brand-card rounded-full flex flex-col items-center justify-center relative z-10 border border-brand-border shadow-md">
                            <span className="text-brand-text font-bold text-4xl leading-none">{totalAssets}</span>
                            <span className="text-[10px] text-brand-muted uppercase tracking-wider mt-1.5 font-semibold">Total</span>
                        </div>
                    </div>

                    {/* Legenda Status */}
                    <div className="flex-1 space-y-2.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                        {statusCounts.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-brand-text font-medium">{item.name}</span>
                                </div>
                                <span className="text-brand-muted font-bold text-xs">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CARD DREAPTA: CATEGORII (Adaugat inapoi, tot cu Pie Chart - conform schitei tale) */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-between col-span-1 md:col-span-2 relative">
                <div className="w-full flex justify-between items-center mb-4">
                    <h4 className="text-brand-text font-bold text-base">Distribuție pe Categorii</h4>
                    <Package size={18} className="text-brand-muted" />
                </div>

                <div className="flex items-center gap-6 w-full flex-1">
                    {/* Donut Chart Categorii */}
                    <div
                        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner shrink-0"
                        style={{ background: categoryDonutBackground, border: totalAssets === 0 ? '4px solid var(--brand-border)' : 'none' }}
                    >
                        <div className="w-24 h-24 bg-brand-card rounded-full flex flex-col items-center justify-center relative z-10 border border-brand-border shadow-md">
                            <Laptop className="w-6 h-6 text-brand-muted mb-0.5" />
                        </div>
                    </div>

                    {/* Legenda Categorii */}
                    <div className="flex-1 space-y-2.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                        {catArray.map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CAT_COLORS[idx % CAT_COLORS.length] }}></span>
                                    <span className="text-brand-text font-medium">{cat[0]}</span>
                                </div>
                                <span className="text-brand-muted font-bold text-xs">{cat[1]}</span>
                            </div>
                        ))}
                        {catArray.length === 0 && (
                            <p className="text-brand-muted text-sm italic py-2">Fara categorii.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}