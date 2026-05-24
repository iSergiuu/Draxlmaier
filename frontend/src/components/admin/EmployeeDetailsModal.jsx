import React from 'react';
import { X, User, Eye, EyeOff, Copy, Building2, Laptop, AlertCircle } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function EmployeeDetailsModal({
                                                 selectedEmployee, setSelectedEmployee,
                                                 selectedDeptId, setSelectedDeptId,
                                                 departments, getDeptColorObj,
                                                 isDeptChanged, handleUpdateEmployee,
                                                 selectedRole, setSelectedRole,
                                                 visiblePasswords, setVisiblePasswords,
                                                 generatedPasswords, copyToClipboard,
                                                 assets, complaints
                                             }) {
    if (!selectedEmployee) return null;

    const isEmpActive = selectedEmployee.isActive === true || selectedEmployee.is_active === true;
    const securityCode = selectedEmployee.securityCode || selectedEmployee.security_code || selectedEmployee.employeeNumber || 'N/A';
    const originalDeptId = departments.find(d => d.name === selectedEmployee.departmentName)?.id || '';

    // Calculăm Asseturile
    const userAssets = assets.filter(a => a.assignedToId === selectedEmployee.id || a.assignedToEmail === selectedEmployee.email);

    // Calculăm Plângerile (doar pentru statusurile care au minim 1)
    const userComplaints = complaints.filter(c => {
        const author = (c.authorName || '').toLowerCase();
        const empName1 = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`.toLowerCase();
        const empName2 = `${selectedEmployee.lastName} ${selectedEmployee.firstName}`.toLowerCase();
        return author === empName1 || author === empName2 || author === (selectedEmployee.email || '').toLowerCase();
    });

    const counts = userComplaints.reduce((acc, curr) => {
        const status = curr.statusCode || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-4 overflow-y-auto">
            <div className="bg-brand-card w-full max-w-lg rounded-2xl shadow-xl border border-brand-border flex flex-col max-h-[90vh] overflow-visible">

                {/* Header-ul (Comun pentru ambele) */}
                <div className="flex justify-between items-center p-6 border-b border-brand-border">
                    <h3 className="text-xl font-bold text-brand-text flex items-center gap-2">
                        <User className="text-brand-primary" />
                        {isEmpActive ? 'Detalii Angajat' : 'Cont Generat (Inactiv)'}
                    </h3>
                    <button onClick={() => setSelectedEmployee(null)} className="p-1.5 text-brand-muted hover:text-brand-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* === BODY PENTRU CONTURI GENERATE (Doar Email, Parola si Cod) === */}
                {!isEmpActive && (
                    <div className="p-6 space-y-5 overflow-visible">
                        <div>
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Email Atribuit</label>
                            <p className="text-brand-text font-mono mt-1 text-sm bg-brand-bg/60 p-2.5 rounded border border-brand-border">
                                {selectedEmployee.email}
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Parolă Temporară</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-brand-text bg-brand-bg px-3 py-2.5 rounded border border-brand-border text-sm flex-1">
                                    {visiblePasswords[selectedEmployee.id]
                                        ? (generatedPasswords[selectedEmployee.id] || selectedEmployee.tempPassword || 'VERIFICA_BACKEND')
                                        : '••••••••'}
                                </span>
                                <button onClick={() => setVisiblePasswords(p => ({...p, [selectedEmployee.id]: !p[selectedEmployee.id]}))} className="p-2.5 border border-brand-border rounded bg-brand-bg text-brand-muted hover:text-brand-text">
                                    {visiblePasswords[selectedEmployee.id] ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Cod Securitate</label>
                            <p className="text-brand-primary font-mono mt-1 bg-brand-primary/10 px-3 py-2.5 rounded border border-brand-primary/20 text-sm">
                                {securityCode}
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    const pass = generatedPasswords[selectedEmployee.id] || selectedEmployee.tempPassword || 'VERIFICA_BACKEND';
                                    copyToClipboard(selectedEmployee.email, pass, securityCode, selectedEmployee.departmentName);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:opacity-90 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Copy size={16} /> Copiază Toate Datele
                            </button>
                        </div>
                    </div>
                )}

                {/* === BODY PENTRU ANGAJAȚI ACTIVI (Cu Info, Assets, Complaints) === */}
                {isEmpActive && (
                    <div className="p-6 space-y-6 overflow-visible">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Nume Complet</label>
                                <p className="text-brand-text font-medium mt-1 text-base">
                                    {selectedEmployee.lastName} {selectedEmployee.firstName}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Departament Curent</label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border rounded-full ${getDeptColorObj(selectedEmployee.departmentName).class}`}>
                                        {selectedEmployee.departmentName || 'Nespecificat'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Email Înregistrat</label>
                            <p className="text-brand-text font-mono mt-1 text-sm">{selectedEmployee.email}</p>
                        </div>

                        <div className="border-t border-brand-border pt-5">
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1 mb-3">
                                <Laptop size={14} className="text-brand-primary" /> Echipamente Alocate ({userAssets.length})
                            </label>
                            {userAssets.length > 0 ? (
                                <div className="space-y-2">
                                    {userAssets.map(asset => (
                                        <div key={asset.id} className="bg-brand-bg px-3 py-2 rounded border border-brand-border text-sm flex justify-between">
                                            <span className="font-medium text-brand-text">{asset.name}</span>
                                            <span className="text-brand-muted font-mono">{asset.serialNumber}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-brand-muted bg-brand-bg/50 px-3 py-2 rounded italic">Acest angajat nu are echipamente alocate.</p>
                            )}
                        </div>

                        <div className="border-t border-brand-border pt-5">
                            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1 mb-3">
                                <AlertCircle size={14} className="text-orange-500" /> Plângeri Create ({userComplaints.length})
                            </label>
                            {Object.keys(counts).length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(counts).map(([status, count]) => (
                                        <div key={status} className="bg-brand-bg px-2.5 py-1.5 rounded border border-brand-border text-xs flex items-center gap-2">
                                            <span className="text-brand-muted capitalize">{status.replace('_', ' ')}</span>
                                            <span className="font-bold text-brand-text">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-brand-muted bg-brand-bg/50 px-3 py-2 rounded italic">Acest angajat nu a deschis nicio plângere.</p>
                            )}
                        </div>

                        <div className="border-t border-brand-border pt-5 pb-2 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1 mb-2">
                                    <Building2 size={14} className="text-brand-primary" /> Mută în alt departament
                                </label>
                                <div className="relative z-50">
                                    <CustomSelect
                                        value={selectedDeptId}
                                        onChange={setSelectedDeptId}
                                        options={departments.map(d => ({value: d.id, label: d.name}))}
                                        placeholder="Alege noul departament..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider flex items-center gap-1 mb-2">
                                    <User size={14} className="text-brand-primary" /> Schimbă rolul
                                </label>
                                <div className="relative z-40">
                                    <CustomSelect
                                        value={selectedRole}
                                        onChange={setSelectedRole}
                                        options={[
                                            { value: 'USER', label: 'User' },
                                            { value: 'ADMIN', label: 'Admin' },
                                            { value: 'SUPER_ADMIN', label: 'Super Admin' },
                                        ]}
                                        placeholder="Alege rolul..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer (Doar butonul de save pt active, daca e cazul, si close) */}
                <div className="p-6 border-t border-brand-border bg-brand-bg/50 rounded-b-2xl flex justify-end gap-3 mt-auto">
                    <button
                        onClick={() => setSelectedEmployee(null)}
                        className="px-4 py-2 border border-brand-border text-brand-text rounded-lg text-sm hover:bg-brand-bg transition"
                    >
                        Închide
                    </button>
                    {(isEmpActive && (isDeptChanged || selectedRole !== (selectedEmployee.roleCode || 'USER'))) && (
                        <button
                            onClick={handleUpdateEmployee}
                            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
                        >
                            Salvează Modificările
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}