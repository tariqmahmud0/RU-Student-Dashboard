import React, { useState } from 'react';
import { CompanyInfo, StudentInfo } from '../types';
import { buildImageUrl, getStudentPhotoUrl } from '../api';
import { GraduationCap, User, Award, Receipt, Bell, LogOut, Menu, X, Home, Building2, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  companyInfo: CompanyInfo | null;
  profile: StudentInfo | null;
  activeTab: 'overview' | 'profile' | 'results' | 'fees' | 'notices';
  setActiveTab: (tab: 'overview' | 'profile' | 'results' | 'fees' | 'notices') => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companyInfo,
  profile,
  activeTab,
  setActiveTab,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoUrl = companyInfo
    ? buildImageUrl(companyInfo.logoFileLocation, companyInfo.logoFileName)
    : null;

  const photoUrl = getStudentPhotoUrl(profile);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'results', label: 'Results & Marks', icon: Award },
    { id: 'fees', label: 'Fees History', icon: Receipt },
    { id: 'notices', label: 'Notices', icon: Bell },
  ] as const;

  const handleTabClick = (tab: 'overview' | 'profile' | 'results' | 'fees' | 'notices') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & University Brand */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-emerald-700 p-1 flex items-center justify-center shrink-0 shadow-sm border border-emerald-800">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyInfo?.name || "University Logo"}
                  className="w-full h-full object-contain bg-white rounded-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-white font-bold text-lg">RU</span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight text-emerald-900 dark:text-emerald-400">
                {companyInfo?.name || "University of Rajshahi"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                {companyInfo?.banglaName || "রাজশাহী বিশ্ববিদ্যালয়"} • Student Portal
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info, Theme Toggle & Logout Button */}
          <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>
            )}

            {profile && (
              <div className="flex items-center space-x-2.5">
                <img
                  src={photoUrl || '/assets/default-avatar.svg'}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-contain bg-slate-50 dark:bg-slate-900 border border-emerald-600/40 shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/default-avatar.svg';
                  }}
                />
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">
                    {profile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    ID: {profile.studentId}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Logout from student portal"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center lg:hidden space-x-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-amber-400" />}
              </button>
            )}
            <button
              onClick={onLogout}
              className="sm:hidden p-2 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-1 shadow-md">
          {profile && (
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">{profile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Student ID: {profile.studentId}</p>
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
