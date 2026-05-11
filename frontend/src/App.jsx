import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Când utilizatorul intră direct pe site, îl trimitem la Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Rutele noastre principale */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;