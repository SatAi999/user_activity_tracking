import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiList, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl p-6 text-white mb-8 shadow-md">
        <h2 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h2>
        <p className="text-indigo-100 mt-1">
          {user?.role === 'admin'
            ? 'You have admin access. Manage users, tasks, and view activity logs.'
            : 'Track and manage your tasks from your personal dashboard.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/tasks"
            className="flex items-center gap-1 bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
          >
            <FiList /> My Tasks <FiArrowRight />
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1 bg-indigo-800 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-900 transition-colors"
            >
              Admin Dashboard <FiArrowRight />
            </Link>
          )}
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link to="/tasks" className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">My Tasks</p>
              <p className="text-lg font-semibold text-gray-800 mt-1">View all your tasks</p>
            </div>
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full group-hover:bg-indigo-200 transition-colors">
              <FiList className="text-xl" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">{user?.role}</p>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <FiCheckCircle className="text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">{user?.status}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <FiTrendingUp className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Getting started tips */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiClock className="text-indigo-600" /> Quick Actions
        </h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <FiArrowRight className="text-indigo-400 shrink-0" />
            <Link to="/tasks" className="hover:text-indigo-600 hover:underline">
              Go to <strong>My Tasks</strong> to create, update, or delete your tasks
            </Link>
          </li>
          {user?.role === 'admin' && (
            <>
              <li className="flex items-center gap-2">
                <FiArrowRight className="text-indigo-400 shrink-0" />
                <Link to="/admin/users" className="hover:text-indigo-600 hover:underline">
                  Visit <strong>User Management</strong> to manage user accounts
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <FiArrowRight className="text-indigo-400 shrink-0" />
                <Link to="/admin/logs" className="hover:text-indigo-600 hover:underline">
                  Check <strong>Activity Logs</strong> to monitor user activity
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
