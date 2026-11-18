import { useEffect, useState } from 'react';
import type { AdminRole } from '../types';
import { getRolesApi, createRoleApi, deleteRoleApi } from '../api/admin';

const AVAILABLE_PERMISSIONS = [
    'categories:create', 'categories:update', 'categories:delete', 'categories:read',
    'hub:create', 'hub:read', 'hub:delete',
    'users:read', 'users:delete',
    'orders:read',
    'roles:create', 'roles:delete',
    '*:*',
];

export default function Roles() {
    const [roles, setRoles] = useState<AdminRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [selected, setSelected] = useState<string[]>([]);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try { const res = await getRolesApi(); setRoles(res.data ?? []); }
        catch { setError('Failed to load roles'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const togglePerm = (p: string) =>
        setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || selected.length === 0) { setError('Name and at least one permission required'); return; }
        try {
            await createRoleApi(name, selected);
            setName(''); setSelected([]); setShowForm(false);
            load();
        } catch (err: any) { setError(err.message || 'Failed to create role'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this role?')) return;
        try { await deleteRoleApi(id); load(); }
        catch (err: any) { setError(err.message || 'Failed to delete role'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Roles</h2>
                <button onClick={() => setShowForm(v => !v)} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                    {showForm ? 'Cancel' : '+ New Role'}
                </button>
            </div>

            {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}

            {showForm && (
                <form onSubmit={handleCreate} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20 }}>
                    <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Role Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} required
                            style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, width: 280, boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 8 }}>Permissions</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {AVAILABLE_PERMISSIONS.map(p => (
                                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer',
                                    padding: '4px 10px', borderRadius: 20, border: '1px solid', background: selected.includes(p) ? '#dbeafe' : '#f9f9f9',
                                    borderColor: selected.includes(p) ? '#3b82f6' : '#ddd', color: selected.includes(p) ? '#1d4ed8' : '#555' }}>
                                    <input type="checkbox" checked={selected.includes(p)} onChange={() => togglePerm(p)} style={{ display: 'none' }} />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit" style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Create</button>
                </form>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
                {loading ? <p style={{ color: '#888' }}>Loading...</p> : roles.map(r => (
                    <div key={r.id} style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>{r.name}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {r.permissions.map(p => (
                                    <span key={p} style={{ fontSize: 11, padding: '2px 8px', background: '#f0f4ff', color: '#3b82f6', borderRadius: 20 }}>{p}</span>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(r.id)}
                            style={{ padding: '4px 10px', background: '#fee2e2', color: '#e53e3e', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
