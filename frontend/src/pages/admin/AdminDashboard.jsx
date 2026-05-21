import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiUsers, FiList, FiActivity, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiBarChart2 } from 'react-icons/fi';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setAnalytics(data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const completionRate = analytics?.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
    : 0;

  const stats = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, icon: FiUsers, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
    { label: 'Total Tasks', value: analytics.totalTasks, icon: FiList, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
    { label: 'Completed', value: analytics.completedTasks, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
    { label: 'In Progress', value: analytics.inProgressTasks, icon: FiTrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-200' },
    { label: 'Pending', value: analytics.pendingTasks, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  ] : [];

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 bg-violet-50 ring-1 ring-violet-200 rounded-lg flex items-center justify-center">
            <FiBarChart2 className="text-violet-600 text-sm" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Overview</h1>
        </div>
        <p className="text-slate-500 text-sm pl-10">System-wide analytics and management</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {stats.map(({ label, value, icon: Icon, color, bg, ring }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className={`w-9 h-9 ${bg} ring-1 ${ring} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`${color} text-sm`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {analytics?.totalTasks > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Task Completion Rate</p>
                <span className="text-xl font-bold text-slate-900">{completionRate}%</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 gap-px">
                {analytics.completedTasks > 0 && (
                  <div className="bg-emerald-400" style={{ width: `${(analytics.completedTasks / analytics.totalTasks) * 100}%` }} />
                )}
                {analytics.inProgressTasks > 0 && (
                  <div className="bg-orange-400" style={{ width: `${(analytics.inProgressTasks / analytics.totalTasks) * 100}%` }} />
                )}
                {analytics.pendingTasks > 0 && (
                  <div className="bg-amber-300" style={{ width: `${(analytics.pendingTasks / analytics.totalTasks) * 100}%` }} />
                )}
              </div>
              <div className="flex gap-5 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Completed ({analytics.completedTasks})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" />In Progress ({analytics.inProgressTasks})</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-300" />Pending ({analytics.pendingTasks})</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { to: '/admin/users', icon: FiUsers, label: 'User Management', desc: 'View, activate, or delete users', bg: 'bg-indigo-50', ring: 'ring-indigo-200', ic: 'text-indigo-600', hover: 'hover:border-indigo-300' },
              { to: '/admin/tasks', icon: FiList, label: 'Task Monitoring', desc: 'View and manage all user tasks', bg: 'bg-blue-50', ring: 'ring-blue-200', ic: 'text-blue-600', hover: 'hover:border-blue-300' },
              { to: '/admin/logs', icon: FiActivity, label: 'Activity Logs', desc: 'Monitor login and task activity', bg: 'bg-emerald-50', ring: 'ring-emerald-200', ic: 'text-emerald-600', hover: 'hover:border-emerald-300' },
            ].map(({ to, icon: Icon, label, desc, bg, ring, ic, hover }) => (
              <Link
                key={to}
                to={to}
                className={`group bg-white rounded-xl border border-slate-200 ${hover} p-5 hover:shadow-md transition-all shadow-sm`}
              >
                <div className={`w-10 h-10 ${bg} ring-1 ${ring} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`${ic} text-base`} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{label}</h3>
                <p className="text-xs text-slate-500 mb-3">{desc}</p>
                <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-indigo-500 transition-colors font-medium">
                  View all <FiArrowRight className="text-xs" />
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
