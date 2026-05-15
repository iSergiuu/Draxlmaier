import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, LogOut, ShieldAlert, ClipboardList } from 'lucide-react';

export default function UserMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    // Referinta pentru click pe afara
    const menuRef = useRef(null);

    const isOpen = isHovered || isPinned;
    const navigate = useNavigate();

    const adminEmail = localStorage.getItem('userEmail') || 'Utilizator';
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin';

    // Logica pentru inchidere la click pe afara
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsPinned(false);
                setIsHovered(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeMenu = () => {
        setIsHovered(false);
        setIsPinned(false);
    };

    const handleNavigate = (path) => {
        navigate(path);
        closeMenu();
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        handleNavigate('/login');
    };

    return (
        <div
            className="relative"
            ref={menuRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-2 rounded-lg transition-colors focus:outline-none text-brand-text flex items-center ${isPinned ? 'bg-black/10' : 'hover:bg-black/5'}`}
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>

            {isOpen && (
                // Wrapper cu padding-top pentru a preveni inchiderea accidentala la hover
                <div className="absolute right-0 top-10 pt-2 z-50">
                    <div className="w-64 bg-brand-card border border-brand-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="py-2">
                            <div className="px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider border-b border-brand-border mb-1 bg-brand-bg/50">
                                Conectat ca: <span className="block text-brand-text truncate mt-1">{adminEmail}</span>
                            </div>

                            <button
                                onClick={() => handleNavigate('/profile')}
                                className="w-full text-left px-4 py-2.5 text-brand-text hover:bg-black/5 font-medium transition-colors flex items-center"
                            >
                                <Users className="w-4 h-4 mr-3 text-brand-muted" />
                                Profilul Meu
                            </button>

                            <button
                                onClick={() => handleNavigate('/dashboard')}
                                className="w-full text-left px-4 py-2.5 text-brand-text hover:bg-black/5 font-medium transition-colors flex items-center"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-3 text-brand-muted" />
                                Asset-urile Mele
                            </button>

                            <button
                                onClick={() => handleNavigate('/complaints')}
                                className="w-full text-left px-4 py-2.5 text-brand-text hover:bg-black/5 font-medium transition-colors flex items-center"
                            >
                                <ClipboardList className="w-4 h-4 mr-3 text-brand-primary" />
                                Problemele Mele
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => handleNavigate('/admin')}
                                    className="w-full text-left px-4 py-2.5 text-brand-primary hover:bg-brand-primary/10 font-medium transition-colors flex items-center"
                                >
                                    <ShieldAlert className="w-4 h-4 mr-3" />
                                    Panou Administrator
                                </button>
                            )}

                            <div className="border-t border-brand-border my-1"></div>

                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-500/10 font-medium transition-colors flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Deconectare
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}