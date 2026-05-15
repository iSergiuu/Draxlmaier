import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const [myAssets, setMyAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Stări pentru meniul hamburger
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- STĂRI NOI PENTRU POPUP-UL DE RAPORTARE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    
    // Stări pentru formularul de raportare
    const [complaintTitle, setComplaintTitle] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [complaintPriority, setComplaintPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
                    setError(`Eroare de Securitate (${response.status}): Backend-ul refuză cererea.`);
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

    // Funcția care deschide modalul
    const openReportModal = (asset) => {
        setSelectedAsset(asset);
        // Resetăm valorile din formular
        setComplaintTitle('');
        setComplaintDescription('');
        setComplaintPriority('MEDIUM');
        setIsModalOpen(true);
    };

    // Funcția care închide modalul
    const closeReportModal = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
    };

    // Funcția care va trimite datele către Java
    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newComplaint = {
            title: complaintTitle,
            description: complaintDescription,
            assetId: selectedAsset.id,
            priority: complaintPriority
        };

        // PÂNĂ FACEM BACKEND-UL, DOAR AFIȘĂM ÎN CONSOLĂ
        console.log("Se trimite către Java:", newComplaint);
        
        // Simulăm o întârziere de 1 secundă ca să vezi animația butonului
        setTimeout(() => {
            alert(`Tichet creat cu succes pentru: ${selectedAsset.name}!`);
            setIsSubmitting(false);
            closeReportModal();
        }, 1000);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-teal-700">Se încarcă...</div>;
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
                    
                    <div>
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none text-gray-600"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsMenuOpen(false)}
                                ></div>
                                
                               <div className="absolute right-6 top-20 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                                <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Contul meu
                                    </div>
                                    
                                    <button 
                                        onClick={() => {
                                            navigate('/profile'); 
                                            setIsMenuOpen(false); 
                                        }}
                                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    >
                                        Profilul Meu
                                    </button>
                                    
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

                {/* --- LISTA DE  ASSET-URI --- */}
                {myAssets.length === 0 ? (
                    <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-200">
                        <p className="text-gray-500">Nu ai niciun asset asignat în acest moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myAssets.map((asset) => (
                            <div key={asset.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                                <h2 className="text-lg font-semibold text-gray-900">{asset.name}</h2>
                                <p className="text-sm text-gray-500 mt-2">{asset.description || "Nicio descriere disponibilă."}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                        SN: {asset.serialNumber || asset.serial_number || "N/A"}
                                    </span>
                                    <button
                                        onClick={() => openReportModal(asset)}
                                        className="text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors"
                                    >
                                        Raportează problemă
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- POPUP-UL PENTRU RAPORTAREA PROBLEMEI (MODAL) --- */}
            {isModalOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Fundalul întunecat care închide fereastra dacă dai click pe el */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeReportModal}
                    ></div>
                    
                    {/* Fereastra propriu-zisă */}
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        
                        {/* Antet Modal */}
                        <div className="bg-teal-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Sesizare nouă</h3>
                            <button 
                                onClick={closeReportModal}
                                className="text-teal-100 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Informații Asset */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <p className="text-sm text-gray-500">Echipament afectat:</p>
                            <p className="font-semibold text-gray-900">{selectedAsset.name}</p>
                        </div>

                        {/* Formularul */}
                        <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4">
                            
                            {/* Titlu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subiectul problemei
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={complaintTitle}
                                    onChange={(e) => setComplaintTitle(e.target.value)}
                                    placeholder="Ex: Laptopul nu se mai aprinde"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                                />
                            </div>

                            {/* Prioritate */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nivel de urgență (Prioritate)
                                </label>
                                <select 
                                    value={complaintPriority}
                                    onChange={(e) => setComplaintPriority(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white transition-all"
                                >
                                    <option value="LOW">Scăzută (Nu mă blochează)</option>
                                    <option value="MEDIUM">Medie (Mă încurcă în lucru)</option>
                                    <option value="HIGH">Ridicată (Sunt parțial blocat)</option>
                                    <option value="CRITICAL">Critică (Nu pot lucra deloc)</option>
                                </select>
                            </div>

                            {/* Descriere */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrie detaliat ce s-a întâmplat
                                </label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={complaintDescription}
                                    onChange={(e) => setComplaintDescription(e.target.value)}
                                    placeholder="Te rog să ne oferi cât mai multe detalii (când a apărut, erori pe ecran etc.)..."
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none transition-all"
                                ></textarea>
                            </div>

                            {/* Butoane Acțiune */}
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={closeReportModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                    Anulează
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition-colors flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting ? 'Se trimite...' : 'Trimite Tichetul'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}