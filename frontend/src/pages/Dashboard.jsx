import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu'; // Importam noua componenta

export default function Dashboard() {
    const [myAssets, setMyAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stari pentru popup-ul de raportare
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Stari pentru formularul de raportare
    const [complaintTitle, setComplaintTitle] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [complaintPriority, setComplaintPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

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
                    setError(`Eroare de Securitate (${response.status}): Backend-ul refuza cererea. Ai adaugat @CrossOrigin pe AssetController?`);
                } else {
                    setError(`Eroare de la server: ${response.status}`);
                }
            } catch (err) {
                console.error("Eroare de retea:", err);
                setError('Eroare CORS sau Backend Oprit. Verifica consola (F12).');
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    // Functia care deschide modalul
    const openReportModal = (asset) => {
        setSelectedAsset(asset);
        // Resetam valorile din formular
        setComplaintTitle('');
        setComplaintDescription('');
        setComplaintPriority('MEDIUM');
        setIsModalOpen(true);
    };

    // Functia care inchide modalul
    const closeReportModal = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
    };

    // Functia care va trimite datele catre Java
    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

        const payload = {
            title: complaintTitle,
            description: complaintDescription,
            assetId: selectedAsset.id,
            priority: complaintPriority
        };

        try {
            const response = await fetch('http://localhost:8080/api/complaints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`Tichet creat cu succes pentru: ${selectedAsset.name}!`);
                closeReportModal();
            } else {
                const errorData = await response.json().catch(() => null);
                alert(`Eroare la creare tichet: ${errorData?.message || 'Date invalide'}`);
            }
        } catch (err) {
            console.error("Eroare la trimiterea plangerii:", err);
            alert("Nu am putut contacta serverul. Asigura-te ca backend-ul este pornit!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-brand-primary bg-brand-bg">Se incarca...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-8 bg-brand-bg">
                <div className="text-red-600 font-bold bg-red-900/50 p-4 rounded-xl border border-red-500 text-red-200">
                    {error}
                </div>
                <button onClick={handleLogout} className="px-4 py-2 bg-brand-card border border-brand-border text-brand-text rounded hover:bg-black/5">
                    Inapoi la Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-bg p-8 transition-colors duration-300 relative">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- ANTETUL --- */}
                <div className="bg-brand-card p-6 rounded-xl shadow-sm border border-brand-border flex justify-between items-center relative transition-colors duration-300">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-text">Asset-urile Mele</h1>
                        <p className="text-brand-muted mt-1">Echipamentele care iti sunt asignate.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        {/* Aici am inlocuit tot codul kilometric cu o singura componenta */}
                        <UserMenu />
                    </div>
                </div>

                {/* --- LISTA DE ASSET-URI --- */}
                {myAssets.length === 0 ? (
                    <div className="bg-brand-card p-8 text-center rounded-xl shadow-sm border border-brand-border transition-colors duration-300">
                        <p className="text-brand-muted">Nu ai niciun asset asignat in acest moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myAssets.map((asset) => (
                            <div key={asset.id} className="bg-brand-card p-6 rounded-2xl shadow-sm border border-brand-border transition-colors duration-300 hover:shadow-md">
                                <h2 className="text-lg font-semibold text-brand-text">{asset.name}</h2>
                                <p className="text-sm text-brand-muted mt-2">{asset.description || "Nicio descriere disponibila."}</p>
                                <div className="mt-6 flex items-center justify-between">
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-bg text-brand-muted border border-brand-border">
                                        SN: {asset.serialNumber || asset.serial_number || "N/A"}
                                    </span>
                                    <button
                                        onClick={() => openReportModal(asset)}
                                        className="text-sm font-bold text-brand-primary hover:opacity-80 transition-opacity"
                                    >
                                        Raporteaza problema
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
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeReportModal}
                    ></div>

                    <div className="relative bg-brand-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col border border-brand-border animate-in fade-in zoom-in-95 duration-200">

                        <div className="bg-brand-primary px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Sesizare noua</h3>
                            <button
                                onClick={closeReportModal}
                                className="text-white/70 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="px-6 py-4 border-b border-brand-border bg-brand-bg">
                            <p className="text-sm text-brand-muted">Echipament afectat:</p>
                            <p className="font-semibold text-brand-text">{selectedAsset.name}</p>
                        </div>

                        <form onSubmit={handleSubmitComplaint} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Subiectul problemei</label>
                                <input
                                    type="text"
                                    required
                                    value={complaintTitle}
                                    onChange={(e) => setComplaintTitle(e.target.value)}
                                    placeholder="Ex: Laptopul nu se mai aprinde"
                                    className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Nivel de urgenta (Prioritate)</label>
                                <select
                                    value={complaintPriority}
                                    onChange={(e) => setComplaintPriority(e.target.value)}
                                    className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all"
                                >
                                    <option value="LOW">Scazuta (Nu ma blocheaza)</option>
                                    <option value="MEDIUM">Medie (Ma incurca in lucru)</option>
                                    <option value="HIGH">Radicata (Sunt partial blocat)</option>
                                    <option value="CRITICAL">Critica (Nu pot lucra deloc)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Descrie detaliat ce s-a intamplat</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={complaintDescription}
                                    onChange={(e) => setComplaintDescription(e.target.value)}
                                    placeholder="Te rog sa ne oferi cat mai multe detalii (cand a aparut, erori pe ecran etc.)..."
                                    className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none resize-none transition-all"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-brand-border">
                                <button
                                    type="button"
                                    onClick={closeReportModal}
                                    className="px-4 py-2 text-brand-text bg-brand-bg hover:bg-black/5 border border-brand-border rounded-lg font-medium transition-colors"
                                >
                                    Anuleaza
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-4 py-2 text-white bg-brand-primary hover:opacity-90 rounded-lg font-medium transition-opacity flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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