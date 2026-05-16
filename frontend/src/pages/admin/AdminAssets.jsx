import React, { useState, useEffect } from 'react';
import {
    Laptop, Smartphone, Headphones, Monitor, Keyboard,
    Mouse, HardDrive, Plus, X, LayoutDashboard, Info,
    AlertCircle, Edit2, Trash2, Check, UserPlus, FileText,
    Search, Filter, PieChart, ArrowUpDown
} from 'lucide-react';

export default function AdminAssets() {
    const [assets, setAssets] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAsset, setSelectedAsset] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Filters and sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');

    const [newAssetData, setNewAssetData] = useState({ name: '', serialNumber: '', category: '', userEmail: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    // Autocomplete for quick assignment (view mode)
    const [assignEmail, setAssignEmail] = useState('');
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

    // Autocomplete for adding new asset
    const [filteredEmailsAdd, setFilteredEmailsAdd] = useState([]);
    const [showEmailSuggestionsAdd, setShowEmailSuggestionsAdd] = useState(false);

    const token = localStorage.getItem('token');

    const fetchData = async () => {
        if (!token) {
            setError("Nu esti autentificat.");
            setIsLoading(false);
            return;
        }

        try {
            const [resAssets, resComplaints, resEmployees] = await Promise.all([
                fetch('http://localhost:8080/api/assets', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://localhost:8080/api/complaints', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
                fetch('http://localhost:8080/api/employees', { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
            ]);

            if (!resAssets.ok) throw new Error('Eroare la preluarea echipamentelor.');

            const rawAssets = await resAssets.json();
            // Keep original index for sorting fallback
            const indexedAssets = rawAssets.map((a, idx) => ({ ...a, _index: idx }));
            setAssets(indexedAssets);

            if (resComplaints && resComplaints.ok) setComplaints(await resComplaints.json());
            if (resEmployees && resEmployees.ok) setEmployees(await resEmployees.json());

            setIsLoading(false);
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getAssignee = (asset) => {
        return asset?.assignedEmail || asset?.assigned_email || asset?.userEmail || asset?.assignedToId || asset?.assigned_to_id || asset?.employeeId || null;
    };

    const isDefective = (assetId) => {
        // Also check if the backend already set the status explicitly
        const currentAsset = assets.find(a => a.id === assetId);
        if (currentAsset && currentAsset.status === 'DEFECTIVE') return true;

        return complaints.some(c => (c.assetId === assetId || c.asset_id === assetId) && (c.status === 'PENDING' || c.status === 'IN_PROGRESS'));
    };

    const normalizeCategory = (cat) => {
        if (!cat) return '';
        return cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1).toLowerCase();
    };

    // Dynamic categories based on DB data
    const dbCategories = assets.map(a => normalizeCategory(a.category)).filter(Boolean);
    const categoriesList = [...new Set([...dbCategories, 'Laptop', 'Telefon', 'Monitor', 'Periferice', 'Altele'])];

    useEffect(() => {
        if (selectedAsset) {
            // Determine the exact status for the dropdown
            let currentStatus = 'AVAILABLE';
            if (isDefective(selectedAsset.id)) currentStatus = 'DEFECTIVE';
            else if (getAssignee(selectedAsset)) currentStatus = 'ASSIGNED';

            setEditData({
                name: selectedAsset.name,
                serialNumber: selectedAsset.serialNumber || selectedAsset.serial_number,
                category: normalizeCategory(selectedAsset.category),
                userEmail: getAssignee(selectedAsset) || '',
                status: currentStatus
            });
            setIsEditing(false);
            setAssignEmail('');
        }
    }, [selectedAsset]);

    useEffect(() => {
        if (isAddModalOpen && !newAssetData.category) {
            setNewAssetData(prev => ({ ...prev, category: categoriesList[0] }));
        }
    }, [isAddModalOpen, categoriesList]);

    const handleAddAsset = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8080/api/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: newAssetData.name,
                    serialNumber: newAssetData.serialNumber,
                    category: normalizeCategory(newAssetData.category)
                })
            });
            if (!response.ok) throw new Error('Eroare la salvare.');
            const createdAsset = await response.json();

            if (newAssetData.userEmail.trim() !== '') {
                await fetch(`http://localhost:8080/api/assets/${createdAsset.id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ email: newAssetData.userEmail })
                });
            }

            fetchData();
            setNewAssetData({ name: '', serialNumber: '', category: '', userEmail: '' });
            setIsAddModalOpen(false);
        } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
    };

    const handleUpdateAsset = async () => {
        try {
            // Ensure no email is sent if the status isn't ASSIGNED
            const finalEmail = (editData.status === 'DEFECTIVE' || editData.status === 'AVAILABLE') ? null : editData.userEmail;

            const response = await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...selectedAsset,
                    ...editData,
                    category: normalizeCategory(editData.category),
                    status: editData.status,
                    userEmail: finalEmail,
                    assignedEmail: finalEmail
                })
            });

            if (!response.ok) throw new Error('Eroare la actualizare.');

            // Re-assign explicitly if the user entered a new email and status is ASSIGNED
            if (editData.status === 'ASSIGNED' && finalEmail) {
                await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ email: finalEmail })
                }).catch(e => console.warn('Assign warn:', e)); // Silently catch if already handled by PUT
            }

            setIsEditing(false);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteAsset = async () => {
        if (!window.confirm(`Esti sigur ca vrei sa stergi ${selectedAsset.name}?`)) return;
        try {
            await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            setSelectedAsset(null);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleAssignAsset = async () => {
        if (!assignEmail) return alert('Introdu un email valid!');
        try {
            await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: assignEmail })
            });
            fetchData();
            // Automatically close modal or trigger re-fetch of selectedAsset logic here
            setSelectedAsset(null);
        } catch (err) { alert(err.message); }
    };

    // Autocomplete input handlers
    const handleEmailInput = (e) => {
        const val = e.target.value;
        setAssignEmail(val);
        if (val.length > 0) {
            setFilteredEmails(employees.filter(emp => emp.email && emp.email.toLowerCase().includes(val.toLowerCase())));
            setShowEmailSuggestions(true);
        } else setShowEmailSuggestions(false);
    };

    const handleNewAssetEmailInput = (e) => {
        const val = e.target.value;
        setNewAssetData({...newAssetData, userEmail: val});
        if (val.length > 0) {
            setFilteredEmailsAdd(employees.filter(emp => emp.email && emp.email.toLowerCase().includes(val.toLowerCase())));
            setShowEmailSuggestionsAdd(true);
        } else setShowEmailSuggestionsAdd(false);
    };

    // Filtering and Sorting logic
    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (asset.serialNumber || asset.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase());
        const normalizedAssetCat = normalizeCategory(asset.category);
        const matchesCategory = categoryFilter === 'ALL' || normalizedAssetCat === categoryFilter;

        let matchesStatus = true;
        const defective = isDefective(asset.id);
        const assigned = !!getAssignee(asset);

        if (statusFilter === 'AVAILABLE') matchesStatus = !assigned && !defective;
        if (statusFilter === 'ASSIGNED') matchesStatus = assigned && !defective;
        if (statusFilter === 'DEFECTIVE') matchesStatus = defective;

        return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
        if (sortOrder === 'NEWEST') {
            if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
            if (!isNaN(a.id) && !isNaN(b.id)) return b.id - a.id;
            return b._index - a._index;
        }
        if (sortOrder === 'OLDEST') {
            if (a.createdAt && b.createdAt) return new Date(a.createdAt) - new Date(b.createdAt);
            if (!isNaN(a.id) && !isNaN(b.id)) return a.id - b.id;
            return a._index - b._index;
        }
        if (sortOrder === 'AZ') return a.name.localeCompare(b.name);
        if (sortOrder === 'ZA') return b.name.localeCompare(a.name);
        return 0;
    });

    // Asset Stats
    const totalAssets = assets.length;
    const defectiveAssetsCount = assets.filter(a => isDefective(a.id)).length;
    const assignedAssetsCount = assets.filter(a => !isDefective(a.id) && !!getAssignee(a)).length;
    const availableAssetsCount = totalAssets - defectiveAssetsCount - assignedAssetsCount;

    const availableDeg = totalAssets ? (availableAssetsCount / totalAssets) * 360 : 0;
    const assignedDeg = totalAssets ? (assignedAssetsCount / totalAssets) * 360 : 0;

    // Complaints Stats
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
    const rejectedComplaints = complaints.filter(c => c.status === 'REJECTED').length;
    const pendingComplaints = complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;

    const getCategoryIcon = (category) => {
        const cat = normalizeCategory(category).toLowerCase();
        if (cat.includes('laptop')) return <Laptop className="w-5 h-5 text-brand-primary" />;
        if (cat.includes('telefon') || cat.includes('phone')) return <Smartphone className="w-5 h-5 text-blue-400" />;
        return <HardDrive className="w-5 h-5 text-brand-muted" />;
    };

    if (isLoading) return <div className="h-full flex items-center justify-center text-brand-text">Se incarca datele...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-text">Gestiune Echipamente</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm">
                    <Plus className="w-5 h-5 mr-1" /> Adauga Echipament
                </button>
            </div>

            {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center"><AlertCircle className="w-5 h-5 mr-3" /><p>{error}</p></div>}

            {/* STATS AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Asset Stats */}
                <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex flex-row items-center justify-between">
                    <div>
                        <h4 className="text-base font-bold text-brand-text mb-4">Sumar Echipamente (Total: {totalAssets})</h4>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-brand-text mr-4 w-20">Disponibile:</span>
                                <span className="font-bold text-emerald-400">{availableAssetsCount}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-brand-text mr-4 w-20">Atribuite:</span>
                                <span className="font-bold text-blue-400">{assignedAssetsCount}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-sm"></span>
                                <span className="font-medium text-brand-text mr-4 w-20">Defecte:</span>
                                <span className="font-bold text-red-400">{defectiveAssetsCount}</span>
                            </div>
                        </div>
                    </div>
                    {totalAssets > 0 ? (
                        <div
                            className="w-28 h-28 rounded-full relative flex-shrink-0 shadow-inner"
                            style={{ background: `conic-gradient(#10b981 0deg ${availableDeg}deg, #3b82f6 ${availableDeg}deg ${availableDeg + assignedDeg}deg, #ef4444 ${availableDeg + assignedDeg}deg 360deg)` }}
                        >
                            <div className="absolute inset-4 bg-brand-card rounded-full"></div>
                        </div>
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-brand-bg border-[16px] border-brand-border flex-shrink-0"></div>
                    )}
                </div>

                {/* Complaint History */}
                <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex flex-col justify-center">
                    <h4 className="text-base font-bold text-brand-text mb-4">Istoric Plangeri (Total: {totalComplaints})</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-brand-bg rounded-lg border border-brand-border text-center">
                            <p className="text-xs text-brand-muted mb-1 font-medium">In asteptare</p>
                            <p className="text-2xl font-bold text-yellow-400">{pendingComplaints}</p>
                        </div>
                        <div className="p-4 bg-brand-bg rounded-lg border border-brand-border text-center">
                            <p className="text-xs text-brand-muted mb-1 font-medium">Rezolvate</p>
                            <p className="text-2xl font-bold text-emerald-400">{resolvedComplaints}</p>
                        </div>
                        <div className="p-4 bg-brand-bg rounded-lg border border-brand-border text-center">
                            <p className="text-xs text-brand-muted mb-1 font-medium">Respinse</p>
                            <p className="text-2xl font-bold text-red-400">{rejectedComplaints}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col lg:flex-row gap-4 bg-brand-card p-4 rounded-xl border border-brand-border">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-2.5 text-brand-muted" />
                    <input
                        type="text" placeholder="Cauta dupa nume sau SN..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-2 text-brand-text focus:outline-brand-primary"
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-brand-primary text-sm">
                        <option value="ALL">Toate Statusurile</option>
                        <option value="AVAILABLE">Disponibile</option>
                        <option value="ASSIGNED">Atribuite</option>
                        <option value="DEFECTIVE">Defecte</option>
                    </select>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-brand-primary text-sm">
                        <option value="ALL">Toate Categoriile</option>
                        {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="col-span-2 md:col-span-1 bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-brand-text focus:outline-brand-primary text-sm">
                        <option value="NEWEST">Cele mai noi</option>
                        <option value="OLDEST">Cele mai vechi</option>
                        <option value="AZ">Nume (A-Z)</option>
                        <option value="ZA">Nume (Z-A)</option>
                    </select>
                </div>
            </div>

            {/* ASSETS LIST */}
            <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden">
                {filteredAssets.length === 0 ? (
                    <div className="p-8 text-center text-brand-muted">Niciun echipament gasit conform filtrelor.</div>
                ) : (
                    <ul className="divide-y divide-brand-border">
                        {filteredAssets.map((asset) => {
                            const isDefect = isDefective(asset.id);
                            const assignee = getAssignee(asset);

                            return (
                                <li key={asset.id} onClick={() => setSelectedAsset(asset)} className="p-4 hover:bg-black/5 cursor-pointer flex items-center justify-between transition-colors">
                                    <div className="flex items-center">
                                        <div className="mr-4 p-2 bg-brand-bg rounded-lg border border-brand-border">{getCategoryIcon(asset.category)}</div>
                                        <div>
                                            <h4 className="text-md font-semibold text-brand-text">{asset.name}</h4>
                                            <p className="text-sm text-brand-muted font-mono">{asset.serialNumber || asset.serial_number}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {isDefect ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-900/20 text-red-400 border-red-900">Defect</span>
                                        ) : assignee ? (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-900/20 text-blue-400 border-blue-900">Atribuit</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-900/20 text-emerald-400 border-emerald-900">Disponibil</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* DETAILS / EDIT MODAL */}
            {selectedAsset && (() => {
                const isDefect = isDefective(selectedAsset.id);
                const assignee = getAssignee(selectedAsset);

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

                                        {/* View Mode Status Indicator */}
                                        <div className="col-span-2 pt-2 border-t border-brand-border">
                                            <p className="text-sm text-brand-muted mb-2">Status Echipament</p>
                                            <div>
                                                {isDefect ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-900/20 text-red-400 border-red-900">Marcheaza ca Defect</span>
                                                ) : assignee ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-900/20 text-blue-400 border-blue-900">Atribuit</span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-900/20 text-emerald-400 border-emerald-900">Disponibil</span>
                                                )}
                                            </div>
                                        </div>
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

                                        {/* Status Dropdown in Edit Mode */}
                                        <div className="pt-2 border-t border-brand-border">
                                            <label className="text-sm text-brand-muted block mb-1">Status Echipament</label>
                                            <select
                                                value={editData.status}
                                                onChange={e => {
                                                    const newStatus = e.target.value;
                                                    let updatedEmail = editData.userEmail;

                                                    // Curata email-ul doar cand se trece in modul de Disponibil sau Defect
                                                    if (newStatus === 'DEFECTIVE' || newStatus === 'AVAILABLE') {
                                                        updatedEmail = '';
                                                    }

                                                    setEditData({...editData, status: newStatus, userEmail: updatedEmail});
                                                }}
                                                className="w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text focus:outline-brand-primary"
                                            >
                                                <option value="AVAILABLE">Disponibil</option>
                                                <option value="ASSIGNED">Atribuit</option>
                                                <option value="DEFECTIVE">Defect</option>
                                            </select>
                                        </div>

                                        {/* Dynamic Email Field with Auto-Status Switch */}
                                        <div>
                                            <label className="text-sm text-brand-muted flex items-center justify-between">
                                                Email Atribuit
                                                {editData.status === 'DEFECTIVE' && <span className="text-xs text-red-400">Inactiv (Status Defect)</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.userEmail}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    let nextStatus = editData.status;

                                                    // Trigger automat pentru schimbare status
                                                    if (val.trim() !== '' && nextStatus === 'AVAILABLE') {
                                                        nextStatus = 'ASSIGNED';
                                                    } else if (val.trim() === '' && nextStatus === 'ASSIGNED') {
                                                        nextStatus = 'AVAILABLE';
                                                    }

                                                    setEditData({ ...editData, userEmail: val, status: nextStatus });
                                                }}
                                                disabled={editData.status === 'DEFECTIVE'}
                                                placeholder={editData.status === 'DEFECTIVE' ? "N/A" : "Scrie email-ul angajatului..."}
                                                className={`w-full bg-brand-bg border border-brand-border rounded p-2 text-brand-text focus:outline-brand-primary mt-1 ${editData.status === 'DEFECTIVE' ? 'opacity-50 cursor-not-allowed bg-black/20' : ''}`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Quick Assignment Widget (View Mode) */}
                                {!isEditing && (
                                    <div className="p-4 bg-brand-bg rounded-xl border border-brand-border">
                                        {isDefect ? (
                                            <div className="flex items-center text-red-400 font-medium">
                                                <AlertCircle className="w-5 h-5 mr-2"/> Echipamentul este marcat ca DEFECT. Nu poate fi atribuit.
                                            </div>
                                        ) : assignee ? (
                                            <div>
                                                <p className="text-sm text-brand-muted mb-1 flex items-center"><UserPlus className="w-4 h-4 mr-1"/> Status Atribuire</p>
                                                <p className="font-medium text-blue-400">Atribuit catre: {assignee}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-emerald-400 font-medium mb-3 flex items-center"><Check className="w-4 h-4 mr-1"/> Echipament Disponibil</p>
                                                <label className="text-xs text-brand-muted mb-1 block">Cauta angajat pentru atribuire rapida:</label>
                                                <div className="flex gap-2 relative">
                                                    <div className="flex-1 relative">
                                                        <input type="text" placeholder="Scrie email..." value={assignEmail} onChange={handleEmailInput} onFocus={() => assignEmail && setShowEmailSuggestions(true)} onBlur={() => setTimeout(() => setShowEmailSuggestions(false), 200)} className="w-full bg-brand-card border border-brand-border rounded p-2 text-sm text-brand-text focus:outline-brand-primary" />
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
            })()}

            {/* ADD ASSET MODAL */}
            {isAddModalOpen && (
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
                                    <input type="text" placeholder="Scrie email angajat..." value={newAssetData.userEmail} onChange={handleNewAssetEmailInput} onFocus={() => newAssetData.userEmail && setShowEmailSuggestionsAdd(true)} onBlur={() => setTimeout(() => setShowEmailSuggestionsAdd(false), 200)} className="w-full bg-brand-bg text-brand-text border border-brand-border rounded p-2 focus:outline-brand-primary" />
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
            )}
        </div>
    );
}