import { useState, useContext } from 'react';
import { ToastContext } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Register() {
    const location = useLocation();
    const navigate = useNavigate();

    const tempEmail = location.state?.tempEmail;

    const showToast = useContext(ToastContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        employeeNumber: ''
    });

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const p = formData.password;
    const cp = formData.confirmPassword;

    const reguli = [
        { id: 1, text: "Intre 8 si 20 de caractere", valida: p.length >= 8 && p.length <= 20 },
        { id: 2, text: "Cel putin o litera mare", valida: /[A-Z]/.test(p) },
        { id: 3, text: "Cel putin o litera mica", valida: /[a-z]/.test(p) },
        { id: 4, text: "Cel putin o cifra", valida: /[0-9]/.test(p) },
        { id: 5, text: "Cel putin un caracter special (!, @, #, etc.)", valida: /[^A-Za-z0-9]/.test(p) },
    ];

    const reguliNeindeplinite = reguli.filter(r => !r.valida);
    const toateIndeplinite = reguliNeindeplinite.length === 0;
    const afiseazaRegulile = p.length > 0 && (isPasswordFocused || !toateIndeplinite);
    const reguliVizibile = isPasswordFocused ? reguli : reguliNeindeplinite;
    const paroleleCoincid = cp !== '' && p === cp && toateIndeplinite;
    const paroleleDifera = cp !== '' && p !== cp;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                employeeNumber: formData.employeeNumber
            };

            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast(tempEmail ? "Cont configurat cu succes! Te poti loga acum." : "Cont creat cu succes!", 'success');
                navigate('/login');
            } else {
                const errText = await response.text();
                try {
                    const json = JSON.parse(errText);
                    showToast(json.message || 'Eroare la inregistrare.', 'error');
                } catch {
                    showToast(errText || 'Eroare la inregistrare.', 'error');
                }
            }
        } catch (error) {
            console.error("Register error:", error);
            showToast("Nu am putut comunica cu serverul.", 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeSwitcher />
            </div>

            <div className="max-w-md w-full space-y-6 bg-brand-card p-6 sm:p-8 rounded-xl shadow-md border border-brand-border transition-colors duration-300">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-text">
                        {tempEmail ? 'Configurare Cont' : 'Creează un cont'}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-brand-muted">Asset Complaint Hub</p>
                </div>

                {tempEmail && (
                    <div className="p-3 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-lg text-sm text-center">
                        Configurezi contul pentru: <strong className="break-all">{tempEmail}</strong>
                    </div>
                )}

                <form className="space-y-0 flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <input name="firstName" type="text" required placeholder="Prenume" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 sm:py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm sm:text-base" />
                        <input name="lastName" type="text" required placeholder="Nume" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 sm:py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm sm:text-base" />
                    </div>

                    <input name="email" type="email" required placeholder="Email personal / institutional" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 sm:py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm sm:text-base" />

                    <input name="employeeNumber" type="text" required placeholder="Cod Securitate (DRX-...)" value={formData.employeeNumber} onChange={handleChange} className="w-full px-4 py-2.5 sm:py-2 bg-brand-bg text-brand-text border border-brand-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors text-sm sm:text-base" />

                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Parola Nouă"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            className={`w-full px-4 py-2.5 sm:py-2 pr-10 bg-brand-bg text-brand-text border rounded-lg focus:outline-none transition-colors text-sm sm:text-base
                            ${paroleleCoincid ? 'border-green-500 focus:border-green-500' : 'border-brand-border focus:border-brand-primary'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                            )}
                        </button>
                    </div>
                    <div style={{
                        maxHeight: afiseazaRegulile ? '200px' : '0',
                        opacity: afiseazaRegulile ? 1 : 0,
                        overflow: 'hidden',
                        marginTop: afiseazaRegulile ? '0' : '0',
                        marginBottom: afiseazaRegulile ? '0' : '-12px',
                        transition: 'max-height 0.5s ease, opacity 0.35s ease, margin 0.5s ease'
                    }}>
                        <div className="bg-brand-bg border border-brand-border rounded-lg p-3 space-y-1">
                            {reguliVizibile.map(r => (
                                <div key={r.id} className="flex items-center gap-2 text-xs transition-colors duration-200"
                                    style={{ color: r.valida ? '#22c55e' : '#f87171' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '16px', height: '16px', borderRadius: '50%',
                                        background: r.valida ? '#22c55e22' : '#f8717122',
                                        flexShrink: 0,
                                        transition: 'background 0.2s ease'
                                    }}>
                                        {r.valida ? (
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M2 5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                <path d="M3 3l4 4M7 3l-4 4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                        )}
                                    </span>
                                    {r.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative pt-1 sm:pt-0">
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="Confirmă parola"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 sm:py-2 pr-10 bg-brand-bg text-brand-text border rounded-lg focus:outline-none transition-colors text-sm sm:text-base
                            ${paroleleCoincid ? 'border-green-500' : paroleleDifera ? 'border-red-500' : 'border-brand-border focus:border-brand-primary'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors"
                        >
                            {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={reguliNeindeplinite.length > 0 || !paroleleCoincid}
                        className={`w-full py-2.5 sm:py-2 px-4 rounded-lg text-white font-medium transition-colors text-sm sm:text-base mt-2
              ${(reguliNeindeplinite.length === 0 && paroleleCoincid) ? 'bg-brand-primary hover:opacity-90' : 'bg-brand-muted cursor-not-allowed'}`}
                    >
                        {tempEmail ? 'Salvează Contul' : 'Creează un cont'}
                    </button>
                </form>
            </div>
        </div>
    );
}