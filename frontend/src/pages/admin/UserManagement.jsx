import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiTrash2, FiToggleLeft, FiToggleRight, FiSearch, FiUsers, FiPlus, FiX } from 'react-icons/fi';

const CATEGORIES = ['Work', 'Personal', 'Urgent', 'Other'];
const AVATAR_COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];
const getAvatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignTarget, setAssignTarget] = useState(null); // user to assign to
  const [assignForm, setAssignForm] = useState({ title: '', description: '', priority: 'medium', category: 'Work', dueDate: '' });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (userId, email) => {
    if (!window.confirm(`Delete user "${email}" and all their tasks?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await api.post('/admin/tasks/assign', { ...assignForm, assignedTo: assignTarget._id });
      toast.success(`Task assigned to ${assignTarget.name}`);
      setAssignTarget(null);
      setAssignForm({ title: '', description: '', priority: 'medium', category: 'Work', dueDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign task');
    } finally { setAssigning(false); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-200 dark:ring-indigo-500/20 rounded-lg flex items-center justify-center">
            <FiUsers className="text-indigo-600 dark:text-indigo-400 text-sm" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-sm text-slate-500 dark:text-[#9494b8]">{users.length} registered users</p>
          </div>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:border-transparent w-64 bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-[#52527a]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f1028] rounded-xl border border-slate-200 dark:border-white/[0.07] overflow-hidden shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_rgba(0,0,0,0.5)]">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0b0c24] border-b border-slate-200 dark:border-white/[0.07]">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-[#52527a] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-[#52527a] text-sm">No users found</td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-[#151630]/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${getAvatarColor(user.name)} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-400 dark:text-[#52527a]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ring-1 ${
                      user.role === 'admin'
                        ? 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20'
                        : 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ring-1 capitalize ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20'
                        : 'bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-[#9494b8]">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    {user.role !== 'admin' ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setAssignTarget(user)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                          title="Assign task"
                        >
                          <FiPlus className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'active'
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                              : 'text-slate-400 dark:text-[#52527a] hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? <FiToggleRight className="text-lg" /> : <FiToggleLeft className="text-lg" />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.email)}
                          className="p-1.5 rounded-lg text-slate-400 dark:text-[#52527a] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete user"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300 dark:text-[#52527a] px-1">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Task Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1028] rounded-2xl shadow-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.7)] border border-slate-100 dark:border-white/[0.07] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.07]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assign Task to {assignTarget.name}</h2>
              <button onClick={() => setAssignTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleAssign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1">Title *</label>
                <input required value={assignForm.title} onChange={e => setAssignForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-[#52527a]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1">Description</label>
                <textarea rows={3} value={assignForm.description} onChange={e => setAssignForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1">Priority</label>
                  <select value={assignForm.priority} onChange={e => setAssignForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1028] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500/50">
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1">Category</label>
                  <select value={assignForm.category} onChange={e => setAssignForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0f1028] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500/50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1">Due Date</label>
                <input type="date" value={assignForm.dueDate} onChange={e => setAssignForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500/50" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAssignTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={assigning}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 transition-colors">
                  {assigning ? 'Assigning…' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
