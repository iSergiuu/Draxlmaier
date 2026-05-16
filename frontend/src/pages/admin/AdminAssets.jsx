// src/pages/admin/AdminAssets.jsx
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Laptop, Smartphone, HardDrive } from 'lucide-react';

// Importam componentele proaspat create
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
        const rawAssignee = asset?.assignedEmail || asset?.assigned_email || asset?.userEmail || asset?.assignedToId || asset?.assigned_to_id || asset?.employeeId || null;

        // Daca informatia primita nu contine '@', inseamna ca este un ID si trebuie sa gasim emailul
        if (rawAssignee && !rawAssignee.includes('@')) {
            const foundEmployee = employees.find(emp => emp.id === rawAssignee);
            if (foundEmployee) return foundEmployee.email;
        }

        return rawAssignee;
    };

    const isDefective = (assetId) => {
        const currentAsset = assets.find(a => a.id === assetId);
        if (currentAsset && currentAsset.status === 'DEFECTIVE') return true;
        return complaints.some(c => (c.assetId === assetId || c.asset_id === assetId) && (c.status === 'PENDING' || c.status === 'IN_PROGRESS'));
    };

    const normalizeCategory = (cat) => {
        if (!cat) return '';
        return cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1).toLowerCase();
    };

    const dbCategories = assets.map(a => normalizeCategory(a.category)).filter(Boolean);
    const categoriesList = [...new Set([...dbCategories, 'Laptop', 'Telefon', 'Monitor', 'Periferice', 'Altele'])];

    useEffect(() => {
        if (selectedAsset) {
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
            if (!response.ok) {
                const errData = await response.text();
                throw new Error(`Eroare la salvare: ${errData}`);
            }

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
       // Validare: Oprim salvarea daca a pus Atribuit dar a lasat emailul gol
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

            // Daca statusul s-a schimbat in ASSIGNED, apelam explicit si ruta de alocare
            if (editData.status === 'ASSIGNED' && finalEmail) {
                const employee = employees.find(emp => emp.email.toLowerCase() === finalEmail.toLowerCase());
                if (employee) {
                    await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/assign`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ employeeId: employee.id })
                    });
                }
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

            // Verificare adaugata pentru a nu inchide modalul daca stergerea esueaza in backend
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Eroare la stergere din baza de date (${response.status}): ${errText}`);
            }

            setSelectedAsset(null);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleAssignAsset = async () => {
        if (!assignEmail) return alert('Introdu un email valid!');

        // Gasim angajatul in lista pentru a-i lua ID-ul
        const employee = employees.find(emp => emp.email.toLowerCase() === assignEmail.toLowerCase());
        if (!employee) return alert('Angajatul cu acest email nu a fost gasit in baza de date!');

        try {
            const response = await fetch(`http://localhost:8080/api/assets/${selectedAsset.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                // Trimitem employeeId asa cum cere backend-ul!
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

    const getCategoryIcon = (category) => {
        const cat = normalizeCategory(category).toLowerCase();
        if (cat.includes('laptop')) return <Laptop className="w-5 h-5 text-brand-primary" />;
        if (cat.includes('telefon') || cat.includes('phone')) return <Smartphone className="w-5 h-5 text-blue-400" />;
        return <HardDrive className="w-5 h-5 text-brand-muted" />;
    };

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

    const totalAssets = assets.length;
    const defectiveAssetsCount = assets.filter(a => isDefective(a.id)).length;
    const assignedAssetsCount = assets.filter(a => !isDefective(a.id) && !!getAssignee(a)).length;
    const availableAssetsCount = totalAssets - defectiveAssetsCount - assignedAssetsCount;

    const availableDeg = totalAssets ? (availableAssetsCount / totalAssets) * 360 : 0;
    const assignedDeg = totalAssets ? (assignedAssetsCount / totalAssets) * 360 : 0;

    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED').length;
    const rejectedComplaints = complaints.filter(c => c.status === 'REJECTED').length;
    const pendingComplaints = complaints.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length;

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

            <AssetSummaryCards
                totalAssets={totalAssets}
                availableAssetsCount={availableAssetsCount}
                assignedAssetsCount={assignedAssetsCount}
                defectiveAssetsCount={defectiveAssetsCount}
                availableDeg={availableDeg}
                assignedDeg={assignedDeg}
                totalComplaints={totalComplaints}
                pendingComplaints={pendingComplaints}
                resolvedComplaints={resolvedComplaints}
                rejectedComplaints={rejectedComplaints}
            />

            <AssetFilters
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
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
            />

            <AssetDetailsModal
                selectedAsset={selectedAsset}
                setSelectedAsset={setSelectedAsset}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editData={editData}
                setEditData={setEditData}
                categoriesList={categoriesList}
                normalizeCategory={normalizeCategory}
                isDefective={isDefective}
                getAssignee={getAssignee}
                getCategoryIcon={getCategoryIcon}
                handleUpdateAsset={handleUpdateAsset}
                handleDeleteAsset={handleDeleteAsset}
                assignEmail={assignEmail}
                setAssignEmail={setAssignEmail}
                handleEmailInput={handleEmailInput}
                showEmailSuggestions={showEmailSuggestions}
                setShowEmailSuggestions={setShowEmailSuggestions}
                filteredEmails={filteredEmails}
                handleAssignAsset={handleAssignAsset}
                employees={employees}
                complaints={complaints}
            />

            {isAddModalOpen && (
                <AddAssetModal
                    setIsAddModalOpen={setIsAddModalOpen}
                    newAssetData={newAssetData}
                    setNewAssetData={setNewAssetData}
                    categoriesList={categoriesList}
                    handleNewAssetEmailInput={handleNewAssetEmailInput}
                    showEmailSuggestionsAdd={showEmailSuggestionsAdd}
                    setShowEmailSuggestionsAdd={setShowEmailSuggestionsAdd}
                    filteredEmailsAdd={filteredEmailsAdd}
                    handleAddAsset={handleAddAsset}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}