// src/components/admin/AssetList.jsx
import React from 'react';

export default function AssetList({ filteredAssets, setSelectedAsset, isDefective, getAssignee, getCategoryIcon }) {
    return (
        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden">
            {filteredAssets.length === 0 ? (
                <div className="p-8 text-center text-brand-muted">Niciun echipament gasit conform filtrelor.</div>
            ) : (
                <ul className="divide-y divide-brand-border">
                    {filteredAssets.map((asset) => {
                        const isDefect = isDefective(asset.id);
                        const assignee = getAssignee(asset);

                        return (
                            <li key={asset.id} onClick={() => setSelectedAsset(asset)} className="p-4 hover:bg-black/5 cursor-pointer flex items-center justify-between transition-colors">
                                <div className="flex items-center">
                                    <div className="mr-4 p-2 bg-brand-bg rounded-lg border border-brand-border">{getCategoryIcon(asset.category)}</div>
                                    <div>
                                        <h4 className="text-md font-semibold text-brand-text">{asset.name}</h4>
                                        <p className="text-sm text-brand-muted font-mono">{asset.serialNumber || asset.serial_number}</p>
                                    </div>
                                </div>
                                <div>
                                    {isDefect ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-900/20 text-red-400 border-red-900">Defect</span>
                                    ) : assignee ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-900/20 text-blue-400 border-blue-900">Atribuit</span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-900/20 text-emerald-400 border-emerald-900">Disponibil</span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}