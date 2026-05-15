import React, { useState, useEffect, useRef } from 'react';

// Temele noastre pe coloane (Dark sus, Light jos)
const themeColumns = [
    {
        dark:  { id: 'theme-dark', name: 'Teal Întunecat', primary: '#14b8a6', bgMain: '#0d1117' },
        light: { id: 'light', name: 'Teal Luminos', primary: '#0d9488', bgMain: '#f9fafb' }
    },
    {
        dark:  { id: 'theme-yellow-dark', name: 'Galben Întunecat', primary: '#facc15', bgMain: '#1c1917' },
        light: { id: 'theme-yellow-light', name: 'Galben Luminos', primary: '#eab308', bgMain: '#fefce8' }
    },
    {
        dark:  { id: 'theme-purple-dark', name: 'Indigo Întunecat', primary: '#818cf8', bgMain: '#1e1b4b' },
        light: { id: 'theme-purple-light', name: 'Indigo Luminos', primary: '#6366f1', bgMain: '#eef2ff' }
    },
    {
        dark:  { id: 'theme-drx', name: 'DRX Întunecat', primary: '#e3000f', bgMain: '#241414' },
        light: { id: 'theme-drx-light', name: 'DRX Luminos', primary: '#e3000f', bgMain: '#fdf2f2' }
    }
];

export default function ThemeSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('appTheme') || 'light');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
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

    // Folosim un SVG cu doua poligoane. Nu mai exista nicio scapare de fundal "patrat" la colturi!
    const ThemeCircle = ({ theme, onClick, isMain = false }) => {
        const sizeClasses = isMain ? "w-8 h-8" : "w-6 h-6";
        const isSelected = !isMain && theme.id === currentTheme;

        // Conturul e culoarea de accent pt cercul principal SAU pt cercul selectat. Restul au gri.
        const borderColor = (isMain || isSelected) ? theme.primary : '#9ca3af';

        return (
            <button
                onClick={onClick}
                title={theme.name}
                className={`${sizeClasses} rounded-full cursor-pointer transition-transform hover:scale-110 shadow-sm flex items-center justify-center`}
                style={{
                    border: `2px solid ${borderColor}`,
                    backgroundColor: 'transparent',
                    padding: 0
                }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full rounded-full overflow-hidden">
                    {/* Triunghiul Stanga-Sus (Fundalul aplicatiei) */}
                    <polygon points="0,100 0,0 100,0" fill={theme.bgMain} />
                    {/* Triunghiul Dreapta-Jos (Culoarea de accent) */}
                    <polygon points="0,100 100,100 100,0" fill={theme.primary} />
                </svg>
            </button>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>

            {/* Cercul din meniul de sus */}
            <ThemeCircle
                theme={activeThemeData}
                onClick={() => setIsOpen(!isOpen)}
                isMain={true}
            />

            {isOpen && (
                <div className="absolute right-0 mt-4 p-3 bg-brand-card border border-brand-border rounded-xl shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-150">

                    <div className="flex flex-col gap-3">
                        {/* Teme Intunecate */}
                        <div className="flex gap-3">
                            {themeColumns.map(col => (
                                <ThemeCircle
                                    key={col.dark.id}
                                    theme={col.dark}
                                    onClick={() => setCurrentTheme(col.dark.id)}
                                />
                            ))}
                        </div>

                        {/* Teme Luminoase */}
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