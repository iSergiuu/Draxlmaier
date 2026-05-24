import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutDashboard, LogOut, ShieldAlert, ClipboardList, Bell, Check, MessageSquare, AlertTriangle, Trash2, X, CheckCheck } from 'lucide-react';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Client } from '@stomp/stompjs';

export default function UserMenu() {
    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const isOpen = isHovered || isPinned;
    const hoverTimeout = useRef(null);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [userId, setUserId] = useState(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const menuRef = useRef(null);
    const notifRef = useRef(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    const adminEmail = localStorage.getItem('userEmail') || 'Utilizator';
    const userRole = localStorage.getItem('userRole');
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin' || userRole === 'SUPER_ADMIN';
    const isDeptResponsible = userRole === 'DEPT_RESPONSIBLE';

    useEffect(() => {
        if (!token) return;

        const initSystem = async () => {
            try {
                const userRes = await fetch('http://localhost:8080/api/employees/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUserId(userData.id);

                    const notifRes = await fetch('http://localhost:8080/api/notifications', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (notifRes.ok) {
                        const notifData = await notifRes.json();
                        setNotifications(notifData);
                    }

                    connectWebSocket(userData.id);
                }
            } catch (err) {
                console.error(err);
            }
        };

        initSystem();
    }, [token]);

    const connectWebSocket = (uid) => {
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: {
                'Authorization': `Bearer ${token}`
            },
            onConnect: () => {
                stompClient.subscribe(`/topic/notifications/${uid}`, (message) => {
                    if (message.body) {
                        const newNotif = JSON.parse(message.body);
                        setNotifications((prev) => [newNotif, ...prev]);
                    }
                });
            }
        });
        stompClient.activate();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsPinned(false);
                setIsHovered(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
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
        setIsNotifOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        handleNavigate('/login');
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:8080/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        const unreadNotifs = notifications.filter(n => !n.read);
        if (unreadNotifs.length === 0) return;

        try {
            await Promise.all(
                unreadNotifs.map(n => 
                    fetch(`http://localhost:8080/api/notifications/${n.id}/read`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                )
            );
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteNotif = async (id, e) => {
        e.stopPropagation();
        try {
            const res = await fetch(`http://localhost:8080/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(notifications.filter(n => n.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAll = async (e) => {
        e.stopPropagation();
        try {
            const res = await fetch('http://localhost:8080/api/notifications/clear-all', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotifClick = (notif) => {
        setIsNotifOpen(false);
        if (!notif.read) {
            fetch(`http://localhost:8080/api/notifications/${notif.id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(() => {
                setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n));
            });
        }
        if (notif.referenceId) {
            navigate(`/complaint/${notif.referenceId}`);
        }
    };

    return (
        <div className="flex items-center gap-2">

            <div className="relative" ref={notifRef}
                onMouseEnter={() => { clearTimeout(hoverTimeout.current); setIsNotifOpen(true); setIsPinned(false); setIsHovered(false); }}
                onMouseLeave={() => { hoverTimeout.current = setTimeout(() => setIsNotifOpen(false), 200); }}
            >
                <button
                    onClick={() => { setIsNotifOpen(!isNotifOpen); closeMenu(); }}
                    className={`p-2 rounded-lg transition-colors focus:outline-none text-brand-text relative ${isNotifOpen ? 'bg-black/10' : 'hover:bg-black/5'}`}
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse border-2 border-brand-card">
                            {unreadCount}
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {isNotifOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 top-12 w-80 bg-brand-card border border-brand-border rounded-xl shadow-xl z-50 overflow-hidden origin-top-right"
                        >
                            <div className="p-3 border-b border-brand-border bg-brand-bg flex justify-between items-center">
                                <span className="font-bold text-brand-text text-sm">Notificări</span>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <>
                                            <button 
                                                onClick={handleMarkAllAsRead}
                                                className="text-[10px] text-brand-muted hover:text-brand-primary flex items-center gap-1 transition-colors"
                                                title="Marchează toate ca citite"
                                            >
                                                <CheckCheck className="w-3.5 h-3.5" />
                                                Citește toate
                                            </button>
                                            <span className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full font-semibold">
                                                {unreadCount} noi
                                            </span>
                                        </>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleDeleteAll}
                                            className="p-1 rounded hover:bg-red-500/10 text-brand-muted hover:text-red-500 transition-colors"
                                            title="Șterge toate notificările"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-80 overflow-y-auto divide-y divide-brand-border pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brand-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand-primary/50">
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-brand-muted text-center py-6">Nu ai notificări momentan.</p>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotifClick(notif)}
                                            className={`group p-3 text-left transition-colors cursor-pointer flex gap-3 items-start ${notif.read ? 'hover:bg-black/5 opacity-70' : 'bg-brand-primary/5 hover:bg-brand-primary/10'}`}
                                        >
                                            <div className="mt-1 text-brand-primary shrink-0">
                                                {notif.title.toLowerCase().includes('comentariu') || notif.title.toLowerCase().includes('raspuns')
                                                    ? <MessageSquare className="w-4 h-4" />
                                                    : <AlertTriangle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold text-brand-text break-words ${notif.read ? '' : 'text-brand-primary'}`}>{notif.title}</p>
                                                <p className="text-xs text-brand-muted mt-0.5 whitespace-pre-wrap break-words">{notif.message}</p>
                                                <span className="text-[10px] text-brand-muted block mt-1">
                                                    {new Date(notif.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1 shrink-0 mt-1">
                                                <button
                                                    onClick={(e) => handleDeleteNotif(notif.id, e)}
                                                    className="p-1 rounded opacity-0 group-hover:opacity-100 bg-brand-bg border border-brand-border hover:bg-red-500 hover:text-white text-brand-muted transition-all"
                                                    title="Șterge notificarea"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                {!notif.read && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                        className="p-1 rounded bg-brand-bg border border-brand-border hover:bg-green-500 hover:text-white text-brand-muted transition-colors"
                                                        title="Marchează ca citit"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div
                className="relative"
                ref={menuRef}
                onMouseEnter={() => { clearTimeout(hoverTimeout.current); setIsHovered(true); setIsNotifOpen(false); }}
                onMouseLeave={() => { hoverTimeout.current = setTimeout(() => setIsHovered(false), 200); }}
            >
                <button
                    onClick={() => { setIsPinned(!isPinned); setIsNotifOpen(false); }}
                    className={`p-2 rounded-lg transition-colors focus:outline-none text-brand-text flex items-center ${isPinned ? 'bg-black/10' : 'hover:bg-black/5'}`}
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 top-10 pt-2 z-50 origin-top-right"
                        >
                            <div className="w-64 bg-brand-card border border-brand-border rounded-xl shadow-lg overflow-hidden">
                                <div className="py-2">
                                    <div className="px-4 py-3 text-xs font-semibold text-brand-muted tracking-wider border-b border-brand-border mb-1 bg-brand-bg/50">
                                        Conectat ca: <span className="block text-brand-text truncate mt-1">{adminEmail}</span>
                                    </div>

                                    <button
                                        onClick={() => handleNavigate('/profile')}
                                        className="w-full text-left px-4 py-2.5 text-brand-text hover:bg-brand-primary/10 font-medium transition-colors flex items-center"
                                    >
                                        <Users className="w-4 h-4 mr-3 text-brand-muted" />
                                        Profilul Meu
                                    </button>

                                    <button
                                        onClick={() => handleNavigate('/dashboard')}
                                        className="w-full text-left px-4 py-2.5 text-brand-text hover:bg-brand-primary/10 font-medium transition-colors flex items-center"
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-3 text-brand-muted" />
                                        Asset-urile Mele
                                    </button>

                                    <button
                                        onClick={() => handleNavigate('/complaints')}
                                        className="w-full text-left px-4 py-2.5 text-brand-text hover:bg-brand-primary/10 font-medium transition-colors flex items-center"
                                    >
                                        <ClipboardList className="w-4 h-4 mr-3 text-brand-primary" />
                                        Sesizările Mele
                                    </button>

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleNavigate(userRole === 'SUPER_ADMIN' ? '/admin' : '/admin/tickets')}
                                            className="w-full text-left px-4 py-2.5 text-brand-primary hover:bg-brand-primary/10 font-medium transition-colors flex items-center"
                                        >
                                            <ShieldAlert className="w-4 h-4 mr-3" />
                                            {userRole === 'SUPER_ADMIN' ? 'Panou Administrator' : 'Rezolvă Tichete'}
                                        </button>
                                    )}

                                    {isDeptResponsible && (
                                        <button
                                            onClick={() => handleNavigate('/dept/tickets')}
                                            className="w-full text-left px-4 py-2.5 text-brand-primary hover:bg-brand-primary/10 font-medium transition-colors flex items-center"
                                        >
                                            <ShieldAlert className="w-4 h-4 mr-3" />
                                            Tichete Departament
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}