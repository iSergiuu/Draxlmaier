import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import UserMenu from '../../components/UserMenu';
import { LayoutDashboard, Users, Settings } from 'lucide-react';

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-brand-bg font-sans transition-colors duration-300">
            {/* SIDEBAR */}
            <div className="w-64 bg-brand-sidebar text-white flex flex-col transition-colors duration-300">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-brand-primary">AssetHub</h1>
                    <p className="text-xs text-gray-400 mt-1">Panou Administrator</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {/* Folosim NavLink în loc de button ca să schimbe culoarea automat când ești pe pagină */}
                    <NavLink to="/admin/assets" className={({isActive}) => `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <LayoutDashboard className="w-5 h-5 mr-3" /> Echipamente
                    </NavLink>

                    <NavLink to="/admin/employees" className={({isActive}) => `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <Users className="w-5 h-5 mr-3" /> Angajați
                    </NavLink>

                    <NavLink to="/admin/departments" className={({isActive}) => `w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <Settings className="w-5 h-5 mr-3" /> Departamente
                    </NavLink>
                </nav>
            </div>

            {/* ZONA CENTRALĂ */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-brand-card shadow-sm border-b border-brand-border p-4 flex justify-between items-center transition-colors duration-300">
                    <h2 className="text-xl font-semibold text-brand-text">Administrare</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <ThemeSwitcher />
                        <UserMenu />
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg p-6 transition-colors duration-300">
                    {/* Aici se vor injecta automat paginile de Echipamente, Angajați etc. */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}