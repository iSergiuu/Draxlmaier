import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Se face login cu:", credentials);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Autentificare</h2>
                    <p className="mt-2 text-sm text-gray-600">Asset Complaint Hub</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input name="email" type="email" required placeholder="Email instituțional" value={credentials.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500" />

                    <input name="password" type="password" required placeholder="Parolă" value={credentials.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500" />

                    <button type="submit" className="w-full py-2 px-4 border border-transparent rounded text-white bg-teal-600 hover:bg-teal-700 font-medium">
                        Intră în cont
                    </button>
                </form>

                {/* --- BUTONUL DE NAVIGARE SPRE REGISTER --- */}
                <div className="text-center mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Nu ai încă un cont?{' '}
                        <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
                            Creează un cont
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}