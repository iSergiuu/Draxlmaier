import { useState, useEffect } from 'react';
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
    { id: 'length', label: 'Intre 8 si 20 de caractere', test: (p) => p.length >= 8 && p.length <= 20 },
    { id: 'upper',  label: 'Cel putin o litera mare',    test: (p) => /[A-Z]/.test(p) },
    { id: 'lower',  label: 'Cel putin o litera mica',    test: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'Cel putin un numar',         test: (p) => /[0-9]/.test(p) },
    { id: 'symbol', label: 'Cel putin un simbol',        test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPassword() {
    const [token, setToken]               = useState('');
    const [password, setPassword]         = useState('');
    const [confirm, setConfirm]           = useState('');
    const [showPass, setShowPass]         = useState(false);
    const [showConf, setShowConf]         = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [message, setMessage]           = useState('');
    const [success, setSuccess]           = useState(false);
    const navigate = useNavigate();
    const showToast = useContext(ToastContext);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('token') || '';
        setToken(t);
        if (!t) setMessage('Link invalid sau expirat. Solicita un nou email de resetare.');
    }, []);

    const ruleResults   = PASSWORD_RULES.map(r => ({ ...r, passed: r.test(password) }));
    const allRulesPassed = ruleResults.every(r => r.passed);
    const confirmMatch   = confirm.length > 0 && password === confirm;
    const confirmMismatch = confirm.length > 0 && password !== confirm;
    const showRules = password.length > 0 && (passwordFocused || !allRulesPassed);
    const visibleRules = passwordFocused ? ruleResults : ruleResults.filter(r => !r.passed);

    const handleReset = async () => {
        if (!allRulesPassed) return setMessage('Parola nu indeplineste toate cerintele.');
        if (password !== confirm) return setMessage('Parolele nu coincid.');
        try {
            const response = await fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password, confirmPassword: confirm })
            });
            if (response.ok) {
                setSuccess(true);
                setMessage('Parola a fost schimbata cu succes!');
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setMessage('Link invalid sau expirat. Solicita un nou email de resetare.');
            }
        } catch {
            setMessage('Eroare de conexiune. Incearca din nou.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeSwitcher />
            </div>

            <div className="max-w-md w-full space-y-6 bg-brand-card p-6 sm:p-8 rounded-xl shadow-md border border-brand-border transition-colors duration-300">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-text">Parola noua</h2>
                    <p className="mt-2 text-xs sm:text-sm text-brand-muted">Asset Complaint Hub</p>
                </div>

                <div className="space-y-0 flex flex-col gap-3 sm:gap-4">
                    <div className="relative">
                        <input
                            type={showPass ? "text" : "password"}
                            placeholder="Parola noua"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            disabled={!token || success}
                            className={`w-full px-4 py-2.5 sm:py-2 pr-10 bg-brand-bg text-brand-text rounded-lg focus:outline-none transition-colors border disabled:opacity-50 text-sm sm:text-base ${
                                confirmMatch && allRulesPassed ? 'border-green-500 focus:border-green-500' :
                                    'border-brand-border focus:border-brand-primary'
                            }`}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors">
                            {showPass ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    <div style={{
                        maxHeight: showRules ? '200px' : '0',
                        opacity: showRules ? 1 : 0,
                        overflow: 'hidden',
                        marginTop: showRules ? '0' : '-15px',
                        marginBottom: showRules ? '0' : '0px',
                        transition: 'max-height 0.69s ease, opacity 0.35s ease, margin 0.5s ease'
                    }}>
                        <div className="bg-brand-bg border border-brand-border rounded-lg p-3 space-y-1">
                            {visibleRules.map(rule => (
                                <div key={rule.id}
                                     className="flex items-center gap-2 text-xs transition-colors duration-200"
                                     style={{ color: rule.passed ? '#22c55e' : '#f87171' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: rule.passed ? '#22c55e22' : '#f8717122',
                                        flexShrink: 0,
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

                    <div className="relative">
                        <input
                            type={showConf ? "text" : "password"}
                            placeholder="Confirma parola noua"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            disabled={!token || success}
                            className={`w-full px-4 py-2.5 sm:py-2 pr-10 bg-brand-bg text-brand-text rounded-lg focus:outline-none transition-colors border disabled:opacity-50 text-sm sm:text-base ${
                                confirmMatch && allRulesPassed ? 'border-green-500 focus:border-green-500' :
                                    confirmMismatch               ? 'border-red-500 focus:border-red-500' :
                                        'border-brand-border focus:border-brand-primary'
                            }`}
                        />
                        <button type="button" onClick={() => setShowConf(!showConf)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors">
                            {showConf ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    </div>

                    {message && (
                        <p className={`text-sm text-center ${success ? 'text-green-400' : 'text-red-400'}`}>
                            {message}
                        </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button type="button"
                                onClick={() => navigate('/login')}
                                className="w-full sm:flex-1 py-2.5 sm:py-2 px-4 border border-brand-border rounded-lg text-brand-muted hover:text-brand-text transition-colors text-sm font-medium">
                            Inapoi la login
                        </button>
                        <button type="button"
                                onClick={handleReset}
                                disabled={!token || success}
                                className="w-full sm:flex-1 py-2.5 sm:py-2 px-4 border border-transparent rounded-lg text-white bg-brand-primary hover:opacity-90 font-medium transition-opacity text-sm disabled:opacity-50">
                            Salveaza parola
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}