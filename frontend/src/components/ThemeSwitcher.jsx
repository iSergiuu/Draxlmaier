import React, { useState, useEffect, useRef } from 'react';

// Temele noastre pe coloane - Optimizate pentru contrast si aspect Premium SaaS
const themeColumns = [
    {
        // 1. Ocean Teal
        dark:  { id: 'root', name: 'Ocean Teal (Dark)', primary: '#14b8a6', bgMain: '#0d1117' }, 
        light: { id: 'theme-light', name: 'Ocean Teal (Light)', primary: '#0d9488', bgMain: '#f9fafb' }
    },
    {
        // 2. Royal Indigo
        dark:  { id: 'theme-purple-dark', name: 'Royal Indigo (Dark)', primary: '#8251f4', bgMain: '#1a191f' }, 
        light: { id: 'theme-purple-light', name: 'Royal Indigo (Light)', primary: '#8251f4', bgMain: '#f8f7fa' }
    },
    {
        // 3. Sunset Amber
        dark:  { id: 'theme-yellow-dark', name: 'Sunset Amber (Dark)', primary: '#d1990a', bgMain: '#1c1b19' }, 
        light: { id: 'theme-yellow-light', name: 'Sunset Amber (Light)', primary: '#cf9f30', bgMain: '#f1f3f5' }
    },
    {
        // 4. Crimson Rose
        dark:  { id: 'theme-red', name: 'Crimson Rose (Dark)', primary: '#ff3333', bgMain: '#171717' }, 
        light: { id: 'theme-red-light', name: 'Crimson Rose (Light)', primary: '#ff0000', bgMain: '#f5f5f5' }
    }
];


export default function ThemeSwitcher() {
    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const hoverTimeout = useRef(null);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('appTheme') || 'light');

    // Referinta pentru a detecta click-ul in afara meniului
    const menuRef = useRef(null);

    const isOpen = isHovered || isPinned;

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

    useEffect(() => {
        localStorage.setItem('appTheme', currentTheme);
        document.documentElement.className = currentTheme === 'light' ? '' : currentTheme;
    }, [currentTheme]);

    let activeThemeData = themeColumns[0].light;
    for (const col of themeColumns) {
        if (col.dark.id === currentTheme) activeThemeData = col.dark;
        if (col.light.id === currentTheme) activeThemeData = col.light;
    }

    const ThemeCircle = ({ theme, onClick, isMain = false }) => {
        const sizeClasses = isMain ? "w-8 h-8" : "w-6 h-6";
        const isSelected = !isMain && theme.id === currentTheme;
        const borderColor = (isMain || isSelected) ? theme.primary : '#9ca3af';

        return (
            <button
                onClick={onClick}
                title={theme.name}
                className={`${sizeClasses} rounded-full cursor-pointer transition-transform hover:scale-110 shadow-sm flex items-center justify-center`}
                style={{
                    border: `2px solid ${borderColor}`,
                    background: `linear-gradient(135deg, ${theme.bgMain} 50%, ${theme.primary} 50%)`,
                    padding: 0
                }}
            />
        );
    };

    return (
        <div
            className="relative"
            ref={menuRef}
            onMouseEnter={() => { clearTimeout(hoverTimeout.current); setIsHovered(true); }}
            onMouseLeave={() => { hoverTimeout.current = setTimeout(() => setIsHovered(false), 200); }}
        >
            <div
                onClick={() => setIsPinned(!isPinned)}
                className={`p-1 rounded-full transition-colors cursor-pointer ${isPinned ? 'bg-black/10' : 'hover:bg-black/5'}`}
            >
                <ThemeCircle
                    theme={activeThemeData}
                    isMain={true}
                />
            </div>

            <div className={`absolute right-0 mt-2 p-3 bg-brand-card border border-brand-border rounded-xl shadow-xl z-50 transition-all duration-200 origin-top-right
                 ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-3">
                            {themeColumns.map(col => (
                                <ThemeCircle
                                    key={col.dark.id}
                                    theme={col.dark}
                                    onClick={() => setCurrentTheme(col.dark.id)}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            {themeColumns.map(col => (
                                <ThemeCircle
                                    key={col.light.id}
                                    theme={col.light}
                                    onClick={() => setCurrentTheme(col.light.id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    );
}