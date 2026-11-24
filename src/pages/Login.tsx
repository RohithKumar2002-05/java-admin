import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { MdDashboard } from 'react-icons/md';
import { FiCopy, FiCheck } from 'react-icons/fi';

const inputCls = 'px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors w-full';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

const DEMO_USER = { email: 'testviewer123@gmail.com', password: 'tesT_123', label: 'Viewer' };

export default function Login() {
    const navigate = useNavigate();
    const { refresh } = useAuth();
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [copied, setCopied]     = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Email and password are required'); return; }
        setLoading(true);
        try {
            const res = await loginApi(email, password);
            localStorage.setItem('admin_token', res.data.token);
            await refresh();
            navigate('/dashboard');
        } catch (err: any) {
            setError(err?.data?.message || err?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#f4f6f4]">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#166534] text-white mb-4">
                        <MdDashboard className="text-[#4ade80] text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1a2e1a]">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
                    {/* Demo account */}
                    <div className="rounded-xl border border-green-200 bg-green-50 p-3 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-[#166534] uppercase tracking-wide">Demo Account · Read-only</p>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-600">{DEMO_USER.email}</span>
                            <button type="button" onClick={() => { navigator.clipboard.writeText(DEMO_USER.email); setCopied('email'); setTimeout(() => setCopied(null), 1500); }}
                                className="text-gray-400 hover:text-[#166534] flex-shrink-0">
                                {copied === 'email' ? <FiCheck size={13} /> : <FiCopy size={13} />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-600">{DEMO_USER.password}</span>
                            <button type="button" onClick={() => { navigator.clipboard.writeText(DEMO_USER.password); setCopied('pass'); setTimeout(() => setCopied(null), 1500); }}
                                className="text-gray-400 hover:text-[#166534] flex-shrink-0">
                                {copied === 'pass' ? <FiCheck size={13} /> : <FiCopy size={13} />}
                            </button>
                        </div>
                        <button type="button" onClick={() => { setEmail(DEMO_USER.email); setPassword(DEMO_USER.password); }}
                            className="text-xs font-semibold text-[#166534] hover:underline text-left mt-1">
                            Fill credentials →
                        </button>
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@example.com" autoFocus className={inputCls} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className={labelCls}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" className={inputCls} />
                        </div>
                        <button type="submit" disabled={loading}
                            className="mt-1 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
