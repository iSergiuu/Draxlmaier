import React, { useState, useEffect } from 'react';
import { Clock, User, Mail, ChevronDown, Search, Filter, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { STATUS_CONFIG, PRIORITY_CONFIG, ASSET_CATEGORIES, getStatus, getPriority, formatDate } from './ticketUtils';

// ─── Badge ──────────────────────────────────────────────────────────────────────

export function Badge({ cfg }) {
    return (
        <span className={`inline-flex items-center gap-1 border rounded-full font-semibold text-[10px] px-2 py-0.5 ${cfg.bg}`}>
            {cfg.label}
        </span>
    );
}

// ─── Ticket Row ─────────────────────────────────────────────────────────────────

export function TicketRow({ ticket, authorEmail, onClick }) {
    const status   = getStatus(ticket);
    const priority = getPriority(ticket);
    const category = ticket._category || 'Altele';

    return (
        <div
            onClick={() => onClick(ticket)}
            className="grid items-center gap-6 px-5 py-3.5 border-b border-brand-border hover:bg-brand-primary/5 cursor-pointer transition-colors group"
            style={{ gridTemplateColumns: '50px minmax(0, 2fr) 1fr 1fr 1fr 1fr' }}
        >
            {/* Nr */}
            <span className="text-xs font-mono text-brand-muted w-8 text-right">#{ticket.ticketNumber ?? '—'}</span>

            {/* Titlu + autor + email */}
            <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-text truncate group-hover:text-brand-primary transition-colors">
                    {ticket.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <User size={10} className="text-brand-muted shrink-0" />
                    <span className="text-xs text-brand-muted truncate">{ticket.authorName || '—'}</span>
                    {authorEmail && (
                        <>
                            <span className="text-brand-border">·</span>
                            <Mail size={10} className="text-brand-muted shrink-0" />
                            <span className="text-xs text-brand-muted truncate">{authorEmail}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Categorie asset */}
            <div className="flex justify-center">
                <span className="text-xs text-brand-muted bg-brand-bg border border-brand-border rounded-full px-2.5 py-0.5 truncate inline-flex items-center justify-center">
                    {category}
                </span>
            </div>

            {/* Prioritate */}
            <div className="flex justify-center"><Badge cfg={priority} /></div>

            {/* Status */}
            <div className="flex justify-center"><Badge cfg={status} /></div>

            {/* Data */}
            <div className="flex justify-center">
                <span className="text-xs text-brand-muted flex items-center gap-1 whitespace-nowrap">
                    <Clock size={11} /> {formatDate(ticket.createdAt)}
                </span>
            </div>
        </div>
    );
}

// ─── Table Header ───────────────────────────────────────────────────────────────

export function TicketTableHeader() {
    return (
        <div
            className="grid items-center gap-6 px-5 py-2.5 bg-brand-bg border-b border-brand-border"
            style={{ gridTemplateColumns: '50px minmax(0, 2fr) 1fr 1fr 1fr 1fr' }}
        >
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider w-8 text-right">#</span>
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider">Titlu / Autor</span>
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider text-center">Categorie</span>
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider text-center">Prioritate</span>
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider text-center">Status</span>
            <span className="text-[10px] font-semibold text-brand-muted uppercase tracking-wider text-center">Data</span>
        </div>
    );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────────

export function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: color + '20' }}>
                <Icon size={18} style={{ color }} />
            </div>
            <div>
                <p className="text-xl font-bold text-brand-text">{value}</p>
                <p className="text-xs text-brand-muted">{label}</p>
            </div>
        </div>
    );
}

// ─── Filter Select ──────────────────────────────────────────────────────────────

export function FilterSelect({ value, onChange, options, icon: Icon, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const selected = options.find(o => o.value === value);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 bg-brand-card border border-brand-border rounded-lg text-xs text-brand-text hover:border-brand-primary transition-colors whitespace-nowrap"
            >
                {Icon && <Icon size={13} className="text-brand-muted" />}
                <span>{selected?.label || placeholder}</span>
                <ChevronDown size={12} className={`text-brand-muted transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-brand-card border border-brand-border rounded-lg shadow-xl z-20 min-w-[160px] overflow-hidden">
                    {options.map(o => (
                        <button
                            key={o.value}
                            onClick={() => { onChange(o.value); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-brand-primary/10 transition-colors ${value === o.value ? 'text-brand-primary font-semibold' : 'text-brand-text'}`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Filters Bar ────────────────────────────────────────────────────────────────

export function TicketFilters({ search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, categoryFilter, setCategoryFilter, sortOrder, setSortOrder }) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cauta dupa titlu, autor, email, nr..."
                    className="w-full pl-9 pr-4 py-2 bg-brand-card border border-brand-border rounded-lg text-xs text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-primary transition-colors"
                />
            </div>

            <FilterSelect value={statusFilter} onChange={setStatusFilter} icon={Filter}
                placeholder="Toate statusurile"
                options={[
                    { value: 'ALL', label: 'Toate statusurile' },
                    ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))
                ]}
            />

            <FilterSelect value={priorityFilter} onChange={setPriorityFilter} icon={AlertTriangle}
                placeholder="Toate prioritatile"
                options={[
                    { value: 'ALL', label: 'Toate prioritatile' },
                    ...Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))
                ]}
            />

            <FilterSelect value={categoryFilter} onChange={setCategoryFilter} icon={Filter}
                placeholder="Toate categoriile"
                options={[
                    { value: 'ALL', label: 'Toate categoriile' },
                    ...ASSET_CATEGORIES.map(c => ({ value: c, label: c }))
                ]}
            />

            <FilterSelect value={sortOrder} onChange={setSortOrder} icon={ArrowUpDown}
                placeholder="Sorteaza"
                options={[
                    { value: 'NEWEST',   label: 'Cele mai noi' },
                    { value: 'OLDEST',   label: 'Cele mai vechi' },
                    { value: 'PRIORITY', label: 'Dupa prioritate' },
                ]}
            />
        </div>
    );
}