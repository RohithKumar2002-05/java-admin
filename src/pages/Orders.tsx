import { useEffect, useState } from 'react';
import type { Order } from '../types';
import { getAllOrdersApi } from '../api/admin';
import { useAdminSocket } from '../hooks/useAdminSocket';
import {
    MdShoppingBag, MdExpandMore, MdExpandLess,
    MdLocationOn, MdCircle,
} from 'react-icons/md';

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
    PENDING:          { bg: 'bg-amber-100',   text: 'text-amber-800' },
    CONFIRMED:        { bg: 'bg-blue-100',    text: 'text-blue-800' },
    PREPARING:        { bg: 'bg-purple-100',  text: 'text-purple-800' },
    OUT_FOR_DELIVERY: { bg: 'bg-[#d1fae5]',  text: 'text-[#065f46]' },
    DELIVERED:        { bg: 'bg-[#dcfce7]',  text: 'text-[#15803d]' },
    CANCELLED:        { bg: 'bg-red-100',     text: 'text-red-800' },
};

const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Pending', CONFIRMED: 'Confirmed', PREPARING: 'Preparing',
    OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
    const [orders, setOrders]     = useState<Order[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [filter, setFilter]     = useState('ALL');
    const [toast, setToast]       = useState('');
    const [live, setLive]         = useState(false);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    useEffect(() => {
        getAllOrdersApi()
            .then(res => setOrders(res.data ?? []))
            .catch(() => setError('Failed to load orders'))
            .finally(() => setLoading(false));
    }, []);

    useAdminSocket({
        onNewOrder: (order) => {
            setOrders(prev => prev.find(o => o.id === order.id) ? prev : [order, ...prev]);
            setLive(true);
            setTimeout(() => setLive(false), 2000);
            showToast(`New order ${order.orderNumber}`);
        },
    });

    const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

    const counts = FILTERS.slice(1).reduce((acc, s) => {
        acc[s] = orders.filter(o => o.status === s).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 bg-[#1a2e1a] text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2">
                    <MdShoppingBag className="text-[#4ade80]" /> {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">All orders across every hub</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
                    <MdCircle className={`text-xs transition-colors duration-300 ${live ? 'text-[#4ade80]' : 'text-gray-300'}`} />
                    <span className="text-xs font-medium text-gray-500">Live</span>
                </div>
            </div>

            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}

            {/* Summary cards */}
            {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {FILTERS.slice(1).map(s => {
                        const st = STATUS_STYLE[s];
                        return (
                            <button
                                key={s}
                                onClick={() => setFilter(filter === s ? 'ALL' : s)}
                                className={`rounded-xl p-3 text-left border transition-all ${
                                    filter === s
                                        ? 'border-[#166534] ring-1 ring-[#166534]'
                                        : 'border-gray-100 bg-white hover:border-[#bbf7d0]'
                                }`}
                            >
                                <p className="text-xl font-bold text-[#1a2e1a]">{counts[s]}</p>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                                    {STATUS_LABEL[s]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {['ALL', ...FILTERS.slice(1)].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                            filter === s
                                ? 'border-[#166534] text-[#166534]'
                                : 'border-transparent text-gray-400 hover:text-[#1a2e1a]'
                        }`}
                    >
                        {s === 'ALL' ? `All (${orders.length})` : STATUS_LABEL[s]}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-200 animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                    <MdShoppingBag className="text-4xl mx-auto mb-3 opacity-30" />
                    No orders{filter !== 'ALL' ? ` with status ${STATUS_LABEL[filter]}` : ''}.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(order => {
                        const st = STATUS_STYLE[order.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
                        const isOpen = expanded === order.id;
                        return (
                            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div
                                    onClick={() => setExpanded(isOpen ? null : order.id)}
                                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#f7fbf7] transition-colors select-none"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1a2e1a]">{order.orderNumber}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            {' · '}{order.items?.length ?? 0} items
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold text-[#1a2e1a] shrink-0">₹{Number(order.total).toFixed(2)}</p>
                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${st.bg} ${st.text}`}>
                                        {STATUS_LABEL[order.status] ?? order.status}
                                    </span>
                                    {isOpen
                                        ? <MdExpandLess className="text-gray-400 shrink-0" />
                                        : <MdExpandMore className="text-gray-400 shrink-0" />
                                    }
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-[#f9fef9] px-5 py-4 space-y-3">
                                        {/* Items */}
                                        <div className="flex flex-col gap-2">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-3">
                                                    {item.productImage
                                                        ? <img src={item.productImage} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                                                        : <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-xs shrink-0">{item.productName[0]}</div>
                                                    }
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-[#1a2e1a] truncate">{item.productName}</p>
                                                        <p className="text-xs text-gray-400">x{item.quantity} · {item.unitMeasure}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#1a2e1a] shrink-0">₹{Number(item.itemTotal).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Address */}
                                        <p className="text-xs text-gray-500 flex items-start gap-1">
                                            <MdLocationOn className="text-[#166534] shrink-0 mt-0.5" />
                                            {order.deliveryAddress}{order.deliveryLandmark ? ` · Near: ${order.deliveryLandmark}` : ''}
                                        </p>
                                        {/* Totals */}
                                        <div className="flex gap-4 text-xs text-gray-500 pt-1 border-t border-gray-100">
                                            <span>Subtotal: <strong className="text-[#1a2e1a]">₹{Number(order.subtotal).toFixed(2)}</strong></span>
                                            <span>Fee: <strong className="text-[#1a2e1a]">₹{Number(order.platformFee).toFixed(2)}</strong></span>
                                            <span>Total: <strong className="text-[#1a2e1a]">₹{Number(order.total).toFixed(2)}</strong></span>
                                        </div>
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
