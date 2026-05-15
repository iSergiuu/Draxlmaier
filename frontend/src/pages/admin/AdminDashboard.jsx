import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Laptop, Smartphone, Headphones, Monitor, Keyboard,
    Mouse, HardDrive, Plus, X, LayoutDashboard, Users,
    Settings, LogOut, Info, AlertCircle, Palette
} from 'lucide-react';

export default function AdminDashboard() {
    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAsset, setSelectedAsset] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Citim tema salvata anterior, sau folosim 'light' default
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

    const navigate = useNavigate();
    const adminEmail = localStorage.getItem('userEmail') || 'Admin';

    // Aplicam tema cand se schimba
    useEffect(() => {
        localStorage.setItem('appTheme', theme);
        // Aplicam clasa pe toata pagina (tag-ul html)
        if (theme === 'light') {
            document.documentElement.className = '';
        } else {
            document.documentElement.className = theme;
        }
    }, [theme]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const fetchAssets = () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/login');
            return;
        }

        fetch('http://localhost:8080/api/assets', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Eroare la preluarea datelor');
                return res.json();
            })
            .then(data => {
                setAssets(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const getCategoryIcon = (category) => {
        if (!category) return <HardDrive className="w-6 h-6 text-brand-muted" />;
        const cat = category.toLowerCase();
        if (cat.includes('laptop')) return <Laptop className="w-6 h-6 text-brand-primary" />;
        if (cat.includes('telefon') || cat.includes('phone')) return <Smartphone className="w-6 h-6 text-green-500" />;
        if (cat.includes('casti') || cat.includes('audio')) return <Headphones className="w-6 h-6 text-purple-500" />;
        if (cat.includes('monitor') || cat.includes('display')) return <Monitor className="w-6 h-6 text-teal-500" />;
        if (cat.includes('tastatura') || cat.includes('keyboard')) return <Keyboard className="w-6 h-6 text-orange-500" />;
        if (cat.includes('mouse')) return <Mouse className="w-6 h-6 text-pink-500" />;
        return <HardDrive className="w-6 h-6 text-brand-muted" />;
    };

    const totalAssets = assets.length;
    const inStockAssets = assets.filter(a => !a.assignedToId && !a.assigned_to_id).length;
    const defectiveAssets = 0;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">Se încarcă panoul de administrare...</div>;
    }

    return (
        <div className="flex h-screen bg-brand-bg font-sans transition-colors duration-300">

            {/* SIDEBAR */}
            <div className="w-64 bg-brand-sidebar text-white flex flex-col transition-colors duration-300">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-brand-primary">AssetHub</h1>
                    <p className="text-xs text-gray-400 mt-1">Panou Administrator</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <a href="#" className="flex items-center px-4 py-3 bg-brand-primary rounded-lg text-white font-medium transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Echipamente
                    </a>
                    <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        Angajați
                    </a>
                    <a href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        <Settings className="w-5 h-5 mr-3" />
                        Departamente
                    </a>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5 mr-3" />
                        Deconectare
                    </button>
                </div>
            </div>

            {/* CONTINUT CENTRAL */}
            <div className="flex-1 flex flex-col overflow-hidden">

                <header className="bg-brand-card shadow-sm border-b border-brand-border p-4 flex justify-between items-center transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-brand-text">Gestiune Echipamente</h2>

                    <div className="flex items-center gap-6 text-sm">
                        {/* Selector de Teme */}
                        <div className="flex items-center gap-2 text-brand-muted">
                            <Palette className="w-4 h-4" />
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="bg-brand-bg text-brand-text border border-brand-border rounded px-2 py-1 focus:outline-none"
                            >
                                <option value="light">Mod Luminos</option>
                                <option value="theme-dark">Mod Întunecat</option>
                                <option value="theme-drx">Temă DRX</option>
                            </select>
                        </div>
                        <div className="text-brand-muted">Conectat ca: <span className="font-semibold text-brand-text">{adminEmail}</span></div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg p-6 transition-colors duration-300">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex items-center transition-colors">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-brand-muted font-medium">Total Echipamente</p>
                                <p className="text-2xl font-bold text-brand-text">{totalAssets}</p>
                            </div>
                        </div>

                        <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex items-center transition-colors">
                            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-brand-muted font-medium">În Stoc (Disponibile)</p>
                                <p className="text-2xl font-bold text-brand-text">{inStockAssets}</p>
                            </div>
                        </div>

                        <div className="bg-brand-card rounded-xl p-6 shadow-sm border border-brand-border flex items-center transition-colors">
                            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-brand-muted font-medium">Defecte (Plângeri deschise)</p>
                                <p className="text-2xl font-bold text-brand-text">{defectiveAssets}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-brand-text">Toate Echipamentele</h3>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5 mr-1" />
                            Adaugă Echipament Nou
                        </button>
                    </div>

                    {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                    <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden transition-colors">
                        {assets.length === 0 ? (
                            <div className="p-8 text-center text-brand-muted">Niciun echipament înregistrat în sistem.</div>
                        ) : (
                            <ul className="divide-y divide-brand-border">
                                {assets.map((asset) => (
                                    <li
                                        key={asset.id}
                                        onClick={() => setSelectedAsset(asset)}
                                        className="p-4 hover:bg-black/5 cursor-pointer flex items-center justify-between transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="mr-4 p-2 bg-brand-bg rounded-lg border border-brand-border">
                                                {getCategoryIcon(asset.category)}
                                            </div>
                                            <div>
                                                <h4 className="text-md font-semibold text-brand-text">{asset.name}</h4>
                                                <p className="text-sm text-brand-muted font-mono">SN: {asset.serialNumber || asset.serial_number}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-brand-bg text-brand-text border border-brand-border">
                        {asset.category || "Fără categorie"}
                      </span>
                                            <Info className="w-5 h-5 text-brand-muted hover:text-brand-primary transition-colors" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>

            {/* POPUP DETALII ECHIPAMENT */}
            {selectedAsset && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-brand-border animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-brand-bg border-b border-brand-border p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-brand-text flex items-center">
                                {getCategoryIcon(selectedAsset.category)}
                                <span className="ml-2">Detalii Echipament</span>
                            </h3>
                            <button onClick={() => setSelectedAsset(null)} className="text-brand-muted hover:text-red-500 p-1 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-brand-muted">Nume Echipament</p>
                                <p className="font-semibold text-brand-text text-lg">{selectedAsset.name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-brand-muted">Serial Number</p>
                                    <p className="font-mono font-medium text-brand-text">{selectedAsset.serialNumber || selectedAsset.serial_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-brand-muted">Categorie</p>
                                    <p className="font-medium text-brand-text">{selectedAsset.category || 'Nespecificat'}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-brand-bg rounded-lg border border-brand-border">
                                <p className="text-sm text-brand-primary mb-1 font-medium">Atribuit către:</p>
                                <p className="font-semibold text-brand-text">
                                    {(selectedAsset.assignedToId || selectedAsset.assigned_to_id) ? 'Angajat (ID valid)' : 'Neatribuit (În Stoc)'}
                                </p>
                            </div>

                            <div className="mt-6 border-t border-brand-border pt-4">
                                <h4 className="font-semibold text-brand-text mb-2">Istoric Plângeri</h4>
                                <div className="bg-brand-bg p-4 rounded-lg text-center border border-dashed border-brand-border">
                                    <p className="text-green-600 font-medium text-sm flex items-center justify-center">
                                        <span className="mr-2">✔️</span> Nu s-au semnalat probleme până acum.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-bg p-4 border-t border-brand-border flex justify-end gap-3">
                            <button className="px-4 py-2 border border-brand-border rounded-lg text-brand-text hover:bg-black/5 font-medium transition-colors">
                                Schimbă Status
                            </button>
                            <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-medium transition-colors">
                                Editează
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POPUP ADAUGARE ECHIPAMENT */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-brand-border">
                        <div className="bg-brand-bg border-b border-brand-border p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-brand-text">Adaugă Echipament Nou</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-brand-muted hover:text-red-500 p-1 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Nume Echipament</label>
                                    <input type="text" className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none" placeholder="Ex: Laptop Dell XPS 15" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Serial Number</label>
                                    <input type="text" className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none font-mono" placeholder="Ex: DXL-2024-0001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Categorie</label>
                                    <select className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none">
                                        <option value="">Selectează o categorie</option>
                                        <option value="Laptop">Laptop</option>
                                        <option value="Telefon">Telefon</option>
                                        <option value="Monitor">Monitor</option>
                                        <option value="Periferice">Periferice</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1">Email Utilizator (Opțional)</label>
                                    <input type="email" className="w-full bg-brand-bg text-brand-text border border-brand-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:outline-none" placeholder="Pentru atribuire rapidă" />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-brand-text border border-brand-border hover:bg-black/5 rounded-lg font-medium transition-colors">Anulează</button>
                                    <button type="button" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover font-medium transition-colors">Salvează Echipament</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}