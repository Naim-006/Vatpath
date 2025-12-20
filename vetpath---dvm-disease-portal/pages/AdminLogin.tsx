import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminLoginProps {
  initialMode?: 'login' | 'forgot' | 'update';
  onSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'forgot' | 'update'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        const { error } = await (supabase.auth as any).signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess();
      }

      if (mode === 'forgot') {
        const { error } = await (supabase.auth as any).resetPasswordForEmail(
          email,
          { redirectTo: 'https://vatpath.vercel.app/' }
        );
        if (error) throw error;
        setMessage('Check your email for the recovery link!');
      }

      if (mode === 'update') {
        const { error } = await (supabase.auth as any).updateUser({
          password,
        });
        if (error) throw error;
        setMessage('Password updated successfully!');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl flex items-center justify-center text-white mx-auto mb-6">
            <Lock size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {mode === 'login'
              ? 'VatPath Login'
              : mode === 'forgot'
              ? 'Account Recovery'
              : 'Update Password'}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Clinical Reference V3.01
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-bold rounded-2xl flex gap-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {message && (
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300 text-xs font-bold rounded-2xl flex gap-3">
              <CheckCircle size={16} /> {message}
            </div>
          )}

          {(mode === 'login' || mode === 'forgot') && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase pl-4">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl dark:text-white"
                  placeholder="doctor@vatpath.com"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'update') && (
            <div className="space-y-2">
              <div className="flex justify-between px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase">
                  {mode === 'update' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-bold text-teal-600"
                  >
                    Forgot?
                  </button>
                )}
              </div>

              <div className="relative">
                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl dark:text-white"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl"
          >
            {loading
              ? 'Processing...'
              : mode === 'login'
              ? 'Authenticate'
              : mode === 'forgot'
              ? 'Send Link'
              : 'Update'}
            <ArrowRight className="inline ml-2" size={18} />
          </button>

          {mode !== 'login' && (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full text-xs font-bold text-slate-400 mt-2"
            >
              Back to Sign In
            </button>
          )}
        </form>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-[10px] text-slate-400 uppercase">Powered by</p>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="https://nextbyte-it.netlify.app/about#team" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
              NextByte iT
            </a>
          </p>
         
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
