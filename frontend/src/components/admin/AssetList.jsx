import React from 'react';
import { AlertTriangle, User, Folder, Mail } from 'lucide-react';

export default function AssetList({
                                      filteredAssets, setSelectedAsset, isDefective, getAssignee, getCategoryIcon, normalizeCategory, complaints
                                  }) {
    return (
        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden transition-colors duration-300 relative z-0">
            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                <tr className="bg-brand-bg/50 border-b border-brand-border text-brand-muted text-xs font-semibold uppercase tracking-wider transition-colors duration-300">
                    <th className="p-4 w-[20%]">Categorie</th>
                    <th className="p-4 w-[30%]">Identificator / Nume</th>
                    <th className="p-4 w-[15%]">Plangeri</th>
                    <th className="p-4 w-[20%]">Email Detinator</th>
                    <th className="p-4 w-[15%] text-right">Status</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-sm transition-colors duration-300">
                {filteredAssets.map(asset => {
                    const defective = isDefective(asset.id);
                    const assigneeEmail = getAssignee(asset);

                    const assetCat = normalizeCategory(asset.category) || 'Nespecificat';
                    const complaintsCount = complaints.filter(c => c.assetId === asset.id || c.asset_id === asset.id).length;

                    return (
                        <tr
                            key={asset.id}
                            onClick={() => setSelectedAsset(asset)}
                            className="hover:bg-brand-bg/30 transition-colors cursor-pointer group"
                        >
                            {/* COLOANA 1: Categorie */}
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-brand-bg rounded-lg border border-brand-border text-brand-primary group-hover:border-brand-primary/30 transition-colors shrink-0">
                                        {getCategoryIcon(asset.category)}
                                    </div>
                                    <div className="font-semibold text-brand-text truncate group-hover:text-brand-primary transition-colors">{assetCat}</div>
                                </div>
                            </td>

                            {/* COLOANA 2: Identificator */}
                            <td className="p-4">
                                <div className="font-medium text-brand-text truncate leading-tight">{asset.name}</div>
                                <div className="text-brand-muted text-xs font-mono mt-1 px-1.5 py-0.5 rounded bg-brand-bg/70 border border-brand-border inline-block">
                                    SN: {asset.serialNumber || asset.serial_number || 'N/A'}
                                </div>
                            </td>

                            {/* COLOANA 3: Plangeri */}
                            <td className="p-4">
                                    <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 py-1 text-xs font-bold border rounded-full ${complaintsCount > 0 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-brand-bg text-brand-muted border-brand-border'}`}>
                                        {complaintsCount}
                                    </span>
                            </td>

                            {/* COLOANA 4: Email Detinator (Acum are iconita Mail importata corect) */}
                            <td className="p-4">
                                {assigneeEmail ? (
                                    <div className="flex items-center gap-2 text-xs text-brand-primary font-medium" title={assigneeEmail}>
                                        <Mail size={12} className="shrink-0" />
                                        <span className="truncate max-w-[180px]">{assigneeEmail}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-brand-muted italic bg-brand-bg/50 px-2 py-0.5 rounded">Neatribuit</span>
                                )}
                            </td>

                            {/* COLOANA 5: Status */}
                            <td className="p-4 text-right">
                                {defective ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                            <AlertTriangle size={12} /> Defect
                                        </span>
                                ) : assigneeEmail ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            Atribuit
                                        </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                            Disponibil
                                        </span>
                                )}
                            </td>
                        </tr>
                    );
                })}
                {filteredAssets.length === 0 && (
                    <tr>
                        <td colSpan="5" className="text-center p-8 text-brand-muted italic">
                            Nu s-au gasit echipamente conform filtrelor selectate.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}