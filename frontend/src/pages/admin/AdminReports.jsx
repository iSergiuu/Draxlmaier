import React, { useState, useEffect } from 'react';
import { Download, Loader2, AlertCircle, Calendar, FileText, Table, Code, Sheet } from 'lucide-react';

const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('token');

const ENTITIES = [
    { value: 'EMPLOYEE',  label: 'Angajați' },
    { value: 'ASSET',     label: 'Echipamente' },
    { value: 'COMPLAINT', label: 'Tichete' },
    { value: 'GENERATED_ACCOUNTS', label: 'Conturi Generate' },
];

const FORMATS = [
    { value: 'PDF',   label: 'PDF',   icon: FileText },
    { value: 'CSV',   label: 'CSV',   icon: Table },
    { value: 'XML',   label: 'XML',   icon: Code },
    { value: 'EXCEL', label: 'Excel', icon: Sheet },
];

const DATE_PRESETS = [
    { value: '24h',    label: 'Ultimele 24h' },
    { value: '7d',     label: 'Ultima săptămână' },
    { value: '30d',    label: 'Ultima lună' },
    { value: 'custom', label: 'Interval personalizat' },
];

const COLUMNS_MAP = {
    EMPLOYEE:           ['firstName', 'lastName', 'email', 'departmentName', 'roleCode', 'isActive', 'createdAt'],
    ASSET:              ['name', 'serialNumber', 'category', 'status', 'assignedToName', 'assignedToEmail', 'createdAt'],
    COMPLAINT:          ['title', 'description', 'status', 'priority', 'authorName', 'createdAt'],
    GENERATED_ACCOUNTS: ['email', 'departmentName', 'employeeNumber', 'isActive', 'createdAt'],
};

const COLUMN_LABELS = {
    firstName: 'Prenume', lastName: 'Nume', email: 'Email',
    departmentName: 'Departament', roleCode: 'Rol', isActive: 'Activ',
    createdAt: 'Data creare', name: 'Nume echipament', serialNumber: 'Serie',
    category: 'Categorie', status: 'Status', assignedToName: 'Atribuit',
    assignedToEmail: 'Email atribuit', title: 'Titlu', description: 'Descriere',
    priority: 'Prioritate', authorName: 'Autor', employeeNumber: 'Cod angajat',
};

function ToggleButton({ label, selected, onClick, accent }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                selected
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                    : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/40'
            }`}
        >
            {label}
            {accent && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-brand-card" />
            )}
        </button>
    );
}

function Section({ title, children }) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">{title}</p>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );
}

function getDateRange(preset) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    if (preset === '24h') {
        const from = new Date(now - 24*60*60*1000);
        return { from: fmt(from), to: fmt(now) };
    }
    if (preset === '7d') {
        const from = new Date(now - 7*24*60*60*1000);
        return { from: fmt(from), to: fmt(now) };
    }
    if (preset === '30d') {
        const from = new Date(now - 30*24*60*60*1000);
        return { from: fmt(from), to: fmt(now) };
    }
    return { from: '', to: '' };
}

export default function AdminReports() {
    const role = localStorage.getItem('userRole');
    const isDeptResponsible = role === 'DEPT_RESPONSIBLE';

    const [entityType,    setEntityType]    = useState('COMPLAINT');
    const [format,        setFormat]        = useState('PDF');
    const [datePreset,    setDatePreset]    = useState('30d');
    const [customFrom,    setCustomFrom]    = useState('');
    const [customTo,      setCustomTo]      = useState('');
    const [departments,   setDepartments]   = useState([]);
    const [myDeptName,    setMyDeptName]    = useState('');
    const [selectedDepts, setSelectedDepts] = useState([]);
    const [generating,    setGenerating]    = useState(false);
    const [error,         setError]         = useState('');

    useEffect(() => {
        fetch(`${API}/departments`, { headers: { 'Authorization': `Bearer ${token()}` } })
            .then(r => r.ok ? r.json() : [])
            .then(setDepartments)
            .catch(() => {});

        if (isDeptResponsible) {
            fetch(`${API}/employees/me`, { headers: { 'Authorization': `Bearer ${token()}` } })
                .then(r => r.ok ? r.json() : null)
                .then(me => { if (me?.departmentName) setMyDeptName(me.departmentName); })
                .catch(() => {});
        }
    }, []);

    const toggleDept = (name) => {
        setSelectedDepts(prev =>
            prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
        );
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        try {
            const { from, to } = datePreset === 'custom'
                ? { from: customFrom, to: customTo }
                : getDateRange(datePreset);

            const filters = {};
            if (from) filters.createdAfter  = from;
            if (to)   filters.createdBefore = to;
            if (isDeptResponsible && myDeptName) {
                filters.departmentName = myDeptName;
            } else if (selectedDepts.length === 1 && (entityType === 'EMPLOYEE' || entityType === 'ASSET')) {
                filters.departmentName = selectedDepts[0];
            }

            const actualEntity = entityType === 'GENERATED_ACCOUNTS' ? 'EMPLOYEE' : entityType;
            if (entityType === 'GENERATED_ACCOUNTS') {
                filters.isActive = 'false';
                filters.departmentName = undefined;
            }

            const payload = {
                entityType: actualEntity,
                format,
                columns: COLUMNS_MAP[entityType],
                sortBy: 'createdAt',
                sortDirection: 'DESC',
                ...(Object.keys(filters).length > 0 && { filters }),
            };

            const res = await fetch(`${API}/reports/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token()}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Eroare server (${res.status})`);

            const blob = await res.blob();
            const extMap = { PDF: 'pdf', CSV: 'csv', XML: 'xml', EXCEL: 'xlsx' };
            const ext  = extMap[format] || 'pdf';
            const url  = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href  = url;

            const disposition = res.headers.get('content-disposition');
            let fileName = `raport_${actualEntity.toLowerCase()}.${ext}`;
            if (disposition) {
                const match = disposition.match(/filename="(.+)"/);
                if (match) fileName = match[1];
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">
            <h3 className="text-xl font-bold text-brand-text">Generare Rapoarte</h3>

            <div className="bg-brand-card border border-brand-border rounded-xl p-6 space-y-6">

                {/* Entitate */}
                <Section title="Entitate">
                    {ENTITIES.map(e => (
                        <ToggleButton
                            key={e.value}
                            label={e.label}
                            selected={entityType === e.value}
                            onClick={() => setEntityType(e.value)}
                        />
                    ))}
                </Section>

                {/* Format */}
                <Section title="Format">
                    {FORMATS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFormat(f.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                format === f.value
                                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                                    : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/40'
                            }`}
                        >
                            <f.icon size={14} />
                            {f.label}
                        </button>
                    ))}
                </Section>

                {/* Departamente - doar pentru SUPER_ADMIN */}
                {!isDeptResponsible && departments.length > 0 && (entityType === 'EMPLOYEE' || entityType === 'ASSET') && (
                    <Section title="Departament (opțional)">
                        <button
                            onClick={() => setSelectedDepts(departments.map(d => d.name))}
                            className="px-3 py-1.5 rounded-lg text-xs border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
                        >
                            Selectează toate
                        </button>
                        <button
                            onClick={() => setSelectedDepts([])}
                            className="px-3 py-1.5 rounded-lg text-xs border border-brand-border text-brand-muted hover:text-brand-text transition-colors"
                        >
                            Deselectează toate
                        </button>
                        {departments.map(d => (
                            <ToggleButton
                                key={d.id}
                                label={d.name}
                                selected={selectedDepts.includes(d.name)}
                                onClick={() => toggleDept(d.name)}
                                accent={selectedDepts.length > 1 && selectedDepts.includes(d.name)}
                            />
                        ))}
                    </Section>
                )}

                {/* Interval */}
                <Section title="Interval de timp">
                    {DATE_PRESETS.map(p => (
                        <ToggleButton
                            key={p.value}
                            label={p.label}
                            selected={datePreset === p.value}
                            onClick={() => setDatePreset(p.value)}
                        />
                    ))}
                </Section>

                {datePreset === 'custom' && (
                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">De la</label>
                            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                                className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Până la</label>
                            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                                className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary transition-colors" />
                        </div>
                    </div>
                )}

                {selectedDepts.length > 1 && (
                    <p className="text-xs text-brand-muted flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-primary inline-block" />
                        {selectedDepts.length} departamente selectate — raportul va include toate
                    </p>
                )}

                {error && (
                    <p className="text-red-400 text-xs flex items-center gap-1.5">
                        <AlertCircle size={12} /> {error}
                    </p>
                )}

                <button onClick={handleGenerate} disabled={generating}
                    className="w-full py-2.5 bg-brand-primary hover:opacity-90 text-white rounded-lg font-medium text-sm transition-opacity flex items-center justify-center gap-2 disabled:opacity-60">
                    {generating
                        ? <><Loader2 size={16} className="animate-spin" /> Se generează...</>
                        : <><Download size={16} /> Generează Raport</>
                    }
                </button>
            </div>
        </div>
    );
}