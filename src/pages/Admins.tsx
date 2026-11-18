import { useEffect, useState } from 'react';
import type { Admin, AdminRole } from '../types';
import { getAdminsApi, createAdminApi, deleteAdminApi, updateAdminRoleApi, getRolesApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';

export default function Admins() {
    const { admin: me } = useAuth();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role_name: '' });

    const load = async () => {
        setLoading(true);
        try {
            const [adminsRes, rolesRes] = await Promise.all([getAdminsApi(), getRolesApi()]);
            setAdmins(adminsRes.data ?? []);
            setRoles(rolesRes.data ?? []);
        } catch { setError('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await createAdminApi(form);
            setSuccess('Admin created');
            setForm({ name: '', email: '', phone: '', password: '', role_name: '' });
            setShowForm(false);
            load();
        } catch (err: any) { setError(err.message || 'Failed to create admin'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this admin?')) return;
        try { await deleteAdminApi(id); load(); }
        catch (err: any) { setError(err.message || 'Failed to delete'); }
    };

    const handleRoleChange = async (id: string, role_name: string) => {
        try { await updateAdminRoleApi(id, role_name); load(); }
        catch (err: any) { setError(err.message || 'Failed to update role'); }
    };

    const s = { th: { padding: '10px 12px', textAlign: 'left' as const, fontSize: 12, color: '#888', borderBottom: '1px solid #eee' }, td: { padding: '12px', fontSize: 13, borderBottom: '1px solid #f0f0f0' } };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Admins</h2>
                <button onClick={() => setShowForm(v => !v)} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                    {showForm ? 'Cancel' : '+ New Admin'}
                </button>
            </div>

            {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}
            {success && <p style={{ color: '#38a169', fontSize: 13 }}>{success}</p>}

            {showForm && (
                <form onSubmit={handleCreate} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {(['name', 'email', 'phone', 'password'] as const).map(f => (
                        <div key={f}>
                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, textTransform: 'capitalize' }}>{f}</label>
                            <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                                type={f === 'password' ? 'password' : 'text'} required
                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
                        </div>
                    ))}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Role</label>
                        <select value={form.role_name} onChange={e => setForm(p => ({ ...p, role_name: e.target.value }))} required
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}>
                            <option value="">— Select role —</option>
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                        <button type="submit" style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Create</button>
                    </div>
                </form>
            )}

            <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {loading ? <p style={{ padding: 20, color: '#888' }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Phone</th><th style={s.th}>Role</th><th style={s.th}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {admins.map(a => (
                                <tr key={a.id}>
                                    <td style={s.td}>{a.name}</td>
                                    <td style={s.td}>{a.email}</td>
                                    <td style={s.td}>{a.phone}</td>
                                    <td style={s.td}>
                                        <select value={a.role} onChange={e => handleRoleChange(a.id, e.target.value)}
                                            disabled={a.id === me?.id}
                                            style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}>
                                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                        </select>
                                    </td>
                                    <td style={s.td}>
                                        {a.id !== me?.id && (
                                            <button onClick={() => handleDelete(a.id)}
                                                style={{ padding: '4px 10px', background: '#fee2e2', color: '#e53e3e', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
