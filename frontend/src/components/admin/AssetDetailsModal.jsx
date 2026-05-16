// src/components/admin/AssetDetailsModal.jsx
import React, { useState } from 'react';
import { X, Check, Trash2, Edit2 } from 'lucide-react';

export default function AssetDetailsModal({
                                              selectedAsset,
                                              setSelectedAsset,
                                              isEditing,
                                              setIsEditing,
                                              editData,
                                              setEditData,
                                              categoriesList,
                                              normalizeCategory,
                                              isDefective,
                                              getAssignee,
                                              getCategoryIcon,
                                              handleUpdateAsset,
                                              handleDeleteAsset,
                                              assignEmail,
                                              setAssignEmail,
                                              handleEmailInput,
                                              showEmailSuggestions,
                                              setShowEmailSuggestions,
                                              filteredEmails,
                                              handleAssignAsset,
                                              employees,
                                              complaints // Noul prop pentru istoric
                                          }) {
    const [showEditSuggestions, setShowEditSuggestions] = useState(false);

    if (!selectedAsset) return null;

    const isDefect = isDefective(selectedAsset.id);
    const assignee = getAssignee(selectedAsset);

    const filteredEditEmails = (editData?.userEmail && employees)
        ? employees.filter(emp => emp.email && emp.email.toLowerCase().includes(editData.userEmail.toLowerCase()))
        : [];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200">
                <div className="bg-brand-bg border-b border-brand-border p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-brand-text flex items-center">
                        {getCategoryIcon(selectedAsset.category)}
                        <span className="ml-2">{isEditing ? 'Editeaza Echipament' : 'Detalii Echipament'}</span>
                    </h3>
                    <button onClick={() => setSelectedAsset(null)} className="text-brand-muted hover:text-red-500 p-1"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5">
                    {!isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2"><p className="text-sm text-brand-muted">Nume</p><p className="font-semibold text-brand-text text-lg">{selectedAsset.name}</p></div>
                            <div><p className="text-sm text-brand-muted">S/N</p><p className="font-mono text-brand-text">{selectedAsset.serialNumber || selectedAsset.serial_number}</p></div>
                            <div><p className="text-sm text-brand-muted">Categorie</p><p className="text-brand-text">{normalizeCategory(selectedAsset.category)}</p></div>

                            {/* SECTIUNEA DE STATUS RESTRUCTURATA */}
                            <div className="col-span-2 pt-2 mt-2 border-t border-brand-border">
                                <p className="text-sm text-brand-muted mb-2">Status Echipament</p>

                                {isDefect ? (
                                    <div className="flex items-center">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-900/20 text-red-400 border-red-900">Defect</span>
                                    </div>
                                ) : assignee ? (
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-900/20 text-blue-400 border-blue-900">Atribuit</span>
                                        <span className="text-white font-medium text-sm">{assignee}</span>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-brand-bg rounded-xl border border-brand-border mt-2">
                                        <p className="text-sm text-emerald-400 font-medium mb-3 flex items-center"><Check className="w-4 h-4 mr-1"/> Echipament Disponibil</p>
                                        <label className="text-xs text-brand-muted mb-1 block">Cauta angajat pentru atribuire rapida (apasa Tab pentru autocompletare):</label>
                                        <div className="flex gap-2 relative">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Scrie email..."
                                                    value={assignEmail}
                                                    onChange={handleEmailInput}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Tab' && filteredEmails.length > 0) {
                                                            e.preventDefault();
                                                            setAssignEmail(filteredEmails[0].email);
                                                            setShowEmailSuggestions(false);
                                                        }
                                                    }}
                                                    onFocus={() => assignEmail && setShowEmailSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)}
                                                    className="w-full bg-brand-card border border-brand-border rounded p-2 text-sm text-brand-text focus:outline-brand-primary"
                                                />
                                                {showEmailSuggestions && filteredEmails.length > 0 && (
                                                    <ul className="absolute z-10 w-full mt-1 bg-brand-card border border-brand-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                        {filteredEmails.map(emp => (
                                                            <li key={emp.id} onClick={() => { setAssignEmail(emp.email); setShowEmailSuggestions(false); }} className="p-2 text-sm text-brand-text hover:bg-brand-bg cursor-pointer border-b border-brand-border last:border-0">{emp.email}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <button onClick={handleAssignAsset} className="bg-brand-primary text-white px-4 py-2 rounded hover:opacity-90 transition-opacity text-sm font-medium">Aloca</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ISTORIC PLANGERI */}
                            {(() => {
                                // Filtram plangerile pentru echipamentul curent
                                const assetComplaints = complaints?.filter(c => c.assetId === selectedAsset.id || c.asset_id === selectedAsset.id) || [];
                                const getStatusCount = (statusName) => assetComplaints.filter(c => c.status === statusName || c.status?.code === statusName).length;

                                return (
                                    <div className="col-span-2 pt-4 mt-2 border-t border-brand-border">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-sm font-medium text-brand-text">Istoric Plangeri ({assetComplaints.length})</p>
                                            {assetComplaints.length > 0 && (
                                                <a href={`/admin/complaints?search=${selectedAsset.serialNumber || selectedAsset.serial_number}`} className="text-xs text-brand-primary hover:underline">
                                                    Vezi toate
                                                </a>
                                            )}
                                        </div>
                                        {assetComplaints.length === 0 ? (
                                            <p className="text-xs text-brand-muted bg-brand-bg p-3 rounded-lg border border-brand-border text-center">Nu exista plangeri inregistrate pentru acest echipament.</p>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                <div className="bg-brand-bg p-2 rounded-lg border border-brand-border text-center flex flex-col justify-center"><p className="text-[10px] text-brand-muted mb-1 font-medium">NEW</p><p className="font-bold text-blue-400">{getStatusCount('NEW')}</p></div>
                                                <div className="bg-brand-bg p-2 rounded-lg border border-brand-border text-center flex flex-col justify-center"><p className="text-[10px] text-brand-muted mb-1 font-medium">REVIEW</p><p className="font-bold text-yellow-400">{getStatusCount('IN_REVIEW')}</p></div>
                                                <div className="bg-brand-bg p-2 rounded-lg border border-brand-border text-center flex flex-col justify-center"><p className="text-[10px] text-brand-muted mb-1 font-medium">PROGRESS</p><p className="font-bold text-orange-400">{getStatusCount('IN_PROGRESS')}</p></div>
                                                <div className="bg-brand-bg p-2 rounded-lg border border-brand-border text-center flex flex-col justify-center"><p className="text-[10px] text-brand-muted mb-1 font-medium">RESOLVED</p><p className="font-bold text-emerald-400">{getStatusCount('RESOLVED')}</p></div>
                                                <div className="bg-brand-bg p-2 rounded-lg border border-brand-border text-center flex flex-col justify-center"><p className="text-[10px] text-brand-muted mb-1 font-medium">CLOSED</p><p className="font-bold text-brand-muted">{getStatusCount('CLOSED')}</p></div>
                                                <div className="bg-brand-bg p-2 rounded-lg border border-brand-border text-center flex flex-col justify-center"><p className="text-[10px] text-brand-muted mb-1 font-medium">REJECTED</p><p className="font-bold text-red-400">{getStatusCount('REJECTED')}</p></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div><label className="text-sm text-brand-muted">Nume</label><input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text focus:outline-brand-primary" /></div>
                            <div><label className="text-sm text-brand-muted">Serial Number</label><input type="text" value={editData.serialNumber} onChange={e => setEditData({...editData, serialNumber: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text font-mono focus:outline-brand-primary" /></div>
                            <div>
                                <label className="text-sm text-brand-muted">Categorie</label>
                                <select value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} className="w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text focus:outline-brand-primary">
                                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="pt-2 border-t border-brand-border">
                                <label className="text-sm text-brand-muted block mb-1">Status Echipament</label>
                                <select
                                    value={editData.status}
                                    onChange={e => {
                                        const newStatus = e.target.value;
                                        let updatedEmail = editData.userEmail;
                                        if (newStatus === 'DEFECTIVE' || newStatus === 'AVAILABLE') updatedEmail = '';
                                        setEditData({...editData, status: newStatus, userEmail: updatedEmail});
                                    }}
                                    className="w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text focus:outline-brand-primary"
                                >
                                    <option value="AVAILABLE">Disponibil</option>
                                    <option value="ASSIGNED">Atribuit</option>
                                    <option value="DEFECTIVE">Defect</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-brand-muted flex items-center justify-between">
                                    Email Atribuit
                                    {editData.status === 'DEFECTIVE' && <span className="text-xs text-red-400">Inactiv (Status Defect)</span>}
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        value={editData.userEmail}
                                        onChange={e => {
                                            const val = e.target.value;
                                            let nextStatus = editData.status;
                                            if (val.trim() !== '' && nextStatus === 'AVAILABLE') nextStatus = 'ASSIGNED';
                                            else if (val.trim() === '' && nextStatus === 'ASSIGNED') nextStatus = 'AVAILABLE';
                                            setEditData({ ...editData, userEmail: val, status: nextStatus });
                                            setShowEditSuggestions(true);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Tab' && filteredEditEmails.length > 0) {
                                                e.preventDefault();
                                                setEditData({ ...editData, userEmail: filteredEditEmails[0].email, status: 'ASSIGNED' });
                                                setShowEditSuggestions(false);
                                            }
                                        }}
                                        onFocus={() => editData.userEmail && setShowEditSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowEditSuggestions(false), 200)}
                                        disabled={editData.status === 'DEFECTIVE'}
                                        placeholder={editData.status === 'DEFECTIVE' ? "N/A" : "Scrie email-ul angajatului..."}
                                        className={`w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text focus:outline-brand-primary ${editData.status === 'DEFECTIVE' ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                    />
                                    {showEditSuggestions && filteredEditEmails.length > 0 && editData.status !== 'DEFECTIVE' && (
                                        <ul className="absolute z-10 w-full mt-1 bg-brand-card border border-brand-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                            {filteredEditEmails.map(emp => (
                                                <li key={emp.id} onClick={() => { setEditData({...editData, userEmail: emp.email, status: 'ASSIGNED'}); setShowEditSuggestions(false); }} className="p-2 text-sm text-brand-text hover:bg-brand-bg cursor-pointer border-b border-brand-border last:border-0">{emp.email}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-brand-bg p-4 border-t border-brand-border flex justify-between items-center">
                    {!isEditing ? (
                        <>
                            <button onClick={handleDeleteAsset} className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center"><Trash2 className="w-4 h-4 mr-1" /> Sterge</button>
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-brand-border rounded-lg text-brand-text hover:bg-black/5 font-medium text-sm flex items-center"><Edit2 className="w-4 h-4 mr-2" /> Editeaza</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-brand-text border border-brand-border hover:bg-black/5 rounded-lg text-sm">Anuleaza</button>
                            <button onClick={handleUpdateAsset} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 text-sm flex items-center"><Check className="w-4 h-4 mr-1" /> Salveaza</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}