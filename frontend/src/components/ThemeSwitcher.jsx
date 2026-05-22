import React, { useState, useEffect, useRef } from 'react';

// Temele noastre pe coloane - Optimizate pentru contrast si aspect Premium SaaS
const themeColumns = [
    {
        // 1. Ocean Teal - Odihnitor, profesional, excelent pentru ecrane mari
        dark:  { id: 'theme-dark', name: 'Ocean Teal (Dark)', primary: '#14b8a6', bgMain: '#0f172a' }, // Fundal Slate (gri-albastrui)
        light: { id: 'light', name: 'Ocean Teal (Light)', primary: '#0d9488', bgMain: '#f8fafc' }
    },
    {
        // 2. Royal Indigo - Culoarea clasica a aplicatiilor de top (ex: Stripe)
        dark:  { id: 'theme-purple-dark', name: 'Royal Indigo (Dark)', primary: '#818cf8', bgMain: '#09090b' }, // Fundal Zinc (foarte inchis)
        light: { id: 'theme-purple-light', name: 'Royal Indigo (Light)', primary: '#4f46e5', bgMain: '#ffffff' } // Fundal alb pur
    },
    {
        // 3. Sunset Amber - O nuanta calda, prietenoasa, inlocuieste galbenul strident
        dark:  { id: 'theme-yellow-dark', name: 'Sunset Amber (Dark)', primary: '#f97316', bgMain: '#1c1917' }, // Fundal Stone (gri cald)
        light: { id: 'theme-yellow-light', name: 'Sunset Amber (Light)', primary: '#ea580c', bgMain: '#fffbeb' } // Fundal usor crem
    },
    {
        // 4. Crimson Rose - O alternativa eleganta si moderna la rosul agresiv
        dark:  { id: 'theme-drx', name: 'Crimson Rose (Dark)', primary: '#f43f5e', bgMain: '#171717' }, // Fundal Neutral
        light: { id: 'theme-drx-light', name: 'Crimson Rose (Light)', primary: '#e11d48', bgMain: '#fff1f2' } // Fundal cu o tenta extrem de fina de roz
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