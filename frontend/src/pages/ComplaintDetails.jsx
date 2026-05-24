import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle2, Send, Clock, User, Shield,
    Info, MessageSquare, MonitorSmartphone, ChevronDown, Package
} from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';

const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const WORKFLOW_STEPS = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STEP_LABELS = {
    NEW:         'Nou',
    IN_REVIEW:   'În analiză',
    IN_PROGRESS: 'În lucru',
    RESOLVED:    'Rezolvat',
    CLOSED:      'Închis',
};

const PRIORITY_CONFIG = {
    CRITICAL: { label: 'Critică',  cls: 'bg-red-500/10 text-red-400 border-red-400/30' },
    HIGH:     { label: 'Ridicată', cls: 'bg-orange-500/10 text-orange-400 border-orange-400/30' },
    MEDIUM:   { label: 'Medie',    cls: 'bg-amber-500/10 text-amber-400 border-amber-400/30' },
    LOW:      { label: 'Scăzută',  cls: 'bg-brand-bg text-brand-muted border-brand-border' },
};
const getPriority = (p) => PRIORITY_CONFIG[(p || '').toUpperCase()] ?? { label: p || '—', cls: 'bg-brand-bg text-brand-muted border-brand-border' };
const getInitials = (name) => (!name || name === 'Eu') ? 'EU' : name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default function ComplaintDetails() {
    const { id }        = useParams();
    const navigate      = useNavigate();
    const statusMenuRef = useRef(null);
    const messagesEndRef = useRef(null);
    // Retine id-urile mesajelor trimise de noi via POST,
    // ca sa ignoram echo-ul care vine inapoi prin WebSocket
    const processedIdsRef = useRef(new Set());

    const [currentUser, setCurrentUser]           = useState(null);
    const [ticket, setTicket]                     = useState(null);
    const [comments, setComments]                 = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [error, setError]                       = useState(null);
    const [newComment, setNewComment]             = useState('');
    const [sendingComment, setSendingComment]     = useState(false);
    const [selectedStatus, setSelectedStatus]     = useState('');
    const [statusComment, setStatusComment]       = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

    const userRole        = localStorage.getItem('userRole')?.toUpperCase();
    const canChangeStatus = userRole === 'ADMIN' || userRole === 'DEPT_RESPONSIBLE';

    // ── Scroll la ultimul mesaj ───────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    // ── Fetch date initiale ───────────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const [ticketRes, commentsRes, userRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/complaints/${id}`,          { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`http://localhost:8080/api/complaints/${id}/comments`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`http://localhost:8080/api/employees/me`,              { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (userRes.ok)    setCurrentUser(await userRes.json());
                if (commentsRes.ok) setComments(await commentsRes.json());

                if (ticketRes.ok) {
                    const data = await ticketRes.json();
                    setTicket(data);
                    setSelectedStatus(data.status || data.statusCode || 'NEW');
                } else throw new Error('Eroare tichet.');
            } catch { setError('Eroare de conexiune.'); }
            finally  { setLoading(false); }
        };
        fetchData();
    }, [id, navigate]);

    // ── WebSocket cu polling fallback ────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
        if (!token || !id) return;

        let stompClient = null;
        let wsConnected = false;
        let pollInterval = null;
        let lastCommentCount = 0;

        // Polling fallback — se activeaza daca WS nu se conecteaza in 4s
        const startPolling = () => {
            if (pollInterval) return;
            console.log('[POLL] WebSocket indisponibil, activam polling la 3s');
            pollInterval = setInterval(async () => {
                try {
                    const res = await fetch(`http://localhost:8080/api/complaints/${id}/comments`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data.length !== lastCommentCount) {
                        lastCommentCount = data.length;
                        setComments(data);
                    }
                } catch { /* ignoram erorile de retea in poll */ }
            }, 3000);
        };

        const wsTimeout = setTimeout(() => {
            if (!wsConnected) startPolling();
        }, 4000);

        try {
            stompClient = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                reconnectDelay: 5000,
                connectHeaders: { Authorization: `Bearer ${token}` },
                onConnect: () => {
                    wsConnected = true;
                    clearTimeout(wsTimeout);
                    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
                    console.log('[WS] Conectat la /topic/complaints/' + id);

                    stompClient.subscribe(`/topic/complaints/${id}`, (frame) => {
                        if (!frame.body) return;
                        try {
                            const incoming = JSON.parse(frame.body);
                            if (!incoming?.id) return;

                            // Ignoram echo-ul propriului mesaj trimis via POST
                            if (processedIdsRef.current.has(incoming.id)) {
                                processedIdsRef.current.delete(incoming.id);
                                return;
                            }

                            // Mesaj de la alt user — adaugam direct
                            setComments(prev => {
                                if (prev.some(c => c.id === incoming.id)) return prev;
                                return [...prev, incoming];
                            });
                        } catch (err) {
                            console.error('[WS] Eroare parsare mesaj:', err);
                        }
                    });
                },
                onDisconnect: () => {
                    wsConnected = false;
                    console.log('[WS] Deconectat, activam polling');
                    startPolling();
                },
                onStompError: (frame) => {
                    wsConnected = false;
                    console.error('[WS] STOMP error:', frame);
                    startPolling();
                },
                onWebSocketError: (err) => {
                    wsConnected = false;
                    console.error('[WS] WebSocket error:', err);
                    startPolling();
                },
            });

            stompClient.activate();
        } catch (err) {
            console.error('[WS] Nu am putut initializa clientul:', err);
            startPolling();
        }

        return () => {
            clearTimeout(wsTimeout);
            if (pollInterval) clearInterval(pollInterval);
            if (stompClient) stompClient.deactivate();
        };
    }, [id]);

    // ── Click outside status menu ─────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (statusMenuRef.current && !statusMenuRef.current.contains(e.target))
                setIsStatusMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Trimite comentariu ────────────────────────────────────────────────────
    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const messageText = newComment;
        setNewComment(''); // clear imediat pentru UX rapid
        setSendingComment(true);

        try {
            const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
            const res   = await fetch(`http://localhost:8080/api/complaints/${id}/comments`, {
                method:  'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body:    JSON.stringify({ message: messageText, isInternal: false }),
            });

            if (res.ok) {
                const added = await res.json().catch(() => null);
                if (added?.id) {
                    // Marcam id-ul ca procesat — WebSocket-ul va ignora echo-ul
                    processedIdsRef.current.add(added.id);
                    setComments(prev => {
                        if (prev.some(c => c.id === added.id)) return prev;
                        return [...prev, added];
                    });
                }
            } else {
                // Daca a esuat, restoram mesajul in input
                setNewComment(messageText);
            }
        } finally {
            setSendingComment(false);
        }
    };

    // ── Schimba status ────────────────────────────────────────────────────────
    const handleStatusChange = async () => {
        setIsUpdatingStatus(true);
        try {
            const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
            const res   = await fetch(`http://localhost:8080/api/complaints/${id}/status`, {
                method:  'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body:    JSON.stringify({ newStatusId: selectedStatus, comment: statusComment }),
            });
            if (res.ok) window.location.reload();
            else alert('Eroare la actualizare.');
        } finally { setIsUpdatingStatus(false); }
    };

    // ── Loading / Error ───────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-brand-muted text-sm">Se încarcă tichetul...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-bg">
            <div className="bg-red-500/10 border border-red-400/30 text-red-400 px-6 py-4 rounded-2xl text-sm">{error}</div>
            <button onClick={() => navigate('/complaints')} className="text-sm text-brand-muted hover:text-brand-text transition-colors">
                ← Înapoi la sesizări
            </button>
        </div>
    );

    if (!ticket) return null;

    const currentStatus = (ticket.status || ticket.statusCode || 'NEW').toUpperCase();
    const currentIndex  = WORKFLOW_STEPS.indexOf(currentStatus);
    const priority      = getPriority(ticket.priority);
    const ticketNum     = ticket.ticketNumber || String(ticket.id).substring(0, 8).toUpperCase();
    const createdDate   = ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('ro-RO') : '—';

    // Numele complet al userului curent (lowercase) pentru comparatie cu authorName din mesaje
    const currentUserFullName = currentUser
        ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim().toLowerCase()
        : '';

    // ── Render ────────────────────────────────────────────────────────────────
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
                                onClick={() => navigate('/complaints')}
                                className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-text transition-colors mb-0.5"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Înapoi la sesizări
                            </button>
                            <h1 className="text-lg font-bold text-brand-text leading-tight flex items-center gap-2">
                                <span className="font-mono text-brand-muted text-base font-normal">#{ticketNum}</span>
                                {ticket.title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

                    {/* ══ Hero card cu progress ═══════════════════════════════ */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm transition-colors duration-300"
                    >
                        <div className="h-1.5 w-full bg-brand-primary" />
                        <div className="p-6 lg:p-8 space-y-6">

                            {/* Titlu + meta */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${priority.cls}`}>
                                        {priority.label}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-brand-muted">
                                        <Clock className="w-3.5 h-3.5" />
                                        {createdDate}
                                    </span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-brand-text leading-tight">
                                    {ticket.title}
                                </h2>
                            </div>

                            {/* Progress workflow */}
                            <div className="pt-4 border-t border-brand-border">
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold mb-5">
                                    Progres tichet
                                </p>
                                <div className="relative flex items-start justify-between">
                                    {/* Linie fundal */}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-brand-border rounded-full" />
                                    {/* Linie progres */}
                                    <div
                                        className="absolute top-4 left-0 h-0.5 bg-brand-primary rounded-full transition-all duration-700"
                                        style={{ width: `${(currentIndex / (WORKFLOW_STEPS.length - 1)) * 100}%` }}
                                    />
                                    {WORKFLOW_STEPS.map((step, idx) => {
                                        const done    = idx < currentIndex;
                                        const current = idx === currentIndex;
                                        const future  = idx > currentIndex;
                                        return (
                                            <div key={step} className="relative flex flex-col items-center gap-2 z-10">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-brand-card transition-all duration-500 ${
                                                    done || current ? 'border-brand-primary' : 'border-brand-border'
                                                }`}>
                                                    {done
                                                        ? <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                                                        : current
                                                            ? <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                                                            : <span className="w-2 h-2 rounded-full bg-brand-border" />
                                                    }
                                                </div>
                                                <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                                                    future ? 'text-brand-muted opacity-40' : 'text-brand-text'
                                                }`}>
                                                    {STEP_LABELS[step]}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ══ Info cards ══════════════════════════════════════════ */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Echipament */}
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-primary transition-colors duration-200">
                            <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                <MonitorSmartphone className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Echipament afectat</p>
                                <p className="text-sm font-bold text-brand-text truncate mt-0.5">{ticket.assetName || 'Nespecificat'}</p>
                            </div>
                        </div>

                        {/* Initiator */}
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-primary transition-colors duration-200">
                            <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">
                                    Inițiator{ticket.authorDepartment ? ` • ${ticket.authorDepartment}` : ''}
                                </p>
                                <p className="text-sm font-bold text-brand-text truncate mt-0.5">{ticket.authorName || '—'}</p>
                            </div>
                        </div>

                        {/* Status / Acces restrictionat */}
                        {canChangeStatus ? (
                            <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-5 flex flex-col gap-3">
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Actualizează status</p>
                                <div className="relative" ref={statusMenuRef}>
                                    <button
                                        onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                                        className="w-full bg-brand-bg border border-brand-border hover:border-brand-primary text-brand-text text-xs font-semibold rounded-xl px-3 py-2.5 flex justify-between items-center transition-all uppercase"
                                    >
                                        {STEP_LABELS[selectedStatus] || selectedStatus}
                                        <ChevronDown className={`w-4 h-4 text-brand-primary transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {isStatusMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                className="absolute z-50 w-full mt-1.5 bg-brand-card border border-brand-border rounded-xl shadow-xl overflow-hidden py-1"
                                            >
                                                {WORKFLOW_STEPS.map(step => (
                                                    <button
                                                        key={step}
                                                        onClick={() => { setSelectedStatus(step); setIsStatusMenuOpen(false); }}
                                                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide hover:bg-brand-primary/10 hover:text-brand-primary transition-colors ${selectedStatus === step ? 'text-brand-primary' : 'text-brand-text'}`}
                                                    >
                                                        {STEP_LABELS[step]}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={statusComment}
                                        onChange={e => setStatusComment(e.target.value)}
                                        placeholder="Motiv..."
                                        className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text placeholder:text-brand-muted focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                                    />
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={isUpdatingStatus || !statusComment.trim() || selectedStatus === currentStatus}
                                        className="bg-brand-primary text-white px-3 rounded-xl disabled:opacity-40 transition-all hover:opacity-90"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex flex-col items-center justify-center gap-2 opacity-50">
                                <Shield className="w-5 h-5 text-brand-muted" />
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">Acces restricționat</span>
                            </div>
                        )}
                    </motion.div>

                    {/* ══ Descriere + Chat ════════════════════════════════════ */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Descriere */}
                        <div className="bg-brand-card border border-brand-border rounded-2xl flex flex-col shadow-sm transition-colors duration-300 h-[480px]">
                            <div className="px-6 py-5 border-b border-brand-border flex items-center gap-3 shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center">
                                    <Info className="w-4 h-4 text-brand-primary" />
                                </div>
                                <h3 className="text-sm font-bold text-brand-text">Detalii problemă</h3>
                            </div>
                            <div className="p-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brand-border [&::-webkit-scrollbar-thumb]:rounded-full">
                                <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap opacity-90"
                                   style={{ overflowWrap: 'anywhere' }}>
                                    {ticket.description}
                                </p>
                            </div>
                        </div>

                        {/* Chat */}
                        <div className="bg-brand-card border border-brand-border rounded-2xl flex flex-col shadow-sm transition-colors duration-300 h-[480px]">
                            {/* Header chat */}
                            <div className="px-6 py-5 border-b border-brand-border flex items-center gap-3 shrink-0">
                                <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-brand-primary" />
                                </div>
                                <h3 className="text-sm font-bold text-brand-text">Discuție</h3>
                                {comments.length > 0 && (
                                    <span className="ml-auto text-xs font-semibold text-brand-muted bg-brand-bg border border-brand-border px-2 py-0.5 rounded-full">
                                        {comments.length} mesaje
                                    </span>
                                )}
                            </div>

                            {/* Lista mesaje */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brand-border [&::-webkit-scrollbar-thumb]:rounded-full">
                                {comments.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-2 opacity-40">
                                        <MessageSquare className="w-8 h-8 text-brand-muted" />
                                        <p className="text-xs text-brand-muted">Niciun mesaj încă. Fii primul!</p>
                                    </div>
                                ) : comments.map((c, i) => {
                                    // Determinam daca mesajul apartine userului curent
                                    const authorLower = (c.authorName || '').trim().toLowerCase();
                                    const isMine = c.isMine ||
                                        (currentUserFullName !== '' && authorLower === currentUserFullName);

                                    return (
                                        <div key={c.id || i} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                                            {/* Avatar */}
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 self-end ${
                                                isMine
                                                    ? 'bg-brand-primary text-white'
                                                    : 'bg-brand-bg border border-brand-border text-brand-text'
                                            }`}>
                                                {getInitials(isMine ? 'Eu' : c.authorName)}
                                            </div>

                                            {/* Bula mesaj */}
                                            <div className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}
                                                 style={{ maxWidth: '75%' }}>
                                                <div className={`flex items-center gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                    <span className="text-[11px] font-semibold text-brand-text">
                                                        {isMine ? 'Eu' : c.authorName}
                                                    </span>
                                                    <span className="text-[10px] text-brand-muted">
                                                        {new Date(c.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className={`px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                                                    isMine
                                                        ? 'bg-brand-primary text-white rounded-tr-sm'
                                                        : 'bg-brand-bg border border-brand-border text-brand-text rounded-tl-sm'
                                                }`}>
                                                    {/* overflowWrap:anywhere sparge si siruri fara spatii */}
                                                    <p className="whitespace-pre-wrap m-0"
                                                       style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                                        {c.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="px-4 pb-4 pt-2 shrink-0 border-t border-brand-border">
                                <form
                                    onSubmit={handleSendComment}
                                    className="flex gap-2 bg-brand-bg border border-brand-border rounded-2xl px-1 py-1 focus-within:ring-2 focus-within:ring-brand-primary/30 transition-all"
                                >
                                    <input
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Scrie un răspuns..."
                                        className="flex-1 bg-transparent px-4 py-2.5 text-sm text-brand-text placeholder:text-brand-muted outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendingComment || !newComment.trim()}
                                        className="bg-brand-primary text-white p-2.5 rounded-xl disabled:opacity-40 hover:opacity-90 transition-all flex items-center justify-center shrink-0"
                                    >
                                        {sendingComment
                                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <Send className="w-4 h-4" />
                                        }
                                    </button>
                                </form>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
