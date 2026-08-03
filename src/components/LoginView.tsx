import React, { useState } from 'react';
import { CompanyInfo } from '../types';
import { buildImageUrl } from '../api';
import { GraduationCap, Eye, EyeOff, Lock, User, ShieldCheck, Building2, AlertCircle, Sun, Moon } from 'lucide-react';
import { Footer } from './Footer';

interface LoginViewProps {
  companyInfo: CompanyInfo | null;
  onLogin: (username: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  companyInfo,
  onLogin,
  isLoading,
  error,
  theme = 'light',
  onToggleTheme,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // CAPTCHA State
  const [captchaNum1, setCaptchaNum1] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaNum2, setCaptchaNum2] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaInput, setCaptchaInput] = useState('');

  const logoUrl = companyInfo
    ? buildImageUrl(companyInfo.logoFileLocation, companyInfo.logoFileName)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!username.trim()) {
      setFormError("Please enter your Student ID / Username.");
      return;
    }
    if (!password) {
      setFormError("Please enter your Password.");
      return;
    }

    if (parseInt(captchaInput) !== captchaNum1 + captchaNum2) {
      setFormError("Incorrect CAPTCHA answer. Please try again.");
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
      setCaptchaInput('');
      return;
    }

    await onLogin(username.trim(), password);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors">
      
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Right Theme Toggle */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer flex items-center space-x-2 text-xs font-semibold"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 dark:from-emerald-950/20 via-slate-100/20 dark:via-transparent to-transparent pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* University Brand & Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-700 border border-emerald-800 shadow-md p-2 mb-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyInfo?.name || "University Logo"}
                className="w-full h-full object-contain bg-white rounded-xl p-1"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-white font-extrabold text-2xl">RU</span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
            {companyInfo?.name || "University of Rajshahi"}
          </h2>
          <p className="mt-1 text-base text-emerald-700 dark:text-emerald-400 font-semibold">
            {companyInfo?.banglaName || "রাজশাহী বিশ্ববিদ্যালয়"}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold font-mono">
            Student e-Result & Academic Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
          
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Student Sign In</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your official student credentials to access your e-Result dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {(error || formError) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900 dark:text-rose-200">Authentication Error</p>
                <p className="text-xs mt-0.5 text-rose-700 dark:text-rose-300">{formError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Student ID / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Student ID / Roll Number
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 2310****01"
                  disabled={isLoading}
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                  className="block w-full pl-10 pr-12 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Security Check: What is {captchaNum1} + {captchaNum2}?
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter the sum"
                  disabled={isLoading}
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

          </form>

          {/* Security Banner */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Authenticates directly with RU e-Result API</span>
            </p>
          </div>

        </div>
      </div>
      
      {/* End flex-1 wrapper */}
      </div>

      {/* Footer */}
      <div className="relative z-20">
        <Footer>
          <>
            <p>{companyInfo?.address || "Rajshahi, Bangladesh"}</p>
            <p className="mt-1 sm:mt-0 font-mono text-[11px] text-slate-400 dark:text-slate-500">
              Powered by University of Rajshahi Result Management System
            </p>
          </>
        </Footer>
      </div>
    </div>
  );
};

