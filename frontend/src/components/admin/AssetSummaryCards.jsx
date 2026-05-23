import React from 'react';
import { Package, Laptop, Target, Smartphone, Keyboard, Mouse, Headphones, HardDrive, Monitor } from 'lucide-react';

const STATUS_COLORS = {
    AVAILABLE: '#22c55e',
    ASSIGNED: '#3b82f6',
    DEFECTIVE: '#ef4444'
};

const ALL_CATEGORIES = [
    'Laptop', 'Telefon', 'Monitor', 'Tastatura', 'Mouse', 'Casti', 'Storage', 'Altele'
];

const CAT_COLORS = [
    '#10b981', '#f59e0b', '#14b8a6', '#64748b', '#f97316', '#84cc16', '#06b6d4', '#71717a'
];

export default function AssetSummaryCards({
                                              totalAssets, availableAssetsCount, assignedAssetsCount, defectiveAssetsCount,
                                              assets, normalizeCategory
                                          }) {
    // === 1. LOGICA STATUSURI ===
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

    // === 2. LOGICA CATEGORII ===
    const categoryStats = {};
    assets.forEach(a => {
        const cat = normalizeCategory(a.category) || 'Altele';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    let currentCatAngle = 0;
    // Mapam direct din lista fixa ca sa pastram o ordine consecventa pe grafic
    const categoryGradient = ALL_CATEGORIES.map((catName, idx) => {
        const count = categoryStats[catName] || 0;
        if (count === 0 || totalAssets === 0) return '';
        const percentage = (count / totalAssets) * 360;
        const color = CAT_COLORS[idx % CAT_COLORS.length];
        const stop = `${color} ${currentCatAngle}deg ${currentCatAngle + percentage}deg`;
        currentCatAngle += percentage;
        return stop;
    }).filter(Boolean).join(', ');

    const categoryDonutBackground = totalAssets > 0 ? `conic-gradient(${categoryGradient})` : 'transparent';

    const getCategoryIcon = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('laptop')) return <Laptop size={14} className="text-emerald-500" />;
        if (cat.includes('telefon') || cat.includes('phone')) return <Smartphone size={14} className="text-amber-500" />;
        if (cat.includes('monitor')) return <Monitor size={14} className="text-teal-500" />;
        if (cat.includes('tastatura') || cat.includes('keyboard')) return <Keyboard size={14} className="text-slate-500" />;
        if (cat.includes('mouse')) return <Mouse size={14} className="text-orange-500" />;
        if (cat.includes('casti') || cat.includes('head')) return <Headphones size={14} className="text-lime-500" />;
        if (cat.includes('storage') || cat.includes('hdd') || cat.includes('ssd')) return <HardDrive size={14} className="text-cyan-500" />;
        return <Package size={14} className="text-zinc-500" />;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

            {/* CARD STANGA: STATUS */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-between col-span-1 md:col-span-2 relative">
                <div className="w-full flex justify-between items-center mb-4">
                    <h4 className="text-brand-text font-bold text-base">Status Echipamente</h4>
                    <Target size={18} className="text-brand-muted" />
                </div>

                <div className="flex items-center justify-between w-full flex-1 px-4">
                    {/* Legenda Status - Aliniata strans, nu imprastiata */}
                    <div className="flex flex-col gap-3">
                        {statusCounts.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 w-24">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-brand-text font-medium">{item.name}</span>
                                </div>
                                <span className="text-brand-text font-bold text-sm bg-brand-bg px-2 py-0.5 rounded border border-brand-border">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner shrink-0"
                        style={{ background: statusDonutBackground, border: totalAssets === 0 ? '4px solid var(--brand-border)' : 'none' }}
                    >
                        <div className="w-24 h-24 bg-brand-card rounded-full flex flex-col items-center justify-center relative z-10 border border-brand-border shadow-md">
                            <span className="text-brand-text font-bold text-4xl leading-none">{totalAssets}</span>
                            <span className="text-[10px] text-brand-muted uppercase tracking-wider mt-1.5 font-semibold">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD DREAPTA: CATEGORII (Acum pe 2 coloane, fara scroll) */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-between col-span-1 md:col-span-2 relative">
                <div className="w-full flex justify-between items-center mb-4">
                    <h4 className="text-brand-text font-bold text-base">Distributie pe Categorii</h4>
                    <Package size={18} className="text-brand-muted" />
                </div>

                <div className="flex items-center gap-6 w-full flex-1">

                    {/* Lista Categorii pe 2 coloane */}
                    <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-2">
                        {ALL_CATEGORIES.map((catName, idx) => {
                            const count = categoryStats[catName] || 0;
                            return (
                                <div key={idx} className="bg-brand-bg px-2.5 py-1.5 rounded-lg border border-brand-border text-sm flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-brand-text">
                                        {getCategoryIcon(catName)}
                                        <span className="font-medium text-brand-text text-xs">{catName}</span>
                                    </div>
                                    <span className="bg-brand-card px-1.5 py-0.5 rounded-full text-[10px] font-bold text-brand-muted border border-brand-border" style={{ color: count > 0 ? CAT_COLORS[idx % CAT_COLORS.length] : 'inherit' }}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-inner shrink-0"
                        style={{ background: categoryDonutBackground, border: totalAssets === 0 ? '4px solid var(--brand-border)' : 'none' }}
                    >
                        <div className="w-24 h-24 bg-brand-card rounded-full flex flex-col items-center justify-center relative z-10 border border-brand-border shadow-md">
                            <Laptop className="w-6 h-6 text-brand-muted mb-0.5" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}