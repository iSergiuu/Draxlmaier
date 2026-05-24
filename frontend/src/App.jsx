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

function ProtectedRoute({ children, allowedRoles }) {
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
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

                    <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="tickets" replace />} />
                        <Route path="tickets" element={<AdminTickets />} />
                        <Route path="tickets/:id" element={<ComplaintDetails />} />
                        <Route path="employees" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminEmployees /></ProtectedRoute>} />
                        <Route path="assets" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAssets /></ProtectedRoute>} />
                        <Route path="departments" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminDepartments /></ProtectedRoute>} />
                        <Route path="reports" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminReports /></ProtectedRoute>} />
                    </Route>

                    <Route path="/dept" element={<ProtectedRoute allowedRoles={['DEPT_RESPONSIBLE']}><DeptLayout /></ProtectedRoute>}>
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