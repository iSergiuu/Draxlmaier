import React from 'react';
import { X, Save, Trash2, Edit2, AlertCircle } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function AssetDetailsModal({
                                              selectedAsset, setSelectedAsset,
                                              isEditing, setIsEditing,
                                              editData, setEditData, onDeleteRequest,
                                              categoriesList, isDefective, getAssignee,
                                              getCategoryIcon, handleUpdateAsset, handleDeleteAsset,
                                              assignEmail, setAssignEmail, handleEmailInput,
                                              showEmailSuggestions, setShowEmailSuggestions, filteredEmails,
                                              handleAssignAsset, complaints,
                                              // Prop-uri noi pentru Edit Mode Suggestions
                                              handleEditEmailInput, showEditEmailSuggestions,
                                              setShowEditEmailSuggestions, filteredEditEmails
                                          }) {
    if (!selectedAsset) return null;

    const currentStatus = isDefective(selectedAsset.id) ? 'DEFECTIVE' : getAssignee(selectedAsset) ? 'ASSIGNED' : 'AVAILABLE';
    const assigneeEmail = getAssignee(selectedAsset);

    const assetComplaints = complaints.filter(c => c.assetId === selectedAsset.id || c.asset_id === selectedAsset.id);
    const complaintCounts = assetComplaints.reduce((acc, curr) => {
        const status = curr.statusCode || curr.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const getComplaintColor = (status) => {
        const s = status.toUpperCase();
        if (['NEW', 'OPEN'].includes(s)) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if (['PENDING', 'IN_PROGRESS', 'REVIEW'].includes(s)) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        if (['RESOLVED', 'CLOSED'].includes(s)) return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (['REJECTED'].includes(s)) return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedAsset(null); setIsEditing(false); }}></div>

            <div className="relative bg-brand-card w-full max-w-lg rounded-2xl shadow-xl border border-brand-border flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text flex items-center gap-3">
                        <div className="p-2 bg-brand-bg rounded-lg border border-brand-border text-brand-primary">
                            {getCategoryIcon(selectedAsset.category)}
                        </div>
                        {isEditing ? 'Editeaza Echipament' : 'Detalii Echipament'}
                    </h3>
                    <button onClick={() => { setSelectedAsset(null); setIsEditing(false); }} className="text-brand-muted hover:text-brand-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-visible space-y-6">
                    {!isEditing ? (
                        <>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Nume Echipament</label>
                                    <p className="text-brand-text font-medium mt-1 text-base">{selectedAsset.name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Serial Number</label>
                                    <p className="text-brand-text font-medium mt-1 text-base">{selectedAsset.serialNumber || selectedAsset.serial_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Categorie</label>
                                    <p className="text-brand-text font-medium mt-1">{selectedAsset.category || 'Nespecificat'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Stare Curenta</label>
                                    <div className="mt-1">
                                        {currentStatus === 'DEFECTIVE' ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Defect</span> :
                                            currentStatus === 'ASSIGNED' ? <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">Atribuit</span> :
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">Disponibil</span>}
                                    </div>
                                </div>
                            </div>

                            {/* DACA E ATRIBUIT - Aratam doar textul, simplu */}
                            {currentStatus === 'ASSIGNED' && assigneeEmail && (
                                <div className="bg-brand-bg/50 p-4 rounded-lg border border-brand-border">
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2 block">Utilizator Atribuit</label>
                                    <p className="text-sm font-medium text-brand-primary truncate">{assigneeEmail}</p>
                                </div>
                            )}

                            {/* DACA E DISPONIBIL - Aratam campul de Alocare Rapida */}
                            {currentStatus === 'AVAILABLE' && (
                                <div className="bg-brand-bg/50 p-4 rounded-lg border border-brand-border">
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2 block">Alocare Rapida</label>
                                    <div className="flex gap-2 items-start relative">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Cauta email-ul angajatului..."
                                                value={assignEmail}
                                                onChange={handleEmailInput}
                                                className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                                            />
                                            {showEmailSuggestions && filteredEmails.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-brand-card border border-brand-border rounded-lg shadow-lg overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                                                    {filteredEmails.map(emp => (
                                                        <div
                                                            key={emp.id}
                                                            onClick={() => { setAssignEmail(emp.email); setShowEmailSuggestions(false); }}
                                                            className="px-3 py-2 text-sm hover:bg-brand-primary/10 cursor-pointer text-brand-text transition-colors"
                                                        >
                                                            {emp.email}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={handleAssignAsset}
                                            className="px-4 py-2.5 bg-brand-primary hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                        >
                                            Atribuie
                                        </button>
                                    </div>
                                </div>
                            )}

                            {Object.keys(complaintCounts).length > 0 && (
                                <div className="border-t border-brand-border pt-5">
                                    <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1 mb-3">
                                        <AlertCircle size={14} className="text-orange-500" /> Plangeri Asociate ({assetComplaints.length})
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(complaintCounts).map(([status, count]) => (
                                            <div key={status} className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-2 ${getComplaintColor(status)}`}>
                                                <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                                                <span className="font-bold">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                    <input type="text" value={editData.serialNumber} onChange={(e) => setEditData({...editData, serialNumber: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors" />
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
                                    onChange={(val) => {
                                        // Logica: Daca schimbi pe Disponibil sau Defect, emailul se sterge.
                                        setEditData({
                                            ...editData,
                                            status: val,
                                            userEmail: (val === 'AVAILABLE' || val === 'DEFECTIVE') ? '' : editData.userEmail
                                        });
                                    }}
                                    options={[
                                        {value: 'AVAILABLE', label: 'Disponibil'},
                                        {value: 'ASSIGNED', label: 'Atribuit'},
                                        {value: 'DEFECTIVE', label: 'Defect'}
                                    ]}
                                />

                                {/* Campul de email mereu prezent, dar se comporta inteligent */}
                                <div className="mt-3 relative">
                                    <input
                                        type="text"
                                        disabled={editData.status === 'DEFECTIVE'}
                                        placeholder={editData.status === 'DEFECTIVE' ? 'Indisponibil pentru echipamente defecte' : 'Scrie email-ul angajatului...'}
                                        value={editData.status === 'DEFECTIVE' ? '' : editData.userEmail}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // Logica: Daca scrii in camp, statusul sare automat pe ASSIGNED
                                            setEditData({
                                                ...editData,
                                                userEmail: val,
                                                status: val.length > 0 ? 'ASSIGNED' : editData.status
                                            });
                                            handleEditEmailInput(val);
                                        }}
                                        className={`w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary transition-colors ${editData.status === 'DEFECTIVE' ? 'opacity-50 cursor-not-allowed bg-brand-bg/50' : ''}`}
                                    />

                                    {showEditEmailSuggestions && filteredEditEmails.length > 0 && editData.status !== 'DEFECTIVE' && (
                                        <div className="absolute z-50 w-full mt-1 bg-brand-card border border-brand-border rounded-lg shadow-lg overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                                            {filteredEditEmails.map(emp => (
                                                <div
                                                    key={emp.id}
                                                    onClick={() => {
                                                        setEditData({...editData, userEmail: emp.email, status: 'ASSIGNED'});
                                                        setShowEditEmailSuggestions(false);
                                                    }}
                                                    className="px-3 py-2 text-sm hover:bg-brand-primary/10 cursor-pointer text-brand-text transition-colors"
                                                >
                                                    {emp.email}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-brand-border bg-brand-bg/50 rounded-b-2xl flex justify-between items-center mt-auto">
                    {!isEditing ? (
                        <>
                            <button onClick={onDeleteRequest} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition flex items-center gap-1.5 text-sm font-medium">
                                <Trash2 size={16} /> Sterge
                            </button>
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm hover:opacity-90 transition flex items-center gap-2 font-medium shadow-sm">
                                <Edit2 size={16} /> Editeaza
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex justify-end gap-3">
                            <button onClick={() => { setIsEditing(false); setEditData({...editData, status: currentStatus, userEmail: assigneeEmail || ''}); setShowEditEmailSuggestions(false); }} className="px-4 py-2 border border-brand-border text-brand-text rounded-lg text-sm hover:bg-brand-bg transition">
                                Anuleaza
                            </button>
                            <button onClick={handleUpdateAsset} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2 font-medium shadow-sm">
                                <Save size={16} /> Salveaza
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}