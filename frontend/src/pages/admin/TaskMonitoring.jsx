import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch, FiList } from 'react-icons/fi';

const STATUS = {
  pending:      'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20',
  'in-progress':'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
  completed:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20',
};

const PRIORITY = {
  low:    'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20',
  medium: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20',
  high:   'bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
};

const TaskMonitoring = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    api.get('/admin/tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/admin/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filtered = tasks.filter(t => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-200 dark:ring-blue-500/20 rounded-lg flex items-center justify-center">
            <FiList className="text-blue-600 dark:text-blue-400 text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task Monitoring</h1>
            <p className="text-sm text-slate-500 dark:text-[#9494b8]">{tasks.length} total tasks across all users</p>
          </div>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#52527a] text-sm" />
          <input
            type="text"
            placeholder="Search tasks or users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:border-transparent w-64 bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-[#52527a]"
          />
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-fit mb-6">
        {['all', 'pending', 'in-progress', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              filterStatus === s ? 'bg-white dark:bg-[#0f1028] text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-[#9494b8] hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f1028] rounded-xl border border-slate-200 dark:border-white/[0.07] overflow-hidden shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0b0c24] border-b border-slate-200 dark:border-white/[0.07]">
                  {['Task', 'Created By', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-[#52527a] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400 dark:text-[#52527a] text-sm">No tasks found</td></tr>
                ) : filtered.map(task => (
                  <tr key={task._id} className="hover:bg-slate-50/60 dark:hover:bg-[#151630]/60 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-400 dark:text-[#52527a] truncate mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{task.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 dark:text-[#52527a]">{task.user?.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PRIORITY[task.priority] || ''}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS[task.status] || ''}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-[#9494b8] whitespace-nowrap">
                      {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-[#52527a] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete task"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
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

export default TaskMonitoring;
