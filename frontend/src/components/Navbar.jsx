import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import {
  FiGrid, FiList, FiUsers, FiActivity, FiLogOut,
  FiCheckSquare, FiMenu, FiX, FiBarChart2, FiShield
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const userNav = [
    { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/tasks', icon: FiList, label: 'My Tasks' },
  ];

  const adminNav = [
    { to: '/admin', icon: FiBarChart2, label: 'Overview' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/tasks', icon: FiCheckSquare, label: 'All Tasks' },
    { to: '/admin/logs', icon: FiActivity, label: 'Activity Logs' },
  ];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
        isActive(to)
          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      <Icon className={`text-lg shrink-0 ${isActive(to) ? 'text-indigo-400' : ''}`} />
      <span>{label}</span>
    </Link>
  );

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-20 border-b border-slate-800 shrink-0">
        <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <FiCheckSquare className="text-white text-xl" />
        </div>
        <div>
          <p className="text-white font-bold text-xl tracking-tight leading-tight">TaskFlow</p>
          <p className="text-indigo-400/70 text-xs leading-tight font-medium tracking-wide uppercase">RBAC System</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <div className="space-y-1">
          {userNav.map(item => <NavItem key={item.to} {...item} />)}
        </div>
        {user?.role === 'admin' && (
          <div className="mt-7">
            <div className="flex items-center gap-2 px-4 mb-2">
              <FiShield className="text-sm text-slate-500" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Admin</p>
            </div>
            <div className="space-y-1">
              {adminNav.map(item => <NavItem key={item.to} {...item} />)}
            </div>
          </div>
        )}
      </nav>
      <div className="px-3 pb-4 border-t border-slate-800 pt-4 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-slate-900/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role} · {user?.status}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[15px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all mt-1"
        >
          <FiLogOut className="text-lg shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-slate-950 flex-col shrink-0 border-r border-slate-800">
        <SidebarInner />
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-50 h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FiCheckSquare className="text-white text-sm" />
          </div>
          <span className="text-white font-bold text-base">TaskFlow</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="text-slate-400 hover:text-white p-1">
          {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <SidebarInner />
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
