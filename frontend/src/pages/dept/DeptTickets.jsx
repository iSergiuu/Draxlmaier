import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ToastContext } from '../../App';
import { Ticket, Loader2, Inbox, Circle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { findAuthorEmail } from '../../components/admin/ticketUtils';
import { TicketRow, TicketTableHeader, StatCard, TicketFilters } from '../../components/admin/TicketComponents';

const API = 'http://localhost:8080/api';
const token = () => localStorage.getItem('token');

export default function DeptTickets() {
    const { me } = useOutletContext();
    const navigate = useNavigate();
    const showToast = useContext(ToastContext);

    const [tickets, setTickets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 50;

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
            if (eRes.ok) setEmployees(await eRes.json());
            if (tRes.ok) {
                const raw = await tRes.json();
                setTickets(raw.map(t => ({ ...t, _category: assetMap[t.assetId] || 'Altele' })));
            }
        } catch {
            if (!silent) showToast('Eroare la încărcarea tichetelor.', 'error');
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        pollRef.current = setInterval(() => fetchAll(true), 30000);
        return () => clearInterval(pollRef.current);
    }, [fetchAll]);

    // Filtrare pe departamentul responsabilului
    const deptTickets = tickets.filter(t => {
        if (!me) return true;
        const author = employees.find(e => {
            const full1 = `${e.firstName} ${e.lastName}`.toLowerCase();
            const full2 = `${e.lastName} ${e.firstName}`.toLowerCase();
            return full1 === (t.authorName || '').toLowerCase() || full2 === (t.authorName || '').toLowerCase();
        });
        return author?.departmentName === me.departmentName;
    });

    const total      = deptTickets.length;
    const newCount   = deptTickets.filter(t => (t.statusCode || '').toUpperCase() === 'NEW').length;
    const inProgress = deptTickets.filter(t => ['IN_PROGRESS', 'IN_REVIEW'].includes((t.statusCode || '').toUpperCase())).length;
    const resolved   = deptTickets.filter(t => ['RESOLVED', 'CLOSED'].includes((t.statusCode || '').toUpperCase())).length;

    const processed = deptTickets.filter(t => {
        const tStatus   = (t.statusCode || '').toUpperCase();
        const tPriority = (t.priority || '').toUpperCase();
        if (statusFilter   !== 'ALL' && tStatus   !== statusFilter)   return false;
        if (priorityFilter !== 'ALL' && tPriority !== priorityFilter) return false;
        if (categoryFilter !== 'ALL' && t._category !== categoryFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            const email = findAuthorEmail(t.authorName, employees) || '';
            return (t.title || '').toLowerCase().includes(s) ||
                   (t.authorName || '').toLowerCase().includes(s) ||
                   email.toLowerCase().includes(s) ||
                   String(t.ticketNumber || '').includes(s);
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

    const totalPages = Math.ceil(processed.length / PAGE_SIZE);
    const paginated  = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => setPage(1), [search, statusFilter, priorityFilter, categoryFilter, sortOrder]);

    return (
        <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-brand-text">Tichete Departament</h3>

            <div className="grid grid-cols-4 gap-4">
                <StatCard label="Total"     value={total}      icon={Ticket}       color="#3b82f6" />
                <StatCard label="Noi"       value={newCount}   icon={Circle}       color="#a855f7" />
                <StatCard label="În lucru"  value={inProgress} icon={AlertCircle}  color="#f59e0b" />
                <StatCard label="Rezolvate" value={resolved}   icon={CheckCircle2} color="#22c55e" />
            </div>

            <TicketFilters
                search={search} setSearch={setSearch}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
            />

            <div className="bg-brand-card border border-brand-border rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
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
                            <TicketRow key={t.id} ticket={t}
                                authorEmail={findAuthorEmail(t.authorName, employees)}
                                onClick={(ticket) => navigate(`/complaint/${ticket.id}`)}
                            />
                        ))
                    )}
                </div>
                <div className="px-5 py-2.5 border-t border-brand-border bg-brand-bg flex items-center justify-between">
                    <span className="text-xs text-brand-muted">
                        {processed.length} tichete · pagina {page} din {totalPages || 1}
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-2 py-1 text-xs border border-brand-border rounded text-brand-muted hover:text-brand-text disabled:opacity-40">← Prev</button>
                            <span className="text-xs text-brand-muted">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-2 py-1 text-xs border border-brand-border rounded text-brand-muted hover:text-brand-text disabled:opacity-40">Next →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}