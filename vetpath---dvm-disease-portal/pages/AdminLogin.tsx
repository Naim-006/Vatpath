
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

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
        // Addressing Property 'signInWithPassword' does not exist error via type assertion
        const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else if (mode === 'forgot') {
        // Addressing Property 'resetPasswordForEmail' does not exist error via type assertion
        const { error } = await (supabase.auth as any).resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '#recovery',
        });
        if (error) throw error;
        setMessage('Check your email for the recovery link!');
      } else if (mode === 'update') {
        // Addressing Property 'updateUser' does not exist error via type assertion
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
    <div className="min-h-[70vh] flex items-center justify-center animate-in slide-in-from-bottom-4 duration-500 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xl font-black mx-auto mb-4">V</div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-white">
            {mode === 'login' ? 'DVM Secure Login' : mode === 'forgot' ? 'Recover Password' : 'Set New Password'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">Professional Veterinary Registry Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[11px] font-semibold rounded-lg border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[11px] font-semibold rounded-lg border border-teal-100 dark:border-teal-800">
              {message}
            </div>
          )}
          
          {(mode === 'login' || mode === 'forgot') && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all dark:text-white"
                placeholder="dvm@clinic.com"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'update') && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {mode === 'update' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-teal-600 hover:text-teal-700 uppercase">Forgot?</button>
                )}
              </div>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Authenticate' : mode === 'forgot' ? 'Send Recovery Link' : 'Update Password'}
          </button>

          {mode !== 'login' && (
            <button 
              type="button" onClick={() => setMode('login')}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Back to Sign In
            </button>
          )}
        </form>

        <p className="mt-8 text-center text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
          Authorized Personnel Only.<br/>Account management via Supabase.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
