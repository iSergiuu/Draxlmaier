import React, { useState, useEffect } from 'react';
import { Building, Users, AlertCircle, Plus } from 'lucide-react';

export default function AdminDepartments() {
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Nu ești autentificat.");
                setIsLoading(false);
                return;
            }

            try {
                // Notă: Acest endpoint trebuie să existe în backend!
                const res = await fetch('http://localhost:8080/api/departments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Eroare la preluarea departamentelor (Endpoint-ul lipsește din backend).');

                const data = await res.json();
                setDepartments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    if (isLoading) return <div className="h-full flex items-center justify-center text-brand-text">Se încarcă departamentele...</div>;

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-text">Departamente</h3>
                <button className="bg-brand-primary hover:opacity-90 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-opacity shadow-sm">
                    <Plus className="w-5 h-5 mr-1" />
                    Adaugă Departament
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {departments.length === 0 && !error ? (
                    <div className="col-span-full p-8 text-center bg-brand-card border border-brand-border rounded-xl text-brand-muted">
                        Niciun departament configurat.
                    </div>
                ) : (
                    departments.map((dept) => (
                        <div key={dept.id} className="bg-brand-card p-6 rounded-xl border border-brand-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-brand-bg rounded-lg text-brand-primary mr-3 border border-brand-border">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-brand-text">{dept.name}</h4>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between text-sm">
                                <span className="text-brand-muted flex items-center">
                                    <Users className="w-4 h-4 mr-1" /> Angajați:
                                </span>
                                <span className="font-semibold text-brand-text">{dept.employeeCount || 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}