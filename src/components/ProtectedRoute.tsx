import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { admin, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f6f4]">
            <div className="w-8 h-8 rounded-full border-2 border-[#166534] border-t-transparent animate-spin" />
        </div>
    );
    return admin ? <Outlet /> : <Navigate to="/login" replace />;
}
