// src/components/admin/AddAssetModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function AddAssetModal({
                                          setIsAddModalOpen,
                                          newAssetData,
                                          setNewAssetData,
                                          categoriesList,
                                          handleNewAssetEmailInput,
                                          showEmailSuggestionsAdd,
                                          setShowEmailSuggestionsAdd,
                                          filteredEmailsAdd,
                                          handleAddAsset,
                                          isSubmitting
                                      }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-brand-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-brand-border animate-in zoom-in-95 duration-200">
                <div className="bg-brand-bg border-b border-brand-border p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-brand-text">Adauga Echipament</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-brand-muted hover:text-red-500 p-1"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6">
                    <form className="space-y-4" onSubmit={handleAddAsset}>
                        <div><label className="block text-sm text-brand-muted mb-1">Nume</label><input required type="text" value={newAssetData.name} onChange={e => setNewAssetData({...newAssetData, name: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded p-2 focus:outline-brand-primary" /></div>
                        <div><label className="block text-sm text-brand-muted mb-1">SN</label><input required type="text" value={newAssetData.serialNumber} onChange={e => setNewAssetData({...newAssetData, serialNumber: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded p-2 font-mono focus:outline-brand-primary" /></div>
                        <div>
                            <label className="block text-sm text-brand-muted mb-1">Categorie</label>
                            <select required value={newAssetData.category} onChange={e => setNewAssetData({...newAssetData, category: e.target.value})} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded p-2 focus:outline-brand-primary">
                                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="relative">
                            <label className="block text-sm text-brand-muted mb-1">Atribuire (Optional)</label>
                            <input type="text" placeholder="Scrie email-ul angajatului..." value={newAssetData.userEmail} onChange={handleNewAssetEmailInput} onFocus={() => newAssetData.userEmail && setShowEmailSuggestionsAdd(true)} onBlur={() => setTimeout(() => setShowEmailSuggestionsAdd(false), 200)} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded p-2 focus:outline-brand-primary" />
                            {showEmailSuggestionsAdd && filteredEmailsAdd.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-brand-card border border-brand-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {filteredEmailsAdd.map(emp => (
                                        <li key={emp.id} onClick={() => { setNewAssetData({...newAssetData, userEmail: emp.email}); setShowEmailSuggestionsAdd(false); }} className="p-2 text-sm text-brand-text hover:bg-brand-bg cursor-pointer border-b border-brand-border last:border-0">{emp.email}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-brand-border rounded-lg text-brand-text hover:bg-black/5 transition-colors">Anuleaza</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity">Adauga Echipament</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}