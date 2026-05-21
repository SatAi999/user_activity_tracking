import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import {
  FiGrid, FiList, FiUsers, FiActivity, FiLogOut,
  FiCheckSquare, FiMenu, FiX, FiBarChart2, FiShield,
  FiBell, FiMoon, FiSun, FiUser,
} from 'react-icons/fi';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const bellRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifs(data.notifications);
      setUnread(data.unreadCount);
    } catch (_) {}
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const id = setInterval(fetchNotifs, 30000);
      return () => clearInterval(id);
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const markOne = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifs(n => n.map(x => x._id === id ? { ...x, read: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const userNav = [
    { to: '/dashboard', icon: FiGrid,  label: 'Dashboard' },
    { to: '/tasks',     icon: FiList,  label: 'My Tasks'  },
    { to: '/profile',   icon: FiUser,  label: 'Profile'   },
  ];

  const adminNav = [
    { to: '/admin',        icon: FiBarChart2,   label: 'Overview'      },
    { to: '/admin/users',  icon: FiUsers,       label: 'Users'         },
    { to: '/admin/tasks',  icon: FiCheckSquare, label: 'All Tasks'     },
    { to: '/admin/logs',   icon: FiActivity,    label: 'Activity Logs' },
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

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

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
      <div className="px-3 pb-4 border-t border-slate-800 pt-4 shrink-0 space-y-1">
        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setShowNotifs(s => !s)}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[15px] text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <span className="relative">
              <FiBell className="text-lg" />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
            <span>Notifications</span>
          </button>
          {showNotifs && (
            <div className="absolute bottom-full left-0 mb-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="font-semibold text-sm text-slate-100">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-6">No notifications</p>
                ) : notifs.map(n => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && markOne(n._id)}
                    className={`px-4 py-3 border-b border-slate-800 text-sm cursor-pointer hover:bg-slate-800 ${!n.read ? 'bg-indigo-500/5' : ''}`}
                  >
                    <p className={!n.read ? 'text-slate-100' : 'text-slate-400'}>{n.message}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[15px] text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          {dark ? <FiSun className="text-lg shrink-0" /> : <FiMoon className="text-lg shrink-0" />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-900/50">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role} · {user?.status}</p>
          </div>
          <button onClick={handleLogout} title="Sign out" className="text-slate-500 hover:text-red-400 transition-colors">
            <FiLogOut className="text-lg" />
          </button>
        </div>
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

