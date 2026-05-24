import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import UserMenu from '../../components/UserMenu';
import { Ticket, Users } from 'lucide-react';

export default function DeptLayout() {
    const [me, setMe] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:8080/api/employees/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : null).then(data => setMe(data));
    }, []);

    return (
        <div className="flex h-screen bg-brand-bg font-sans transition-colors duration-300">
            <div className="w-64 bg-brand-sidebar text-white flex flex-col transition-colors duration-300">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-brand-primary">AssetHub</h1>
                    <p className="text-xs text-gray-400 mt-1">Responsabil Departament</p>
                    {me && (
                        <p className="text-xs text-brand-primary mt-2 font-semibold truncate">
                            {me.departmentName}
                        </p>
                    )}
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavLink to="/dept/tickets" className={({isActive}) => `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <Ticket className="w-5 h-5 mr-3" /> Tichete
                    </NavLink>
                    <NavLink to="/dept/employees" className={({isActive}) => `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <Users className="w-5 h-5 mr-3" /> Angajați
                    </NavLink>
                </nav>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-brand-card shadow-sm border-b border-brand-border p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-brand-text">
                        {me ? `Departament ${me.departmentName}` : 'Panou Responsabil'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg p-6">
                    <Outlet context={{ me }} />
                </main>
            </div>
        </div>
    );
}