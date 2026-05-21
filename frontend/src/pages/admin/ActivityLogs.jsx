import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiActivity } from 'react-icons/fi';

const ACTION_STYLE = {
  LOGIN:               { cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',       dot: 'bg-blue-500' },
  REGISTER:            { cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20', dot: 'bg-indigo-500' },
  TASK_CREATED:        { cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20', dot: 'bg-emerald-500' },
  TASK_UPDATED:        { cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',    dot: 'bg-amber-500' },
  TASK_DELETED:        { cls: 'bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',               dot: 'bg-red-500' },
  USER_STATUS_UPDATED: { cls: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20', dot: 'bg-orange-500' },
  USER_DELETED:        { cls: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-500 dark:ring-red-500/20',               dot: 'bg-red-600' },
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    api.get('/admin/logs')
      .then(({ data }) => setLogs(data))
      .catch(() => toast.error('Failed to load logs'))
      .finally(() => setLoading(false));
  }, []);

  const actions = ['all', 'LOGIN', 'REGISTER', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED'];

  const filtered = logs.filter(log => {
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchSearch =
      log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-200 dark:ring-emerald-500/20 rounded-lg flex items-center justify-center">
            <FiActivity className="text-emerald-600 dark:text-emerald-400 text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
            <p className="text-sm text-slate-500 dark:text-[#9494b8]">{logs.length} recent activity records</p>
          </div>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#52527a] text-sm" />
          <input
            type="text"
            placeholder="Search by user or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:border-transparent w-64 bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-[#52527a]"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {actions.map(a => (
          <button
            key={a}
            onClick={() => setFilterAction(a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterAction === a
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-[#9494b8] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10'
            }`}
          >
            {a === 'all' ? 'All Events' : a.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
            <FiActivity className="text-2xl text-slate-400 dark:text-[#52527a]" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">No activity logs found</p>
          <p className="text-slate-400 dark:text-[#52527a] text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f1028] rounded-xl border border-slate-200 dark:border-white/[0.07] overflow-hidden shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b0c24] border-b border-slate-200 dark:border-white/[0.07]">
                  {['Event', 'User', 'Details', 'IP Address', 'Time'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-[#52527a] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {filtered.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/60 dark:hover:bg-[#151630]/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${ACTION_STYLE[log.action]?.cls || 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-white/10'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ACTION_STYLE[log.action]?.dot || 'bg-slate-400'}`} />
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{log.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 dark:text-[#52527a]">{log.user?.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                      <span className="line-clamp-1">{log.details || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-[#9494b8] font-mono">{log.ipAddress || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-[#9494b8] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
