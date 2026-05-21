import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUsers, FiList, FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '—'}</p>
      </div>
      <div className={`${color} p-3 rounded-full`}>
        <Icon className="text-xl" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setAnalytics(data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Overview of all users, tasks and activity</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <>
          {/* Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
            <StatCard icon={FiUsers} label="Total Users" value={analytics?.totalUsers} color="bg-indigo-100 text-indigo-600" />
            <StatCard icon={FiList} label="Total Tasks" value={analytics?.totalTasks} color="bg-blue-100 text-blue-600" />
            <StatCard icon={FiCheckCircle} label="Completed" value={analytics?.completedTasks} color="bg-green-100 text-green-600" />
            <StatCard icon={FiClock} label="Pending" value={analytics?.pendingTasks} color="bg-yellow-100 text-yellow-600" />
            <StatCard icon={FiTrendingUp} label="In Progress" value={analytics?.inProgressTasks} color="bg-orange-100 text-orange-600" />
          </div>

          {/* Task breakdown bar */}
          {analytics?.totalTasks > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Task Breakdown</h3>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                {analytics.completedTasks > 0 && (
                  <div
                    className="bg-green-400"
                    style={{ width: `${(analytics.completedTasks / analytics.totalTasks) * 100}%` }}
                    title={`Completed: ${analytics.completedTasks}`}
                  />
                )}
                {analytics.inProgressTasks > 0 && (
                  <div
                    className="bg-orange-400"
                    style={{ width: `${(analytics.inProgressTasks / analytics.totalTasks) * 100}%` }}
                    title={`In Progress: ${analytics.inProgressTasks}`}
                  />
                )}
                {analytics.pendingTasks > 0 && (
                  <div
                    className="bg-yellow-300"
                    style={{ width: `${(analytics.pendingTasks / analytics.totalTasks) * 100}%` }}
                    title={`Pending: ${analytics.pendingTasks}`}
                  />
                )}
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block" /> Completed</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block" /> In Progress</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-300 inline-block" /> Pending</span>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { to: '/admin/users', icon: FiUsers, label: 'User Management', desc: 'View, activate, or delete users', color: 'indigo' },
              { to: '/admin/tasks', icon: FiList, label: 'Task Monitoring', desc: 'View and manage all user tasks', color: 'blue' },
              { to: '/admin/logs', icon: FiActivity, label: 'Activity Logs', desc: 'Monitor login and task activity', color: 'green' },
            ].map(({ to, icon: Icon, label, desc, color }) => (
              <Link
                key={to}
                to={to}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group`}
              >
                <div className={`bg-${color}-100 text-${color}-600 w-10 h-10 rounded-full flex items-center justify-center mb-3`}>
                  <Icon />
                </div>
                <h3 className="font-semibold text-gray-800">{label}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
                <div className={`flex items-center gap-1 text-${color}-600 text-sm font-medium mt-3 group-hover:gap-2 transition-all`}>
                  Go <FiArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
