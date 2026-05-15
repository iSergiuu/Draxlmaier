import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: '',
        employeeNumber: '',
        joinedAt: '',
        totalTickets: 0
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Verificam ambele chei ca sa fim siguri
                const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:8080/api/employees/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    setUser({
                        firstName: data.firstName || 'N/A',
                        lastName: data.lastName || 'N/A',
                        email: data.email || 'N/A',
                        department: data.departmentName || 'N/A',
                        role: data.roleCode || 'USER',
                        employeeNumber: data.employeeNumber || 'N/A',
                        joinedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('ro-RO') : 'Necunoscut',
                        totalTickets: data.totalTickets || 0
                    });
                } else if (response.status === 401 || response.status === 403) {
                    // Daca expira sesiunea
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    setError('Eroare la aducerea datelor din profil.');
                }
            } catch (err) {
                console.error("Eroare retea:", err);
                setError('Nu ne-am putut conecta la serverul Spring Boot.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-brand-primary font-medium bg-brand-bg">Se încarcă profilul...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-brand-bg">
                <div className="text-red-600 font-bold bg-red-900/50 p-4 rounded-xl border border-red-500 text-red-200">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-brand-card border border-brand-border text-brand-text rounded hover:bg-black/5 font-medium transition-colors"
                >
                    Înapoi la Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg p-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Antetul Nou (la fel ca in Dashboard) */}
                <div className="bg-brand-card p-6 rounded-xl shadow-sm border border-brand-border flex justify-between items-center relative transition-colors duration-300">
                    <div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-brand-primary hover:opacity-80 font-medium transition-opacity mb-2"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Înapoi la Dashboard
                        </button>
                        <h1 className="text-2xl font-bold text-brand-text">Profilul Meu</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                {/* Cardul cu Profilul */}
                <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden transition-colors duration-300">
                    {/* Antet colorat (in culoarea temei curente) */}
                    <div className="h-24 bg-brand-primary transition-colors duration-300"></div>

                    <div className="px-8 pb-8 pt-6">

                        <div>
                            <h1 className="text-3xl font-bold text-brand-text">{user.firstName} {user.lastName}</h1>
                            <p className="text-brand-muted font-medium mt-1">{user.role} • Departamentul {user.department}</p>
                        </div>

                        <div className="mt-8">
                            <div className="bg-brand-bg p-6 rounded-lg border border-brand-border transition-colors duration-300">
                                <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-6">
                                    Informații Profesionale
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
                                    <div>
                                        <p className="text-sm text-brand-muted mb-1">Email Instituțional</p>
                                        <p className="font-medium text-brand-text">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-brand-muted mb-1">Marcă Angajat</p>
                                        <p className="font-medium text-brand-text">{user.employeeNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-brand-muted mb-1">Membru din</p>
                                        <p className="font-medium text-brand-text">{user.joinedAt}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-brand-muted mb-1">Sesizări Trimise</p>
                                        <div className="flex items-center">
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-bold bg-brand-bg border border-brand-primary text-brand-primary">
                                                {user.totalTickets} tichete
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}