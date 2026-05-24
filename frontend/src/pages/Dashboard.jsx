import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../App';
import { motion } from 'framer-motion';
import {
    Laptop, Smartphone, Monitor, Printer,
    HardDrive, Cpu, Box, Mouse, Plus,
    AlertTriangle, CheckCircle, Package,
    Keyboard, Headphones
} from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import UserMenu from '../components/UserMenu';

const ASSET_ICONS_CONFIG = [
    { keywords: ['laptop', 'macbook', 'thinkpad', 'notebook'], icon: Laptop },
    { keywords: ['phone', 'telefon', 'iphone', 'samsung', 'smartphone'], icon: Smartphone },
    { keywords: ['monitor', 'display', 'screen'], icon: Monitor },
    { keywords: ['printer', 'imprimanta', 'xerox'], icon: Printer },
    { keywords: ['server'], icon: Cpu },
    { keywords: ['storage', 'hdd', 'ssd', 'hard'], icon: HardDrive },
    { keywords: ['mouse'], icon: Mouse },
    { keywords: ['tastatura', 'keyboard', 'tastatură'], icon: Keyboard },
    { keywords: ['casti', 'căști', 'headset', 'headphones', 'audio', 'earphone'], icon: Headphones },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
    const [myAssets, setMyAssets]           = useState([]);
    const [openTicketsCount, setOpenTicketsCount] = useState(0);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [activeFilter, setActiveFilter]   = useState('Toate');

    const [isModalOpen, setIsModalOpen]     = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    
    const showToast = useContext(ToastContext);

    const [complaintTitle, setComplaintTitle]               = useState('');
    const [complaintDescription, setComplaintDescription]   = useState('');
    const [complaintPriority, setComplaintPriority]         = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting]                   = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token            = localStorage.getItem('jwt_token') || localStorage.getItem('token');
                const currentUserEmail = localStorage.getItem('userEmail');
                if (!token || !currentUserEmail) { navigate('/login'); return; }

                const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

                const [assetsRes, complaintsRes] = await Promise.all([
                    fetch('http://localhost:8080/api/assets', { headers }),
                    fetch('http://localhost:8080/api/complaints/me', { headers })
                ]);

                if (assetsRes.ok && complaintsRes.ok) {
                    const assetsData = await assetsRes.json();
                    const complaintsData = await complaintsRes.json();

                    const activeComplaints = complaintsData.filter(c => {
                        const s = (c.status || c.statusCode || '').toUpperCase();
                        return s !== 'RESOLVED' && s !== 'CLOSED' && s !== 'REJECTED';
                    });
                    
                    setOpenTicketsCount(activeComplaints.length);

                    const activeAssetIds = new Set(activeComplaints.map(c => c.assetId));

                    const filteredAssets = assetsData.filter(a => {
                        const email = a.assignedToEmail || a.assigned_to_email || '';
                        return email.toLowerCase() === currentUserEmail.toLowerCase();
                    }).map(a => ({
                        ...a,
                        hasActiveTicket: activeAssetIds.has(a.id)
                    }));
                    
                    setMyAssets(filteredAssets);

                } else if (assetsRes.status === 401 || assetsRes.status === 403 || complaintsRes.status === 401 || complaintsRes.status === 403) {
                    setError(`Eroare de securitate: backend-ul refuză cererea.`);
                } else {
                    setError(`Eroare de la server`);
                }
            } catch (err) {
                console.error('Eroare de rețea:', err);
                setError('Eroare CORS sau backend oprit.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        ['jwt_token', 'token', 'userRole', 'userEmail'].forEach(k => localStorage.removeItem(k));
        navigate('/login');
    };

    const getAssetIcon = (asset) => {
        const s     = `${asset.name || ''} ${asset.category || ''}`.toLowerCase();
        const found = ASSET_ICONS_CONFIG.find(c => c.keywords.some(k => s.includes(k)));
        const Icon  = found ? found.icon : Box;
        return <Icon className="w-5 h-5" />;
    };

    const filterAssets = () => {
        const s = (a) => `${a.name} ${a.category}`.toLowerCase();
        if (activeFilter === 'Laptopuri')
            return myAssets.filter(a => /laptop|macbook|thinkpad|notebook/i.test(s(a)));
        if (activeFilter === 'Telefoane')
            return myAssets.filter(a => /phone|telefon|iphone|samsung|smartphone/i.test(s(a)));
        if (activeFilter === 'Monitoare')
            return myAssets.filter(a => /monitor|display|screen/i.test(s(a)));
        if (activeFilter === 'Periferice')
            return myAssets.filter(a => /mouse|tastatur|keyboard|casti|headset|headphone|printer|imprimanta/i.test(s(a)));
        if (activeFilter === 'Storage')
            return myAssets.filter(a => /storage|hdd|ssd|hard/i.test(s(a)));
        if (activeFilter === 'Altele')
            return myAssets.filter(a => {
                const str = s(a);
                return !/laptop|macbook|thinkpad|notebook|phone|telefon|iphone|samsung|monitor|display|mouse|tastatur|keyboard|casti|headset|headphone|printer|imprimanta|storage|hdd|ssd|hard|server/.test(str);
            });
        return myAssets;
    };

    const openReportModal = (asset) => {
        setSelectedAsset(asset);
        setComplaintTitle('');
        setComplaintDescription('');
        setComplaintPriority('MEDIUM');
        setIsModalOpen(true);
    };

    const closeReportModal = () => { setIsModalOpen(false); setSelectedAsset(null); };

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/complaints', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body:    JSON.stringify({
                    title:       complaintTitle,
                    description: complaintDescription,
                    assetId:     selectedAsset.id,
                    priority:    complaintPriority,
                }),
            });
            if (res.ok) {
                showToast(`Tichet creat cu succes pentru: ${selectedAsset.name}!`, 'success');
                closeReportModal();
                setOpenTicketsCount(prev => prev + 1);
                setMyAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...a, hasActiveTicket: true } : a));
            } else {
                const errData = await res.json().catch(() => null);
                showToast(`Eroare la creare tichet: ${errData?.message || 'Date invalide'}`, 'error');
            }
        } catch (err) {
            console.error('Eroare la trimiterea plângerii:', err);
            showToast('Nu am putut contacta serverul.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const visibleAssets = filterAssets();
    const functionalAssetsCount = myAssets.filter(a => !a.hasActiveTicket).length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-brand-muted text-sm">Se încarcă echipamentele...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-brand-bg transition-colors duration-300">
            <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-sm max-w-md text-center">
                {error}
            </div>
            <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm border border-brand-border text-brand-text rounded-lg hover:bg-brand-card transition-colors"
            >
                Înapoi la login
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg transition-colors duration-300">
            <div className="w-full px-6 lg:px-10 py-8 space-y-8">

                <div className="bg-brand-card border border-brand-border rounded-2xl px-6 py-5 flex justify-between items-center shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-brand-text leading-tight">Asset-urile mele</h1>
                            <p className="text-xs text-brand-muted mt-0.5">Echipamentele care îți sunt asignate</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center gap-4 transition-colors duration-300">
                        <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-brand-primary shrink-0">
                            <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">Total</p>
                            <p className="text-2xl font-bold text-brand-text leading-tight">{myAssets.length}</p>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center gap-4 transition-colors duration-300">
                        <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-green-500 shrink-0">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">Funcționale</p>
                            <p className="text-2xl font-bold text-brand-text leading-tight">{functionalAssetsCount}</p>
                        </div>
                    </div>

                    <div className="bg-brand-card border border-brand-border rounded-2xl p-5 flex items-center gap-4 transition-colors duration-300">
                        <div className="w-11 h-11 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center text-amber-500 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">Tichete deschise</p>
                            <p className="text-2xl font-bold text-brand-text leading-tight">{openTicketsCount}</p>
                        </div>
                    </div>
                </div>

                {myAssets.length === 0 ? (
                    <div className="bg-brand-card border border-brand-border rounded-2xl p-12 text-center transition-colors duration-300">
                        <Box className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-40" />
                        <p className="text-brand-muted">Nu ai niciun echipament asignat în acest moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-brand-text">
                                Inventar
                                <span className="ml-2 text-xs font-normal text-brand-muted">
                                    ({visibleAssets.length} echipament{visibleAssets.length !== 1 ? 'e' : ''})
                                </span>
                            </h2>
                            <div className="flex gap-1.5 flex-wrap">
                                {['Toate', 'Laptopuri', 'Telefoane', 'Monitoare', 'Periferice', 'Storage', 'Altele'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(f)}
                                        className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-all duration-200 ${
                                            activeFilter === f
                                                ? 'bg-brand-primary text-white border-brand-primary'
                                                : 'border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/40 bg-brand-card'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {visibleAssets.map((asset) => {
                                const hasTicket = asset.hasActiveTicket;
                                return (
                                    <motion.div
                                        key={asset.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -4, transition: { duration: 0.15 } }}
                                        className={`bg-brand-card rounded-2xl border flex flex-col transition-all duration-200 hover:shadow-md ${
                                            hasTicket
                                                ? 'border-amber-400/50 hover:border-amber-400'
                                                : 'border-brand-border hover:border-brand-primary'
                                        }`}
                                    >
                                        <div className="p-5 flex items-start gap-4 flex-1">
                                            <div className="p-2.5 bg-brand-bg rounded-xl border border-brand-border text-brand-primary shrink-0">
                                                {getAssetIcon(asset)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-bold text-brand-text leading-snug truncate">
                                                    {asset.name}
                                                </h3>
                                                <p className="text-xs text-brand-muted mt-1 line-clamp-2 leading-relaxed">
                                                    {asset.description || 'Nicio descriere disponibilă.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-5 pb-5 pt-4 flex items-center justify-between border-t border-brand-border mt-auto">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-mono text-brand-muted bg-brand-bg border border-brand-border rounded-md px-2 py-0.5 w-fit">
                                                    SN: {asset.serialNumber || asset.serial_number || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1.5 mt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasTicket ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
                                                    <span className="text-[11px] text-brand-muted font-bold uppercase tracking-wider">
                                                        {hasTicket ? 'Tichet activ' : 'Funcțional'}
                                                    </span>
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => openReportModal(asset)}
                                                className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:opacity-70 transition-opacity"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Raportează
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </div>

            {isModalOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeReportModal}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="bg-brand-primary px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-white font-bold text-base">Sesizare nouă</h3>
                            </div>
                            <button
                                onClick={closeReportModal}
                                aria-label="Închide"
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="px-6 py-3 border-b border-brand-border bg-brand-bg flex items-center gap-3 transition-colors duration-300">
                            <div className="p-2 bg-brand-card rounded-lg border border-brand-border text-brand-primary">
                                {getAssetIcon(selectedAsset)}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-widest text-brand-muted font-semibold">Echipament afectat</p>
                                <p className="text-sm font-bold text-brand-text">{selectedAsset.name}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitComplaint} className="p-6 space-y-5">

                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wide">
                                    Subiectul problemei
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={complaintTitle}
                                    onChange={e => setComplaintTitle(e.target.value)}
                                    placeholder="Ex: Laptopul nu se mai aprinde"
                                    className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all placeholder:text-brand-muted"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-2 uppercase tracking-wide">
                                    Nivel de urgență
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { value: 'LOW',      label: 'Scăzută',  activeClass: 'bg-green-500/10 text-green-600 border-green-400' },
                                        { value: 'MEDIUM',   label: 'Medie',    activeClass: 'bg-amber-500/10 text-amber-600 border-amber-400' },
                                        { value: 'HIGH',     label: 'Ridicată', activeClass: 'bg-orange-500/10 text-orange-600 border-orange-400' },
                                        { value: 'CRITICAL', label: 'Critică',  activeClass: 'bg-red-500/10 text-red-500 border-red-400' },
                                    ].map(p => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setComplaintPriority(p.value)}
                                            className={`text-[11px] font-semibold py-2 rounded-xl border transition-all ${
                                                complaintPriority === p.value
                                                    ? p.activeClass
                                                    : 'border-brand-border text-brand-muted bg-brand-bg hover:bg-brand-card'
                                            }`}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wide">
                                    Descriere detaliată
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={complaintDescription}
                                    onChange={e => setComplaintDescription(e.target.value)}
                                    placeholder="Descrie detaliat ce s-a întâmplat..."
                                    className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-xl px-4 py-2.5 text-sm resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all placeholder:text-brand-muted leading-relaxed"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-brand-border">
                                <button
                                    type="button"
                                    onClick={closeReportModal}
                                    className="px-5 py-2.5 text-sm font-semibold text-brand-text bg-brand-bg border border-brand-border rounded-xl hover:bg-brand-card transition-colors"
                                >
                                    Anulează
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-5 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-xl transition-opacity flex items-center gap-2 ${
                                        isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Se trimite...
                                        </>
                                    ) : 'Trimite tichetul'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}