import React, { useState, useEffect } from 'react';
import { Users, Mail, Briefcase, AlertCircle, UserPlus } from 'lucide-react';

export default function AdminEmployees() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Nu ești autentificat.");
                setIsLoading(false);
                return;
            }

            try {
                // Notă: Acest endpoint trebuie să existe în backend pentru a returna o listă!
                const res = await fetch('http://localhost:8080/api/employees', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Eroare la preluarea angajaților (Endpoint-ul s-ar putea să nu existe încă în backend).');

                const data = await res.json();
                setEmployees(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    if (isLoading) return <div className="h-full flex items-center justify-center text-brand-text">Se încarcă angajații...</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-text">Gestiune Angajați</h3>
                <button className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-opacity shadow-sm">
                    <UserPlus className="w-5 h-5 mr-1" />
                    Adaugă Angajat
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-brand-card rounded-xl shadow-sm border border-brand-border overflow-hidden transition-colors">
                {employees.length === 0 && !error ? (
                    <div className="p-8 text-center text-brand-muted">Niciun angajat înregistrat în sistem.</div>
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
                                    {emp.department || "Fără departament"}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}