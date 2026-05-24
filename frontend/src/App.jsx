import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useToast } from './hooks/useToast';
import Toast from './components/Toast';

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
import AdminTickets from './pages/admin/AdminTickets';
import AdminDepartments from './pages/admin/AdminDepartments';
import DeptLayout from './pages/dept/DeptLayout';
import DeptTickets from './pages/dept/DeptTickets';
import DeptEmployees from './pages/dept/DeptEmployees';
import AdminReports from './pages/admin/AdminReports';

export const ToastContext = React.createContext(null);

function ProtectedAdminRoute({ children, superAdminOnly = false }) {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isDeptResponsible = role === 'DEPT_RESPONSIBLE';
    const isAdmin = role === 'ADMIN' || isSuperAdmin || isDeptResponsible;
    if (!token || !isAdmin) return <Navigate to="/dashboard" replace />;
    if (superAdminOnly && !isSuperAdmin) return <Navigate to="/admin/tickets" replace />;
    if (!superAdminOnly && isDeptResponsible && window.location.pathname.startsWith('/admin')) 
        return <Navigate to="/dept/tickets" replace />;
    return children;
}

function App() {
    const { toasts, showToast } = useToast();
    const removeToast = (id) => {};

    return (
        <ToastContext.Provider value={showToast}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />

                    <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                        <Route index element={<Navigate to="tickets" replace />} />
                        <Route path="tickets" element={<AdminTickets />} />
                        <Route path="tickets/:id" element={<ComplaintDetails />} />
                        <Route path="employees" element={<ProtectedAdminRoute superAdminOnly><AdminEmployees /></ProtectedAdminRoute>} />
                        <Route path="assets" element={<ProtectedAdminRoute superAdminOnly><AdminAssets /></ProtectedAdminRoute>} />
                        <Route path="departments" element={<ProtectedAdminRoute superAdminOnly><AdminDepartments /></ProtectedAdminRoute>} />
                        <Route path="reports" element={<ProtectedAdminRoute superAdminOnly><AdminReports /></ProtectedAdminRoute>} />
                    </Route>

                    <Route path="/dept" element={<ProtectedAdminRoute><DeptLayout /></ProtectedAdminRoute>}>
                        <Route index element={<Navigate to="tickets" replace />} />
                        <Route path="tickets" element={<DeptTickets />} />
                        <Route path="tickets/:id" element={<ComplaintDetails />} />
                        <Route path="employees" element={<DeptEmployees />} />
                    </Route>

                    {/* Rutele pentru tichete */}
                    <Route path="/complaints" element={<MyComplaints />} />
                    <Route path="/complaint/:id" element={<ComplaintDetails />} />

                    {/* Daca scrie un link gresit, il trimitem la login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
            <Toast toasts={toasts} onRemove={(id) => {}} />
        </ToastContext.Provider>
    );
}

export default App;