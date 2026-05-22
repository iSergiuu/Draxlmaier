import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Plus, Trash2, Users, Filter, X, Building2, UserCheck, Clock } from 'lucide-react';
import EmployeeDetailsModal from '../../components/admin/EmployeeDetailsModal';

export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDept, setModalDept] = useState('');
    const [modalCount, setModalCount] = useState(1);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ firstName: '', lastName: '', departmentId: '' });

    const [visiblePasswords, setVisiblePasswords] = useState({});

    const token = localStorage.getItem('token');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [empRes, deptRes] = await Promise.all([
                fetch('http://localhost:8080/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8080/api/departments', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
            ]);

            if (empRes.ok) setEmployees(await empRes.json());
            if (deptRes && deptRes.ok) setDepartments(await deptRes.json());
            setIsLoading(false);
        } catch (error) {
            console.error("Eroare la preluarea datelor:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            setEditData({
                firstName: selectedEmployee.firstName || selectedEmployee.first_name || '',
                lastName: selectedEmployee.lastName || selectedEmployee.last_name || '',
                departmentId: selectedEmployee.departmentId || selectedEmployee.department_id || ''
            });
            setIsEditing(false);
        }
    }, [selectedEmployee]);

    const handleGenerateAccounts = async (e) => {
        e.preventDefault();
        if (!modalDept) return alert("Selectează un departament!");

        try {
            const res = await fetch('http://localhost:8080/api/employees/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ departmentId: modalDept, count: modalCount })
            });

            if (res.ok) {
                fetchData();
                setIsModalOpen(false);
                setModalCount(1);
                setModalDept('');
                setActiveTab('GENERATED');
            } else {
                const err = await res.text();
                alert(`Eroare la generare: ${err}`);
            }
        } catch (error) {
            alert("Eroare de rețea.");
        }
    };

    const handleDeleteAllGenerated = async () => {
        if (window.confirm("Sigur vrei să ștergi TOATE conturile generate neatribuite?")) {
            try {
                const res = await fetch('http://localhost:8080/api/employees/pending', {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) fetchData();
            } catch (error) {
                alert("Nu s-au putut șterge conturile.");
            }
        }
    };

    const handleUpdateEmployee = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/employees/${selectedEmployee.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editData)
            });

            if (res.ok) {
                fetchData();
                setSelectedEmployee(null);
                setIsEditing(false);
            } else {
                alert("Eroare la actualizarea angajatului.");
            }
        } catch (error) {
            alert("Eroare de rețea.");
        }
    };

    // FUNCTIE ACTUALIZATA SA INCLUDA CODUL DE SECURITATE
    const copyToClipboard = (email, password, securityCode) => {
        const text = `Te poți loga pe platformă folosind:\nEmail: ${email}\nParolă: ${password}\nCod Securitate: ${securityCode || 'N/A'}\n\n*La prima logare va trebui să îți configurezi contul introducând aceste 3 date.`;
        navigator.clipboard.writeText(text);
        alert("Datele au fost copiate în clipboard!");
    };

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive === true || e.is_active === true).length;
    const generatedEmployees = totalEmployees - activeEmployees;

    const activeDeg = totalEmployees ? (activeEmployees / totalEmployees) * 360 : 0;
    const generatedDeg = totalEmployees ? (generatedEmployees / totalEmployees) * 360 : 0;

    const filteredEmployees = employees.filter(emp => {
        const empIsActive = emp.isActive === true || emp.is_active === true;

        if (activeTab === 'ACTIVE' && !empIsActive) return false;
        if (activeTab === 'GENERATED' && empIsActive) return false;

        const matchesSearch = `${emp.first_name || ''} ${emp.last_name || ''} ${emp.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
        const deptId = emp.departmentId || emp.department_id;
        const matchesDept = selectedDeptFilter === 'ALL' || deptId === selectedDeptFilter;

        return matchesSearch && matchesDept;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-text">Management Angajați</h3>
                <div className="flex gap-3">
                    <button onClick={handleDeleteAllGenerated} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
                        <Trash2 className="w-5 h-5 mr-1" /> Curăță Inactive
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm">
                        <Plus className="w-5 h-5 mr-1" /> Generează Conturi
                    </button>
                </div>
            </div>

            {/* Summary Cards + Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
                    <div>
                        <h4 className="text-brand-text font-bold mb-1">Status Conturi</h4>
                        <div className="flex items-center text-sm mb-1 text-brand-muted">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            <span>Activi: {activeEmployees}</span>
                        </div>
                        <div className="flex items-center text-sm text-brand-muted">
                            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                            <span>În așteptare: {generatedEmployees}</span>
                        </div>
                    </div>
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner"
                         style={{ background: `conic-gradient(#22c55e ${activeDeg}deg, #f97316 0 ${activeDeg + generatedDeg}deg, transparent 0)` }}>
                        <div className="w-16 h-16 bg-brand-card rounded-full flex flex-col items-center justify-center">
                            <span className="text-brand-text font-bold text-lg leading-none">{totalEmployees}</span>
                            <span className="text-[10px] text-brand-muted uppercase">Total</span>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex items-center col-span-1">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500"><UserCheck className="w-8 h-8" /></div>
                    <div className="ml-4">
                        <p className="text-brand-muted text-sm font-medium">Conturi Active</p>
                        <h4 className="text-2xl font-bold text-brand-text">{activeEmployees}</h4>
                    </div>
                </div>
                <div className="bg-brand-card border border-brand-border rounded-xl p-6 shadow-sm flex items-center col-span-1">
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500"><Clock className="w-8 h-8" /></div>
                    <div className="ml-4">
                        <p className="text-brand-muted text-sm font-medium">Conturi Generate</p>
                        <h4 className="text-2xl font-bold text-brand-text">{generatedEmployees}</h4>
                    </div>
                </div>
            </div>

            {/* TAB-URI DE SEPARARE */}
            <div className="flex space-x-2 border-b border-brand-border mb-4">
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'ACTIVE' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
                >
                    Angajați Activi
                </button>
                <button
                    onClick={() => setActiveTab('GENERATED')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'GENERATED' ? 'border-orange-500 text-orange-500' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
                >
                    Conturi Generate (În Așteptare)
                </button>
            </div>

            {/* Filtre */}
            <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Caută după nume sau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary transition-colors text-sm"
                    />
                    <div className="flex items-center gap-2 border border-brand-border rounded px-3 py-2 bg-brand-bg text-brand-text text-sm">
                        <Building2 size={16} className="text-brand-muted" />
                        <select
                            value={selectedDeptFilter}
                            onChange={(e) => setSelectedDeptFilter(e.target.value)}
                            className="bg-transparent focus:outline-none cursor-pointer w-full"
                        >
                            <option value="ALL">Toate Departamentele</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Listă / Tabel Angajați */}
            {isLoading ? (
                <div className="text-center p-8 text-brand-muted">Se încarcă datele...</div>
            ) : (
                <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-brand-bg/50 border-b border-brand-border text-brand-muted text-xs font-semibold uppercase tracking-wider">
                            <th className="p-4">Identificator / Nume</th>
                            <th className="p-4">Departament</th>
                            {/* Titlu coloana updatat */}
                            {activeTab === 'GENERATED' && <th className="p-4">Parolă & Cod Sec.</th>}
                            <th className="p-4 text-right">Acțiuni</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border text-sm">
                        {filteredEmployees.map(emp => {
                            const deptId = emp.departmentId || emp.department_id;
                            const deptObj = departments.find(d => d.id === deptId);
                            const isEmpActive = emp.isActive === true || emp.is_active === true;
                            // Preia codul de securitate, indiferent sub ce nume il trimite backend-ul
                            const securityCode = emp.securityCode || emp.security_code || emp.securitycode;

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
                                        {isEmpActive ? (
                                            <div>
                                                <div className="font-semibold text-brand-text">{emp.lastName || emp.last_name} {emp.firstName || emp.first_name}</div>
                                                <div className="text-brand-muted text-xs">{emp.email}</div>
                                            </div>
                                        ) : (
                                            <div className="font-mono bg-orange-500/10 text-orange-500 px-2 py-1 rounded inline-block text-xs font-bold border border-orange-500/20">
                                                {emp.email}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-brand-muted">{deptObj ? deptObj.name : 'Nespecificat'}</td>

                                    {activeTab === 'GENERATED' && (
                                        <td className="p-4">
                                            {emp.tempPassword ? (
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-brand-text bg-brand-bg px-2 py-1 rounded border border-brand-border text-xs">
                                                            P: {visiblePasswords[emp.id] ? emp.tempPassword : '••••••••'}
                                                        </span>
                                                        <button onClick={() => setVisiblePasswords(p => ({...p, [emp.id]: !p[emp.id]}))} className="text-brand-muted hover:text-brand-text transition-colors">
                                                            {visiblePasswords[emp.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                        </button>
                                                    </div>
                                                    {/* AFISAREA CODULUI DE SECURITATE */}
                                                    {securityCode && (
                                                        <div className="font-mono text-brand-primary text-xs flex items-center gap-1">
                                                            Cod: <span className="bg-brand-primary/10 px-1 rounded">{securityCode}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-brand-muted text-xs opacity-50">— (Securizată)</span>
                                            )}
                                        </td>
                                    )}

                                    <td className="p-4 text-right">
                                        {!isEmpActive && emp.tempPassword ? (
                                            <button
                                                onClick={() => copyToClipboard(emp.email, emp.tempPassword, securityCode)}
                                                className="inline-flex items-center gap-1 text-xs text-brand-primary hover:opacity-80 transition ml-auto border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1.5 rounded-md"
                                            >
                                                <Copy size={14} /> Copiază
                                            </button>
                                        ) : (
                                            <span className="text-brand-muted text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={activeTab === 'GENERATED' ? "4" : "3"} className="text-center p-8 text-brand-muted">
                                    Nu s-au găsit înregistrări în această categorie.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Generare Conturi */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
                    <div className="bg-brand-card w-full max-w-md p-6 rounded-2xl shadow-xl border border-brand-border relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-brand-muted hover:text-brand-text">
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold mb-2 text-brand-text">Generează Conturi Noi</h3>
                        <p className="text-brand-muted text-sm mb-6">Utilizatorii vor primi o adresă temporară de tip <span className="font-mono text-brand-primary text-xs">tempXXXXX@draxlmaier.com</span>.</p>

                        <form onSubmit={handleGenerateAccounts} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-muted mb-1">Departament Asignat</label>
                                <select
                                    value={modalDept}
                                    onChange={(e) => setModalDept(e.target.value)}
                                    className="w-full border border-brand-border rounded-lg p-2.5 text-sm bg-brand-bg text-brand-text focus:outline-none focus:border-brand-primary"
                                    required
                                >
                                    <option value="">Alege un departament...</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div>
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
            )}

            {/* Modal Detalii Angajat */}
            <EmployeeDetailsModal
                selectedEmployee={selectedEmployee}
                setSelectedEmployee={setSelectedEmployee}
                departments={departments}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editData={editData}
                setEditData={setEditData}
                handleUpdateEmployee={handleUpdateEmployee}
            />
        </div>
    );
}