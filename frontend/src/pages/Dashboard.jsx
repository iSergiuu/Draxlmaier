import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { motion } from 'framer-motion';
import UserMenu from '../components/UserMenu';
import { Laptop, Smartphone, Monitor, Printer, HardDrive, Cpu, Box, Mouse } from 'lucide-react';

// Aceasta este configurarea centralizata.
const ASSET_ICONS_CONFIG = [
    { keywords: ['laptop', 'macbook', 'thinkpad'], icon: Laptop },
    { keywords: ['phone', 'telefon', 'iphone', 'samsung'], icon: Smartphone },
    { keywords: ['monitor', 'display'], icon: Monitor },
    { keywords: ['printer', 'imprimanta', 'xerox'], icon: Printer },
    { keywords: ['server'], icon: Cpu },
    { keywords: ['storage', 'hdd', 'ssd'], icon: HardDrive },
    { keywords: ['mouse'], icon: Mouse }
];

// Variantele de animatie mutate in locul corect, in afara functiei
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
    const [myAssets, setMyAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    const [complaintTitle, setComplaintTitle] = useState('');
    const [complaintDescription, setComplaintDescription] = useState('');
    const [complaintPriority, setComplaintPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
                // Preluăm emailul utilizatorului logat
                const currentUserEmail = localStorage.getItem('userEmail');

                if (!token || !currentUserEmail) {
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

                    // FILTRARE: Păstrăm doar asset-urile unde emailul atribuit corespunde cu cel al userului curent
                    const filteredAssets = data.filter(asset => {
                        const assignedEmail = asset.assignedToEmail || asset.assigned_to_email || '';
                        return assignedEmail.toLowerCase() === currentUserEmail.toLowerCase();
                    });

                    setMyAssets(filteredAssets);
                } else if (response.status === 401 || response.status === 403) {
                    setError(`Eroare de Securitate (${response.status}): Backend-ul refuza cererea.`);
                } else {
                    setError(`Eroare de la server: ${response.status}`);
                }
            } catch (err) {
                console.error("Eroare de retea:", err);
                setError('Eroare CORS sau Backend Oprit.');
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

    const openReportModal = (asset) => {
        setSelectedAsset(asset);
        setComplaintTitle('');
        setComplaintDescription('');
        setComplaintPriority('MEDIUM');
        setIsModalOpen(true);
    };

    const closeReportModal = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
    };

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
            alert("Nu am putut contacta serverul.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAssetIcon = (asset) => {
        const searchString = `${asset.name || ''} ${asset.category || ''}`.toLowerCase();

        const found = ASSET_ICONS_CONFIG.find(item =>
            item.keywords.some(keyword => searchString.includes(keyword))
        );

        if (found) {
            const IconComponent = found.icon;
            return <IconComponent className="w-8 h-8" />;
        }

        return <Box className="w-8 h-8" />;
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

                <div className="bg-brand-card p-6 rounded-xl shadow-sm border border-brand-border flex justify-between items-center relative transition-colors duration-300">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-text">Asset-urile Mele</h1>
                        <p className="text-brand-muted mt-1">Echipamentele care iti sunt asignate.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                {myAssets.length === 0 ? (
                    <div className="bg-brand-card p-8 text-center rounded-xl shadow-sm border border-brand-border transition-colors duration-300">
                        <p className="text-brand-muted">Nu ai niciun asset asignat in acest moment.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {myAssets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                variants={itemVariants}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="bg-brand-card p-6 rounded-2xl shadow-sm border border-brand-border transition-colors duration-300 hover:shadow-md hover:border-brand-primary flex flex-col justify-between"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-brand-bg rounded-xl border border-brand-border text-brand-primary shrink-0">
                                        {getAssetIcon(asset)}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-brand-text leading-tight">{asset.name}</h2>
                                        <p className="text-sm text-brand-muted mt-1 line-clamp-2">{asset.description || "Nicio descriere disponibila."}</p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-brand-border flex items-center justify-between">
                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-brand-bg text-brand-muted border border-brand-border">
                                        SN: {asset.serialNumber || asset.serial_number || "N/A"}
                                    </span>
                                    <button
                                        onClick={() => openReportModal(asset)}
                                        className="text-sm font-bold text-brand-primary hover:opacity-80 transition-opacity"
                                    >
                                        Raporteaza
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

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

                        <div className="px-6 py-4 border-b border-brand-border bg-brand-bg flex items-center gap-3">
                            <div className="text-brand-primary opacity-80">
                                {getAssetIcon(selectedAsset)}
                            </div>
                            <div>
                                <p className="text-xs text-brand-muted">Echipament afectat:</p>
                                <p className="font-semibold text-brand-text">{selectedAsset.name}</p>
                            </div>
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
                                    <option value="LOW">Scazuta</option>
                                    <option value="MEDIUM">Medie</option>
                                    <option value="HIGH">Ridicata</option>
                                    <option value="CRITICAL">Critica</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-brand-text mb-1">Descrie detaliat ce s-a intamplat</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={complaintDescription}
                                    onChange={(e) => setComplaintDescription(e.target.value)}
                                    placeholder="Detalii..."
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