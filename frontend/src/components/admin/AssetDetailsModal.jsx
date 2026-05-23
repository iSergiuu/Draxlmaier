import React from 'react';
import { X, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function AssetDetailsModal({
                                              selectedAsset, setSelectedAsset,
                                              isEditing, setIsEditing,
                                              editData, setEditData,
                                              categoriesList, isDefective, getAssignee,
                                              getCategoryIcon, handleUpdateAsset, handleDeleteAsset,
                                              assignEmail, setAssignEmail, handleEmailInput,
                                              showEmailSuggestions, setShowEmailSuggestions, filteredEmails,
                                              handleAssignAsset, complaints
                                          }) {
    if (!selectedAsset) return null;

    const currentStatus = isDefective(selectedAsset.id) ? 'DEFECTIVE' : getAssignee(selectedAsset) ? 'ASSIGNED' : 'AVAILABLE';
    const assigneeEmail = getAssignee(selectedAsset);

    // Calculăm Plângerile pentru acest asset strict pe baza la ce exista in DB
    const assetComplaints = complaints.filter(c => c.assetId === selectedAsset.id || c.asset_id === selectedAsset.id);
    const complaintCounts = assetComplaints.reduce((acc, curr) => {
        const status = curr.statusCode || curr.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedAsset(null); setIsEditing(false); }}></div>

            <div className="relative bg-brand-card w-full max-w-lg rounded-2xl shadow-xl border border-brand-border flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text flex items-center gap-3">
                        <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                            {getCategoryIcon(selectedAsset.category)}
                        </div>
                        {isEditing ? 'Editează Echipament' : 'Detalii Echipament'}
                    </h3>
                    <button onClick={() => { setSelectedAsset(null); setIsEditing(false); }} className="text-brand-muted hover:text-brand-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {!isEditing ? (
                        <>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Nume Echipament</label>
                                    <p className="text-brand-text font-medium mt-1 text-base">{selectedAsset.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Serial Number</label>
                                    <p className="text-brand-text font-mono mt-1 text-sm bg-brand-bg/60 p-2 rounded border border-brand-border">{selectedAsset.serialNumber || selectedAsset.serial_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Categorie</label>
                                    <p className="text-brand-text font-medium mt-1">{selectedAsset.category || 'Nespecificat'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Stare Curentă</label>
                                    <div className="mt-1">
                                        {currentStatus === 'DEFECTIVE' ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Defect / Service</span> :
                                            currentStatus === 'ASSIGNED' ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">Atribuit</span> :
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Disponibil</span>}
                                    </div>
                                </div>
                            </div>

                            {assigneeEmail && (
                                <div className="bg-brand-bg/50 p-4 rounded-lg border border-brand-border">
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2 block">Utilizator Atribuit</label>
                                    <p className="text-sm font-medium text-brand-primary truncate">{assigneeEmail}</p>
                                </div>
                            )}

                            {/* Istoric Plangeri Dinamic */}
                            <div className="border-t border-brand-border pt-5">
                                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1 mb-3">
                                    <AlertCircle size={14} className="text-orange-500" /> Plângeri Asociate ({assetComplaints.length})
                                </label>
                                {Object.keys(complaintCounts).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(complaintCounts).map(([status, count]) => (
                                            <div key={status} className="bg-brand-bg px-2.5 py-1.5 rounded border border-brand-border text-xs flex items-center gap-2">
                                                <span className="text-brand-muted capitalize">{status.replace('_', ' ')}</span>
                                                <span className="font-bold text-brand-text">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-brand-muted bg-brand-bg/50 px-3 py-2 rounded italic">Acest echipament nu are plângeri înregistrate.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Nume Echipament</label>
                                <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Serial Number</label>
                                    <input type="text" value={editData.serialNumber} onChange={(e) => setEditData({...editData, serialNumber: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:border-brand-primary transition-colors" />
                                </div>
                                <div className="relative z-50">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Categorie</label>
                                    <CustomSelect value={editData.category} onChange={(val) => setEditData({...editData, category: val})} options={categoriesList.map(c => ({value: c, label: c}))} placeholder="Alege..." />
                                </div>
                            </div>
                            <div className="relative z-40 border-t border-brand-border pt-4 mt-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Stare / Atribuire</label>
                                <CustomSelect
                                    value={editData.status}
                                    onChange={(val) => setEditData({...editData, status: val, userEmail: val !== 'ASSIGNED' ? '' : editData.userEmail})}
                                    options={[ {value: 'AVAILABLE', label: 'Disponibil'}, {value: 'ASSIGNED', label: 'Atribuit Angajat'}, {value: 'DEFECTIVE', label: 'Defect / Service'} ]}
                                />
                                {editData.status === 'ASSIGNED' && (
                                    <div className="mt-3 relative">
                                        <input type="text" placeholder="Scrie email-ul angajatului..." value={editData.userEmail} onChange={(e) => setEditData({...editData, userEmail: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-brand-border bg-brand-bg/50 rounded-b-2xl flex justify-between items-center">
                    {!isEditing ? (
                        <>
                            <button onClick={handleDeleteAsset} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition flex items-center gap-1.5 text-sm font-medium">
                                <Trash2 size={16} /> Șterge
                            </button>
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm hover:opacity-90 transition flex items-center gap-2 font-medium shadow-sm">
                                <Edit2 size={16} /> Editează
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex justify-end gap-3">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-brand-border text-brand-text rounded-lg text-sm hover:bg-brand-bg transition">
                                Anulează
                            </button>
                            <button onClick={handleUpdateAsset} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2 font-medium shadow-sm">
                                <Save size={16} /> Salvează
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}