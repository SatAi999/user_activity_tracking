import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FiList, FiCheckCircle, FiClock, FiTrendingUp, FiArrowRight, FiPlus, FiZap } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    api.get('/tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => {})
      .finally(() => setLoadingTasks(false));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Total Tasks', value: total, icon: FiList, color: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
    { label: 'Completed', value: completed, icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
    { label: 'In Progress', value: inProgress, icon: FiTrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
    { label: 'Pending', value: pending, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
  ];

  return (
    <div className="px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-base mt-2">
          {user?.role === 'admin' ? "Here's an overview of your workspace." : "Here's a summary of your tasks today."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg, ring }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className={`w-12 h-12 ${bg} ring-1 ${ring} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`${color} text-xl`} />
            </div>
            <p className={`text-4xl font-bold text-slate-900 ${loadingTasks ? 'opacity-30' : ''}`}>
              {loadingTasks ? '—' : value}
            </p>
            <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-base font-semibold text-slate-800">Task Progress</p>
              <p className="text-sm text-slate-400 mt-0.5">{completed} of {total} tasks completed</p>
            </div>
            <span className="text-4xl font-bold text-slate-900">{completionRate}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex gap-6 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Completed ({completed})</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" />In Progress ({inProgress})</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Pending ({pending})</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <p className="text-base font-semibold text-slate-800">Quick Actions</p>
          <Link to="/tasks" className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors group">
            <div className="w-10 h-10 bg-white ring-1 ring-indigo-200 rounded-xl flex items-center justify-center shrink-0">
              <FiPlus className="text-indigo-600 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">New Task</p>
              <p className="text-xs text-slate-500">Create a task</p>
            </div>
            <FiArrowRight className="text-slate-400 group-hover:text-indigo-600 text-base transition-colors" />
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors group">
              <div className="w-10 h-10 bg-white ring-1 ring-violet-200 rounded-xl flex items-center justify-center shrink-0">
                <FiZap className="text-violet-600 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">Admin Panel</p>
                <p className="text-xs text-slate-500">Manage system</p>
              </div>
              <FiArrowRight className="text-slate-400 group-hover:text-violet-600 text-base transition-colors" />
            </Link>
          )}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <p className="text-base font-semibold text-slate-800 mb-4">Account Details</p>
        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Role</p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold capitalize ring-1 ${
              user?.role === 'admin' ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-blue-50 text-blue-700 ring-blue-200'
            }`}>{user?.role}</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Status</p>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 capitalize">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />{user?.status}
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Email</p>
            <p className="text-slate-700 font-semibold text-base">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
