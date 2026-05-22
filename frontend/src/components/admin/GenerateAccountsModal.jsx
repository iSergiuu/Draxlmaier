import React from 'react';
import CustomSelect from './CustomSelect';
import { Building2, X } from 'lucide-react';

export default function GenerateAccountsModal({
                                                  isModalOpen, setIsModalOpen,
                                                  modalDept, setModalDept,
                                                  modalCount, setModalCount,
                                                  handleGenerateAccounts, departments
                                              }) {
    if (!isModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
            <div className="bg-brand-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-brand-border relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-brand-muted hover:text-brand-text">
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold mb-2 text-brand-text">Generează Conturi Noi</h3>
                <p className="text-brand-muted text-sm mb-6">Utilizatorii vor primi o adresă temporară de tip <span className="font-mono text-brand-primary text-xs">tempXXXXX@draxlmaier.com</span>.</p>

                <form onSubmit={handleGenerateAccounts} className="space-y-4 overflow-visible">
                    <div className="relative z-50">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Departament Asignat</label>
                        <CustomSelect
                            value={modalDept}
                            onChange={setModalDept}
                            options={departments.map(d => ({value: d.id, label: d.name}))}
                            icon={Building2}
                            placeholder="Alege un departament..."
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Număr de conturi</label>
                        <input
                            type="number" min="1" max="50"
                            value={modalCount}
                            onChange={(e) => setModalCount(parseInt(e.target.value) || 1)}
                            className="w-full border border-brand-border rounded-lg p-2.5 text-sm bg-brand-bg text-brand-text focus:outline-none focus:border-brand-primary"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4 justify-end border-t border-brand-border mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-brand-border text-brand-text rounded-lg text-sm hover:bg-brand-bg transition">
                            Anulează
                        </button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm hover:opacity-90 transition">
                            Generează
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}