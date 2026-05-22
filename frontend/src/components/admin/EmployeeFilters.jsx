import React from 'react';
import CustomSelect from './CustomSelect';
import { Building2, ArrowUpDown } from 'lucide-react';

export default function EmployeeFilters({
                                            searchQuery, setSearchQuery,
                                            selectedDeptFilter, setSelectedDeptFilter,
                                            sortOrder, setSortOrder,
                                            departments
                                        }) {
    return (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between relative z-10">
            <div className="flex flex-wrap gap-4 flex-1 items-center">
                <input
                    type="text"
                    placeholder="Caută după nume sau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />

                <div className="w-full md:w-56 z-30 relative">
                    <CustomSelect
                        value={selectedDeptFilter}
                        onChange={setSelectedDeptFilter}
                        options={[{value: 'ALL', label: 'Toate Departamentele'}, ...departments.map(d => ({value: d.id, label: d.name}))]}
                        icon={Building2}
                        placeholder="Toate Departamentele"
                    />
                </div>

                <div className="w-full md:w-48 z-20 relative">
                    <CustomSelect
                        value={sortOrder}
                        onChange={setSortOrder}
                        options={[
                            {value: 'NEWEST', label: 'Cele mai noi'},
                            {value: 'OLDEST', label: 'Cele mai vechi'},
                            {value: 'AZ', label: 'Nume (A - Z)'},
                            {value: 'ZA', label: 'Nume (Z - A)'}
                        ]}
                        icon={ArrowUpDown}
                        placeholder="Sortează..."
                    />
                </div>
            </div>
        </div>
    );
}