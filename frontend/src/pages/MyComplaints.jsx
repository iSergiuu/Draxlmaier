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
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) { navigate('/login'); return; }

            const response = await fetch('http://localhost:8080/api/complaints', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setComplaints(data);
            } else {
                setError(`Eroare de la server: ${response.status}`);
            }
        } catch (err) {
            setError('Eroare de conexiune cu serverul.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        if (!status) return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Info className="w-4 h-4 mr-1"/>, text: 'NECUNOSCUT' };
        switch (status.toUpperCase()) {
            case 'NEW': return { color: 'text-blue-600', bg: 'bg-blue-100', icon: <AlertCircle className="w-4 h-4 mr-1"/>, text: 'NOU' };
            case 'IN_REVIEW': return { color: 'text-purple-600', bg: 'bg-purple-100', icon: <Clock className="w-4 h-4 mr-1"/>, text: 'ÎN ANALIZĂ' };
            case 'IN_PROGRESS': return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <Clock className="w-4 h-4 mr-1"/>, text: 'ÎN LUCRU' };
            case 'RESOLVED': 
            case 'CLOSED': return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4 mr-1"/>, text: 'REZOLVAT' };
            case 'REJECTED': return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-4 h-4 mr-1"/>, text: 'RESPINS' };
            default: return { color: 'text-gray-500', bg: 'bg-gray-100', icon: <Info className="w-4 h-4 mr-1"/>, text: status };
        }
    };

    const getPriorityBadge = (priority) => {
        if (!priority) return null;
        const p = priority.toUpperCase();
        if (p === 'CRITICAL') return <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700 border border-red-200">CRITICĂ</span>;
        if (p === 'HIGH') return <span className="px-2 py-1 text-xs font-bold rounded bg-orange-100 text-orange-700 border border-orange-200">RIDICATĂ</span>;
        if (p === 'LOW') return <span className="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-gray-600 border border-gray-200">SCĂZUTĂ</span>;
        return <span className="px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-700 border border-yellow-200">MEDIE</span>;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold bg-gray-50">Se încarcă tichetele...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-6">
                
                <button onClick={() => navigate('/dashboard')} className="flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors mb-4">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Înapoi la Dashboard
                </button>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Ticket className="w-7 h-7 mr-3 text-teal-600" /> Problemele Mele
                        </h1>
                        <p className="text-gray-500 mt-1">Gestionează și urmărește statusul sesizărilor tale.</p>
                    </div>
                    <ThemeSwitcher />
                </div>

                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>}

                {!error && complaints.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4 opacity-50" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Totul funcționează perfect!</h3>
                        <p className="text-gray-500">Nu ai raportat nicio problemă până acum.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.map((ticket) => {
                            const statusStyle = getStatusStyle(ticket.status || ticket.statusCode); 
                            
                            return (
                                <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-teal-500 hover:shadow-md transition-all">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                #{ticket.ticketNumber || ticket.id.substring(0,6).toUpperCase()}
                                            </span>
                                            {getPriorityBadge(ticket.priority)}
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{ticket.title}</h2>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{ticket.description}</p>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.color}`}>
                                                {statusStyle.icon} {statusStyle.text}
                                            </span>
                                        </div>
                                        
                                        {/* AICI E MAGIA: Butonul navighează spre pagina nouă creată mai sus */}
                                        <button 
                                            onClick={() => navigate(`/complaint/${ticket.id}`)}
                                            className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            Detalii Tichet
                                        </button>
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