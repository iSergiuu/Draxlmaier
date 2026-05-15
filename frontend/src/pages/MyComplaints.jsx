import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { ArrowLeft, Ticket, Clock, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:8080/api/complaints', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setComplaints(data);
                } else if (response.status === 401 || response.status === 403) {
                    setError('Eroare de Securitate. Nu ești autorizat să vezi aceste tichete.');
                } else {
                    setError(`Eroare de la server: ${response.status}`);
                }
            } catch (err) {
                console.error("Eroare de rețea:", err);
                setError('Eroare de conexiune cu serverul.');
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, [navigate]);

    // Funcție pentru a da o culoare frumoasă statusului
    const getStatusStyle = (status) => {
        if (!status) return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Info className="w-4 h-4 mr-1"/>, text: 'NECUNOSCUT' };
        
        switch (status.toUpperCase()) {
            case 'NEW': 
                return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <AlertCircle className="w-4 h-4 mr-1"/>, text: 'NOU' };
            case 'IN_REVIEW':
                return { color: 'text-purple-600', bg: 'bg-purple-100', icon: <Clock className="w-4 h-4 mr-1"/>, text: 'ÎN ANALIZĂ' };
            case 'IN_PROGRESS': 
                return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <Clock className="w-4 h-4 mr-1"/>, text: 'ÎN LUCRU' };
            case 'RESOLVED': 
            case 'CLOSED':
                return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4 mr-1"/>, text: 'REZOLVAT' };
            case 'REJECTED':
                return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-4 h-4 mr-1"/>, text: 'RESPINS' };
            default: 
                return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Info className="w-4 h-4 mr-1"/>, text: status };
        }
    };

    // Funcție pentru prioritate
    const getPriorityBadge = (priority) => {
        if (!priority) return null;
        const p = priority.toUpperCase();
        if (p === 'CRITICAL') return <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700 border border-red-200">CRITICĂ</span>;
        if (p === 'HIGH') return <span className="px-2 py-1 text-xs font-bold rounded bg-orange-100 text-orange-700 border border-orange-200">RIDICATĂ</span>;
        if (p === 'LOW') return <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-gray-600 border border-gray-200">SCĂZUTĂ</span>;
        return <span className="px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-200">MEDIE</span>;
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-brand-primary bg-brand-bg">Se încarcă tichetele...</div>;
    }

    return (
        <div className="min-h-screen bg-brand-bg p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Buton Înapoi */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-brand-primary hover:opacity-80 font-medium transition-opacity mb-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Înapoi la Dashboard
                </button>

                {/* Antet */}
                <div className="bg-brand-card p-6 rounded-xl shadow-sm border border-brand-border flex justify-between items-center transition-colors duration-300">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-text flex items-center">
                            <Ticket className="w-7 h-7 mr-3 text-brand-primary" />
                            Problemele Mele
                        </h1>
                        <p className="text-brand-muted mt-1">Urmărește statusul sesizărilor tale.</p>
                    </div>
                    <ThemeSwitcher />
                </div>

                {error && (
                    <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Lista de tichete */}
                {!error && complaints.length === 0 ? (
                    <div className="bg-brand-card p-12 text-center rounded-xl shadow-sm border border-brand-border flex flex-col items-center transition-colors duration-300">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-brand-text mb-2">Totul funcționează perfect!</h3>
                        <p className="text-brand-muted">Nu ai raportat nicio problemă până acum.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {complaints.map((ticket) => {
                            const statusStyle = getStatusStyle(ticket.status || ticket.statusCode); // Adaptat pentru cum trimite Java ta
                            
                            return (
                                <div key={ticket.id} className="bg-brand-card p-6 rounded-xl shadow-sm border border-brand-border transition-colors duration-300 hover:border-brand-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-mono text-brand-muted bg-black/5 px-2 py-0.5 rounded border border-brand-border">
                                                #{ticket.ticketNumber || ticket.id.substring(0,8)}
                                            </span>
                                            {getPriorityBadge(ticket.priority)}
                                            <span className="text-xs text-brand-muted flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('ro-RO') : 'Data necunoscută'}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-bold text-brand-text">{ticket.title}</h2>
                                        <p className="text-sm text-brand-muted mt-1 line-clamp-2">{ticket.description}</p>
                                    </div>
                                    
                                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-brand-border pt-4 sm:pt-0 sm:pl-6 min-w-[140px]">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.color}`}>
                                            {statusStyle.icon}
                                            {statusStyle.text}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}