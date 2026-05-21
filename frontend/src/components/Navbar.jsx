import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiCheckSquare, FiUsers, FiActivity, FiGrid, FiList } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'bg-indigo-700 text-white'
      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white';

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-xl">
            <FiCheckSquare className="text-2xl" />
            <span>TaskFlow</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}
            >
              <FiGrid />
              Dashboard
            </Link>

            <Link
              to="/tasks"
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tasks')}`}
            >
              <FiList />
              My Tasks
            </Link>

            {/* Admin-only links */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin')}`}
                >
                  <FiGrid />
                  Admin
                </Link>
                <Link
                  to="/admin/users"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/users')}`}
                >
                  <FiUsers />
                  Users
                </Link>
                <Link
                  to="/admin/tasks"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/tasks')}`}
                >
                  <FiCheckSquare />
                  All Tasks
                </Link>
                <Link
                  to="/admin/logs"
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin/logs')}`}
                >
                  <FiActivity />
                  Logs
                </Link>
              </>
            )}
          </div>

          {/* User info + Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-indigo-200 text-xs capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-indigo-800 hover:bg-indigo-900 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
