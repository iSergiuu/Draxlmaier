import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Ticket, Clock, CheckCircle,
    AlertTriangle, AlertCircle, Info,
    Package, Search
} from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';

// ── Animații ──────────────────────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    NEW:         { label: 'Nou',        icon: AlertCircle,   dot: 'bg-blue-400',   pill: 'bg-blue-500/10 text-blue-400 border-blue-400/30' },
    IN_REVIEW:   { label: 'În analiză', icon: Clock,         dot: 'bg-purple-400', pill: 'bg-purple-500/10 text-purple-400 border-purple-400/30' },
    IN_PROGRESS: { label: 'În lucru',   icon: Clock,         dot: 'bg-amber-400',  pill: 'bg-amber-500/10 text-amber-400 border-amber-400/30' },
    RESOLVED:    { label: 'Rezolvat',   icon: CheckCircle,   dot: 'bg-green-400',  pill: 'bg-green-500/10 text-green-400 border-green-400/30' },
    CLOSED:      { label: 'Închis',     icon: CheckCircle,   dot: 'bg-green-400',  pill: 'bg-green-500/10 text-green-400 border-green-400/30' },
    REJECTED:    { label: 'Respins',    icon: AlertTriangle, dot: 'bg-red-400',    pill: 'bg-red-500/10 text-red-400 border-red-400/30' },
};

const getStatus = (status) => {
    const key = (status || '').toUpperCase();
    return STATUS_CONFIG[key] ?? { label: status || 'Necunoscut', icon: Info, dot: 'bg-brand-muted', pill: 'bg-brand-bg text-brand-muted border-brand-border' };
};

// ── Priority config ───────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
    CRITICAL: { label: 'Critică',  class: 'bg-red-500/10 text-red-400 border-red-400/30' },
    HIGH:     { label: 'Ridicată', class: 'bg-orange-500/10 text-orange-400 border-orange-400/30' },
    MEDIUM:   { label: 'Medie',    class: 'bg-amber-500/10 text-amber-400 border-amber-400/30' },
    LOW:      { label: 'Scăzută',  class: 'bg-brand-bg text-brand-muted border-brand-border' },
};

const getPriority = (priority) => {
    const key = (priority || '').toUpperCase();
    return PRIORITY_CONFIG[key] ?? { label: priority || '—', class: 'bg-brand-bg text-brand-muted border-brand-border' };
};

// ── Componenta principală ─────────────────────────────────────────────────────
export default function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [search, setSearch]         = useState('');
    const [filterStatus, setFilterStatus] = useState('Toate');
    const navigate = useNavigate();

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            const response = await fetch('http://localhost:8080/api/complaints/me', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setComplaints(await response.json());
            } else if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Eroare de la server.');
            }
        } catch {
            setError('Eroare de conexiune cu serverul.');
        } finally {
            setLoading(false);
        }
    };

    // ── Filtrare ──────────────────────────────────────────────────────────────
    const STATUS_FILTERS = ['Toate', 'Nou', 'În analiză', 'În lucru', 'Rezolvat', 'Respins'];
    const STATUS_FILTER_MAP = { 'Nou': 'NEW', 'În analiză': 'IN_REVIEW', 'În lucru': 'IN_PROGRESS', 'Rezolvat': 'RESOLVED', 'Respins': 'REJECTED' };

    const visible = complaints.filter(t => {
        const matchSearch = search === '' ||
            (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'Toate' ||
            (t.status || t.statusCode || '').toUpperCase() === STATUS_FILTER_MAP[filterStatus];
        return matchSearch && matchStatus;
    });

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-brand-muted text-sm">Se încarcă sesizările...</p>
            </div>
        </div>
    );

    // ── UI ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-brand-bg transition-colors duration-300">
            <div className="w-full px-6 lg:px-10 py-8 space-y-6">

                {/* ══ Topbar ══════════════════════════════════════════════════ */}
                <div className="bg-brand-card border border-brand-border rounded-2xl px-6 py-4 flex justify-between items-center shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-text transition-colors mb-0.5"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Înapoi la Asset-urile mele
                            </button>
                            <h1 className="text-lg font-bold text-brand-text leading-tight">Sesizările mele</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                {/* ══ Bara de căutare + filtre ════════════════════════════════ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Caută sesizare..."
                            className="w-full bg-brand-card border border-brand-border text-brand-text text-sm rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all placeholder:text-brand-muted"
                        />
                    </div>

                    {/* Filtre status */}
                    <div className="flex gap-1.5 flex-wrap">
                        {STATUS_FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterStatus(f)}
                                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                                    filterStatus === f
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'border-brand-border text-brand-muted hover:text-brand-text bg-brand-card'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══ Eroare ══════════════════════════════════════════════════ */}
                {error && (
                    <div className="bg-red-500/10 border border-red-400/30 text-red-400 px-5 py-4 rounded-2xl text-sm">
                        {error}
                    </div>
                )}

                {/* ══ Stare goală ═════════════════════════════════════════════ */}
                {!error && visible.length === 0 && (
                    <div className="bg-brand-card border border-brand-border rounded-2xl p-14 flex flex-col items-center justify-center gap-3 transition-colors duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-brand-bg border border-brand-border flex items-center justify-center mb-1">
                            <CheckCircle className="w-6 h-6 text-brand-muted opacity-40" />
                        </div>
                        <p className="text-base font-semibold text-brand-text">
                            {search || filterStatus !== 'Toate' ? 'Niciun rezultat găsit' : 'Totul funcționează perfect!'}
                        </p>
                        <p className="text-sm text-brand-muted">
                            {search || filterStatus !== 'Toate'
                                ? 'Încearcă alte criterii de filtrare.'
                                : 'Nu ai raportat nicio problemă până acum.'}
                        </p>
                    </div>
                )}

                {/* ══ Grid sesizări ════════════════════════════════════════════ */}
                {!error && visible.length > 0 && (
                    <>
                        <p className="text-xs text-brand-muted">
                            {visible.length} sesizăr{visible.length === 1 ? 'e' : 'i'} găsite
                        </p>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {visible.map((ticket) => {
                                const statusKey = (ticket.status || ticket.statusCode || '').toUpperCase();
                                const status    = getStatus(statusKey);
                                const priority  = getPriority(ticket.priority);
                                const StatusIcon = status.icon;
                                const ticketNum  = ticket.ticketNumber || String(ticket.id).substring(0, 6).toUpperCase();
                                const date       = ticket.createdAt
                                    ? new Date(ticket.createdAt).toLocaleDateString('ro-RO')
                                    : null;

                                return (
                                    <motion.div
                                        key={ticket.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -4, transition: { duration: 0.15 } }}
                                        className="bg-brand-card border border-brand-border rounded-2xl flex flex-col hover:border-brand-primary hover:shadow-md transition-all duration-200"
                                    >
                                        {/* Stripe colorat top */}
                                        <div className={`h-1 w-full rounded-t-2xl ${status.dot}`} />

                                        <div className="p-5 flex flex-col gap-3 flex-1">
                                            {/* Header: nr tichet + prioritate */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-mono font-bold text-brand-muted bg-brand-bg border border-brand-border px-2 py-0.5 rounded-md">
                                                    #{ticketNum}
                                                </span>
                                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${priority.class}`}>
                                                    {priority.label}
                                                </span>
                                            </div>

                                            {/* Titlu + descriere */}
                                            <div className="flex-1">
                                                <h2 className="text-sm font-bold text-brand-text line-clamp-1 leading-snug">
                                                    {ticket.title}
                                                </h2>
                                                <p className="text-xs text-brand-muted mt-1.5 line-clamp-2 leading-relaxed">
                                                    {ticket.description}
                                                </p>
                                            </div>

                                            {/* Footer: status + data + buton */}
                                            <div className="border-t border-brand-border pt-3 flex flex-col gap-2.5 mt-auto">
                                                <div className="flex items-center justify-between">
                                                    {/* Status pill */}
                                                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.pill}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </span>
                                                    {/* Data */}
                                                    {date && (
                                                        <span className="text-[11px] text-brand-muted">{date}</span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/complaint/${ticket.id}`)}
                                                    className="w-full py-2 text-xs font-semibold text-brand-primary bg-brand-bg border border-brand-border rounded-xl hover:border-brand-primary hover:bg-brand-card transition-all"
                                                >
                                                    Vezi detalii →
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </>
                )}

            </div>
        </div>
    );
}
