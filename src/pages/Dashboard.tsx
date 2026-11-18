import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCategoriesApi, getAdminsApi, getRolesApi, getHubsApi, getGlobalRevenueApi } from '../api/admin';
import { useAdminSocket } from '../hooks/useAdminSocket';
import {
    MdCategory, MdPeople, MdShield, MdHub, MdArrowOutward,
    MdShoppingBag, MdTrendingUp, MdTrendingDown, MdCircle, MdAttachMoney,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

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

export default function Dashboard() {
    const { admin } = useAuth();
    const navigate  = useNavigate();

    const [counts, setCounts]   = useState({ categories: 0, hubs: 0, admins: 0, roles: 0 });
    const [revenue, setRevenue] = useState<Revenue | null>(null);
    const [loading, setLoading] = useState(true);
    const [live, setLive]       = useState(false);

    const loadRevenue = () =>
        getGlobalRevenueApi().then(res => setRevenue(res.data)).catch(() => {});

    useEffect(() => {
        Promise.all([getCategoriesApi(), getAdminsApi(), getRolesApi(), getHubsApi(), getGlobalRevenueApi()])
            .then(([cats, admins, roles, hubs, rev]) => {
                setCounts({
                    categories: (cats.data ?? []).length,
                    admins:     (admins.data ?? []).length,
                    roles:      (roles.data ?? []).length,
                    hubs:       (hubs.data ?? []).length,
                });
                setRevenue(rev.data ?? null);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useAdminSocket({
        onNewOrder: () => {
            setLive(true);
            setTimeout(() => setLive(false), 2000);
            loadRevenue();
        },
    });

    const revTrend = revenue ? trendPct(revenue.thisMonthRevenue, revenue.lastMonthRevenue) : null;
    const ordTrend = revenue ? trendPct(revenue.thisMonthOrders,  revenue.lastMonthOrders)  : null;

    const platformCards = [
        { label: 'Admin Users',  value: counts.admins,     Icon: MdPeople,   dark: true,  href: '/settings' },
        { label: 'Roles',        value: counts.roles,      Icon: MdShield,   dark: false, href: '/settings' },
        { label: 'Categories',   value: counts.categories, Icon: MdCategory, dark: false, href: '/categories' },
        { label: 'Hubs',         value: counts.hubs,       Icon: MdHub,      dark: false, href: '/hubs' },
    ];

    const revenueCards = [
        { label: 'Total Revenue',   value: fmt(revenue?.totalRevenue ?? 0),   sub: 'All delivered orders',          dark: true,  Icon: MdAttachMoney,  trend: null },
        { label: 'This Month',      value: fmt(revenue?.thisMonthRevenue ?? 0), sub: 'vs last month',               dark: false, Icon: MdTrendingUp,   trend: revTrend },
        { label: 'Total Orders',    value: (revenue?.totalOrders ?? 0).toLocaleString(), sub: `${revenue?.thisMonthOrders ?? 0} this month`, dark: false, Icon: MdShoppingBag, trend: ordTrend },
        { label: 'Avg Order Value', value: fmt(revenue?.avgOrderValue ?? 0),  sub: 'Per delivered order',           dark: false, Icon: MdAttachMoney,  trend: null },
    ];

    const skeleton = (cols: number, h = 'h-28') => (
        <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-4`}>
            {Array.from({ length: cols }).map((_, i) => <div key={i} className={`${h} rounded-2xl bg-gray-200 animate-pulse`} />)}
        </div>
    );

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e1a]">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {admin?.name}. Here's your platform overview.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
                    <MdCircle className={`text-xs transition-colors duration-300 ${live ? 'text-[#4ade80]' : 'text-gray-300'}`} />
                    <span className="text-xs font-medium text-gray-500">Live</span>
                </div>
            </div>

            {/* Platform stat cards */}
            {loading ? skeleton(4) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {platformCards.map(({ label, value, Icon, dark, href }) => (
                        <button key={label} onClick={() => navigate(href)}
                            className={`rounded-2xl p-5 flex flex-col gap-3 shadow-sm border text-left transition-transform hover:-translate-y-0.5 w-full ${dark ? 'bg-[#1a3a1a] border-[#2d5a2d]' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-[#2d5a2d]' : 'bg-[#dcfce7]'}`}>
                                    <Icon className={`text-base ${dark ? 'text-[#4ade80]' : 'text-[#166534]'}`} />
                                </div>
                                <MdArrowOutward className={`text-sm ${dark ? 'text-[#4ade80]' : 'text-gray-300'}`} />
                            </div>
                            <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#1a2e1a]'}`}>{value}</p>
                            <p className={`text-xs ${dark ? 'text-[#86efac]' : 'text-gray-400'}`}>{label}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Revenue stat cards */}
            {loading ? skeleton(4) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {revenueCards.map(({ label, value, sub, dark, Icon, trend }) => (
                        <div key={label} className={`rounded-2xl p-5 flex flex-col gap-3 shadow-sm border ${dark ? 'bg-[#1a3a1a] border-[#2d5a2d]' : 'bg-white border-gray-100'}`}>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dark ? 'bg-[#2d5a2d]' : 'bg-[#dcfce7]'}`}>
                                <Icon className={`text-base ${dark ? 'text-[#4ade80]' : 'text-[#166534]'}`} />
                            </div>
                            <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-[#1a2e1a]'}`}>{value}</p>
                            <div>
                                <p className={`text-xs ${dark ? 'text-[#86efac]' : 'text-gray-400'}`}>{label}</p>
                                {trend ? (
                                    <p className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${trend.up ? 'text-[#16a34a]' : 'text-red-500'}`}>
                                        {trend.up ? <MdTrendingUp /> : <MdTrendingDown />} {trend.text}
                                    </p>
                                ) : (
                                    <p className={`text-xs mt-0.5 ${dark ? 'text-[#4ade80]' : 'text-gray-400'}`}>{sub}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts */}
            {!loading && revenue && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Area chart — revenue trend */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <p className="text-base font-bold text-[#1a2e1a]">Revenue Trend</p>
                                <p className="text-xs text-gray-400 mt-0.5">Monthly delivered revenue · last 6 months</p>
                            </div>
                            <span className="text-xl font-bold text-[#1a2e1a]">{fmt(revenue.totalRevenue)}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={revenue.chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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

                    {/* Bar chart — orders per month */}
                    <div className="bg-[#1a3a1a] rounded-2xl border border-[#2d5a2d] shadow-sm p-6">
                        <p className="text-base font-bold text-white mb-1">Orders / Month</p>
                        <p className="text-xs text-[#86efac] mb-5">Delivered orders · last 6 months</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={revenue.chart} barSize={14} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d5a2d" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#86efac' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#86efac' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 10, background: '#1a3a1a', border: '1px solid #2d5a2d', color: '#fff', fontSize: 12 }} />
                                <Bar dataKey="orders" name="Orders" fill="#4ade80" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Hub revenue breakdown + Account */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Hub breakdown */}
                    {revenue?.hubBreakdown && revenue.hubBreakdown.length > 0 && (
                        <div className="bg-[#1a3a1a] rounded-2xl border border-[#2d5a2d] shadow-sm p-6">
                            <p className="text-base font-bold text-white mb-5">Top Hubs by Revenue</p>
                            <div className="flex flex-col gap-3">
                                {revenue.hubBreakdown.slice(0, 5).map((h, i) => {
                                    const max = revenue.hubBreakdown![0].revenue;
                                    const pct = max > 0 ? Math.min(100, (h.revenue / max) * 100) : 0;
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-[#86efac] truncate max-w-[65%]">{h.hubLocation}</span>
                                                <span className="text-xs font-bold text-white">{fmt(h.revenue)}</span>
                                            </div>
                                            <div className="h-1.5 bg-[#2d5a2d] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#4ade80] rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Account */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <p className="text-base font-bold text-[#1a2e1a] mb-4">Account</p>
                        <div className="flex flex-col gap-0">
                            {[
                                { label: 'Name',  value: admin?.name },
                                { label: 'Email', value: admin?.email },
                                { label: 'Role',  value: admin?.role },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{row.label}</span>
                                    <span className="text-sm font-medium text-[#1a2e1a]">{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Permissions</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(admin?.permissions ?? []).map(p => (
                                    <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-medium">{p}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
