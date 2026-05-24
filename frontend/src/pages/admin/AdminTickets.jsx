import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../App';
import { Ticket, Loader2, Inbox, UserCheck, Circle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { findAuthorEmail } from '../../components/admin/ticketUtils';
import { TicketRow, TicketTableHeader, StatCard, TicketFilters } from '../../components/admin/TicketComponents';

const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('token') || localStorage.getItem('jwt_token');

const MINE_STATUSES = ['IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'REJECTED'];
const ACTIVE_STATUSES = ['NEW', 'IN_REVIEW'];
const CLOSED_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'];

export default function AdminTickets() {
    const showToast  = useContext(ToastContext);
    const navigate   = useNavigate();

    const [tickets,   setTickets]   = useState([]);
    const [employees, setEmployees] = useState([]);
    const [assets,    setAssets]    = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState('ACTIVE');

    const [search,          setSearch]          = useState('');
    const [statusFilter,    setStatusFilter]    = useState('ALL');
    const [priorityFilter,  setPriorityFilter]  = useState('ALL');
    const [categoryFilter,  setCategoryFilter]  = useState('ALL');
    const [sortOrder,       setSortOrder]       = useState('NEWEST');

    const pollRef = useRef(null);

    const fetchAll = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [tRes, eRes, aRes] = await Promise.all([
                fetch(`${API}/complaints`, { headers: { 'Authorization': `Bearer ${token()}` } }),
                fetch(`${API}/employees`,  { headers: { 'Authorization': `Bearer ${token()}` } }),
                fetch(`${API}/assets`,     { headers: { 'Authorization': `Bearer ${token()}` } }),
            ]);
            const rawAssets = aRes.ok ? await aRes.json() : [];
            if (aRes.ok) setAssets(rawAssets);
            const assetMap = {};
            rawAssets.forEach(a => { assetMap[a.id] = a.category || 'Altele'; });
            if (tRes.ok) {
                const raw = await tRes.json();
                setTickets(raw.map(t => ({ ...t, _category: assetMap[t.assetId] || 'Altele' })));
            }
            if (eRes.ok) setEmployees(await eRes.json());
        } catch {
            if (!silent) showToast('Eroare la încărcarea tichetelor.', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAll();
        pollRef.current = setInterval(() => fetchAll(true), 30000);
        return () => clearInterval(pollRef.current);
    }, [fetchAll]);

    const total      = tickets.length;
    const newCount   = tickets.filter(t => (t.statusCode || '').toUpperCase() === 'NEW').length;
    const inProgress = tickets.filter(t => ['IN_PROGRESS', 'IN_REVIEW'].includes((t.statusCode || '').toUpperCase())).length;
    const resolved   = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes((t.statusCode || '').toUpperCase())).length;

    const processed = tickets.filter(t => {
        const tStatus   = (t.statusCode || t.status || '').toUpperCase();
        const tPriority = (t.priority || '').toUpperCase();
        const tCat      = t._category || 'Altele';

        if (activeTab === 'ACTIVE' && !ACTIVE_STATUSES.includes(tStatus)) return false;
        if (activeTab === 'CLOSED' && !CLOSED_STATUSES.includes(tStatus)) return false;
        if (activeTab === 'MINE'   && !MINE_STATUSES.includes(tStatus))   return false;

        if (statusFilter   !== 'ALL' && tStatus   !== statusFilter)   return false;
        if (priorityFilter !== 'ALL' && tPriority !== priorityFilter) return false;
        if (categoryFilter !== 'ALL' && tCat      !== categoryFilter) return false;

        if (search) {
            const s     = search.toLowerCase();
            const email = findAuthorEmail(t.authorName, employees) || '';
            const matches =
                (t.title      || '').toLowerCase().includes(s) ||
                (t.authorName || '').toLowerCase().includes(s) ||
                email.toLowerCase().includes(s) ||
                String(t.ticketNumber || '').includes(s);
            if (!matches) return false;
        }

        return true;
    }).sort((a, b) => {
        if (sortOrder === 'NEWEST')   return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOrder === 'OLDEST')   return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'PRIORITY') {
            const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
            return (order[(a.priority || '').toUpperCase()] ?? 9) - (order[(b.priority || '').toUpperCase()] ?? 9);
        }
        return 0;
    });

    const PAGE_SIZE = 50;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(processed.length / PAGE_SIZE);
    const paginated  = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, statusFilter, priorityFilter, categoryFilter, sortOrder, activeTab]);

    return (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-text">Tichete Suport</h3>
            </div>

            <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
                <StatCard label="Total"     value={total}      icon={Ticket}       color="#3b82f6" />
                <StatCard label="Noi"       value={newCount}   icon={Circle}       color="#a855f7" />
                <StatCard label="În lucru"  value={inProgress} icon={AlertCircle}  color="#f59e0b" />
                <StatCard label="Rezolvate" value={resolved}   icon={CheckCircle2} color="#22c55e" />
            </div>

            <div className="flex gap-1 border-b border-brand-border overflow-x-auto no-scrollbar">
                {[
                    { key: 'ACTIVE', label: 'Tichete active',  icon: AlertCircle },
                    { key: 'CLOSED', label: 'Tichete închise', icon: CheckCircle2 },
                    { key: 'MINE',   label: 'Tichetele mele',  icon: UserCheck },
                    { key: 'ALL',    label: 'Toate',           icon: Inbox },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-muted hover:text-brand-text'}`}>
                        <tab.icon size={15} /> {tab.label}
                    </button>
                ))}
            </div>

            <TicketFilters
                search={search} setSearch={setSearch}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
            />

            <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="flex-1 flex flex-col min-h-0 overflow-x-auto">
                    <div className="min-w-[800px] flex flex-col h-full">
                        <TicketTableHeader />
                        <div className="overflow-y-auto flex-1">
                            {loading ? (
                                <div className="flex items-center justify-center py-16 gap-2 text-brand-muted">
                                    <Loader2 size={18} className="animate-spin" /> Se incarca...
                                </div>
                            ) : paginated.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-2 text-brand-muted">
                                    <Inbox size={32} className="opacity-30" />
                                    <p className="text-sm">Niciun tichet găsit.</p>
                                </div>
                            ) : (
                                paginated.map(t => (
                                    <TicketRow
                                        key={t.id}
                                        ticket={t}
                                        authorEmail={findAuthorEmail(t.authorName, employees)}
                                        onClick={() => navigate(`/complaint/${t.id}`)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-5 py-2.5 border-t border-brand-border bg-brand-bg flex items-center justify-between">
                    <span className="text-xs text-brand-muted">
                        {processed.length} tichete · pagina {page} din {totalPages || 1}
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-2 py-1 text-xs border border-brand-border rounded text-brand-muted hover:text-brand-text disabled:opacity-40 transition-colors">
                                ← Prev
                            </button>
                            <span className="text-xs text-brand-muted">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-2 py-1 text-xs border border-brand-border rounded text-brand-muted hover:text-brand-text disabled:opacity-40 transition-colors">
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}