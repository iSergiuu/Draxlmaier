import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Importam componenta pentru teme
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });

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

                // Salvam token-ul (am pus ambele denumiri ca sa fim siguri ca merge in toate fisierele)
                localStorage.setItem('jwt_token', data.accessToken);
                localStorage.setItem('token', data.accessToken);

                // Salvam email-ul pentru a-l afisa in dashboard
                localStorage.setItem('userEmail', credentials.email);

                // Salvam rolul ca sa apara butonul de Admin in Dashboard
                // Daca backend-ul trimite rolul, il foloseste pe ala, altfel pune ADMIN automat pt test
                const assignedRole = data.role ? data.role : 'ADMIN';
                localStorage.setItem('userRole', assignedRole);

                navigate('/dashboard');
            } else {
                alert("Email sau parolă incorecte!");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Nu ne-am putut conecta la server.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg py-12 px-4 transition-colors duration-300 relative">

            {/* Butonul de tema pus in dreapta sus */}
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
                        placeholder="Email instituțional"
                        value={credentials.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary"
                    />

                    <input
                        name="password"
                        type="password"
                        required
                        placeholder="Parolă"
                        value={credentials.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-brand-bg text-brand-text border border-brand-border rounded focus:outline-none focus:border-brand-primary"
                    />

                    <button type="submit" className="w-full py-2 px-4 border border-transparent rounded text-white bg-brand-primary hover:opacity-90 font-medium transition-opacity">
                        Intră în cont
                    </button>
                </form>

                <div className="text-center mt-4 border-t border-brand-border pt-4">
                    <p className="text-sm text-brand-muted">
                        Nu ai încă un cont?{' '}
                        <Link to="/register" className="font-medium text-brand-primary hover:opacity-80">
                            Creează un cont
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}