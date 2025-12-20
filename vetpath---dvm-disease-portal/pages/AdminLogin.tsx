import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Lock, Mail, ArrowRight, UserCheck, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLoginProps {
  initialMode?: 'login' | 'forgot' | 'update';
  onSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ initialMode = 'login', onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'forgot' | 'update'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else if (mode === 'forgot') {
        const { error } = await (supabase.auth as any).resetPasswordForEmail(email, {
          redirectTo: 'https://vatpath.vercel.app/',
        });
        if (error) throw error;
        setMessage('Check your email for the recovery link!');
      } else if (mode === 'update') {
        const { error } = await (supabase.auth as any).updateUser({ password });
        if (error) throw error;
        setMessage('Password updated! You can now access the portal.');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-slide-up px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-teal-500/30 transform transition-transform hover:scale-110 duration-500">
            <Lock size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {mode === 'login' ? 'DVM Secure Portal' : mode === 'forgot' ? 'Account Recovery' : 'Update Credentials'}
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-2">Professional Access Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-bold rounded-2xl flex items-center gap-3 animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300 text-xs font-bold rounded-2xl flex items-center gap-3 animate-fade-in">
              <CheckCircle size={16} />
              {message}
            </div>
          )}

          {(mode === 'login' || mode === 'forgot') && (
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all dark:text-white font-medium placeholder:text-slate-400"
                  placeholder="doctor@vetpath.com"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'update') && (
            <div className="space-y-2 group">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {mode === 'update' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide">Forgot?</button>
                )}
              </div>
              <div className="relative">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all dark:text-white font-medium placeholder:text-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : (
              <>
                {mode === 'login' ? 'Authenticate' : mode === 'forgot' ? 'Send Link' : 'Update'}
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {mode !== 'login' && (
            <button
              type="button" onClick={() => setMode('login')}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
            >
              Back to Sign In
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
