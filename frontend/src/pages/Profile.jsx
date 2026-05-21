import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName]                 = useState(user?.name || '');
  const [avatar, setAvatar]             = useState(user?.avatar || '');
  const [currentPassword, setCurrentPw] = useState('');
  const [newPassword, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw]       = useState('');
  const [saving, setSaving]             = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPw) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const updates = { name, avatar };
      if (newPassword) { updates.currentPassword = currentPassword; updates.newPassword = newPassword; }
      await updateProfile(updates);
      toast.success('Profile updated');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="p-6 max-w-2xl mx-auto dark:text-slate-100">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Profile</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Manage your account settings</p>

      {/* Avatar preview */}
      <div className="flex items-center gap-5 mb-8 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        {avatar ? (
          <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover shadow-md" onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {initials}
          </div>
        )}
        <div>
          <p className="text-xl font-bold dark:text-white">{user?.name}</p>
          <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="text-xs font-semibold capitalize bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full mt-1 inline-block">{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiUser className="text-indigo-500" /> Basic Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input value={user?.email} disabled
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar URL</label>
            <input
              value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiLock className="text-indigo-500" /> Change Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Leave blank to keep your current password.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPw(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 w-full justify-center px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50 transition-colors shadow-sm">
          <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
