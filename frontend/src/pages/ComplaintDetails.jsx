import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';
import { 
    ArrowLeft, CheckCircle2, Send, Clock, User, Shield, Info, 
    Activity, MessageSquare, MonitorSmartphone, ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ComplaintDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    
    const userRole = localStorage.getItem('userRole')?.toUpperCase();
    const canChangeStatus = userRole === 'ADMIN' || userRole === 'DEPT_RESPONSIBLE';
    
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusComment, setStatusComment] = useState(''); 
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // State-uri pentru Dropdown-ul Custom
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const statusMenuRef = useRef(null);

    const workflowSteps = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                if (!token) { navigate('/login'); return; }

                const ticketRes = await fetch(`http://localhost:8080/api/complaints/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const commentsRes = await fetch(`http://localhost:8080/api/complaints/${id}/comments`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (ticketRes.ok) {
                    const ticketData = await ticketRes.json();
                    setTicket(ticketData);
                    setSelectedStatus(ticketData.status || ticketData.statusCode || 'NEW');
                } else {
                    throw new Error('Nu am putut incarca detaliile tichetului.');
                }

                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData);
                }
            } catch (err) {
                console.error(err);
                setError('A aparut o eroare la conectarea cu serverul.');
            } finally {
                setLoading(false);
            }
        };
        fetchTicketDetails();
    }, [id, navigate]);

    // Inchide dropdown-ul la click in afara lui
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
                setIsStatusMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        setSendingComment(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/complaints/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: newComment })
            });

            if (response.ok) {
                const addedComment = await response.json().catch(() => ({
                    id: Math.random(),
                    message: newComment,
                    authorName: 'Eu',
                    createdAt: new Date().toISOString(),
                    isMine: true
                }));
                
                setComments([...comments, addedComment]);
                setNewComment('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSendingComment(false);
        }
    };

    const handleStatusChange = async () => {
        setIsUpdatingStatus(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const payload = { newStatusId: selectedStatus, comment: statusComment };

            const response = await fetch(`http://localhost:8080/api/complaints/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Status actualizat cu succes!");
                window.location.reload(); 
            } else {
                const errData = await response.json().catch(() => null);
                alert(`Eroare la actualizare: ${errData?.message || 'Date invalide'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Eroare de conexiune la schimbarea statusului.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const getInitials = (name) => {
        if (!name || name === 'Eu') return 'EU';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-primary text-xl font-bold bg-brand-bg">Se incarca detaliile...</div>;
    if (error) return <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-8 bg-brand-bg"><div className="text-red-600 font-bold bg-red-900/50 p-4 rounded-xl border border-red-500">{error}</div><button onClick={() => navigate('/complaints')} className="px-4 py-2 bg-brand-card text-brand-text rounded border border-brand-border">Inapoi</button></div>;
    if (!ticket) return null;

    const currentStatus = (ticket.status || ticket.statusCode || 'NEW').toUpperCase();

    return (
        <div className="min-h-screen bg-brand-bg font-sans transition-colors duration-300">
            
            {/* 1. TOP NAVBAR STICKY */}
            <header className="sticky top-0 z-40 bg-brand-bg/80 backdrop-blur-lg border-b border-brand-border px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/complaints')} 
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 text-brand-muted hover:text-brand-text transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden md:flex items-center gap-3 border-l border-brand-border pl-6">
                        <span className="font-mono text-sm text-brand-muted">#{ticket.ticketNumber || ticket.id.substring(0,6).toUpperCase()}</span>
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-xs font-bold rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                            {currentStatus.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <UserMenu />
                </div>
            </header>

            {/* 2. MAIN LAYOUT (Split View) */}
            <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col lg:flex-row gap-8 items-start"
                >
                    
                    {/* COLOANA STANGA: FOCUS */}
                    <div className="w-full lg:flex-1 space-y-8">
                        <motion.div variants={itemVariants}>
                            <h1 className="text-3xl md:text-4xl font-black text-brand-text mb-4 leading-tight">{ticket.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-brand-muted">
                                <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {ticket.authorName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('ro-RO', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'}) : 'N/A'}</span>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-brand-card p-6 md:p-8 rounded-3xl border border-brand-border shadow-sm">
                            <div className="prose prose-sm md:prose-base prose-invert max-w-none">
                                <p className="text-brand-text leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-4">
                            <h3 className="text-xl font-bold text-brand-text flex items-center gap-2 mb-6">
                                <MessageSquare className="w-5 h-5 text-brand-primary" /> Firul discutiei
                            </h3>
                            
                            <div className="space-y-6 mb-8">
                                {comments.length === 0 ? (
                                    <p className="text-brand-muted text-sm italic">Nu exista mesaje momentan.</p>
                                ) : (
                                    comments.map((comment, idx) => {
                                        const isMine = comment.authorName === 'Eu' || comment.isMine;
                                        return (
                                            <div key={idx} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 bg-brand-bg border border-brand-border">
                                                    <span className={isMine ? 'text-brand-primary' : 'text-brand-muted'}>{getInitials(comment.authorName)}</span>
                                                </div>
                                                <div className={`flex flex-col max-w-[85%] ${isMine ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-brand-text">{comment.authorName || 'Echipa Suport'}</span>
                                                        <span className="text-[10px] text-brand-muted">{comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'}) : ''}</span>
                                                    </div>
                                                    <div className={`p-4 text-sm rounded-2xl ${isMine ? 'bg-brand-primary text-white rounded-tr-sm' : 'bg-brand-card border border-brand-border text-brand-text rounded-tl-sm'}`}>
                                                        <p className="whitespace-pre-wrap">{comment.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <form onSubmit={handleSendComment} className="bg-brand-card border border-brand-border p-2 rounded-2xl flex items-end gap-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-primary/50 transition-all">
                                <textarea 
                                    value={newComment} 
                                    onChange={(e) => setNewComment(e.target.value)} 
                                    placeholder="Scrie o actualizare..." 
                                    rows="1"
                                    className="flex-1 bg-transparent border-none text-brand-text px-4 py-3 outline-none text-sm resize-none min-h-[44px] max-h-32" 
                                />
                                <button 
                                    type="submit" 
                                    disabled={sendingComment || !newComment.trim()} 
                                    className="p-3 bg-brand-primary hover:opacity-90 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* COLOANA DREAPTA: CONTEXT (Sticky) */}
                    <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 space-y-6 lg:sticky lg:top-24">
                        
                        {/* 1. Actiuni Admin - ACUM CU DROPDOWN CUSTOM */}
                        {canChangeStatus && (
                            <motion.div variants={itemVariants} className="bg-brand-primary/10 border border-brand-primary/30 p-6 rounded-3xl">
                                <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Panou Rezolvare
                                </h3>
                                <div className="space-y-4">
                                    
                                    {/* Meniul de Status Custom */}
                                    <div className="relative" ref={statusMenuRef}>
                                        <button 
                                            type="button"
                                            onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                                            className="w-full bg-brand-card border border-brand-border text-brand-text font-medium rounded-xl px-4 py-3 flex justify-between items-center text-sm uppercase hover:border-brand-primary/50 transition-colors shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedStatus === currentStatus ? 'bg-brand-muted' : 'bg-brand-primary animate-pulse'}`}></div>
                                                {selectedStatus ? selectedStatus.replace('_', ' ') : 'Selecteaza'}
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isStatusMenuOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute z-50 w-full mt-2 bg-brand-card border border-brand-border rounded-xl shadow-xl overflow-hidden"
                                                >
                                                    {workflowSteps.map((step) => (
                                                        <button
                                                            key={step}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedStatus(step);
                                                                setIsStatusMenuOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm font-bold uppercase transition-colors hover:bg-brand-primary/10 flex items-center justify-between ${selectedStatus === step ? 'bg-brand-primary/10 text-brand-primary' : 'text-brand-muted hover:text-brand-text'}`}
                                                        >
                                                            {step.replace('_', ' ')}
                                                            {selectedStatus === step && <CheckCircle2 className="w-4 h-4 text-brand-primary" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <textarea 
                                        value={statusComment}
                                        onChange={(e) => setStatusComment(e.target.value)}
                                        placeholder="Nota de sistem (obligatoriu)..."
                                        rows="2"
                                        className="w-full bg-brand-card border border-brand-border text-brand-text rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-brand-primary text-sm resize-none shadow-sm"
                                    />
                                    <button 
                                        onClick={handleStatusChange}
                                        disabled={isUpdatingStatus || !statusComment.trim() || selectedStatus === currentStatus}
                                        className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-sm flex justify-center items-center gap-2"
                                    >
                                        {isUpdatingStatus ? 'Se proceseaza...' : 'Actualizeaza Status'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. Informatii Contextuale */}
                        <motion.div variants={itemVariants} className="bg-brand-card border border-brand-border p-6 rounded-3xl space-y-6">
                            <div>
                                <p className="text-xs text-brand-muted font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MonitorSmartphone className="w-4 h-4" /> Echipament Afectat
                                </p>
                                <p className="text-sm font-semibold text-brand-text bg-brand-bg p-3 rounded-xl border border-brand-border">
                                    {ticket.assetName || 'Nespecificat'}
                                </p>
                            </div>
                            
                            <div>
                                <p className="text-xs text-brand-muted font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Detalii Angajat
                                </p>
                                <div className="bg-brand-bg p-4 rounded-xl border border-brand-border space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-brand-muted">Departament</span>
                                        <span className="text-sm font-semibold text-brand-text">{ticket.authorDepartment || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-brand-muted">Rol Sistem</span>
                                        <span className="px-2 py-0.5 bg-brand-card border border-brand-border text-brand-text text-[10px] font-bold rounded uppercase">{ticket.authorRole || 'USER'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-brand-muted">Prioritate initiala</span>
                                        <span className="text-sm font-bold text-brand-text">{ticket.priority || 'MEDIUM'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3. Workflow Stepper Minimalist */}
                        <motion.div variants={itemVariants} className="bg-brand-card border border-brand-border p-6 rounded-3xl">
                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Parcurs Tichet
                            </p>
                            <div className="relative pl-3 space-y-6 before:absolute before:inset-0 before:ml-[1.1rem] before:w-px before:bg-brand-border before:z-0">
                                {workflowSteps.map((step, idx) => {
                                    const currentIndex = workflowSteps.indexOf(currentStatus);
                                    const isCompleted = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;
                                    
                                    return (
                                        <div key={step} className="relative flex items-center gap-4">
                                            <div className={`z-10 w-3 h-3 rounded-full shrink-0 transition-colors duration-300 ${isCompleted ? 'bg-brand-primary shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.4)]' : 'bg-brand-bg border border-brand-border'} ${isCurrent ? 'ring-4 ring-brand-primary/20' : ''}`}></div>
                                            <p className={`text-xs font-bold ${isCurrent ? 'text-brand-primary' : isCompleted ? 'text-brand-text' : 'text-brand-muted'}`}>{step.replace('_', ' ')}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}