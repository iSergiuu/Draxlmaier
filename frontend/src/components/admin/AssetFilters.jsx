// src/components/admin/AssetFilters.jsx
import React from 'react';
import { Search } from 'lucide-react';

export default function AssetFilters({
                                         searchQuery, setSearchQuery,
                                         statusFilter, setStatusFilter,
                                         categoryFilter, setCategoryFilter,
                                         sortOrder, setSortOrder,
                                         categoriesList
                                     }) {
    return (
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
    );
}