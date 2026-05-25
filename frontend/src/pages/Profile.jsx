import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Hash, Building2, Calendar, Ticket, ArrowLeft, Package, Eye, EyeOff } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEmployeeNumber, setShowEmployeeNumber] = useState(false);

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: '',
        employeeNumber: '',
        joinedAt: '',
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const employeeRes = await fetch('http://localhost:8080/api/employees/me', { 
                    method: 'GET', 
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (employeeRes.ok) {
                    const empData = await employeeRes.json();

                    setUser({
                        firstName: empData.firstName || 'N/A',
                        lastName: empData.lastName || 'N/A',
                        email: empData.email || 'N/A',
                        department: empData.departmentName || 'N/A',
                        role: empData.roleCode || 'USER',
                        employeeNumber: empData.employeeNumber || 'N/A',
                        joinedAt: empData.createdAt
                            ? new Date(empData.createdAt).toLocaleDateString('ro-RO')
                            : 'Necunoscut',
                    });
                } else if (employeeRes.status === 401 || employeeRes.status === 403) {
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError('Eroare la aducerea datelor din profil.');
                }
            } catch (err) {
                console.error(err);
                setError('Nu ne-am putut conecta la serverul Spring Boot.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-brand-muted text-sm">Se încarcă profilul...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-brand-bg transition-colors duration-300">
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-sm max-w-md text-center">
                {error}
            </div>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm border border-brand-border text-brand-text rounded-lg hover:bg-brand-card transition-colors"
            >
                Înapoi la dashboard
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg transition-colors duration-300">
            <div className="w-full px-6 lg:px-10 py-8 space-y-6">

                {/* Header Pagina */}
                <div className="bg-brand-card border border-brand-border rounded-2xl px-6 py-4 flex justify-between items-center shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col justify-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-brand-muted hover:text-brand-text transition-colors uppercase tracking-wider mb-0.5 w-fit"
                            >
                                <ArrowLeft className="w-3 h-3" />
                                Înapoi
                            </button>
                            <h1 className="text-xl font-bold text-brand-text leading-tight">Profilul meu</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Coloana Stanga - Identitate */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        className="lg:col-span-1 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm transition-colors duration-300"
                    >
                        <div className="h-32 bg-brand-primary relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
                                    backgroundSize: '14px 14px',
                                }}
                            />
                        </div>

                        <div className="px-6 pb-8 pt-6">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h2 className="text-2xl font-bold text-brand-text truncate">{user.firstName} {user.lastName}</h2>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0 uppercase tracking-wider mt-1">
                                    {user.role}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-brand-muted font-medium mb-6">
                                <Building2 className="w-4 h-4 text-brand-primary/70" />
                                {user.department}
                            </div>

                            <div className="border-t border-brand-border pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4 text-brand-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Membru din</p>
                                        <p className="text-sm font-medium text-brand-text mt-0.5">{user.joinedAt}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Coloana Dreapta - Detalii & Activitate */}
                    <div className="lg:col-span-2 space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.07 }}
                            className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-sm transition-colors duration-300"
                        >
                            <h3 className="text-sm font-bold text-brand-text mb-5 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-brand-primary inline-block" />
                                Contact & Securitate
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-border rounded-xl overflow-hidden border border-brand-border">
                                {/* Email */}
                                <div className="bg-brand-card px-5 py-4 flex items-center gap-4 transition-colors duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-brand-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Email instituțional</p>
                                        <p className="text-sm font-medium text-brand-text mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                {/* Cod Securitate */}
                                <div className="bg-brand-card px-5 py-4 flex items-center gap-4 transition-colors duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                        <Hash className="w-4 h-4 text-brand-primary" />
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Cod de securitate</p>
                                            <p className="text-sm font-medium text-brand-text mt-0.5 font-mono tracking-widest">
                                                {!showEmployeeNumber ? '••••••••' : user.employeeNumber}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => setShowEmployeeNumber(!showEmployeeNumber)}
                                            className="p-2 rounded-lg text-brand-muted hover:bg-brand-bg hover:text-brand-primary transition-colors focus:outline-none"
                                            title={showEmployeeNumber ? "Ascunde" : "Arată"}
                                        >
                                            {showEmployeeNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.14 }}
                            className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-sm transition-colors duration-300"
                        >
                            <h3 className="text-sm font-bold text-brand-text mb-5 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-brand-primary inline-block" />
                                Tichete și Sesizări
                            </h3>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-brand-bg rounded-xl border border-brand-border">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center shrink-0 shadow-sm">
                                        <Ticket className="w-6 h-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-brand-text">
                                            Istoric sesizări
                                        </p>
                                        <p className="text-xs text-brand-muted mt-1">Vezi și gestionează problemele raportate de tine</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/complaints')}
                                    className="mt-2 sm:mt-0 sm:ml-auto w-full sm:w-auto px-5 py-2.5 text-sm font-semibold bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all duration-300 shrink-0 border border-brand-primary/20"
                                >
                                    Deschide
                                </button>
                            </div>
                        </motion.div>

                    </div>
                </div>

            </div>
        </div>
    );
}