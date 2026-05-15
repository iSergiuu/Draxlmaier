import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails'; // Am adus pagina nouă aici

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Rutele pentru tichete */}
                <Route path="/complaints" element={<MyComplaints />} />
                <Route path="/complaint/:id" element={<ComplaintDetails />} />

                {/* (Opțional dar recomandat) Dacă scrie un link greșit, îl trimitem la login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;