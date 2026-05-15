import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    // State nou pentru vizibilitatea parolei
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('jwt_token', data.accessToken);
                localStorage.setItem('token', data.accessToken);
                localStorage.setItem('userEmail', credentials.email);

                const assignedRole = data.role ? data.role : 'ADMIN';
                localStorage.setItem('userRole', assignedRole);

                navigate('/dashboard');
            } else {
                alert("Email sau parola incorecte!");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Nu ne-am putut conecta la server.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg py-12 px-4 transition-colors duration-300 relative">

            <div className="absolute top-6 right-6">
                <ThemeSwitcher />
            </div>

            <div className="max-w-md w-full space-y-6 bg-brand-card p-8 rounded-xl shadow-md border border-brand-border transition-colors duration-300">

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-brand-text">Autentificare</h2>
                    <p className="mt-2 text-sm text-brand-muted">Asset Complaint Hub</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email institutional"
                        value={credentials.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary transition-colors"
                    />

                    {/* Campul Parola cu Ochisor */}
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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-text focus:outline-none transition-colors"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <button type="submit" className="w-full py-2 px-4 border border-transparent rounded text-white bg-brand-primary hover:opacity-90 font-medium transition-opacity">
                        Intra in cont
                    </button>
                </form>

                <div className="text-center mt-4 border-t border-brand-border pt-4">
                    <p className="text-sm text-brand-muted">
                        Nu ai inca un cont?{' '}
                        <Link to="/register" className="font-medium text-brand-primary hover:opacity-80 transition-opacity">
                            Creeaza un cont
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}