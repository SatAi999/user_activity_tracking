import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiLock, FiMessageCircle, FiSend, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

const STATUS_MAP = {
  pending:     { label: 'Pending',     cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  completed:   { label: 'Completed',   cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
};
const PRIORITY_MAP = {
  low:    { cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200', dot: 'bg-slate-400' },
  medium: { cls: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200', dot: 'bg-orange-400' },
  high:   { cls: 'bg-red-50 text-red-600 ring-1 ring-red-200', dot: 'bg-red-500' },
};
const CATEGORY_MAP = {
  Work:     'bg-indigo-100 text-indigo-700',
  Personal: 'bg-violet-100 text-violet-700',
  Urgent:   'bg-rose-100 text-rose-700',
  Other:    'bg-slate-100 text-slate-600',
};
const CATEGORIES = ['Work', 'Personal', 'Urgent', 'Other'];
const emptyForm = { title: '', description: '', priority: 'medium', status: 'pending', category: 'Other', dueDate: '' };

function isOverdue(task) {
  return task.dueDate && task.status !== 'completed' && new Date(task.dueDate) < new Date();
}

function TaskCard({ task, currentUser, onEdit, onDelete, onStatusChange }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState([]);
  const [loadingC, setLoadingC]         = useState(false);
  const [newComment, setNewComment]     = useState('');
  const [sending, setSending]           = useState(false);

  const overdue     = isOverdue(task);
  const isLocked    = task.isAdminAssigned && currentUser?.role !== 'admin';
  const isOwner     = task.user === currentUser?._id || task.user?._id === currentUser?._id;
  const canDelete   = !task.isAdminAssigned && (isOwner || currentUser?.role === 'admin');

  const loadComments = async () => {
    if (loadingC) return;
    setLoadingC(true);
    try {
      const { data } = await api.get(`/tasks/${task._id}/comments`);
      setComments(data);
    } catch (_) { toast.error('Failed to load comments'); }
    finally { setLoadingC(false); }
  };

  const toggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(s => !s);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { content: newComment });
      setComments(c => [...c, data]);
      setNewComment('');
    } catch (_) { toast.error('Failed to add comment'); }
    finally { setSending(false); }
  };

  const assigneeName = task.assignedTo?.name || task.assignedTo;
  const assignerName = task.assignedBy?.name || task.assignedBy;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all hover:shadow-md ${overdue ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {task.isAdminAssigned && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 px-2 py-0.5 rounded-full">
                  <FiLock className="text-[10px]" /> Admin Assigned
                </span>
              )}
              {overdue && (
                <span className="text-[11px] font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
                  ⚠ Overdue
                </span>
              )}
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_MAP[task.category] || CATEGORY_MAP.Other}`}>
                {task.category}
              </span>
            </div>
            <h3 className={`text-[17px] font-semibold leading-tight dark:text-white ${overdue ? 'text-red-700 dark:text-red-400' : 'text-slate-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            {!isLocked && (
              <button onClick={() => onEdit(task)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                <FiEdit2 />
              </button>
            )}
            {isLocked && (
              <button onClick={() => onEdit(task)} title="Update status only" className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                <FiEdit2 />
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(task._id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[task.status]?.cls}`}>
            {STATUS_MAP[task.status]?.label}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_MAP[task.priority]?.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_MAP[task.priority]?.dot}`} />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          {task.dueDate && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${overdue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Assignee info */}
        {assigneeName && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Assigned to <span className="font-medium text-slate-700 dark:text-slate-200">{assigneeName}</span>
            {assignerName && <> by <span className="font-medium">{assignerName}</span></>}
          </p>
        )}

        {/* Comments toggle */}
        <button
          onClick={toggleComments}
          className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <FiMessageCircle />
          {showComments ? 'Hide comments' : 'Comments'}
          {showComments ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {showComments && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 pb-4">
          {loadingC ? (
            <p className="text-xs text-slate-400 py-3">Loading…</p>
          ) : (
            <div className="space-y-3 mt-3">
              {comments.length === 0 && <p className="text-xs text-slate-400">No comments yet.</p>}
              {comments.map(c => (
                <div key={c._id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {c.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{c.user?.name}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{c.content}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={submitComment} className="flex gap-2 mt-3">
            <input
              value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 text-sm px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button disabled={sending || !newComment.trim()} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [filterStatus, setFilterStatus]     = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchTasks = () => {
    api.get('/tasks')
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (t) => {
    setEditTask(t);
    setForm({
      title: t.title, description: t.description || '',
      priority: t.priority, status: t.status,
      category: t.category || 'Other',
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) payload.dueDate = null;
      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks(ts => ts.map(t => t._id === data._id ? data : t));
        toast.success('Task updated');
      } else {
        const { data } = await api.post('/tasks', payload);
        setTasks(ts => [data, ...ts]);
        toast.success('Task created');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving task');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(ts => ts.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const isLocked = editTask?.isAdminAssigned && user?.role !== 'admin';

  const filtered = tasks.filter(t => {
    const sMatch = filterStatus === 'all' || t.status === filterStatus;
    const cMatch = filterCategory === 'all' || t.category === filterCategory;
    return sMatch && cMatch;
  });

  const counts = { all: tasks.length };
  tasks.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });

  const catCounts = { all: tasks.length };
  tasks.forEach(t => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });

  return (
    <div className="p-6 max-w-6xl mx-auto dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{tasks.length} tasks total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <FiPlus /> New Task
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {[['all', 'All'], ['pending', 'Pending'], ['in-progress', 'In Progress'], ['completed', 'Completed']].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterStatus === val
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            }`}
          >
            {lbl} <span className="opacity-60">({counts[val] || 0})</span>
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['all', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterCategory === cat
                ? 'bg-violet-600 text-white shadow'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-300'
            }`}
          >
            {cat === 'all' ? 'All Categories' : cat} ({catCounts[cat] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-lg font-medium">No tasks found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={user}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold dark:text-white">{editTask ? 'Edit Task' : 'Create Task'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {isLocked && (
                <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
                  <FiLock /> Admin-assigned task — you can only update the status.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  disabled={isLocked}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                />
              </div>
              {!isLocked && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    disabled={isLocked}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              {!isLocked && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 transition-colors">
                  {saving ? 'Saving…' : editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
