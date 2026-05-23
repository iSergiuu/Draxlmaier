import React from 'react';
import CustomSelect from './CustomSelect';
import { ArrowUpDown, Search, Mail, Tag, Building } from 'lucide-react';

export default function AssetFilters({
                                        searchQuery, setSearchQuery,
                                        emailSearchQuery, setEmailSearchQuery,
                                        statusFilter, setStatusFilter,
                                        departmentFilter, setDepartmentFilter,
                                        departmentsList,
                                        sortOrder, setSortOrder,
                                    }) {
    return (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-wrap items-center gap-4 relative z-10 shadow-sm transition-colors duration-300">

            <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search size={16} className="text-brand-muted" />
                </div>
                <input
                    type="text"
                    placeholder="Cauta dupa nume..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
            </div>

            <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail size={16} className="text-brand-muted" />
                </div>
                <input
                    type="text"
                    placeholder="Cauta dupa email..."
                    value={emailSearchQuery}
                    onChange={(e) => setEmailSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
            </div>

            <div className="w-48 z-30 relative">
                <CustomSelect
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    options={[{value: 'ALL', label: 'Toate Departamentele'}, ...departmentsList.map(d => ({value: d.id, label: d.name}))]}
                    icon={Building}
                    placeholder="Departament"
                />
            </div>

            <div className="w-48 z-20 relative">
                <CustomSelect
                    value={sortOrder}
                    onChange={setSortOrder}
                    options={[
                        {value: 'NEWEST', label: 'Cele mai noi'},
                        {value: 'OLDEST', label: 'Cele mai vechi'},
                        {value: 'AZ', label: 'A - Z'},
                        {value: 'ZA', label: 'Z - A'}
                    ]}
                    icon={ArrowUpDown}
                    placeholder="Sorteaza..."
                />
            </div>
        </div>
    );
}
