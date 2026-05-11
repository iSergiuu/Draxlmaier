import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        securityCode: '',
    });

    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // State-uri noi pentru vizibilitatea parolelor
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const p = formData.password;
    const cp = formData.confirmPassword;

    const reguli = [
        { id: 1, text: "Între 8 și 20 de caractere", valida: p.length >= 8 && p.length <= 20 },
        { id: 2, text: "Cel puțin o literă mare", valida: /[A-Z]/.test(p) },
        { id: 3, text: "Cel puțin o literă mică", valida: /[a-z]/.test(p) },
        { id: 4, text: "Cel puțin o cifră", valida: /[0-9]/.test(p) },
        { id: 5, text: "Cel puțin un caracter special (!, @, #, etc.)", valida: /[^A-Za-z0-9]/.test(p) },
    ];

    const reguliNeindeplinite = reguli.filter(r => !r.valida);
    const afiseazaRegulile = isPasswordFocused || (p.length > 0 && reguliNeindeplinite.length > 0);
    const paroleleCoincid = cp !== '' && p === cp;
    const paroleleDifera = cp !== '' && p !== cp;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Date trimise:", formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Creează un cont</h2>
                    <p className="mt-2 text-sm text-gray-600">Asset Complaint Hub</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                        <input name="firstName" type="text" required placeholder="Prenume" value={formData.firstName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500" />
                        <input name="lastName" type="text" required placeholder="Nume" value={formData.lastName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500" />
                    </div>

                    <input name="email" type="email" required placeholder="Email instituțional" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500" />

                    <input name="securityCode" type="text" required placeholder="Cod Securitate" value={formData.securityCode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-500" />

                    {/* Câmpul Primă Parolă Îmbrăcat în div relativ */}
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"} // Aici facem magia schimbării din puncte în text
                            required
                            placeholder="Parolă"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            className={`w-full px-3 py-2 pr-10 border rounded focus:outline-none transition-colors 
                            ${paroleleCoincid ? 'border-green-500' : 'border-gray-300 focus:border-teal-500'}`}
                        />
                        {/* Butonul cu iconița asezat in dreapta absolut */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showPassword ? (
                                // Iconita Ochi Taiat
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                // Iconita Ochi Normal
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Zona de reguli dinamice */}
                    {afiseazaRegulile && reguliNeindeplinite.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <ul className="space-y-1">
                                {reguliNeindeplinite.map(r => (
                                    <li key={r.id} className="text-xs text-gray-500 flex items-center">
                                        <span className="mr-2">•</span> {r.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Câmpul Confirmare Parolă */}
                    <div className="relative">
                        <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="Confirmă parola"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 pr-10 border rounded focus:outline-none transition-colors 
                            ${paroleleCoincid ? 'border-green-500' : paroleleDifera ? 'border-red-500' : 'border-gray-300 focus:border-teal-500'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            {showConfirmPassword ? (
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

                    <button
                        type="submit"
                        disabled={reguliNeindeplinite.length > 0 || !paroleleCoincid}
                        className={`w-full py-2 px-4 rounded text-white font-medium transition-colors 
              ${(reguliNeindeplinite.length === 0 && paroleleCoincid) ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        Creează un cont
                    </button>
                </form>

                <div className="text-center mt-4 border-t pt-4">
                    <p className="text-sm text-gray-600">
                        Ai deja un cont?{' '}
                        <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
                            Intră în cont
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}