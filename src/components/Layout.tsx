import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    MdDashboard, MdCategory, MdSettings, MdInventory2,
    MdLogout, MdPerson, MdMenu, MdClose, MdHub, MdShoppingBag
} from 'react-icons/md';

const NAV = [
    { to: '/dashboard',  label: 'Dashboard',  Icon: MdDashboard,    end: true  },
    { to: '/categories', label: 'Categories', Icon: MdCategory,     end: false },
    { to: '/hubs',       label: 'Hubs',       Icon: MdHub,          end: false },
    { to: '/orders',     label: 'Orders',     Icon: MdShoppingBag,  end: false },
    // { to: '/revenue',    label: 'Revenue',    Icon: MdAttachMoney,  end: false },
    { to: '/products',   label: 'Products',   Icon: MdInventory2,   end: false },
    { to: '/settings',   label: 'Settings',   Icon: MdSettings,     end: false },
];

function NavContent({ admin, onNav, onLogout }: {
    admin: { name: string; role: string } | null;
    onNav?: () => void;
    onLogout: () => void;
}) {
    return (
        <>
            <div className="flex items-center gap-3 px-6 py-6">
                <div className="w-8 h-8 rounded-xl bg-[#2d5a2d] flex items-center justify-center">
                    <MdDashboard className="text-[#4ade80] text-base" />
                </div>
                <span className="text-white font-bold text-sm tracking-wide">Java Admin</span>
            </div>

            <p className="px-6 text-[10px] font-semibold uppercase tracking-widest text-[#4a7a4a] mb-2">Menu</p>

            <nav className="flex flex-col gap-1 px-3">
                {NAV.map(({ to, label, Icon, end }) => (
                    <NavLink
                        key={to} to={to} end={end}
                        onClick={onNav}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isActive
                                    ? 'bg-[#2d5a2d] text-white'
                                    : 'text-[#8aab8a] hover:bg-[#243824] hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon className={`text-lg shrink-0 ${isActive ? 'text-[#4ade80]' : ''}`} />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="flex-1" />

            <div className="px-3 pb-5 flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#243824]">
                    <div className="w-8 h-8 rounded-full bg-[#2d5a2d] flex items-center justify-center shrink-0">
                        <MdPerson className="text-[#4ade80] text-base" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-sm font-medium text-white truncate block">{admin?.name ?? '—'}</span>
                        <span className="text-[10px] text-[#4a7a4a]">{admin?.role ?? ''}</span>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8aab8a] hover:bg-red-900/30 hover:text-red-400 transition-all w-full text-left"
                >
                    <MdLogout className="text-lg shrink-0" />
                    Logout
                </button>
            </div>
        </>
    );
}

export default function Layout() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="flex min-h-screen bg-[#f4f6f4]">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-60 shrink-0 bg-[#1a2e1a] flex-col h-screen sticky top-0">
                <NavContent admin={admin} onLogout={handleLogout} />
            </aside>

            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1a2e1a] flex items-center justify-between px-4 z-40 border-b border-[#2d5a2d]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#2d5a2d] flex items-center justify-center">
                        <MdDashboard className="text-[#4ade80] text-sm" />
                    </div>
                    <span className="text-white font-bold text-sm">Java Admin</span>
                </div>
                <button onClick={() => setOpen(v => !v)} className="text-white p-2 rounded-xl hover:bg-[#2d5a2d] transition-colors">
                    {open ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
                </button>
            </div>

            {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

            <aside className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-[#1a2e1a] flex flex-col z-50 transition-transform duration-250 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <NavContent admin={admin} onNav={() => setOpen(false)} onLogout={handleLogout} />
            </aside>

            {/* Main — flex-1 with min-w-0 prevents overflow past sidebar */}
            <main className="flex-1 min-w-0 overflow-y-auto bg-[#f4f6f4] pt-14 lg:pt-0">
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
