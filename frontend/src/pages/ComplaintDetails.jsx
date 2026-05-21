import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher'; // Componenta adăugată
import UserMenu from '../components/UserMenu';           // Componenta adăugată
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

export default function ComplaintDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [newComment, setNewComment] = useState('');
    const [sendingComment, setSendingComment] = useState(false);
    
    // Verificare Roluri
    const userRole = localStorage.getItem('userRole')?.toUpperCase();
    const canChangeStatus = userRole === 'ADMIN' || userRole === 'DEPT_RESPONSIBLE';
    
    const [selectedStatus, setSelectedStatus] = useState('');
    const [statusComment, setStatusComment] = useState(''); 
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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
                    throw new Error('Nu am putut încărca detaliile tichetului.');
                }

                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    setComments(commentsData);
                }
            } catch (err) {
                console.error(err);
                setError('A apărut o eroare la conectarea cu serverul.');
            } finally {
                setLoading(false);
            }
        };

        fetchTicketDetails();
    }, [id, navigate]);

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
            
            const payload = {
                newStatusId: selectedStatus, 
                comment: statusComment
            };

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

    const workflowSteps = ['NEW', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-primary font-bold bg-brand-bg">Se încarcă detaliile...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold bg-brand-bg">{error}</div>;
    if (!ticket) return null;

    const currentStatus = (ticket.status || ticket.statusCode || 'NEW').toUpperCase();

    return (
        <div className="min-h-screen bg-brand-bg p-4 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Antetul Superior cu Navigare și Meniu Utilizator */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate('/complaints')} className="flex items-center text-brand-primary hover:opacity-80 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Înapoi la listă
                    </button>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                {/* Zona de Titlu și Controale Admin */}
                <div className="flex flex-col md:flex-row md:items-start justify-between border-b border-brand-border pb-6 gap-6">
                    <h1 className="text-xl md:text-2xl font-bold text-brand-text mt-2">
                        Plângere #{ticket.ticketNumber || ticket.id.substring(0,6).toUpperCase()} — {ticket.title}
                    </h1>
                    
                    {/* CONTROALE ADMIN */}
                    {canChangeStatus && (
                        <div className="bg-brand-card p-5 rounded-xl border border-brand-border shadow-sm flex flex-col gap-4 min-w-[320px] md:min-w-[400px]">
                            <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Acțiuni Administrator
                            </h3>
                            
                            <div>
                                <select 
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full bg-brand-bg border border-brand-border text-brand-text font-medium rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm transition-all cursor-pointer"
                                >
                                    <option value="NEW">NOU</option>
                                    <option value="IN_REVIEW">ÎN ANALIZĂ</option>
                                    <option value="IN_PROGRESS">ÎN LUCRU</option>
                                    <option value="RESOLVED">REZOLVAT</option>
                                    <option value="CLOSED">ÎNCHIS</option>
                                    <option value="REJECTED">RESPINS</option>
                                </select>
                            </div>

                            <textarea 
                                value={statusComment}
                                onChange={(e) => setStatusComment(e.target.value)}
                                placeholder="Motivul schimbării statusului (obligatoriu)..."
                                rows="2"
                                className="w-full bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm resize-none transition-all"
                            />
                            
                            <button 
                                onClick={handleStatusChange}
                                disabled={isUpdatingStatus || !statusComment.trim() || selectedStatus === currentStatus}
                                className="w-full bg-brand-primary hover:opacity-90 disabled:bg-brand-border disabled:text-brand-muted disabled:cursor-not-allowed text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all flex justify-center items-center"
                            >
                                {isUpdatingStatus ? 'Se actualizează...' : 'Actualizează Status'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* COLOANA STÂNGA */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border p-6">
                            <h3 className="text-lg font-bold text-brand-text mb-6 border-b border-brand-border pb-4">Detalii Plângere</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Titlu</p><p className="text-sm font-semibold text-brand-text">{ticket.title}</p></div>
                                <div>
                                    <p className="text-xs text-brand-muted font-medium mb-1">Status</p>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>
                                        {currentStatus}
                                    </span>
                                </div>
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Asset</p><p className="text-sm font-semibold text-brand-text">{ticket.assetName || 'Echipament Nespecificat'}</p></div>
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Autor</p><p className="text-sm font-semibold text-brand-text">{ticket.authorName || 'Eu'}</p></div>
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted font-medium mb-1">Descriere</p>
                                <p className="text-sm text-brand-text leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                            </div>
                        </div>

                        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border p-6 flex flex-col h-[500px]">
                            <h3 className="text-lg font-bold text-brand-text mb-4 border-b border-brand-border pb-4">Comentarii ({comments.length})</h3>
                            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
                                {comments.length === 0 ? (
                                    <p className="text-brand-muted text-center py-8 text-sm">Nu există comentarii.</p>
                                ) : (
                                    comments.map((comment, idx) => {
                                        const isMine = comment.authorName === 'Eu' || comment.isMine;
                                        const avatarBg = isMine ? 'bg-yellow-500' : 'bg-brand-primary';

                                        return (
                                            <div key={idx} className="flex gap-4">
                                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-white text-sm ${avatarBg}`}>
                                                    {getInitials(comment.authorName)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-brand-text text-sm">{comment.authorName || 'Echipa Suport IT'}</span>
                                                        {!isMine && <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 rounded font-medium">ADMIN</span>}
                                                        <span className="text-xs text-brand-muted ml-auto">
                                                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString('ro-RO', {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short', year:'numeric'}) : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-brand-text opacity-90">{comment.message}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <form onSubmit={handleSendComment} className="flex items-center gap-3 border-t border-brand-border pt-4">
                                <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Scrie un răspuns..." className="flex-1 bg-brand-bg border border-brand-border text-brand-text rounded-lg px-4 py-2.5 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none text-sm transition-all" />
                                <button type="submit" disabled={sendingComment || !newComment.trim()} className="px-6 py-2.5 bg-brand-primary hover:opacity-90 text-white font-medium rounded-lg text-sm transition-all disabled:opacity-50">Trimite</button>
                            </form>
                        </div>
                    </div>

                    {/* COLOANA DREAPTA */}
                    <div className="space-y-6">
                        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border p-6">
                            <h3 className="text-lg font-bold text-brand-text mb-6 border-b border-brand-border pb-4">Workflow</h3>
                            <div className="relative pl-3 space-y-6 before:absolute before:inset-0 before:ml-[1.1rem] before:w-0.5 before:bg-brand-border">
                                {workflowSteps.map((step, idx) => {
                                    const currentIndex = workflowSteps.indexOf(currentStatus);
                                    const isCompleted = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;
                                    return (
                                        <div key={step} className="relative flex items-start gap-4">
                                            <div className={`mt-0.5 relative z-10 w-3 h-3 rounded-full shrink-0 ${isCompleted ? 'bg-brand-primary' : 'bg-brand-card border-2 border-brand-border'} ${isCurrent ? 'ring-4 ring-brand-primary/20' : ''}`}></div>
                                            <div>
                                                <p className={`text-sm font-bold ${isCurrent || isCompleted ? 'text-brand-text' : 'text-brand-muted'}`}>{step}</p>
                                                <p className="text-xs text-brand-muted mt-0.5">{isCompleted ? 'Status înregistrat' : 'În așteptare'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border p-6">
                            <h3 className="text-lg font-bold text-brand-text mb-4 border-b border-brand-border pb-4">Informații Angajat</h3>
                            <div className="space-y-4">
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Nume</p><p className="text-sm font-semibold text-brand-text">{ticket.authorName || 'Nespecificat'}</p></div>
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Email</p><p className="text-sm font-semibold text-brand-text">{ticket.authorEmail || 'Nespecificat'}</p></div>
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Departament</p><p className="text-sm font-semibold text-brand-text">{ticket.authorDepartment || 'IT'}</p></div>
                                <div><p className="text-xs text-brand-muted font-medium mb-1">Rol</p><span className="inline-block px-2 py-0.5 bg-brand-bg border border-brand-border text-brand-muted text-xs font-bold rounded">{ticket.authorRole || 'USER'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}