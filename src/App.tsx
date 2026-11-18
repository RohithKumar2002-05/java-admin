import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Hubs from './pages/Hubs';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Settings from './pages/Settings';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard"  element={<Dashboard />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/hubs"       element={<Hubs />} />
                            <Route path="/orders"     element={<Orders />} />
                            <Route path="/products"   element={<Products />} />
                            <Route path="/settings"   element={<Settings />} />
                        </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
