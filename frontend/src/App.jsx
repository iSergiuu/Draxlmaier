import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Când utilizatorul intră direct pe site, îl trimitem la Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Rutele noastre principale */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 2. Am adăugat ruta pentru Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* (Opțional dar recomandat) Dacă scrie un link greșit (ex: /test), îl trimitem la login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;