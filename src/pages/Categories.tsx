import { useEffect, useRef, useState } from 'react';
import type { Category, SubCategory } from '../types';
import { getCategoriesApi, createCategoryApi, getSubCategoriesApi, createSubCategoryApi } from '../api/admin';
import { MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';

type FormMode = 'category' | 'subcategory' | null;

const inputCls = 'w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#1a2e1a] outline-none focus:border-[#4ade80] focus:ring-1 focus:ring-[#4ade80] transition-colors';
const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block';

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading]       = useState(true);
    const [mode, setMode]             = useState<FormMode>(null);
    const [expanded, setExpanded]     = useState<string | null>(null);
    const [subMap, setSubMap]         = useState<Record<string, SubCategory[]>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess]       = useState('');
    const [error, setError]           = useState('');
    const catFileRef = useRef<HTMLInputElement>(null);
    const subFileRef = useRef<HTMLInputElement>(null);

    const [catForm, setCatForm] = useState({ name: '', description: '' });
    const [subForm, setSubForm] = useState({ name: '', description: '', categoryId: '' });

    const load = async () => {
        try {
            const res = await getCategoriesApi();
            setCategories(res.data ?? []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const openMode = (m: FormMode, prefillCategoryId = '') => {
        setMode(m); setError(''); setSuccess('');
        setCatForm({ name: '', description: '' });
        setSubForm({ name: '', description: '', categoryId: prefillCategoryId });
        if (catFileRef.current) catFileRef.current.value = '';
        if (subFileRef.current) subFileRef.current.value = '';
    };

    const closeForm = () => { setMode(null); setError(''); };

    const toggleExpand = async (cat: Category) => {
        if (expanded === cat.id) { setExpanded(null); return; }
        setExpanded(cat.id);
        if (!subMap[cat.id]) {
            try {
                const res = await getSubCategoriesApi(cat.id);
                setSubMap(m => ({ ...m, [cat.id]: res.data ?? [] }));
            } catch { setSubMap(m => ({ ...m, [cat.id]: [] })); }
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        if (!catForm.name.trim()) { setError('Name is required'); return; }
        const fd = new FormData();
        fd.append('name', catForm.name.trim());
        if (catForm.description) fd.append('description', catForm.description);
        if (catFileRef.current?.files?.[0]) fd.append('image', catFileRef.current.files[0]);
        setSubmitting(true);
        try {
            await createCategoryApi(fd);
            setSuccess(`Category "${catForm.name}" created`);
            closeForm(); await load();
        } catch (err: any) { setError(err?.data?.message || 'Failed to create category'); }
        finally { setSubmitting(false); }
    };

    const handleSubCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        if (!subForm.name.trim()) { setError('Name is required'); return; }
        if (!subForm.categoryId) { setError('Please select a category'); return; }
        const fd = new FormData();
        fd.append('name', subForm.name.trim());
        if (subForm.description) fd.append('description', subForm.description);
        if (subFileRef.current?.files?.[0]) fd.append('image', subFileRef.current.files[0]);
        setSubmitting(true);
        try {
            await createSubCategoryApi(subForm.categoryId, fd);
            setSuccess(`Subcategory "${subForm.name}" created`);
            // refresh subs for that category
            const res = await getSubCategoriesApi(subForm.categoryId);
            setSubMap(m => ({ ...m, [subForm.categoryId]: res.data ?? [] }));
            closeForm();
        } catch (err: any) { setError(err?.data?.message || 'Failed to create subcategory'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage global categories and subcategories</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => mode === 'category' ? closeForm() : openMode('category')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-sm font-semibold transition-colors"
                    >
                        <MdAdd className="text-base" />
                        {mode === 'category' ? 'Cancel' : 'Category'}
                    </button>
                    <button
                        onClick={() => mode === 'subcategory' ? closeForm() : openMode('subcategory')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] text-sm font-semibold transition-colors hover:opacity-80"
                    >
                        <MdAdd className="text-base" />
                        {mode === 'subcategory' ? 'Cancel' : 'Subcategory'}
                    </button>
                </div>
            </div>

            {success && (
                <div className="px-4 py-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-sm">
                    {success}
                </div>
            )}

            {/* Category form */}
            {mode === 'category' && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6">
                    <p className="text-sm font-bold text-[#14532d] mb-4">New Category</p>
                    {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                    <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Name *</label>
                            <input value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Grocery" className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Description</label>
                            <input value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" className={inputCls} />
                        </div>
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className={labelCls}>Image</label>
                            <input type="file" accept="image/*" ref={catFileRef} className="text-sm text-gray-500 cursor-pointer" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" disabled={submitting}
                                className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                                {submitting ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Subcategory form */}
            {mode === 'subcategory' && (
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-6">
                    <p className="text-sm font-bold text-[#14532d] mb-4">New Subcategory</p>
                    {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
                    <form onSubmit={handleSubCategorySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Category *</label>
                            <select value={subForm.categoryId} onChange={e => setSubForm(f => ({ ...f, categoryId: e.target.value }))} className={inputCls}>
                                <option value="">— Select category —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Name *</label>
                            <input value={subForm.name} onChange={e => setSubForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dairy" className={inputCls} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className={labelCls}>Description</label>
                            <input value={subForm.description} onChange={e => setSubForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" className={inputCls} />
                        </div>
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className={labelCls}>Image</label>
                            <input type="file" accept="image/*" ref={subFileRef} className="text-sm text-gray-500 cursor-pointer" />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" disabled={submitting}
                                className="px-5 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-50 text-white text-sm font-semibold transition-colors">
                                {submitting ? 'Creating...' : 'Create Subcategory'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />)}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                    No categories yet. Click <strong className="text-[#166534]">+ Category</strong> to create one.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {categories.map(cat => {
                        const subs = subMap[cat.id] ?? cat.subCategories ?? [];
                        const isOpen = expanded === cat.id;
                        return (
                            <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div
                                    onClick={() => toggleExpand(cat)}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-[#f0fdf4] transition-colors cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        {cat.imagePath ? (
                                            <img src={cat.imagePath} alt={cat.name} className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-sm shrink-0">
                                                {cat.name[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-[#1a2e1a]">{cat.name}</p>
                                            {cat.description && <p className="text-xs text-gray-400">{cat.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={e => { e.stopPropagation(); openMode('subcategory', cat.id); }}
                                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-[#bbf7d0] text-[#166534] hover:bg-[#f0fdf4] transition-colors"
                                        >
                                            <MdAdd /> Sub
                                        </button>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                            {cat.subCategories?.length ?? 0} subs
                                        </span>
                                        {isOpen
                                            ? <MdExpandLess className="text-gray-400 text-lg" />
                                            : <MdExpandMore className="text-gray-400 text-lg" />
                                        }
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-[#f9fef9] px-5 py-3 flex flex-col gap-2">
                                        {subs.length === 0 ? (
                                            <p className="text-xs text-gray-400 py-1">No subcategories yet. Click <strong>+ Sub</strong> to add one.</p>
                                        ) : subs.map(sub => (
                                            <div key={sub.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                                                {sub.imagePath ? (
                                                    <img src={sub.imagePath} alt={sub.name} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-xs shrink-0">
                                                        {sub.name[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                                                    {sub.description && <p className="text-xs text-gray-400">{sub.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
