import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Starea utilizatorului care se potrivește cu DTO-ul din Java
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        role: '',
        employeeNumber: '',
        joinedAt: '',
        totalTickets: 0 // NOU: Starea pentru numărul de tichete
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                
                // Dacă nu ești logat, te trimite la login
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Chemăm API-ul tău funcțional
                const response = await fetch('http://localhost:8080/api/employees/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Populăm interfața cu datele din JSON-ul primit
                    setUser({
                        firstName: data.firstName || 'N/A',
                        lastName: data.lastName || 'N/A',
                        email: data.email || 'N/A',
                        department: data.departmentName || 'N/A', 
                        role: data.roleCode || 'USER',
                        employeeNumber: data.employeeNumber || 'N/A',
                        joinedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('ro-RO') : 'Necunoscut',
                        totalTickets: data.totalTickets || 0 // NOU: Prindem numărul de tichete trimis de Java (va fi 5 momentan)
                    });
                } else if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwt_token');
                    navigate('/login');
                } else {
                    setError('Eroare la aducerea datelor din profil.');
                }
            } catch (err) {
                console.error("Eroare rețea:", err);
                setError('Nu ne-am putut conecta la serverul Spring Boot.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-teal-600 font-medium">Se încarcă profilul...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
                <button 
                    onClick={() => navigate('/dashboard')} 
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-medium"
                >
                    Înapoi la Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Buton de întoarcere */}
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Înapoi la Dashboard
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Antet colorat (făcut mai subțire) */}
                    <div className="h-24 bg-teal-600"></div>
                    
                    <div className="px-8 pb-8 pt-8">
                        
                        {/* Titlu Profil */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                            <p className="text-gray-500 font-medium mt-1">{user.role} • Departamentul {user.department}</p>
                        </div>

                        {/* Detalii aduse din baza de date */}
                        <div className="mt-8">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
                                    Informații Profesionale
                                </h3>
                                {/* Am modificat aici pentru a permite mai mult spațiu pentru noua secțiune: gap-y-8 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Email Instituțional</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Marcă Angajat</p>
                                        <p className="font-medium text-gray-900">{user.employeeNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Membru din</p>
                                        <p className="font-medium text-gray-900">{user.joinedAt}</p>
                                    </div>
                                    {/* NOU: Secțiunea pentru afișarea numărului de tichete cu un "badge" vizual */}
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Sesizări Trimise</p>
                                        <div className="flex items-center">
                                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-bold bg-teal-100 text-teal-800">
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