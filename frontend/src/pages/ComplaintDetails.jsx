import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';
import { ArrowLeft, CheckCircle2, Send, Clock, User, Shield, Info, Activity, MessageSquare, MonitorSmartphone, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

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
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
    const statusMenuRef = useRef(null);
    const workflowSteps = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                if (!token) { navigate('/login'); return; }
                const ticketRes = await fetch(`http://localhost:8080/api/complaints/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                const commentsRes = await fetch(`http://localhost:8080/api/complaints/${id}/comments`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (ticketRes.ok) {
                    const ticketData = await ticketRes.json();
                    setTicket(ticketData);
                    setSelectedStatus(ticketData.status || ticketData.statusCode || 'NEW');
                } else throw new Error('Eroare tichet.');
                if (commentsRes.ok) setComments(await commentsRes.json());
            } catch (err) { setError('Eroare de conexiune.'); } finally { setLoading(false); }
        };
        fetchTicketDetails();
    }, [id, navigate]);

    useEffect(() => {
        const handleClickOutside = (e) => { if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) setIsStatusMenuOpen(false); };
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
                method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newComment })
            });
            if (response.ok) {
                const addedComment = await response.json().catch(() => ({ id: Math.random(), message: newComment, authorName: 'Eu', createdAt: new Date().toISOString(), isMine: true }));
                setComments([...comments, addedComment]);
                setNewComment('');
            }
        } finally { setSendingComment(false); }
    };

    const handleStatusChange = async () => {
        setIsUpdatingStatus(true);
        try {
            const token = localStorage.getItem('jwt_token');
            const response = await fetch(`http://localhost:8080/api/complaints/${id}/status`, {
                method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatusId: selectedStatus, comment: statusComment })
            });
            if (response.ok) window.location.reload(); 
            else alert("Eroare la actualizare.");
        } finally { setIsUpdatingStatus(false); }
    };

    const getInitials = (name) => (!name || name === 'Eu') ? 'EU' : name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    if (loading) return <div className="h-screen flex items-center justify-center text-brand-primary font-bold bg-brand-bg">Se incarca...</div>;
    if (error) return <div className="h-screen flex items-center justify-center font-bold text-red-500 bg-brand-bg">{error}</div>;
    if (!ticket) return null;

    const currentStatus = (ticket.status || ticket.statusCode || 'NEW').toUpperCase();
    const currentIndex = workflowSteps.indexOf(currentStatus);

    return (
        <div className="min-h-screen bg-brand-bg font-sans text-brand-text transition-colors duration-300 pb-16 selection:bg-brand-primary/30">
            <header className="sticky top-0 z-50 bg-brand-bg/60 backdrop-blur-xl border-b border-brand-border/50 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/complaints')} className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-card border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Tichet Suport</span>
                        <span className="text-sm font-mono font-bold">#{ticket.ticketNumber || ticket.id.substring(0,8).toUpperCase()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4"><ThemeSwitcher /><UserMenu /></div>
            </header>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-brand-card to-brand-bg border border-brand-border/60 rounded-[2rem] p-8 lg:p-10 shadow-xl shadow-brand-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-black rounded-full uppercase tracking-wider">
                                    {ticket.priority} PRIORITY
                                </span>
                                <span className="text-sm text-brand-muted flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4"/> {new Date(ticket.createdAt).toLocaleString('ro-RO')}</span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-2">{ticket.title}</h1>
                        </div>

                        <div className="mt-8 pt-8 border-t border-brand-border/40">
                            <div className="flex justify-between items-center relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-0 before:w-full before:h-1 before:bg-brand-border/40 before:rounded-full before:-z-10">
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-brand-primary rounded-full -z-10 transition-all duration-700" style={{ width: `${(currentIndex / (workflowSteps.length - 1)) * 100}%` }}></div>
                                
                                {workflowSteps.map((step, idx) => {
                                    const isActive = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-3 bg-brand-card px-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'border-brand-primary bg-brand-card shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.3)]' : 'border-brand-border bg-brand-bg'}`}>
                                                {idx < currentIndex ? <CheckCircle2 className="w-5 h-5 text-brand-primary"/> : <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-brand-primary animate-pulse' : 'bg-brand-muted/30'}`}></div>}
                                            </div>
                                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-brand-text' : 'text-brand-muted opacity-50'}`}>{step.replace('_', ' ')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-brand-card border border-brand-border/60 p-6 rounded-[2rem] shadow-lg flex items-center gap-5 hover:border-brand-primary/30 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <MonitorSmartphone className="w-6 h-6 text-brand-primary"/>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-0.5">Echipament Afectat</span>
                            <span className="text-base font-bold truncate">{ticket.assetName || 'Nespecificat'}</span>
                        </div>
                    </div>
                    
                    <div className="bg-brand-card border border-brand-border/60 p-6 rounded-[2rem] shadow-lg flex items-center gap-5 hover:border-brand-primary/30 transition-colors">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-brand-primary"/>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-0.5">Initiator • {ticket.authorDepartment}</span>
                            <span className="text-base font-bold truncate">{ticket.authorName}</span>
                        </div>
                    </div>

                    {canChangeStatus ? (
                        <div className="bg-brand-card border-2 border-brand-primary/20 p-6 rounded-[2rem] shadow-lg shadow-brand-primary/5 flex flex-col justify-center gap-3">
                            <div className="relative" ref={statusMenuRef}>
                                <button onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)} className="w-full bg-brand-bg border border-brand-border hover:border-brand-primary/50 text-brand-text font-bold rounded-xl px-4 py-3 flex justify-between items-center text-sm uppercase transition-all">
                                    {selectedStatus ? selectedStatus.replace('_', ' ') : 'Selecteaza status'}
                                    <ChevronDown className={`w-4 h-4 text-brand-primary transition-transform ${isStatusMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isStatusMenuOpen && (
                                        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="absolute z-50 w-full mt-2 bg-brand-card border border-brand-border rounded-xl shadow-xl overflow-hidden py-1">
                                            {workflowSteps.map((step) => (
                                                <button key={step} onClick={() => {setSelectedStatus(step); setIsStatusMenuOpen(false);}} className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/10 hover:text-brand-primary transition-colors">
                                                    {step.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex gap-2">
                                <input value={statusComment} onChange={(e) => setStatusComment(e.target.value)} placeholder="Motiv..." className="flex-1 bg-brand-bg border border-brand-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary transition-all"/>
                                <button onClick={handleStatusChange} disabled={isUpdatingStatus || !statusComment.trim() || selectedStatus === currentStatus} className="bg-brand-primary text-white px-4 rounded-xl disabled:opacity-40 disabled:grayscale transition-all hover:scale-105 active:scale-95"><CheckCircle2 className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-brand-bg border border-brand-border/60 p-6 rounded-[2rem] flex flex-col items-center justify-center text-brand-muted opacity-60">
                            <Shield className="w-6 h-6 mb-2"/>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Acces Restrictionat</span>
                        </div>
                    )}
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
                    
                    <div className="bg-brand-card border border-brand-border/60 rounded-[2.5rem] p-8 md:p-10 flex flex-col shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-brand-primary/10 rounded-xl"><Info className="w-5 h-5 text-brand-primary"/></div>
                            <h3 className="text-xl font-bold">Detalii Problema</h3>
                        </div>
                        <div className="flex-1 prose prose-sm md:prose-base prose-invert overflow-y-auto pr-4 custom-scrollbar">
                            <p className="whitespace-pre-wrap leading-relaxed text-brand-text opacity-90">{ticket.description}</p>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-brand-border/60 rounded-[2.5rem] p-6 md:p-8 flex flex-col shadow-xl">
                        <div className="flex items-center gap-3 mb-6 px-2">
                            <div className="p-2.5 bg-brand-primary/10 rounded-xl"><MessageSquare className="w-5 h-5 text-brand-primary"/></div>
                            <h3 className="text-xl font-bold">Discutie</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2 custom-scrollbar">
                            {comments.map((c, i) => (
                                <div key={i} className={`flex gap-3 max-w-[85%] ${c.isMine || c.authorName === 'Eu' ? 'ml-auto flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${c.isMine || c.authorName === 'Eu' ? 'bg-brand-primary text-white' : 'bg-brand-bg border border-brand-border text-brand-text'}`}>{getInitials(c.authorName)}</div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className={`flex items-center gap-2 ${c.isMine || c.authorName === 'Eu' ? 'justify-end' : ''}`}>
                                            <span className="text-[11px] font-bold opacity-70">{c.authorName}</span>
                                            <span className="text-[9px] font-bold opacity-40">{new Date(c.createdAt).toLocaleTimeString('ro-RO', {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className={`p-4 text-sm leading-relaxed shadow-sm ${c.isMine || c.authorName === 'Eu' ? 'bg-brand-primary text-white rounded-2xl rounded-tr-sm' : 'bg-brand-bg border border-brand-border rounded-2xl rounded-tl-sm'}`}>
                                            <p className="whitespace-pre-wrap m-0">{c.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendComment} className="shrink-0 flex gap-2 bg-brand-bg p-2 rounded-3xl border border-brand-border focus-within:ring-2 focus-within:ring-brand-primary/30 transition-all">
                            <input value={newComment} onChange={(e)=>setNewComment(e.target.value)} className="flex-1 bg-transparent px-5 py-3 outline-none text-sm placeholder:text-brand-muted" placeholder="Scrie un raspuns..."/>
                            <button type="submit" disabled={sendingComment || !newComment} className="bg-brand-primary text-white p-3.5 rounded-2xl disabled:opacity-40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-md"><Send className="w-4 h-4"/></button>
                        </form>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}