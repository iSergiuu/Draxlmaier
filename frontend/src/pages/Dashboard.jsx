import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [myAssets, setMyAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // --- STATE NOU PENTRU MENIUL HAMBURGER ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:8080/api/assets', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMyAssets(data);
                } else if (response.status === 401 || response.status === 403) {
                    // AM COMENTAT ASTEA TEMPORAR CA SA NU TE MAI DEA AFARA:
                    // localStorage.removeItem('jwt_token');
                    // navigate('/login');
                    
                    setError(`Eroare de Securitate (${response.status}): Backend-ul refuză cererea. Ai adăugat @CrossOrigin pe AssetController? Ai implementat metoda pe backend?`);
                } else {
                    setError(`Eroare de la server: ${response.status}`);
                }
            } catch (err) {
                console.error("Eroare de rețea:", err);
                setError('Eroare CORS sau Backend Oprit. Verifică consola (F12).');
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    const handleReportProblem = (assetId, assetName) => {
        console.log(`Pregătire tichet POST /api/complaints pentru asset-ul cu ID-ul: ${assetId}`);
        alert(`Urmează să creăm o plângere pentru: ${assetName}`);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-teal-700">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-8">
                <div className="text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">
                    {error}
                </div>
                <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    Înapoi la Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* --- ANTETUL CU MENIUL HAMBURGER --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center relative">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asset-urile Mele</h1>
                        <p className="text-gray-500 mt-1">Echipamentele care îți sunt asignate.</p>
                    </div>
                    
                    {/* Containerul pentru Meniu */}
                    <div>
                        {/* Butonul cu cele 3 linii (Hamburger SVG) */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none text-gray-600"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {/* Dropdown-ul care apare când isMenuOpen este true */}
                        {isMenuOpen && (
                            <>
                                {/* Fundal invizibil pentru a închide meniul la click în afară */}
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsMenuOpen(false)}
                                ></div>
                                
                               <div className="absolute right-6 top-20 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                                <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Contul meu
                                    </div>
                                    
                                    {/* AICI ERA O MICA EROARE DE NAVIGARE: e doar '/profile', nu '/pages/Profile' */}
                                    <button 
                                        onClick={() => {
                                            navigate('/profile'); 
                                            setIsMenuOpen(false); 
                                        }}
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Profilul Meu
                                    </button>
                                    
                                    {/* Butonul de Logout pe care îl aveai deja */}
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors"
                                    >
                                        Deconectare
                                    </button>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                </div>

                {myAssets.length === 0 ? (
                    <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-200">
                        <p className="text-gray-500">Nu ai niciun asset asignat în acest moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myAssets.map((asset) => (
                            <div key={asset.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">{asset.name}</h2>
                                <p className="text-sm text-gray-500 mt-2">{asset.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{asset.status}</span>
                                    <button
                                        onClick={() => handleReportProblem(asset.id, asset.name)}
                                        className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                                    >
                                        Raportează problemă
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}