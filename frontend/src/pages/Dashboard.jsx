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

  const total       = tasks.length;
  const completed   = tasks.filter(t => t.status === 'completed').length;
  const inProgress  = tasks.filter(t => t.status === 'in-progress').length;
  const pending     = tasks.filter(t => t.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    {
      label: 'Total Tasks', value: total,
      icon: FiList,
      light: { icon: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200', num: 'text-indigo-700' },
      dark:  { icon: 'dark:text-indigo-400', bg: 'dark:bg-indigo-500/10', ring: 'dark:ring-indigo-500/20', num: 'dark:text-indigo-300' },
    },
    {
      label: 'Completed', value: completed,
      icon: FiCheckCircle,
      light: { icon: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', num: 'text-emerald-700' },
      dark:  { icon: 'dark:text-emerald-400', bg: 'dark:bg-emerald-500/10', ring: 'dark:ring-emerald-500/20', num: 'dark:text-emerald-300' },
    },
    {
      label: 'In Progress', value: inProgress,
      icon: FiTrendingUp,
      light: { icon: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', num: 'text-blue-700' },
      dark:  { icon: 'dark:text-blue-400', bg: 'dark:bg-blue-500/10', ring: 'dark:ring-blue-500/20', num: 'dark:text-blue-300' },
    },
    {
      label: 'Pending', value: pending,
      icon: FiClock,
      light: { icon: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', num: 'text-amber-700' },
      dark:  { icon: 'dark:text-amber-400', bg: 'dark:bg-amber-500/10', ring: 'dark:ring-amber-500/20', num: 'dark:text-amber-300' },
    },
  ];

  return (
    <div className="px-8 py-10 w-full">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-[#9494b8] text-base mt-2">
          {user?.role === 'admin' ? "Here's an overview of your workspace." : "Here's a summary of your tasks today."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map(({ label, value, icon: Icon, light, dark }) => (
          <div key={label}
            className="bg-white dark:bg-[#0f1028] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-6 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.5)] transition-all hover:shadow-md dark:hover:bg-[#151630] dk-card">
            <div className={`w-12 h-12 ${light.bg} ${dark.bg} ring-1 ${light.ring} ${dark.ring} rounded-xl flex items-center justify-center mb-4`}>
              <Icon className={`${light.icon} ${dark.icon} text-xl`} />
            </div>
            <p className={`text-4xl font-bold text-slate-900 ${dark.num} ${loadingTasks ? 'opacity-30' : ''}`}>
              {loadingTasks ? '—' : value}
            </p>
            <p className="text-sm text-slate-500 dark:text-[#9494b8] mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 bg-white dark:bg-[#0f1028] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-6 shadow-sm dk-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Task Progress</p>
              <p className="text-sm text-slate-400 dark:text-[#52527a] mt-0.5">{completed} of {total} tasks completed</p>
            </div>
            <span className="text-4xl font-bold text-slate-900 dark:text-white">{completionRate}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          {/* progress glow in dark */}
          <div className="flex gap-6 mt-4 text-sm text-slate-500 dark:text-[#9494b8]">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:shadow-[0_0_6px_rgba(52,211,153,0.6)]" />Completed ({completed})</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 dark:shadow-[0_0_6px_rgba(96,165,250,0.6)]" />In Progress ({inProgress})</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:shadow-[0_0_6px_rgba(251,191,36,0.6)]" />Pending ({pending})</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f1028] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-6 shadow-sm dk-card flex flex-col gap-4">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Quick Actions</p>
          <Link to="/tasks" className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-transparent dark:border-indigo-500/20 transition-all group">
            <div className="w-10 h-10 bg-white dark:bg-indigo-500/15 ring-1 ring-indigo-200 dark:ring-indigo-500/30 rounded-xl flex items-center justify-center shrink-0">
              <FiPlus className="text-indigo-600 dark:text-indigo-400 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">New Task</p>
              <p className="text-xs text-slate-500 dark:text-[#52527a]">Create a task</p>
            </div>
            <FiArrowRight className="text-slate-400 dark:text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-base transition-colors" />
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border border-transparent dark:border-violet-500/20 transition-all group">
              <div className="w-10 h-10 bg-white dark:bg-violet-500/15 ring-1 ring-violet-200 dark:ring-violet-500/30 rounded-xl flex items-center justify-center shrink-0">
                <FiZap className="text-violet-600 dark:text-violet-400 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Admin Panel</p>
                <p className="text-xs text-slate-500 dark:text-[#52527a]">Manage system</p>
              </div>
              <FiArrowRight className="text-slate-400 dark:text-violet-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 text-base transition-colors" />
            </Link>
          )}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white dark:bg-[#0f1028] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-6 shadow-sm dk-card">
        <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Account Details</p>
        <div className="flex flex-wrap gap-10 text-sm">
          <div>
            <p className="text-slate-400 dark:text-[#52527a] text-xs font-medium mb-1.5 uppercase tracking-wide">Role</p>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold capitalize ring-1 ${
              user?.role === 'admin'
                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-200 dark:ring-violet-500/25'
                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-500/25'
            }`}>{user?.role}</span>
          </div>
          <div>
            <p className="text-slate-400 dark:text-[#52527a] text-xs font-medium mb-1.5 uppercase tracking-wide">Status</p>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/25 capitalize">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:shadow-[0_0_6px_rgba(52,211,153,0.7)]" />{user?.status}
            </span>
          </div>
          <div>
            <p className="text-slate-400 dark:text-[#52527a] text-xs font-medium mb-1.5 uppercase tracking-wide">Email</p>
            <p className="text-slate-700 dark:text-slate-200 font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-[#52527a] text-xs font-medium mb-1.5 uppercase tracking-wide">Member since</p>
            <p className="text-slate-700 dark:text-slate-200 font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
