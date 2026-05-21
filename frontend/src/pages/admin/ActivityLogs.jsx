import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSearch, FiActivity } from 'react-icons/fi';

const ACTION_COLORS = {
  LOGIN: 'bg-blue-100 text-blue-700',
  REGISTER: 'bg-indigo-100 text-indigo-700',
  TASK_CREATED: 'bg-green-100 text-green-700',
  TASK_UPDATED: 'bg-yellow-100 text-yellow-700',
  TASK_DELETED: 'bg-red-100 text-red-600',
  USER_STATUS_UPDATED: 'bg-orange-100 text-orange-600',
  USER_DELETED: 'bg-red-100 text-red-700',
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

  const filtered = logs.filter((log) => {
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchSearch =
      log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-gray-500 text-sm">{logs.length} recent activity records</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Action filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => setFilterAction(a)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterAction === a ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {a === 'all' ? 'All' : a.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FiActivity className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No activity logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Action', 'User', 'Details', 'IP Address', 'Time'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-700">{log.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{log.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {log.details || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                      {log.ipAddress || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
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
