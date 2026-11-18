import { useEffect, useState } from 'react';
import { getGlobalRevenueApi } from '../api/admin';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { MdTrendingUp, MdTrendingDown, MdShoppingBag, MdAttachMoney, MdHub } from 'react-icons/md';

interface Revenue {
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    avgOrderValue: number;
    totalOrders: number;
    thisMonthOrders: number;
    lastMonthOrders: number;
    chart: { month: string; revenue: number; orders: number }[];
    statusBreakdown: Record<string, number>;
    hubBreakdown: { hubLocation: string; revenue: number; orders: number }[] | null;
}

const STATUS_COLORS: Record<string, string> = {
    DELIVERED: '#4ade80', CONFIRMED: '#60a5fa', PREPARING: '#a78bfa',
    PENDING: '#fbbf24', OUT_FOR_DELIVERY: '#34d399', CANCELLED: '#f87171',
};

function fmt(n: number) {
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${n.toFixed(0)}`;
}

function trendPct(cur: number, prev: number) {
    if (prev === 0) return cur > 0 ? { text: '+100%', up: true } : null;
    const p = (((cur - prev) / prev) * 100).toFixed(1);
    return { text: `${Number(p) >= 0 ? '+' : ''}${p}%`, up: Number(p) >= 0 };
}

export default function Revenue() {
    const [data, setData]     = useState<Revenue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState('');

    useEffect(() => {
        getGlobalRevenueApi()
            .then(res => setData(res.data))
            .catch(() => setError('Failed to load revenue data'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse" />)}
            </div>
            <div className="h-72 rounded-2xl bg-gray-200 animate-pulse" />
        </div>
    );

    if (error || !data) return (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error || 'No data'}</div>
    );

    const revTrend = trendPct(data.thisMonthRevenue, data.lastMonthRevenue);
    const ordTrend = trendPct(data.thisMonthOrders, data.lastMonthOrders);

    const statCards = [
        { label: 'Total Revenue',    value: fmt(data.totalRevenue),          sub: 'All delivered orders',       dark: true,  Icon: MdAttachMoney,  trend: null },
        { label: 'This Month',       value: fmt(data.thisMonthRevenue),       sub: 'vs last month',              dark: false, Icon: MdTrendingUp,   trend: revTrend },
        { label: 'Total Orders',     value: data.totalOrders.toLocaleString(), sub: `${data.thisMonthOrders} this month`, dark: false, Icon: MdShoppingBag, trend: ordTrend },
        { label: 'Avg Order Value',  value: fmt(data.avgOrderValue),          sub: 'Per delivered order',        dark: false, Icon: MdAttachMoney,  trend: null },
    ];

    const pieData = Object.entries(data.statusBreakdown).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#1a2e1a]">Revenue</h1>
                <p className="text-sm text-gray-500 mt-1">Platform-wide revenue and order analytics</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(({ label, value, sub, dark, Icon, trend }) => (
                    <div key={label} className={`rounded-2xl p-6 flex flex-col gap-3 shadow-sm border ${dark ? 'bg-[#1a3a1a] border-[#2d5a2d]' : 'bg-white border-gray-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dark ? 'bg-[#2d5a2d]' : 'bg-[#dcfce7]'}`}>
                            <Icon className={`text-lg ${dark ? 'text-[#4ade80]' : 'text-[#166534]'}`} />
                        </div>
                        <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#1a2e1a]'}`}>{value}</p>
                        <div>
                            <p className={`text-xs ${dark ? 'text-[#86efac]' : 'text-gray-400'}`}>{label}</p>
                            {trend ? (
                                <p className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${trend.up ? 'text-[#16a34a]' : 'text-red-500'}`}>
                                    {trend.up ? <MdTrendingUp /> : <MdTrendingDown />} {trend.text} vs last month
                                </p>
                            ) : (
                                <p className={`text-xs mt-0.5 ${dark ? 'text-[#4ade80]' : 'text-gray-400'}`}>{sub}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Area chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-base font-bold text-[#1a2e1a] mb-1">Revenue Trend</p>
                    <p className="text-xs text-gray-400 mb-5">Monthly delivered revenue — last 6 months</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#166534" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => fmt(Number(v))} />
                            <Tooltip formatter={(v) => [fmt(Number(v)), 'Revenue']} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                            <Area type="monotone" dataKey="revenue" stroke="#166534" strokeWidth={2.5} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#166534' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Order status pie */}
                <div className="bg-[#1a3a1a] rounded-2xl border border-[#2d5a2d] shadow-sm p-6">
                    <p className="text-base font-bold text-white mb-1">Order Status</p>
                    <p className="text-xs text-[#86efac] mb-4">All-time breakdown</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                {pieData.map((entry) => (
                                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#6b7280'} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 10, background: '#1a3a1a', border: '1px solid #2d5a2d', color: '#fff', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {pieData.map(e => (
                            <div key={e.name} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[e.name] ?? '#6b7280' }} />
                                <span className="text-[10px] text-[#86efac]">{e.name} ({e.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly orders bar + hub breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bar chart — orders per month */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-base font-bold text-[#1a2e1a] mb-1">Orders per Month</p>
                    <p className="text-xs text-gray-400 mb-5">Delivered orders — last 6 months</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={data.chart} barSize={18} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
                            <Bar dataKey="orders" name="Orders" fill="#166534" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Hub breakdown */}
                {data.hubBreakdown && data.hubBreakdown.length > 0 && (
                    <div className="bg-[#1a3a1a] rounded-2xl border border-[#2d5a2d] shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <MdHub className="text-[#4ade80]" />
                            <p className="text-base font-bold text-white">Top Hubs by Revenue</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {data.hubBreakdown.slice(0, 6).map((h, i) => {
                                const max = data.hubBreakdown![0].revenue;
                                const pct = max > 0 ? Math.min(100, (h.revenue / max) * 100) : 0;
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs text-[#86efac] truncate max-w-[60%]">{h.hubLocation}</span>
                                            <span className="text-xs font-bold text-white">{fmt(h.revenue)}</span>
                                        </div>
                                        <div className="h-1.5 bg-[#2d5a2d] rounded-full overflow-hidden">
                                            <div className="h-full bg-[#4ade80] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
