import React, { useState, useEffect, useCallback } from 'react';
import { Building, Users, AlertCircle, Plus, Pencil, Trash2, X, Check, Package, MessageSquare, Loader2 } from 'lucide-react';

const token = () => localStorage.getItem('token');
const API = 'http://localhost:8080/api';

function StatBadge({ icon: Icon, label, value, color }) {
    return (
        <div className="flex flex-col gap-1 bg-brand-bg rounded-lg p-3 border border-brand-border flex-1">
            <div className="flex items-center gap-1.5 text-brand-muted text-xs">
                <Icon size={12} />
                <span>{label}</span>
            </div>
            <span className="text-brand-text font-bold text-lg leading-none" style={{ color }}>{value ?? '—'}</span>
        </div>
    );
}

function DeptCard({ dept, dashboardStats, onEdit, onDelete, onSelect }) {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API}/departments/${dept.id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token()}` }
                });
                if (res.ok) setStats(await res.json());
            } catch {}
        };
        fetchStats();
    }, [dept.id]);

    const employeeCount = dashboardStats?.employeesPerDepartment?.find(
        d => d.departmentName === dept.name
    )?.count ?? 0;

    const assetCount = dashboardStats?.assetsPerDepartment?.find(
        d => d.departmentName === dept.name
    )?.count ?? 0;

    return (
        <div className="bg-brand-card border border-brand-border rounded-xl shadow-sm hover:border-brand-primary/40 transition-all duration-200 flex flex-col">
            <div className="flex items-center justify-between p-5 pb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-bg rounded-lg text-brand-primary border border-brand-border">
                        <Building size={20} />
                    </div>
                    <h4 className="text-base font-bold text-brand-text">{dept.name}</h4>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(dept)}
                        className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => onDelete(dept)}
                        className="p-1.5 rounded-lg text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="px-5 pb-4 flex gap-2">
                <StatBadge icon={Users}         label="Angajati" value={employeeCount}              color="#3b82f6" />
                <StatBadge icon={Package}       label="Asseturi" value={assetCount}                 color="#10b981" />
                <StatBadge icon={MessageSquare} label="Plangeri" value={stats?.totalComplaits ?? 0} color="#f59e0b" />
            </div>
        </div>
    );
}

function AddEditModal({ dept, onClose, onSave }) {
    const [name, setName]       = useState(dept?.name || '');
    const [managerId, setManagerId] = useState(dept?.managerId || '');
    const [employees, setEmployees] = useState([]);
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState('');

    const [managerSearch, setManagerSearch] = useState('');
        const [showSuggestions, setShowSuggestions] = useState(false);

        useEffect(() => {
            if (dept) return;
            fetch(`${API}/employees`, { headers: { 'Authorization': `Bearer ${token()}` } })
                .then(r => r.ok ? r.json() : [])
                .then(data => setEmployees(data.filter(e => e.isActive)))
                .catch(() => {});
        }, []);

    const filteredEmployees = managerSearch.length > 1
        ? employees.filter(e =>
            e.email.toLowerCase().includes(managerSearch.toLowerCase()) ||
            `${e.firstName} ${e.lastName}`.toLowerCase().includes(managerSearch.toLowerCase())
          )
        : [];

    const handleSave = async () => {
        if (!name.trim()) return setError('Numele este obligatoriu.');
        setSaving(true);
        setError('');
        try {
            const method = dept ? 'PUT' : 'POST';
            const url    = dept ? `${API}/departments/${dept.id}` : `${API}/departments`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
                body: JSON.stringify({ 
                name: name.trim(),
                ...(managerId ? { managerId } : {})
                 })
            });
            if (!res.ok) {
                const txt = await res.text();
                let message = 'Eroare la salvare.';
                try {
                    const json = JSON.parse(txt);
                    message = json.message || message;
                } catch {}
                throw new Error(message);
            }
            onSave();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-brand-text">
                        {dept ? 'Editeaza departament' : 'Departament nou'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Nume departament"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                    className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />

                {!dept && (
                    <div className="relative">
                        <label className="text-xs text-brand-muted mb-1 block">Manager departament</label>
                        <input
                            type="text"
                            placeholder="Cauta dupa email sau nume..."
                            value={managerSearch}
                            onChange={(e) => { setManagerSearch(e.target.value); setManagerId(''); setShowSuggestions(true); }}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm"
                        />
                        {managerId && (
                            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                                <Check size={11} /> {managerSearch}
                            </p>
                        )}
                        {showSuggestions && filteredEmployees.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-brand-card border border-brand-border rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                                {filteredEmployees.map(e => (
                                    <button
                                        key={e.id}
                                        type="button"
                                        onMouseDown={() => {
                                            setManagerId(e.id);
                                            setManagerSearch(`${e.firstName} ${e.lastName} — ${e.email}`);
                                            setShowSuggestions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-brand-primary/10 transition-colors border-b border-brand-border last:border-0"
                                    >
                                        <span className="text-brand-text font-medium">{e.firstName} {e.lastName}</span>
                                        <span className="text-brand-muted ml-2">{e.email}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                        <AlertCircle size={12} /> {error}
                    </p>
                )}

                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 py-2 px-4 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text transition-colors text-sm">
                        Anuleaza
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2 px-4 bg-brand-primary hover:opacity-90 text-white rounded-lg font-medium text-sm transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        {dept ? 'Salveaza' : 'Adauga'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteModal({ dept, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError]       = useState('');

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${API}/departments/${dept.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (!res.ok) throw new Error('Eroare la stergere.');
            onDeleted();
        } catch (err) {
            setError(err.message);
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-brand-card border border-brand-border rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-brand-text">Sterge departament</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <p className="text-sm text-brand-muted">
                    Esti sigur ca vrei sa stergi departamentul <span className="text-brand-text font-semibold">"{dept.name}"</span>? Actiunea nu poate fi anulata.
                </p>

                {error && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                        <AlertCircle size={12} /> {error}
                    </p>
                )}

                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 py-2 px-4 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text transition-colors text-sm">
                        Anuleaza
                    </button>
                    <button onClick={handleDelete} disabled={deleting}
                        className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Sterge
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDepartments() {
    const [departments, setDepartments] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [isLoading, setIsLoading]     = useState(true);
    const [error, setError]             = useState(null);

    const [addEditModal, setAddEditModal] = useState(null); // null | 'new' | dept object
    const [deleteModal, setDeleteModal]   = useState(null); // null | dept object

    const fetchDepartments = useCallback(async () => {
        const tok = token();
        if (!tok) { setError("Nu esti autentificat."); setIsLoading(false); return; }
        try {
            const [deptRes, dashRes] = await Promise.all([
                fetch(`${API}/departments`, { headers: { 'Authorization': `Bearer ${tok}` } }),
                fetch(`${API}/dashboard/stats`, { headers: { 'Authorization': `Bearer ${tok}` } }),
            ]);
            if (!deptRes.ok) throw new Error('Eroare la preluarea departamentelor.');
            if (!dashRes.ok) throw new Error('Eroare la preluarea statisticilor.');
            setDepartments(await deptRes.json());
            setDashboardStats(await dashRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

    const handleSaved = () => { setAddEditModal(null); fetchDepartments(); };
    const handleDeleted = () => { setDeleteModal(null); fetchDepartments(); };
    const handleSelect = (dept) => { /* poti extinde aici cu o pagina de detalii */ };

    if (isLoading) return (
        <div className="h-full flex items-center justify-center text-brand-muted gap-2">
            <Loader2 size={18} className="animate-spin" /> Se incarca departamentele...
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-text">Departamente</h3>
                <button onClick={() => setAddEditModal('new')}
                    className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 transition-opacity shadow-sm text-sm">
                    <Plus size={18} /> Adauga Departament
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {departments.length === 0 && !error ? (
                    <div className="col-span-full p-10 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted text-sm">
                        Niciun departament configurat. Adauga primul departament.
                    </div>
                ) : (
                    departments.map(dept => (
                        <DeptCard
                            key={dept.id}
                            dept={dept}
                            dashboardStats={dashboardStats}
                            onEdit={(d) => setAddEditModal(d)}
                            onDelete={(d) => setDeleteModal(d)}
                            onSelect={handleSelect}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            {addEditModal && (
                <AddEditModal
                    dept={addEditModal === 'new' ? null : addEditModal}
                    onClose={() => setAddEditModal(null)}
                    onSave={handleSaved}
                />
            )}
            {deleteModal && (
                <DeleteModal
                    dept={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
}