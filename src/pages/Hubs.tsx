import { useEffect, useState } from 'react';
import type { Hub } from '../types';
import { getHubsApi } from '../api/admin';
import { MdHub, MdExpandMore, MdExpandLess, MdLocationOn, MdEmail, MdPhone, MdPerson } from 'react-icons/md';

export default function Hubs() {
    const [hubs, setHubs]         = useState<Hub[]>([]);
    const [loading, setLoading]   = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [error, setError]       = useState('');

    useEffect(() => {
        getHubsApi()
            .then(res => setHubs(res.data ?? []))
            .catch(() => setError('Failed to load hubs'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6 w-full">
            <div>
                <h1 className="text-3xl font-bold text-[#1a2e1a]">Hubs</h1>
                <p className="text-sm text-gray-500 mt-1">All registered hub owners on the platform</p>
            </div>

            {error && (
                <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
            )}

            {!loading && (
                <div className="bg-[#1a3a1a] border border-[#2d5a2d] rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#2d5a2d] flex items-center justify-center shrink-0">
                        <MdHub className="text-[#4ade80] text-xl" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-white">{hubs.length}</p>
                        <p className="text-sm text-[#86efac]">Total hub owners registered</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />)}
                </div>
            ) : hubs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm">
                    <MdHub className="text-4xl mx-auto mb-3 opacity-30" />
                    No hubs registered yet.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {hubs.map(hub => {
                        const isOpen = expanded === hub.id;
                        const initials = hub.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                        return (
                            <div key={hub.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div
                                    onClick={() => setExpanded(isOpen ? null : hub.id)}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-[#f0fdf4] transition-colors cursor-pointer select-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#dcfce7] flex items-center justify-center text-[#166534] font-bold text-sm shrink-0">
                                            {initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#1a2e1a]">{hub.name}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <MdLocationOn className="text-[#166534] text-xs shrink-0" />
                                                {hub.hub_location || 'No location set'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-medium">
                                            {hub.role}
                                        </span>
                                        {isOpen
                                            ? <MdExpandLess className="text-gray-400 text-lg" />
                                            : <MdExpandMore className="text-gray-400 text-lg" />
                                        }
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-[#f9fef9] px-5 py-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {[
                                                { Icon: MdPerson,      label: 'Name',     value: hub.name },
                                                { Icon: MdEmail,       label: 'Email',    value: hub.email },
                                                { Icon: MdPhone,       label: 'Phone',    value: hub.phone },
                                                { Icon: MdLocationOn,  label: 'Location', value: hub.hub_location || '—' },
                                            ].map(({ Icon, label, value }) => (
                                                <div key={label} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                                                    <Icon className="text-[#166534] text-lg shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                                                        <p className="text-sm font-medium text-[#1a2e1a] truncate">{value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 sm:col-span-2 lg:col-span-2">
                                                <MdHub className="text-[#166534] text-lg shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Hub ID</p>
                                                    <p className="text-xs font-mono text-gray-500 truncate">{hub.id}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Permissions</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {hub.permissions.map((p: string) => (
                                                    <span key={p} className="text-xs px-2.5 py-0.5 rounded-full bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0] font-medium">
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
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
