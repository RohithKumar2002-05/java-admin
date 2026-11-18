import { createContext, useContext, useEffect, useState } from 'react';
import type { Admin } from '../types';
import { getMeApi } from '../api/admin';

interface AuthCtx {
    admin: Admin | null;
    loading: boolean;
    refresh: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthCtx>({ admin: null, loading: true, refresh: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        if (!localStorage.getItem('admin_token')) { setAdmin(null); setLoading(false); return; }
        try {
            setLoading(true);
            const res = await getMeApi();
            setAdmin(res.data);
        } catch {
            setAdmin(null);
            localStorage.removeItem('admin_token');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setAdmin(null);
    };

    useEffect(() => { refresh(); }, []);

    return <AuthContext.Provider value={{ admin, loading, refresh, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
