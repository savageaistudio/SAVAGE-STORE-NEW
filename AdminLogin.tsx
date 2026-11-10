import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OFFICIAL_LOGO_PATH, PRIMARY_ADMIN_EMAIL } from '../../lib/firebase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const { loginWithEmail, loginWithGoogle, isAdmin, currentUser } = useAuth();
  const [email, setEmail] = useState(PRIMARY_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in as admin
  React.useEffect(() => {
    if (currentUser && isAdmin) {
      onLoginSuccess();
    }
  }, [currentUser, isAdmin, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error('Admin Google signin error:', err);
      setErrorMsg(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <img
            src={OFFICIAL_LOGO_PATH}
            alt="SAVAGE Logo"
            className="w-16 h-16 rounded-full mx-auto border-2 border-red-600 shadow-md object-cover"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800/60 rounded-full text-[11px] font-bold text-red-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Restricted Admin Portal
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
            SAVAGE STORE Management
          </h1>
          <p className="text-xs text-neutral-400">
            Sign in with authorized administrator credentials to manage products, categories, orders, and store settings.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-red-500 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:border-red-500 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Administrator'}
          </button>
        </form>

        <div className="relative py-1 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <span className="relative bg-neutral-900 px-3 text-[10px] uppercase tracking-wider text-neutral-500">
            Or
          </span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
        >
          <span>Continue with Google</span>
        </button>

        <div className="pt-2 text-center">
          <button
            onClick={onNavigateHome}
            className="text-xs text-neutral-500 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Customer Store
          </button>
        </div>
      </div>
    </div>
  );
};
