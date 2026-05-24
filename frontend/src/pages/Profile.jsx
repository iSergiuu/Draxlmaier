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

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                // Facem request DOAR pentru datele utilizatorului (scapam de 500-ul de la complaints)
                const employeeRes = await fetch('http://localhost:8080/api/employees/me', { 
                    method: 'GET', 
                    headers 
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
                                Înapoi
                            </button>
                            <h1 className="text-lg font-bold text-brand-text leading-tight">Profilul meu</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                        className="lg:col-span-1 bg-brand-card border border-brand-border rounded-2xl overflow-hidden shadow-sm transition-colors duration-300"
                    >
                        <div className="h-28 bg-brand-primary relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
                                    backgroundSize: '14px 14px',
                                }}
                            />
                        </div>

                        <div className="px-6 pb-6 pt-6">
                            <div className="flex items-start justify-between gap-4 mb-1">
                                <h2 className="text-xl font-bold text-brand-text truncate">{user.firstName} {user.lastName}</h2>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0 uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                            
                            <p className="text-sm text-brand-muted flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                {user.department}
                            </p>

                            <div className="border-t border-brand-border my-5" />

                            <div className="space-y-3.5">
                                {[
                                    { icon: Mail,      label: 'Email',             value: user.email },
                                    { icon: Hash,      label: 'Cod de securitate', value: user.employeeNumber, isSecret: true },
                                    { icon: Calendar,  label: 'Membru din',        value: user.joinedAt },
                                ].map(({ icon: Icon, label, value, isSecret }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center shrink-0 mt-0.5">
                                            <Icon className="w-3.5 h-3.5 text-brand-primary" />
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">{label}</p>
                                                <p className="text-sm font-medium text-brand-text mt-0.5 font-mono">
                                                    {isSecret && !showEmployeeNumber 
                                                        ? '••••••••' 
                                                        : value}
                                                </p>
                                            </div>
                                            {isSecret && (
                                                <button 
                                                    onClick={() => setShowEmployeeNumber(!showEmployeeNumber)}
                                                    className="p-1.5 text-brand-muted hover:text-brand-primary transition-colors focus:outline-none"
                                                    title={showEmployeeNumber ? "Ascunde" : "Arată"}
                                                >
                                                    {showEmployeeNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="lg:col-span-2 space-y-6">

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.07 }}
                            className="bg-brand-card border border-brand-border rounded-2xl p-6 shadow-sm transition-colors duration-300"
                        >
                            <h3 className="text-sm font-bold text-brand-text mb-5 flex items-center gap-2">
                                <span className="w-1 h-4 rounded-full bg-brand-primary inline-block" />
                                Informații profesionale
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-border rounded-xl overflow-hidden border border-brand-border">
                                {[
                                    { label: 'Email instituțional', value: user.email,          icon: Mail },
                                    { label: 'Cod de securitate',   value: user.employeeNumber, icon: Hash, isSecret: true },
                                    { label: 'Departament',         value: user.department,      icon: Building2 },
                                    { label: 'Dată angajare',       value: user.joinedAt,        icon: Calendar },
                                ].map(({ label, value, icon: Icon, isSecret }) => (
                                    <div
                                        key={label}
                                        className="bg-brand-card px-5 py-4 flex items-center gap-4 transition-colors duration-300"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                            <Icon className="w-4 h-4 text-brand-primary" />
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">{label}</p>
                                                <p className="text-sm font-medium text-brand-text mt-0.5 font-mono">
                                                    {isSecret && !showEmployeeNumber 
                                                        ? '••••••••' 
                                                        : value}
                                                </p>
                                            </div>
                                            {isSecret && (
                                                <button 
                                                    onClick={() => setShowEmployeeNumber(!showEmployeeNumber)}
                                                    className="p-1.5 text-brand-muted hover:text-brand-primary transition-colors focus:outline-none"
                                                    title={showEmployeeNumber ? "Ascunde" : "Arată"}
                                                >
                                                    {showEmployeeNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
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

                            <div className="flex items-center gap-4 p-4 bg-brand-bg rounded-xl border border-brand-border">
                                <div className="w-9 h-9 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center shrink-0">
                                    <Ticket className="w-4 h-4 text-brand-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">
                                        Istoric sesizări
                                    </p>
                                    <p className="text-xs text-brand-muted mt-0.5">Vezi și gestionează problemele raportate de tine</p>
                                </div>
                                <button
                                    onClick={() => navigate('/my-complaints')} // Asigură-te că ruta este corectă
                                    className="ml-auto px-4 py-2 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded-lg hover:bg-brand-primary/20 transition-colors shrink-0"
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