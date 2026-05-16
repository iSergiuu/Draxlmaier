import React, { useState, useEffect } from 'react';
import { Users, Mail, Briefcase, AlertCircle, UserPlus, X } from 'lucide-react';

export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State-uri noi pentru generarea codului
    const [generatedCode, setGeneratedCode] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const token = localStorage.getItem('token');

    const fetchEmployees = async () => {
        if (!token) {
            setError("Nu esti autentificat.");
            setIsLoading(false);
            return;
        }

        try {
            // Nota: Acest endpoint trebuie sa existe in backend pentru a returna o lista
            const res = await fetch('http://localhost:8080/api/employees', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Eroare la preluarea angajatilor (Endpoint-ul s-ar putea sa nu existe inca in backend).');

            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Functie apelata cand apesi butonul de Adauga Angajat
    const handleGenerateEmployeeCode = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            // Request gol catre ruta de generare cod conform planului
            const response = await fetch('http://localhost:8080/api/employees/generate-code', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Eroare la generarea codului DRX.');

            // Prelucram codul primit (text simplu)
            const newCode = await response.text();

            // Afisam codul pe ecran
            setGeneratedCode(newCode);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center text-brand-text">Se incarca angajatii...</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-text">Gestiune Angajati</h3>
                <button
                    onClick={handleGenerateEmployeeCode}
                    disabled={isGenerating}
                    className={`bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-opacity shadow-sm ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <UserPlus className="w-5 h-5 mr-1" />
                    {isGenerating ? 'Se genereaza...' : 'Adauga Angajat'}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Banner pentru afisarea codului generat */}
            {generatedCode && (
                <div className="mb-6 p-6 bg-brand-card border border-emerald-500/50 rounded-xl flex flex-col items-center justify-center text-center shadow-lg relative animate-in fade-in zoom-in-95 duration-300">
                    <button
                        onClick={() => setGeneratedCode(null)}
                        className="absolute top-4 right-4 text-brand-muted hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <p className="text-emerald-400 font-medium mb-2">Codul pentru noul angajat a fost generat:</p>
                    <div className="flex items-center gap-3 bg-brand-bg px-6 py-3 rounded-lg border border-brand-border mb-3 shadow-inner">
                        <h2 className="text-3xl font-mono font-bold text-brand-text tracking-wider">{generatedCode}</h2>
                    </div>
                    <p className="text-sm text-brand-muted max-w-md">
                        Ofera acest cod viitorului angajat. El il va introduce in pagina de Register alaturi de restul datelor, iar sistemul ii va completa inregistrarea.
                    </p>
                </div>
            )}

            <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden transition-colors">
                {employees.length === 0 && !error ? (
                    <div className="p-8 text-center text-brand-muted">Niciun angajat inregistrat in sistem.</div>
                ) : (
                    <ul className="divide-y divide-brand-border">
                        {employees.map((emp) => (
                            <li key={emp.id} className="p-4 hover:bg-black/5 flex items-center justify-between transition-colors">
                                <div className="flex items-center">
                                    <div className="mr-4 p-3 bg-brand-bg rounded-full border border-brand-border">
                                        <Users className="w-5 h-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-md font-semibold text-brand-text">
                                            {emp.firstName || emp.first_name} {emp.lastName || emp.last_name}
                                        </h4>
                                        <p className="text-sm text-brand-muted flex items-center mt-1">
                                            <Mail className="w-3 h-3 mr-1" /> {emp.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-brand-muted bg-brand-bg px-3 py-1 rounded-lg border border-brand-border">
                                    <Briefcase className="w-4 h-4" />
                                    {emp.department || "Fara departament"}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}