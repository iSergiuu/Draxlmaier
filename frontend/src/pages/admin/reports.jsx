import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [entityType, setEntityType] = useState('EMPLOYEE');
  const [format, setFormat] = useState('PDF');
  const [departmentId, setDepartmentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Preluăm departamentele la încărcarea paginii
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Asigură-te că ruta este corectă pentru mediul tău
        const response = await axios.get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Eroare la preluarea departamentelor:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Construim payload-ul exact pe modelul așteptat de Spring Boot
    const payload = {
      entityType: entityType,
      format: format,
      columns: [], // Poți adăuga coloane specifice dacă backend-ul o cere, altfel poate rămâne gol
      filters: {
        ...(departmentId && { departmentId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      },
      sortBy: "createdAt", // Valoare default pentru sortare
      sortDirection: "DESC"
    };

    try {
      const response = await axios.post('/api/reports/generate', payload, {
        responseType: 'blob', // ESENȚIAL pentru a nu corupe fișierul PDF/CSV
      });

      // Extragem numele fișierului din header-ul Content-Disposition dacă există,
      // altfel generăm un nume default
      let fileName = `raport_${entityType.toLowerCase()}.${format.toLowerCase()}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }

      // Creăm link-ul temporar pentru descărcare
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Curățăm DOM-ul
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Eroare la generarea raportului:', error);
      alert('A apărut o eroare la generarea raportului. Verifică filtrele și încearcă din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <div className="bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Generare Rapoarte
          </h1>
          <div className="h-1 w-24 bg-blue-600 rounded-full"></div>
        </div>

        <form onSubmit={handleGenerateReport} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Entitate */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Entitate</label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="EMPLOYEE">Angajați (Situația conturilor)</option>
                <option value="ASSET">Echipamente (Situația echipamentelor)</option>
                <option value="COMPLAINT">Tichete (Sesizări)</option>
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Format Export</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              >
                <option value="PDF">Document PDF</option>
                <option value="CSV">Fișier CSV (Excel)</option>
              </select>
            </div>

            {/* Departament (Opțional) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Departament (Opțional)</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Toate departamentele</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Data de început */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Dată început (Opțional)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Data de sfârșit */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Dată sfârșit (Opțional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center px-6 py-3 rounded-md text-white font-medium transition-all ${
                isLoading 
                  ? 'bg-blue-800 cursor-not-allowed opacity-70' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-md hover:shadow-blue-500/20 active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Se generează...
                </>
              ) : (
                'Descarcă Raportul'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportsPage;