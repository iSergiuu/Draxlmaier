// src/components/admin/AssetSummaryCards.jsx
import React from 'react';

export default function AssetSummaryCards({
                                              totalAssets,
                                              availableAssetsCount,
                                              assignedAssetsCount,
                                              defectiveAssetsCount,
                                              availableDeg,
                                              assignedDeg,
                                              totalComplaints,
                                              pendingComplaints,
                                              resolvedComplaints,
                                              rejectedComplaints
                                          }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex flex-row items-center justify-between">
                <div>
                    <h4 className="text-base font-bold text-brand-text mb-4">Sumar Echipamente (Total: {totalAssets})</h4>
                    <div className="space-y-3">
                        <div className="flex items-center text-sm">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-sm"></span>
                            <span className="font-medium text-brand-text mr-4 w-20">Disponibile:</span>
                            <span className="font-bold text-emerald-400">{availableAssetsCount}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 shadow-sm"></span>
                            <span className="font-medium text-brand-text mr-4 w-20">Atribuite:</span>
                            <span className="font-bold text-blue-400">{assignedAssetsCount}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-sm"></span>
                            <span className="font-medium text-brand-text mr-4 w-20">Defecte:</span>
                            <span className="font-bold text-red-400">{defectiveAssetsCount}</span>
                        </div>
                    </div>
                </div>
                {totalAssets > 0 ? (
                    <div
                        className="w-28 h-28 rounded-full relative flex-shrink-0 shadow-inner"
                        style={{ background: `conic-gradient(#10b981 0deg ${availableDeg}deg, #3b82f6 ${availableDeg}deg ${availableDeg + assignedDeg}deg, #ef4444 ${availableDeg + assignedDeg}deg 360deg)` }}
                    >
                        <div className="absolute inset-4 bg-brand-card rounded-full"></div>
                    </div>
                ) : (
                    <div className="w-28 h-28 rounded-full bg-brand-bg border-[16px] border-brand-border flex-shrink-0"></div>
                )}
            </div>

            <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex flex-col justify-center">
                <h4 className="text-base font-bold text-brand-text mb-4">Istoric Plangeri (Total: {totalComplaints})</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-brand-bg rounded-lg border border-brand-border text-center">
                        <p className="text-xs text-brand-muted mb-1 font-medium">In asteptare</p>
                        <p className="text-2xl font-bold text-yellow-400">{pendingComplaints}</p>
                    </div>
                    <div className="p-4 bg-brand-bg rounded-lg border border-brand-border text-center">
                        <p className="text-xs text-brand-muted mb-1 font-medium">Rezolvate</p>
                        <p className="text-2xl font-bold text-emerald-400">{resolvedComplaints}</p>
                    </div>
                    <div className="p-4 bg-brand-bg rounded-lg border border-brand-border text-center">
                        <p className="text-xs text-brand-muted mb-1 font-medium">Respinse</p>
                        <p className="text-2xl font-bold text-red-400">{rejectedComplaints}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}