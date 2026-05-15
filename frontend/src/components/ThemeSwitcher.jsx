import React, { useState, useEffect, useRef } from 'react';

// Temele noastre pe coloane
const themeColumns = [
    {
        dark:  { id: 'theme-dark', name: 'Teal Intunecat', primary: '#14b8a6', bgMain: '#0d1117' },
        light: { id: 'light', name: 'Teal Luminos', primary: '#0d9488', bgMain: '#f9fafb' }
    },
    {
        dark:  { id: 'theme-yellow-dark', name: 'Galben Intunecat', primary: '#facc15', bgMain: '#1c1917' },
        light: { id: 'theme-yellow-light', name: 'Galben Luminos', primary: '#eab308', bgMain: '#fefce8' }
    },
    {
        dark:  { id: 'theme-purple-dark', name: 'Indigo Intunecat', primary: '#818cf8', bgMain: '#1e1b4b' },
        light: { id: 'theme-purple-light', name: 'Indigo Luminos', primary: '#6366f1', bgMain: '#eef2ff' }
    },
    {
        dark:  { id: 'theme-drx', name: 'DRX Intunecat', primary: '#e3000f', bgMain: '#241414' },
        light: { id: 'theme-drx-light', name: 'DRX Luminos', primary: '#e3000f', bgMain: '#fdf2f2' }
    }
];

export default function ThemeSwitcher() {
    const [isHovered, setIsHovered] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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

            {isOpen && (
                <div className="absolute right-0 mt-2 p-3 bg-brand-card border border-brand-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
            )}
        </div>
    );
}