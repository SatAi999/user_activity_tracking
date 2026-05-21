import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiCheckSquare, FiArrowRight, FiShield, FiBarChart2, FiUsers, FiUser } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[45%] bg-slate-950 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-slate-950 to-violet-950/40" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <FiCheckSquare className="text-white text-lg" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage tasks.<br />
            Track activity.<br />
            <span className="text-indigo-400">Stay in control.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            A role-based access control system with full activity tracking and admin oversight.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: FiShield, title: 'Role-based access', desc: 'Admin and user roles with protected routes' },
            { icon: FiBarChart2, title: 'Real-time analytics', desc: 'Task and user statistics at a glance' },
            { icon: FiUsers, title: 'User management', desc: 'Activate, deactivate, or remove users' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/25 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="text-indigo-400 text-sm" />
              </div>
              <div>
                <p className="text-slate-200 text-sm font-medium">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#06071a]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FiCheckSquare className="text-white text-sm" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">TaskFlow</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-slate-500 dark:text-[#9494b8] text-sm mb-6">Enter your credentials to continue</p>

          {/* Role selector */}
          <div className="flex gap-3 mb-6">
            {[{ value: 'user', icon: FiUser, label: 'User' }, { value: 'admin', icon: FiShield, label: 'Admin' }].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  role === value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#9494b8] hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="text-sm" />
                {label}
              </button>
            ))}
          </div>

          {/* Inline error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1.5">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#52527a] text-sm" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:border-transparent bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-[#52527a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-[#9494b8] mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#52527a] text-sm" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 focus:border-transparent bg-white dark:bg-white/5 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign in <FiArrowRight /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-[#9494b8] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
