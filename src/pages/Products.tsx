import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { getProductsApi } from '../api/admin';
import { MdInventory2, MdExpandMore, MdExpandLess, MdHub } from 'react-icons/md';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        getProductsApi()
            .then(res => setProducts(res.data ?? []))
            .catch(() => setError('Failed to load products'))
            .finally(() => setLoading(false));
    }, []);

    // Group products by hubCity (fallback to hubAddressId)
    const grouped: Record<string, Product[]> = {};
    for (const p of products) {
        const key = p.hubCity || p.hubAddressId || 'Unknown Hub';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
    }
    const hubKeys = Object.keys(grouped).sort();

    return (
        <div className="space-y-6 w-full">
            <div>
                <h1 className="text-3xl font-bold text-[#1a2e1a]">Products</h1>
                <p className="text-sm text-gray-500 mt-1">All products across every hub on the platform</p>
            </div>

            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}

            {!loading && products.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a3a1a] border border-[#2d5a2d] rounded-2xl p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2d5a2d] flex items-center justify-center shrink-0">
                            <MdInventory2 className="text-[#4ade80] text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{products.length}</p>
                            <p className="text-xs text-[#86efac]">Total products</p>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                            <MdHub className="text-[#166534] text-lg" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#1a2e1a]">{hubKeys.length}</p>
                            <p className="text-xs text-gray-400">Hubs with products</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                    <MdInventory2 className="text-4xl mx-auto mb-3 opacity-30" />
                    No products found across any hub.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {hubKeys.map(hubKey => {
                        const hubProducts = grouped[hubKey];
                        const isOpen = expanded === hubKey;
                        return (
                            <div key={hubKey} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                {/* Hub header row */}
                                <div
                                    onClick={() => setExpanded(isOpen ? null : hubKey)}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-[#f0fdf4] transition-colors cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                                            <MdHub className="text-[#166534] text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#1a2e1a]">{hubKey}</p>
                                            <p className="text-xs text-gray-400">{hubProducts.length} product{hubProducts.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                                            {hubProducts.filter(p => p.isActive).length} active
                                        </span>
                                        {isOpen
                                            ? <MdExpandLess className="text-gray-400 text-lg" />
                                            : <MdExpandMore className="text-gray-400 text-lg" />
                                        }
                                    </div>
                                </div>

                                {/* Products under this hub */}
                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-[#f9fef9] px-5 py-3 flex flex-col gap-2">
                                        {hubProducts.map(p => (
                                            <div key={p.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-sm shrink-0">
                                                        {p.name[0]}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-[#1a2e1a] truncate">{p.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {p.categoryName}{p.subCategoryName ? ` › ${p.subCategoryName}` : ''} · {p.unitMeasure}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-[#1a2e1a]">₹{Number(p.price).toFixed(2)}</p>
                                                    {p.discountPercentage > 0 && (
                                                        <p className="text-xs text-gray-400">
                                                            <span className="line-through">₹{Number(p.actualPrice).toFixed(2)}</span>
                                                            {' '}<span className="text-[#166534] font-medium">{p.discountPercentage}% off</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                                                    p.isActive
                                                        ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                }`}>
                                                    {p.isActive ? 'Active' : 'Inactive'} · {p.stockQuantity}
                                                </span>
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
