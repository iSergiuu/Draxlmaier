import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAssets from './pages/admin/AdminAssets';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminDepartments from './pages/admin/AdminDepartments';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />


                {/* Aici se încarcă AdminAssets în interiorul Layout-ului */}
                <Route path="/admin" element={<AdminLayout />}>
                    {/* Când accesezi /admin, te redirecționează automat la /admin/assets */}
                    <Route index element={<Navigate to="assets" replace />} />

                    <Route path="assets" element={<AdminAssets />} />
                    <Route path="employees" element={<AdminEmployees />} />
                    <Route path="departments" element={<AdminDepartments />} />
                </Route>

                {/* Rutele pentru tichete */}
                <Route path="/complaints" element={<MyComplaints />} />
                <Route path="/complaint/:id" element={<ComplaintDetails />} />

                {/* Dacă scrie un link greșit, îl trimitem la login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;