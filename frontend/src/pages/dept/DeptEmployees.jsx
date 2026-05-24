import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ToastContext } from '../../App';
import { Plus, Trash2 } from 'lucide-react';
import EmployeeList from '../../components/admin/EmployeeList';
import EmployeeDetailsModal from '../../components/admin/EmployeeDetailsModal';
import GenerateAccountsModal from '../../components/admin/GenerateAccountsModal';

const DEPT_COLORS = [
    { hex: '#3b82f6', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { hex: '#a855f7', class: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { hex: '#10b981', class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { hex: '#f59e0b', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
];

const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('token');

export default function DeptEmployees() {
    const { me } = useOutletContext();
    const showToast = useContext(ToastContext);

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [generatedPasswords, setGeneratedPasswords] = useState({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [empRes, deptRes, compRes, assetRes] = await Promise.all([
                fetch(`${API}/employees`, { headers: { 'Authorization': `Bearer ${token()}` } }),
                fetch(`${API}/departments`, { headers: { 'Authorization': `Bearer ${token()}` } }).catch(() => null),
                fetch(`${API}/complaints`, { headers: { 'Authorization': `Bearer ${token()}` } }).catch(() => null),
                fetch(`${API}/assets`, { headers: { 'Authorization': `Bearer ${token()}` } }).catch(() => null),
            ]);
            if (empRes.ok) setEmployees((await empRes.json()).map((e, i) => ({ ...e, _index: i })));
            if (deptRes?.ok) setDepartments(await deptRes.json());
            if (compRes?.ok) setComplaints(await compRes.json());
            if (assetRes?.ok) setAssets(await assetRes.json());
        } catch (err) {
            showToast('Eroare la încărcarea datelor.', 'error');
        } finally {
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

    const getDeptColorObj = (deptName) => {
        const fallback = { hex: '#6b7280', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
        if (!deptName) return fallback;
        const index = departments.findIndex(d => d.name === deptName);
        return index === -1 ? fallback : DEPT_COLORS[index % DEPT_COLORS.length];
    };

    const copyToClipboard = (email, password, securityCode, deptName) => {
        const text = `Date de acces platformă DRX (Departament: ${deptName || 'Nespecificat'})\n\nEmail: ${email}\nParolă: ${password}\nCod Securitate: ${securityCode || 'N/A'}`;
        navigator.clipboard.writeText(text);
        showToast('Datele au fost copiate!', 'success');
    };

    const handleGenerateAccounts = async (e) => {
        e.preventDefault();
        const myDept = departments.find(d => d.name === me?.departmentName);
        if (!myDept) return showToast('Departamentul tău nu a fost găsit.', 'error');
        try {
            const res = await fetch(`${API}/employees/generate-temp-account?departmentId=${myDept.id}&count=1`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (res.ok) {
                const newAccs = await res.json();
                const updatedPasswords = { ...generatedPasswords };
                newAccs.forEach(acc => { updatedPasswords[acc.id] = acc.password || acc.tempPassword || 'VERIFICA_BACKEND'; });
                setGeneratedPasswords(updatedPasswords);
                fetchData();
                setIsModalOpen(false);
                setActiveTab('GENERATED');
                showToast('Cont generat cu succes!', 'success');
            } else {
                showToast('Eroare la generare.', 'error');
            }
        } catch { showToast('Eroare de rețea.', 'error'); }
    };

    const handleUpdateEmployee = async () => {
        try {
            const res = await fetch(`${API}/employees/${selectedEmployee.id}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
                body: JSON.stringify({ roleCode: selectedRole })
            });
            if (res.ok) { fetchData(); setSelectedEmployee(null); showToast('Modificările au fost salvate.', 'success'); }
            else showToast('Eroare la salvare.', 'error');
        } catch { showToast('Eroare de rețea.', 'error'); }
    };

    // Filtrare doar pe departamentul responsabilului
    const deptEmployees = employees.filter(emp => emp.departmentName === me?.departmentName);

    const processedEmployees = deptEmployees.filter(emp => {
        if (activeTab === 'ACTIVE' && !emp.isActive) return false;
        if (activeTab === 'GENERATED' && emp.isActive) return false;
        return `${emp.firstName || ''} ${emp.lastName || ''} ${emp.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-text">
                    Angajați — {me?.departmentName}
                </h3>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmDeleteAll(true)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg font-medium flex items-center transition-colors text-sm">
                        <Trash2 className="w-4 h-4 mr-1" /> Curăță Inactive
                    </button>
                    <button onClick={() => setIsModalOpen(true)}
                        className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm text-sm">
                        <Plus className="w-4 h-4 mr-1" /> Generează Cont
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-2">
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Caută angajat..."
                    className="flex-1 px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-primary" />
            </div>

            <div className="flex space-x-2 border-b border-brand-border">
                {['ACTIVE', 'GENERATED'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
                        {tab === 'ACTIVE' ? 'Angajați Activi' : 'Conturi Generate'}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center p-8 text-brand-muted">Se încarcă...</div>
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
                modalDept={departments.find(d => d.name === me?.departmentName)?.id || ''}
                setModalDept={() => {}}
                modalCount={1} setModalCount={() => {}}
                handleGenerateAccounts={handleGenerateAccounts}
                departments={departments.filter(d => d.name === me?.departmentName)}
            />

            {selectedEmployee && (
                <EmployeeDetailsModal
                    selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee}
                    selectedDeptId={selectedDeptId} setSelectedDeptId={setSelectedDeptId}
                    selectedRole={selectedRole} setSelectedRole={setSelectedRole}
                    departments={departments.filter(d => d.name === me?.departmentName)}
                    getDeptColorObj={getDeptColorObj}
                    isDeptChanged={false}
                    handleUpdateEmployee={handleUpdateEmployee}
                    visiblePasswords={visiblePasswords} setVisiblePasswords={setVisiblePasswords}
                    generatedPasswords={generatedPasswords} copyToClipboard={copyToClipboard}
                    assets={assets} complaints={complaints}
                />
            )}

            {confirmDeleteAll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-brand-card border border-brand-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
                        <h3 className="text-base font-bold text-brand-text">Șterge conturi inactive</h3>
                        <p className="text-sm text-brand-muted">Ești sigur că vrei să ștergi toate conturile generate neatribuite din departamentul tău?</p>
                        <div className="flex gap-2">
                            <button onClick={() => setConfirmDeleteAll(false)}
                                className="flex-1 py-2 border border-brand-border rounded-lg text-brand-muted text-sm">Anulează</button>
                            <button onClick={async () => {
                                setConfirmDeleteAll(false);
                                try {
                                    const res = await fetch(`${API}/employees/temporary-accounts`, {
                                        method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` }
                                    });
                                    if (res.ok) { fetchData(); showToast('Conturile inactive au fost șterse.', 'success'); }
                                    else showToast('Eroare la ștergere.', 'error');
                                } catch { showToast('Eroare de rețea.', 'error'); }
                            }} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                                Șterge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}