import React, { useState, useEffect, useContext } from 'react';
import { ToastContext } from '../../App';
import { Plus, Trash2 } from 'lucide-react';
import EmployeeSummaryCards from '../../components/admin/EmployeeSummaryCards';
import EmployeeFilters from '../../components/admin/EmployeeFilters';
import EmployeeList from '../../components/admin/EmployeeList';
import GenerateAccountsModal from '../../components/admin/GenerateAccountsModal';
import EmployeeDetailsModal from '../../components/admin/EmployeeDetailsModal';

const DEPT_COLORS = [
    { hex: '#3b82f6', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { hex: '#a855f7', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { hex: '#ec4899', class: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
    { hex: '#10b981', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { hex: '#f59e0b', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { hex: '#06b6d4', class: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    { hex: '#f43f5e', class: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    { hex: '#6366f1', class: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' }
];

export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [searchQuery, setSearchQuery] = useState('');
    const [emailSearchQuery, setEmailSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [departmentFilter, setDepartmentFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
    const [modalDept, setModalDept] = useState('');
    const [modalCount, setModalCount] = useState(1);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [generatedPasswords, setGeneratedPasswords] = useState({});

    const token = localStorage.getItem('token');
    const showToast = useContext(ToastContext);

    const getDeptColorObj = (deptName) => {
        const fallback = { hex: '#6b7280', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
        if (!deptName) return fallback;
        const index = departments.findIndex(d => d.name === deptName);
        if (index === -1) return fallback;
        return DEPT_COLORS[index % DEPT_COLORS.length];
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [empRes, deptRes, compRes, assetRes] = await Promise.all([
                fetch('http://localhost:8080/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8080/api/departments', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
                fetch('http://localhost:8080/api/complaints', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
                fetch('http://localhost:8080/api/assets', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
            ]);

            if (empRes.ok) {
                const rawEmp = await empRes.json();
                setEmployees(rawEmp.map((e, idx) => ({...e, _index: idx})));
            }
            if (deptRes && deptRes.ok) setDepartments(await deptRes.json());
            if (compRes && compRes.ok) setComplaints(await compRes.json());
            if (assetRes && assetRes.ok) setAssets(await assetRes.json());

            setIsLoading(false);
        } catch (error) {
            console.error("Eroare la preluarea datelor:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (selectedEmployee) {
            const foundDept = departments.find(d => d.name === selectedEmployee.departmentName);
            setSelectedDeptId(foundDept ? foundDept.id : '');
            setSelectedRole(selectedEmployee.roleCode || 'USER');
        }
    }, [selectedEmployee, departments]);

    const handleGenerateAccounts = async (e) => {
        e.preventDefault();
        if (!modalDept) return showToast('Selectează un departament!', 'warning');

        try {
            const res = await fetch(`http://localhost:8080/api/employees/generate-temp-account?departmentId=${modalDept}&count=${modalCount}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const newAccs = await res.json();
                const updatedPasswords = { ...generatedPasswords };
                newAccs.forEach(acc => {
                    updatedPasswords[acc.id] = acc.password || acc.tempPassword || acc.plainPassword || 'VERIFICA_BACKEND';
                });
                setGeneratedPasswords(updatedPasswords);

                fetchData();
                setIsModalOpen(false);
                setModalCount(1);
                setModalDept('');
                setActiveTab('GENERATED');
            } else {
                const err = await res.text();
                showToast(`Eroare la generare: ${err}`, 'error');
            }
        } catch (error) { showToast('Eroare de rețea.', 'error'); }
    };

    const handleUpdateEmployee = async () => {
        try {
            const [deptRes, roleRes] = await Promise.all([
                fetch(`http://localhost:8080/api/employees/${selectedEmployee.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ roleCode: selectedRole, departmentId: selectedDeptId })
                }),
                fetch(`http://localhost:8080/api/employees/${selectedEmployee.id}/role`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ roleCode: selectedRole })
                })
            ]);

            if (deptRes.ok || roleRes.ok) {
                fetchData();
                setSelectedEmployee(null);
                showToast('Modificările au fost salvate.', 'success');
            } else {
                showToast('Eroare la salvarea modificărilor.', 'error');
            }
        } catch (error) { showToast('Eroare de rețea la actualizare.', 'error'); }
    };

    const copyToClipboard = (email, password, securityCode, deptName) => {
        const text = `Date de acces platformă DRX (Departament: ${deptName || 'Nespecificat'})\n\nEmail: ${email}\nParolă: ${password}\nCod Securitate: ${securityCode || 'N/A'}\n\nIntrodu aceste date la prima logare pentru a-ți configura contul.`;
        navigator.clipboard.writeText(text);
        showToast('Datele au fost copiate în clipboard!', 'success');
    };

    const activeEmployeesList = employees.filter(e => e.isActive === true);
    const generatedEmployeesList = employees.filter(e => e.isActive === false);
    const totalEmployees = employees.length;

    const getDeptStats = () => {
        const stats = {};
        departments.forEach(d => { stats[d.name] = { name: d.name, count: 0, class: getDeptColorObj(d.name).class, hex: getDeptColorObj(d.name).hex } });
        employees.forEach(emp => {
            if (emp.departmentName && stats[emp.departmentName]) stats[emp.departmentName].count += 1;
        });
        return Object.values(stats).sort((a, b) => b.count - a.count);
    };

    const processedEmployees = employees.filter(emp => {
        if (activeTab === 'ACTIVE' && !emp.isActive) return false;
        if (activeTab === 'GENERATED' && emp.isActive) return false;

        const matchesName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesEmail = (emp.email || '').toLowerCase().includes(emailSearchQuery.toLowerCase());
        const empDeptObj = departments.find(d => d.name === emp.departmentName);
        const deptIdToMatch = empDeptObj ? empDeptObj.id : null;
        const matchesDept = departmentFilter === 'ALL' || deptIdToMatch === departmentFilter;

    return matchesName && matchesEmail && matchesDept;
    }).sort((a, b) => {
        if (sortOrder === 'AZ') return (a.lastName || a.email || '').localeCompare(b.lastName || b.email || '');
        if (sortOrder === 'ZA') return (b.lastName || b.email || '').localeCompare(a.lastName || a.email || '');
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        if (sortOrder === 'NEWEST') return dateA !== dateB ? dateA - dateB : a._index - b._index;
        if (sortOrder === 'OLDEST') return dateA !== dateB ? dateB - dateA : b._index - b._index;
        return 0;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative z-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl sm:text-2xl font-bold text-brand-text">Management Angajați</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <button onClick={() => setConfirmDeleteAll(true)} className="w-full sm:w-auto justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2.5 sm:py-2 rounded-lg font-medium flex items-center transition-colors text-sm sm:text-base">
                        <Trash2 className="w-5 h-5 mr-1" /> Curăță Inactive
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto justify-center bg-brand-primary hover:opacity-90 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium flex items-center shadow-sm text-sm sm:text-base transition-opacity">
                        <Plus className="w-5 h-5 mr-1" /> Generează Conturi
                    </button>
                </div>
            </div>

            <EmployeeSummaryCards
                totalEmployees={totalEmployees}
                activeCount={activeEmployeesList.length}
                generatedCount={generatedEmployeesList.length}
                deptStats={getDeptStats()}
            />

            <div className="flex overflow-x-auto no-scrollbar space-x-2 border-b border-brand-border mb-4">
                <button
                    onClick={() => setActiveTab('ACTIVE')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ACTIVE' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
                >
                    Angajați Activi
                </button>
                <button
                    onClick={() => setActiveTab('GENERATED')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'GENERATED' ? 'border-orange-500 text-orange-500' : 'border-transparent text-brand-muted hover:text-brand-text'}`}
                >
                    Conturi Generate
                </button>
            </div>

            {activeTab === 'ACTIVE' && (
                <EmployeeFilters
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    emailSearchQuery={emailSearchQuery} setEmailSearchQuery={setEmailSearchQuery}
                    departmentFilter={departmentFilter} setDepartmentFilter={setDepartmentFilter}
                    departmentsList={departments}
                    sortOrder={sortOrder} setSortOrder={setSortOrder}
                />
            )}

            {isLoading ? (
                <div className="text-center p-8 text-brand-muted text-sm sm:text-base">Se încarcă datele...</div>
            ) : (
                <EmployeeList
                    processedEmployees={processedEmployees}
                    activeTab={activeTab}
                    departments={departments}
                    complaints={complaints}
                    getDeptColorObj={getDeptColorObj}
                    visiblePasswords={visiblePasswords}
                    setVisiblePasswords={setVisiblePasswords}
                    generatedPasswords={generatedPasswords}
                    setSelectedEmployee={setSelectedEmployee}
                    copyToClipboard={copyToClipboard}
                />
            )}

            <GenerateAccountsModal
                isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}
                modalDept={modalDept} setModalDept={setModalDept}
                modalCount={modalCount} setModalCount={setModalCount}
                handleGenerateAccounts={handleGenerateAccounts}
                departments={departments}
            />

            {selectedEmployee && (
                <EmployeeDetailsModal
                    selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee}
                    selectedDeptId={selectedDeptId} setSelectedDeptId={setSelectedDeptId}
                    selectedRole={selectedRole} setSelectedRole={setSelectedRole}
                    departments={departments} getDeptColorObj={getDeptColorObj}
                    isDeptChanged={selectedDeptId !== (departments.find(d => d.name === selectedEmployee.departmentName)?.id || '')}
                    handleUpdateEmployee={handleUpdateEmployee}
                    visiblePasswords={visiblePasswords} setVisiblePasswords={setVisiblePasswords}
                    generatedPasswords={generatedPasswords} copyToClipboard={copyToClipboard}
                    assets={assets} complaints={complaints}
                />
            )}

            {confirmDeleteAll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-brand-card border border-brand-border rounded-xl shadow-xl w-full max-w-sm p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/10 rounded-lg shrink-0">
                                <Trash2 size={20} className="text-red-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-brand-text">Sterge conturi inactive</h3>
                        </div>
                        <p className="text-sm text-brand-muted">
                            Esti sigur ca vrei sa stergi <span className="text-brand-text font-semibold">toate</span> conturile generate neatribuite? Actiunea nu poate fi anulata.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <button onClick={() => setConfirmDeleteAll(false)}
                                className="w-full sm:flex-1 py-2.5 sm:py-2 px-4 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text transition-colors text-sm font-medium">
                                Anuleaza
                            </button>
                            <button onClick={async () => {
                                setConfirmDeleteAll(false);
                                try {
                                    const res = await fetch('http://localhost:8080/api/employees/temporary-accounts', {
                                        method: 'DELETE',
                                        headers: { 'Authorization': `Bearer ${token}` }
                                    });
                                    if (res.ok) { fetchData(); showToast('Conturile inactive au fost sterse.', 'success'); }
                                    else showToast('A aparut o eroare la stergere.', 'error');
                                } catch { showToast('Nu s-au putut sterge conturile.', 'error'); }
                            }}
                                className="w-full sm:flex-1 py-2.5 sm:py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                <Trash2 size={16} /> Sterge tot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}