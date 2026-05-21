import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiSearch } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-600',
  high: 'bg-red-100 text-red-600',
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
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Monitoring</h1>
          <p className="text-gray-500 text-sm">{tasks.length} total tasks across all users</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'in-progress', 'completed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Task', 'Created By', 'Priority', 'Status', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No tasks found</td>
                  </tr>
                ) : (
                  filtered.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{task.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{task.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[task.status]}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete task"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskMonitoring;
