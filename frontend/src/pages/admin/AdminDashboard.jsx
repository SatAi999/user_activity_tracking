import { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import { ThemeContext } from '../../context/ThemeContext';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark } = useContext(ThemeContext);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusData = [
    { name: 'Pending',     value: stats?.pendingTasks    || 0 },
    { name: 'In Progress', value: stats?.inProgressTasks || 0 },
    { name: 'Completed',   value: stats?.completedTasks  || 0 },
  ];

  const categoryData = (stats?.byCategory || []).map(c => ({ name: c._id || 'Other', value: c.count }));
  const byDayData    = (stats?.byDay     || []).map(d => ({ date: d._id, Tasks: d.count, Completed: d.completed }));
  const perUserData  = (stats?.perUser   || []).map(u => ({ name: u.name || 'Unknown', Total: u.total, Completed: u.completed }));

  // Theme-aware chart colors
  const gridStroke  = dark ? 'rgba(148,163,184,0.08)' : '#e2e8f0';
  const axisColor   = dark ? '#9494b8' : '#64748b';
  const tooltipStyle = dark
    ? { backgroundColor: '#0f1028', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '10px', color: '#e4e4f4' }
    : { borderRadius: '10px' };

  const statCards = [
    { label: 'Total Users',    value: stats?.totalUsers    || 0,
      light: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
      dark:  'dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20' },
    { label: 'Total Tasks',    value: stats?.totalTasks    || 0,
      light: 'bg-slate-100 text-slate-700 ring-slate-200',
      dark:  'dark:bg-white/5 dark:text-slate-200 dark:ring-white/10' },
    { label: 'Completed',      value: stats?.completedTasks || 0,
      light: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      dark:  'dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20' },
    { label: 'Admin Assigned', value: stats?.adminAssigned || 0,
      light: 'bg-violet-50 text-violet-700 ring-violet-200',
      dark:  'dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20' },
  ];

  const ChartCard = ({ title, children }) => (
    <div className="bg-white dark:bg-[#0f1028] rounded-2xl border border-slate-200 dark:border-white/[0.07] p-5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.5)]">
      <h2 className="font-semibold text-slate-700 dark:text-slate-100 mb-4">{title}</h2>
      {children}
    </div>
  );

  const emptyMsg = (msg = 'No data') => (
    <p className="text-slate-400 dark:text-[#52527a] text-sm text-center mt-10">{msg}</p>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Analytics</h1>
      <p className="text-slate-500 dark:text-[#9494b8] mb-8">Platform-wide task statistics</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`rounded-2xl px-5 py-4 ring-1 ${s.light} ${s.dark}`}>
            <p className="text-sm font-medium opacity-70">{s.label}</p>
            <p className="text-4xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Tasks by Status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: axisColor }} />
              <YAxis tick={{ fontSize: 12, fill: axisColor }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by Category">
          {categoryData.length === 0 ? emptyMsg() : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: axisColor, fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Activity — Last 7 Days">
          {byDayData.length === 0 ? emptyMsg('No recent data') : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={byDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} />
                <YAxis tick={{ fontSize: 12, fill: axisColor }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: axisColor, fontSize: '12px' }} />
                <Line type="monotone" dataKey="Tasks"     stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
                <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="User Productivity">
          {perUserData.length === 0 ? emptyMsg() : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={perUserData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis type="number" tick={{ fontSize: 12, fill: axisColor }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fill: axisColor }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: axisColor, fontSize: '12px' }} />
                <Bar dataKey="Total"     fill="#6366f1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Completed" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
