import React from 'react';
import { User, Eye, EyeOff, Copy } from 'lucide-react';

export default function EmployeeList({
                                         processedEmployees, activeTab, departments, complaints,
                                         getDeptColorObj, visiblePasswords, setVisiblePasswords,
                                         generatedPasswords, setSelectedEmployee, copyToClipboard
                                     }) {
    return (
        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-brand-bg/50 border-b border-brand-border text-brand-muted text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4">Identificator / Nume</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Departament</th>
                    {activeTab === 'ACTIVE' && <th className="p-4">Plângeri</th>}
                    <th className="p-4 text-right"></th>
                </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-sm">
                {processedEmployees.map(emp => {
                    const isEmpActive = emp.isActive === true || emp.is_active === true;
                    const securityCode = emp.securityCode || emp.security_code || emp.securitycode || emp.employeeNumber || emp.employee_number;
                    const colorObj = getDeptColorObj(emp.departmentName);

                    const complaintsCount = complaints.filter(c => {
                        const author = (c.authorName || '').toLowerCase();
                        const empName1 = `${emp.firstName} ${emp.lastName}`.toLowerCase();
                        const empName2 = `${emp.lastName} ${emp.firstName}`.toLowerCase();
                        return author === empName1 || author === empName2 || author === (emp.email || '').toLowerCase();
                    }).length;

                    return (
                        <tr
                            key={emp.id}
                            className="hover:bg-brand-bg/30 transition-colors cursor-pointer"
                            onClick={(e) => {
                                if (e.target.closest('button')) return;
                                setSelectedEmployee(emp);
                            }}
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-bg rounded-lg border border-brand-border text-brand-muted">
                                        <User size={16} className={!isEmpActive ? "text-orange-500/70" : "text-brand-primary"} />
                                    </div>
                                    {isEmpActive ? (
                                        <div>
                                            <div className="font-semibold text-brand-text">{emp.lastName} {emp.firstName}</div>
                                            <div className="text-brand-muted text-xs">{emp.email}</div>
                                        </div>
                                    ) : (
                                        <div className="font-mono bg-orange-500/10 text-orange-500 px-2 py-1 rounded text-xs font-bold border border-orange-500/20">
                                            {emp.email}
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td className="p-4">
                                {emp.roleCode && (
                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border rounded-full ${
                                        emp.roleCode === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-400 border-red-400/30' :
                                        emp.roleCode === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-400/30' :
                                        emp.roleCode === 'DEPT_RESPONSIBLE' ? 'bg-purple-500/10 text-purple-400 border-purple-400/30' :
                                        'bg-brand-bg text-brand-muted border-brand-border'
                                    }`}>
                                        {emp.roleCode === 'SUPER_ADMIN' ? 'Super Admin' :
                                        emp.roleCode === 'ADMIN' ? 'Admin' :
                                        emp.roleCode === 'DEPT_RESPONSIBLE' ? 'Resp. Dept.' : 'User'}
                                    </span>
                                )}
                            </td>
                            <td className="p-4">
                                {['ADMIN', 'SUPER_ADMIN'].includes(emp.roleCode) ? (
                                    <span className="text-brand-muted text-sm">—</span>
                                ) : (
                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium border rounded-full ${colorObj.class}`}>
                                        {emp.departmentName || 'Nespecificat'}
                                    </span>
                                )}
                            </td>

                            {activeTab === 'ACTIVE' && (
                                <td className="p-4">
                                        <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium bg-brand-bg border border-brand-border text-brand-muted rounded-full">
                                            {complaintsCount}
                                        </span>
                                </td>
                            )}

                            <td className="p-4 text-right">
                                {!isEmpActive && (
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const displayTempPass = generatedPasswords[emp.id] || emp.tempPassword || 'VERIFICA_BACKEND';
                                                copyToClipboard(emp.email, displayTempPass, securityCode, emp.departmentName);
                                            }}
                                            className="inline-flex items-center p-2 text-brand-primary hover:bg-brand-primary/10 rounded-md transition"
                                            title="Copiază datele de conectare"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
                {processedEmployees.length === 0 && (
                    <tr>
                        <td colSpan={activeTab === 'ACTIVE' ? "5" : "4"} className="text-center p-8 text-brand-muted">
                            Nu s-au găsit înregistrări în această categorie.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}