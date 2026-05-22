import React from 'react';
import { X, Building2, Mail, User, Info, Save, Edit2 } from 'lucide-react';

export default function EmployeeDetailsModal({
                                                 selectedEmployee,
                                                 setSelectedEmployee,
                                                 departments,
                                                 isEditing,
                                                 setIsEditing,
                                                 editData,
                                                 setEditData,
                                                 handleUpdateEmployee
                                             }) {
    if (!selectedEmployee) return null;

    const currentDept = departments.find(d => d.id === (selectedEmployee.departmentId || selectedEmployee.department_id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
            <div className="bg-brand-card w-full max-w-lg rounded-2xl shadow-xl border border-brand-border flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
                        <User className="text-brand-primary" />
                        Detalii Angajat
                    </h3>
                    <button onClick={() => { setSelectedEmployee(null); setIsEditing(false); }} className="text-brand-muted hover:text-brand-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6">

                    {/* Status Badge */}
                    <div className="flex justify-between items-center bg-brand-bg p-4 rounded-lg border border-brand-border">
                        <span className="text-sm font-medium text-brand-muted uppercase tracking-wider">Status Cont</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            selectedEmployee.isActive || selectedEmployee.is_active
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                        }`}>
                            {selectedEmployee.isActive || selectedEmployee.is_active ? 'ACTIV' : 'ÎN AȘTEPTARE'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Name & Email (View Mode) */}
                        {!isEditing ? (
                            <>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase">Nume Complet</label>
                                    <p className="text-brand-text font-medium mt-1">
                                        {(selectedEmployee.firstName || selectedEmployee.first_name) || '-'} {(selectedEmployee.lastName || selectedEmployee.last_name) || '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase flex items-center gap-1"><Mail size={14} /> Email</label>
                                    <p className="text-brand-text font-mono text-sm mt-1">{selectedEmployee.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase flex items-center gap-1"><Building2 size={14} /> Departament</label>
                                    <p className="text-brand-text font-medium mt-1">{currentDept ? currentDept.name : 'Nespecificat'}</p>
                                </div>
                            </>
                        ) : (
                            /* Edit Mode */
                            <div className="space-y-4 animate-in fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-brand-muted uppercase">Nume</label>
                                        <input
                                            type="text"
                                            value={editData.lastName}
                                            onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                                            className="w-full mt-1 border border-brand-border rounded-lg p-2.5 text-sm bg-brand-bg text-brand-text focus:outline-none focus:border-brand-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-brand-muted uppercase">Prenume</label>
                                        <input
                                            type="text"
                                            value={editData.firstName}
                                            onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                                            className="w-full mt-1 border border-brand-border rounded-lg p-2.5 text-sm bg-brand-bg text-brand-text focus:outline-none focus:border-brand-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-brand-muted uppercase">Departament</label>
                                    <select
                                        value={editData.departmentId}
                                        onChange={(e) => setEditData({...editData, departmentId: e.target.value})}
                                        className="w-full mt-1 border border-brand-border rounded-lg p-2.5 text-sm bg-brand-bg text-brand-text focus:outline-none focus:border-brand-primary"
                                    >
                                        <option value="">Alege un departament...</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                {/* Informare Editare */}
                                <div className="p-3 bg-brand-primary/10 border border-brand-primary/30 rounded flex gap-2 items-start mt-2">
                                    <Info className="text-brand-primary shrink-0 w-4 h-4 mt-0.5" />
                                    <p className="text-xs text-brand-primary">Email-ul nu poate fi modificat de aici. Pentru resetări, generează un cont nou.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Acțiuni */}
                <div className="p-6 border-t border-brand-border bg-brand-bg/50 rounded-b-2xl flex justify-end gap-3">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm hover:opacity-90 transition flex items-center gap-2"
                        >
                            <Edit2 size={16} /> Editează Profilul
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-brand-border text-brand-text rounded-lg text-sm hover:bg-brand-bg transition"
                            >
                                Anulează
                            </button>
                            <button
                                onClick={handleUpdateEmployee}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <Save size={16} /> Salvează Modificările
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}