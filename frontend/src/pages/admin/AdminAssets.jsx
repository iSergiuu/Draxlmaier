import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Laptop, Smartphone, HardDrive, Keyboard, Mouse, Headphones, Package } from 'lucide-react';

import AssetSummaryCards from '../../components/admin/AssetSummaryCards';
import AssetFilters from '../../components/admin/AssetFilters';
import AssetList from '../../components/admin/AssetList';
import AddAssetModal from '../../components/admin/AddAssetModal';
import AssetDetailsModal from '../../components/admin/AssetDetailsModal';

export default function AdminAssets() {
    const [assets, setAssets] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAsset, setSelectedAsset] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [emailSearchQuery, setEmailSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');

    const [newAssetData, setNewAssetData] = useState({ name: '', serialNumber: '', category: '', userEmail: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    const [assignEmail, setAssignEmail] = useState('');
    const [filteredEmails, setFilteredEmails] = useState([]);
    const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);

    const [filteredEmailsAdd, setFilteredEmailsAdd] = useState([]);
    const [showEmailSuggestionsAdd, setShowEmailSuggestionsAdd] = useState(false);

    // NEW: State pentru Edit Mode Suggestions
    const [filteredEditEmails, setFilteredEditEmails] = useState([]);
    const [showEditEmailSuggestions, setShowEditEmailSuggestions] = useState(false);

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
        if (!asset) return null;
        const rawAssignee = asset.assignedEmail || asset.assigned_email || asset.assignedToEmail || asset.userEmail || asset.assignedToId || asset.assigned_to_id || asset.employeeId || null;
        if (rawAssignee && (typeof rawAssignee !== 'string' || !rawAssignee.includes('@'))) {
            const foundEmployee = employees.find(emp => emp.id === rawAssignee);
            if (foundEmployee) return foundEmployee.email;
        }
        if (!rawAssignee || (typeof rawAssignee === 'string' && (!rawAssignee.includes('@') || rawAssignee.trim() === '' || rawAssignee.includes('Neatribuit')))) {
            return null;
        }
        return rawAssignee;
    };

    const isDefective = (assetId) => {
        const currentAsset = assets.find(a => a.id === assetId);
        if (currentAsset && currentAsset.status === 'DEFECTIVE') return true;
        return complaints.some(c => (c.assetId === assetId || c.asset_id === assetId) && (c.statusCode === 'PENDING' || c.status === 'IN_PROGRESS'));
    };

    const normalizeCategory = (cat) => {
        if (!cat) return '';
        return cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1).toLowerCase();
    };

    const dbCategories = assets.map(a => normalizeCategory(a.category)).filter(Boolean);
    const defaultCategories = ['Laptop', 'Telefon', 'Monitor', 'Tastatura', 'Mouse', 'Casti', 'Altele'];
    const categoriesList = [...new Set([...dbCategories, ...defaultCategories])].filter(c => c !== 'Periferice');

    useEffect(() => {
        if (selectedAsset) {
            const assignee = getAssignee(selectedAsset);
            let currentStatus = 'AVAILABLE';
            if (isDefective(selectedAsset.id)) currentStatus = 'DEFECTIVE';
            else if (assignee) currentStatus = 'ASSIGNED';

            setEditData({
                name: selectedAsset.name,
                serialNumber: selectedAsset.serialNumber || selectedAsset.serial_number,
                category: normalizeCategory(selectedAsset.category),
                userEmail: assignee || '',
                status: currentStatus
            });
            setIsEditing(false);
            setAssignEmail('');
            setShowEditEmailSuggestions(false);
        }
    }, [selectedAsset]);

    useEffect(() => {
        if (isAddModalOpen && !newAssetData.category) {
            setNewAssetData(prev => ({ ...prev, category: categoriesList[0] }));
        }
    }, [isAddModalOpen, categoriesList]);

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

    // NEW: Handler pt recomandarile din Edit Mode
    const handleEditEmailInput = (val) => {
        if (val.length > 0) {
            setFilteredEditEmails(employees.filter(emp => emp.email && emp.email.toLowerCase().includes(val.toLowerCase())));
            setShowEditEmailSuggestions(true);
        } else {
            setShowEditEmailSuggestions(false);
        }
    };

    const handleAssignAsset = async () => {
        if (!assignEmail) return alert('Introdu un email valid!');
        const employee = employees.find(emp => emp.email.toLowerCase() === assignEmail.toLowerCase());
        if (!employee) return alert('Angajatul cu acest email nu a fost gasit in baza de date!');

        try {
            const response = await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ employeeId: employee.id })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Eroare la alocare (${response.status}): ${errText}`);
            }

            fetchData();
            setSelectedAsset(null);
        } catch (err) { alert(err.message); }
    };

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
            if (!response.ok) throw new Error(`Eroare la salvare`);

            const createdAsset = await response.json();

            if (newAssetData.userEmail.trim() !== '') {
                const employee = employees.find(emp => emp.email.toLowerCase() === newAssetData.userEmail.toLowerCase());
                if (employee) {
                    await fetch(`http://localhost:8080/api/assets/${createdAsset.id}/assign`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ employeeId: employee.id })
                    });
                }
            }

            fetchData();
            setNewAssetData({ name: '', serialNumber: '', category: '', userEmail: '' });
            setIsAddModalOpen(false);
        } catch (err) { alert(err.message); } finally { setIsSubmitting(false); }
    };

    const handleUpdateAsset = async () => {
        if (editData.status === 'ASSIGNED' && (!editData.userEmail || editData.userEmail.trim() === '')) {
            return alert('Te rog introdu un email pentru a putea atribui echipamentul!');
        }

        try {
            let finalEmail = editData.userEmail;
            if (editData.status === 'DEFECTIVE' || editData.status === 'AVAILABLE' || !finalEmail || finalEmail.trim() === '') {
                finalEmail = null;
            }

            const updatePayload = {
                name: editData.name,
                serialNumber: editData.serialNumber,
                category: editData.category,
                assignedToEmail: finalEmail
            };

            const response = await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Eroare la actualizare (${response.status}): ${errText}`);
            }

            const currentAssignee = getAssignee(selectedAsset);
            if (editData.status === 'ASSIGNED' && finalEmail && finalEmail !== currentAssignee) {
                const employee = employees.find(emp => emp.email.toLowerCase() === finalEmail.toLowerCase());
                if (employee) {
                    await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/assign`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ employeeId: employee.id })
                    });
                }
            } else if (editData.status !== 'ASSIGNED' && currentAssignee) {
                await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/unassign`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setIsEditing(false);
            setSelectedAsset(null);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleDeleteAsset = async () => {
        if (!window.confirm(`Esti sigur ca vrei sa stergi ${selectedAsset.name}?`)) return;
        try {
            const response = await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Eroare la stergere`);
            setSelectedAsset(null);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const getCategoryIcon = (category) => {
        const cat = normalizeCategory(category).toLowerCase();
        if (cat.includes('laptop')) return <Laptop size={14} className="text-emerald-500" />;
        if (cat.includes('telefon') || cat.includes('phone')) return <Smartphone size={14} className="text-amber-500" />;
        if (cat.includes('storage') || cat.includes('hdd') || cat.includes('ssd')) return <HardDrive size={14} className="text-slate-500" />;
        if (cat.includes('tastatura') || cat.includes('keyboard')) return <Keyboard size={14} className="text-teal-500" />;
        if (cat.includes('mouse')) return <Mouse size={14} className="text-orange-500" />;
        if (cat.includes('casti') || cat.includes('head')) return <Headphones size={14} className="text-cyan-500" />;
        return <Package size={14} className="text-zinc-500" />;
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (asset.serialNumber || asset.serial_number || '').toLowerCase().includes(searchQuery.toLowerCase());

        const assigneeEmail = getAssignee(asset) || '';
        const matchesEmailSearch = assigneeEmail.toLowerCase().includes(emailSearchQuery.toLowerCase());

        const normalizedAssetCat = normalizeCategory(asset.category);
        const matchesCategory = categoryFilter === 'ALL' || normalizedAssetCat === categoryFilter;

        let matchesStatus = true;
        const defective = isDefective(asset.id);
        const assigned = !!assigneeEmail;

        if (statusFilter === 'AVAILABLE') matchesStatus = !assigned && !defective;
        if (statusFilter === 'ASSIGNED') matchesStatus = assigned && !defective;
        if (statusFilter === 'DEFECTIVE') matchesStatus = defective;

        return matchesSearch && matchesEmailSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
        if (sortOrder === 'NEWEST') {
            const dateA = a.createdAt ? new Date(a.createdAt) : 0;
            const dateB = b.createdAt ? new Date(b.createdAt) : 0;
            if (dateA && dateB) return dateB - dateA;
            return b._index - a._index;
        }
        if (sortOrder === 'OLDEST') {
            const dateA = a.createdAt ? new Date(a.createdAt) : 0;
            const dateB = b.createdAt ? new Date(b.createdAt) : 0;
            if (dateA && dateB) return dateA - dateB;
            return a._index - b._index;
        }
        if (sortOrder === 'AZ') return a.name.localeCompare(b.name);
        if (sortOrder === 'ZA') return b.name.localeCompare(a.name);
        return 0;
    });

    const totalAssets = assets.length;
    const defectiveAssetsCount = assets.filter(a => isDefective(a.id)).length;
    const assignedAssetsCount = assets.filter(a => !isDefective(a.id) && !!getAssignee(a)).length;
    const availableAssetsCount = totalAssets - defectiveAssetsCount - assignedAssetsCount;

    if (isLoading) return <div className="h-full flex items-center justify-center text-brand-text">Se incarca datele...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative z-0">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-text">Gestiune Echipamente</h3>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-sm">
                    <Plus className="w-5 h-5 mr-1" /> Adauga Echipament
                </button>
            </div>

            {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center"><AlertCircle className="w-5 h-5 mr-3" /><p>{error}</p></div>}

            <AssetSummaryCards
                totalAssets={totalAssets}
                availableAssetsCount={availableAssetsCount}
                assignedAssetsCount={assignedAssetsCount}
                defectiveAssetsCount={defectiveAssetsCount}
                assets={assets}
                normalizeCategory={normalizeCategory}
                getCategoryIcon={getCategoryIcon}
            />

            <AssetFilters
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                emailSearchQuery={emailSearchQuery} setEmailSearchQuery={setEmailSearchQuery}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
                categoriesList={categoriesList}
            />

            <AssetList
                filteredAssets={filteredAssets}
                setSelectedAsset={setSelectedAsset}
                isDefective={isDefective}
                getAssignee={getAssignee}
                getCategoryIcon={getCategoryIcon}
                normalizeCategory={normalizeCategory}
                complaints={complaints}
            />

            <AssetDetailsModal
                selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset}
                isEditing={isEditing} setIsEditing={setIsEditing}
                editData={editData} setEditData={setEditData}
                categoriesList={categoriesList} normalizeCategory={normalizeCategory}
                isDefective={isDefective} getAssignee={getAssignee}
                getCategoryIcon={getCategoryIcon} handleUpdateAsset={handleUpdateAsset}
                handleDeleteAsset={handleDeleteAsset}
                assignEmail={assignEmail} setAssignEmail={setAssignEmail}
                handleEmailInput={handleEmailInput} showEmailSuggestions={showEmailSuggestions}
                setShowEmailSuggestions={setShowEmailSuggestions} filteredEmails={filteredEmails}
                handleAssignAsset={handleAssignAsset} complaints={complaints}
                // PASAM PROPS-URILE NOI PENTRU EDIT MODE
                handleEditEmailInput={handleEditEmailInput}
                showEditEmailSuggestions={showEditEmailSuggestions}
                setShowEditEmailSuggestions={setShowEditEmailSuggestions}
                filteredEditEmails={filteredEditEmails}
            />

            {isAddModalOpen && (
                <AddAssetModal
                    setIsAddModalOpen={setIsAddModalOpen}
                    newAssetData={newAssetData} setNewAssetData={setNewAssetData}
                    categoriesList={categoriesList} handleNewAssetEmailInput={handleNewAssetEmailInput}
                    showEmailSuggestionsAdd={showEmailSuggestionsAdd} setShowEmailSuggestionsAdd={setShowEmailSuggestionsAdd}
                    filteredEmailsAdd={filteredEmailsAdd} handleAddAsset={handleAddAsset}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}