import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useContext } from 'react';
import { ToastContext } from '../App';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

const PASSWORD_RULES = [
    { id: 'length',  label: 'Intre 8 si 20 de caractere', test: (p) => p.length >= 8 && p.length <= 20 },
    { id: 'upper',   label: 'Cel putin o litera mare',     test: (p) => /[A-Z]/.test(p) },
    { id: 'lower',   label: 'Cel putin o litera mica',     test: (p) => /[a-z]/.test(p) },
    { id: 'number',  label: 'Cel putin un numar',          test: (p) => /[0-9]/.test(p) },
    { id: 'symbol',  label: 'Cel putin un simbol',         test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const showToast = useContext(ToastContext);

    // Forgot password state
    const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');

    // Reset password state
    const [resetPassword, setResetPassword]     = useState('');
    const [resetConfirm, setResetConfirm]       = useState('');
    const [showResetPass, setShowResetPass]     = useState(false);
    const [showResetConf, setShowResetConf]     = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [resetMessage, setResetMessage]       = useState('');

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.email && data.email.toLowerCase().startsWith('temp')) {
                    navigate('/register', { state: { tempEmail: data.email, tempToken: data.accessToken } });
                    return;
                }
                localStorage.setItem('jwt_token', data.accessToken);
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userRole', data.role ? data.role : 'ADMIN');
                navigate('/dashboard');
            } else {
                showToast("Email sau parola incorecte!","error");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showToast("Nu ne-am putut conecta la server.","error");
        }
    };

    const handleForgotPassword = async () => {
        const emailToUse = forgotEmail.trim() || credentials.email.trim();
        if (!emailToUse) return setForgotMessage('Introdu un email valid.');
        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToUse })
            });
            if (response.ok) {
                setForgotMessage('Email trimis! Verifica inbox-ul.');
            } else {
                setForgotMessage('A aparut o eroare. Verifica emailul introdus.');
            }
        } catch {
            setForgotMessage('A aparut o eroare de conexiune.');
        }
    };

    const handleResetPassword = async () => {
        const allValid = PASSWORD_RULES.every(r => r.test(resetPassword));
        if (!allValid) return setResetMessage('Parola nu indeplineste toate cerintele.');
        if (resetPassword !== resetConfirm) return setResetMessage('Parolele nu coincid.');
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token') || '';
        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: resetPassword, confirmPassword: resetConfirm })
            });
            if (response.ok) {
                setResetMessage('Parola a fost schimbata! Redirectionare...');
                setTimeout(() => { setMode('login'); setResetPassword(''); setResetConfirm(''); setResetMessage(''); }, 2000);
            } else {
                setResetMessage('Link invalid sau expirat.');
            }
        } catch {
            setResetMessage('Eroare de conexiune.');
        }
    };

    const ruleResults = PASSWORD_RULES.map(r => ({ ...r, passed: r.test(resetPassword) }));
    const confirmMatch = resetConfirm.length > 0 && resetPassword === resetConfirm;
    const confirmMismatch = resetConfirm.length > 0 && resetPassword !== resetConfirm;
    const showRules = passwordFocused || (resetPassword.length > 0 && !ruleResults.every(r => r.passed));

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg py-12 px-4 transition-colors duration-300 relative">
            <div className="absolute top-6 right-6">
                <ThemeSwitcher />
            </div>

            <div className="max-w-md w-full space-y-6 bg-brand-card p-8 rounded-xl shadow-md border border-brand-border transition-colors duration-300">

                {/* TITLU */}
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-brand-text">
                        {mode === 'login' ? 'Autentificare' : mode === 'forgot' ? 'Resetare parola' : 'Parola noua'}
                    </h2>
                    <p className="mt-2 text-sm text-brand-muted">Asset Complaint Hub</p>
                </div>

                {/* ===== MODE: LOGIN ===== */}
                {mode === 'login' && (
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="Email (ex: temp_8b7def@draxlmaier.com)"
                            value={credentials.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary transition-colors"
                        />
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Parola"
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 pr-10 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary transition-colors"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors">
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded text-white bg-brand-primary hover:opacity-90 font-medium transition-opacity">
                            Intra in cont
                        </button>
                        <button type="button" onClick={() => { setMode('forgot'); setForgotMessage(''); setForgotEmail(credentials.email); }}
                                className="w-full text-sm text-brand-muted hover:text-brand-text transition-colors text-center">
                            Am uitat parola
                        </button>
                    </form>
                )}

                {/* ===== MODE: FORGOT ===== */}
                {mode === 'forgot' && (
                    <div className="space-y-4">
                        <p className="text-sm text-brand-muted text-center">
                            Introdu emailul contului tau si iti trimitem un link de resetare.
                        </p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={forgotEmail}
                            placeholder={credentials.email || "Email"}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary transition-colors"
                        />
                        {forgotMessage && (
                            <p className={`text-sm text-center ${forgotMessage.includes('eroare') ? 'text-red-400' : 'text-green-400'}`}>
                                {forgotMessage}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button type="button"
                                    onClick={() => { setMode('login'); setForgotMessage(''); setForgotEmail(''); }}
                                    className="flex-1 py-2 px-4 border border-brand-border rounded text-brand-muted hover:text-brand-text transition-colors text-sm">
                                Inapoi
                            </button>
                            <button type="button" onClick={handleForgotPassword}
                                    className="flex-1 py-2 px-4 border border-transparent rounded text-white bg-brand-primary hover:opacity-90 font-medium transition-opacity text-sm">
                                Trimite email
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== MODE: RESET ===== */}
                {mode === 'reset' && (
                    <div className="space-y-4">
                        {/* Parola noua */}
                        <div className="relative">
                            <input
                                type={showResetPass ? "text" : "password"}
                                placeholder="Parola noua"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className="w-full px-3 py-2 pr-10 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary transition-colors"
                            />
                            <button type="button" onClick={() => setShowResetPass(!showResetPass)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors">
                                {showResetPass ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {/* Cerinte parola cu animatie */}
                        <div style={{
                            maxHeight: showRules ? '200px' : '0',
                            opacity: showRules ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'max-height 0.3s ease, opacity 0.2s ease'
                        }}>
                            <div className="bg-brand-bg border border-brand-border rounded-lg p-3 space-y-1.5">
                                {ruleResults.map(rule => (
                                    <div key={rule.id} className="flex items-center gap-2 text-xs transition-colors duration-200"
                                         style={{ color: rule.passed ? '#22c55e' : '#f87171' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            width: '16px', height: '16px', borderRadius: '50%',
                                            background: rule.passed ? '#22c55e22' : '#f8717122',
                                            transition: 'background 0.2s ease'
                                        }}>
                                            {rule.passed ? (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <path d="M2 5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            ) : (
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                    <path d="M3 3l4 4M7 3l-4 4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                                                </svg>
                                            )}
                                        </span>
                                        {rule.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Confirma parola */}
                        <div className="relative">
                            <input
                                type={showResetConf ? "text" : "password"}
                                placeholder="Confirma parola noua"
                                value={resetConfirm}
                                onChange={(e) => setResetConfirm(e.target.value)}
                                className={`w-full px-3 py-2 pr-10 bg-brand-bg text-brand-text rounded focus:outline-none transition-colors border ${
                                    confirmMatch ? 'border-green-500 focus:border-green-500' :
                                        confirmMismatch ? 'border-red-500 focus:border-red-500' :
                                            'border-brand-border focus:border-brand-primary'
                                }`}
                            />
                            <button type="button" onClick={() => setShowResetConf(!showResetConf)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors">
                                {showResetConf ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        {resetMessage && (
                            <p className={`text-sm text-center ${resetMessage.includes('schimbata') ? 'text-green-400' : 'text-red-400'}`}>
                                {resetMessage}
                            </p>
                        )}

                        <div className="flex gap-2">
                            <button type="button"
                                    onClick={() => { setMode('login'); setResetPassword(''); setResetConfirm(''); setResetMessage(''); }}
                                    className="flex-1 py-2 px-4 border border-brand-border rounded text-brand-muted hover:text-brand-text transition-colors text-sm">
                                Inapoi
                            </button>
                            <button type="button" onClick={handleResetPassword}
                                    className="flex-1 py-2 px-4 border border-transparent rounded text-white bg-brand-primary hover:opacity-90 font-medium transition-opacity text-sm">
                                Salveaza parola
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}