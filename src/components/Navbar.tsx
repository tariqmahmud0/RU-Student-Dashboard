import React, { useState, useEffect } from 'react';
import { CompanyInfo, StudentInfo, TabType, OthersSubView } from '../types';
import { buildImageUrl, getStudentPhotoUrl } from '../api';
import {
  GraduationCap,
  User,
  Award,
  Receipt,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Building2,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  companyInfo: CompanyInfo | null;
  profile: StudentInfo | null;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  othersSubView?: OthersSubView;
  setOthersSubView?: (sub: OthersSubView) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companyInfo,
  profile,
  activeTab,
  setActiveTab,
  othersSubView = 'directory',
  setOthersSubView,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoUrl = companyInfo
    ? buildImageUrl(companyInfo.logoFileLocation, companyInfo.logoFileName)
    : null;

  const photoUrl = getStudentPhotoUrl(profile);

  // Close mobile drawer on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Desktop & Mobile Nav Items
  const navItems = [
    { id: 'overview' as const, label: 'Overview', shortLabel: 'Overview', icon: Home },
    { id: 'results' as const, label: 'Results & Marks', shortLabel: 'Results', icon: Award },
    { id: 'fees' as const, label: 'Fees History', shortLabel: 'Fees', icon: Receipt },
    { id: 'notices' as const, label: 'Notices', shortLabel: 'Notices', icon: Bell },
    { id: 'directory' as const, label: 'RU Directory', shortLabel: 'Directory', icon: Building2 },
    { id: 'others' as const, label: 'Student Hub', shortLabel: 'Hub', icon: GraduationCap },
  ];

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleOthersSubClick = (sub: OthersSubView) => {
    setActiveTab('others');
    if (setOthersSubView) {
      setOthersSubView(sub);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-slate-100 shadow-xs sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          
          {/* 1. Logo & University Brand (Left) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 min-w-0">
            <button
              onClick={() => handleTabClick('overview')}
              className="flex items-center space-x-2.5 sm:space-x-3 text-left cursor-pointer group focus:outline-none"
              title="Go to Overview Dashboard"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-1 flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/30 group-hover:scale-105 transition-transform">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={companyInfo?.name || "University Logo"}
                    className="w-full h-full object-contain bg-white rounded-lg p-0.5"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-white font-extrabold text-sm sm:text-base tracking-tight">RU</span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm sm:text-base leading-tight text-slate-900 dark:text-white truncate max-w-[160px] xs:max-w-[210px] sm:max-w-none">
                  <span className="hidden sm:inline">{companyInfo?.name || "University of Rajshahi"}</span>
                  <span className="sm:hidden">RU Student Portal</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-semibold tracking-wide truncate max-w-[160px] xs:max-w-[210px] sm:max-w-none">
                  {companyInfo?.banglaName || "রাজশাহী বিশ্ববিদ্যালয়"}
                  <span className="hidden md:inline text-slate-400 dark:text-slate-500 font-normal"> • Student Portal</span>
                </p>
              </div>
            </button>
          </div>

          {/* 2. Desktop Navigation Links (Center - Hidden on < lg to prevent wrapping/breaking) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.id === 'directory'
                  ? activeTab === 'directory' || (activeTab === 'others' && othersSubView === 'directory')
                  : item.id === 'others'
                  ? activeTab === 'others' && othersSubView === 'hub'
                  : activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'directory') {
                      handleOthersSubClick('directory');
                    } else if (item.id === 'others') {
                      handleOthersSubClick('hub');
                    } else {
                      handleTabClick(item.id);
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/90 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">{item.shortLabel}</span>
                  {item.id === 'directory' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* 3. Right Side Controls (Desktop >= lg) */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5 shrink-0 pl-1">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent dark:border-slate-800"
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

            {/* User Profile Quick Access */}
            {profile && (
              <button
                onClick={() => handleTabClick('profile')}
                className={`flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-full border transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
                title="View Student Profile"
              >
                <img
                  src={photoUrl || '/assets/default-avatar.svg'}
                  alt={profile.name}
                  className="w-7 h-7 rounded-full object-contain bg-white dark:bg-slate-900 border border-emerald-600/40 shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/default-avatar.svg';
                  }}
                />
                <div className="text-left hidden xl:block leading-none">
                  <p className="text-xs font-bold truncate max-w-[110px]">
                    {profile.name.split(' ')[0] || profile.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                    {profile.studentId}
                  </p>
                </div>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
              title="Logout from student portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>

          {/* 4. Mobile & Tablet Controls (< lg - Never breaks, fits neatly in 1 line) */}
          <div className="flex items-center lg:hidden space-x-1 sm:space-x-1.5 shrink-0">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Toggle Theme"
                aria-label="Toggle dark mode"
              >
                {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            )}

            {profile && (
              <button
                onClick={() => handleTabClick('profile')}
                className={`p-0.5 rounded-full border cursor-pointer transition-all ${
                  activeTab === 'profile'
                    ? 'ring-2 ring-emerald-500 border-emerald-500 scale-105'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                }`}
                title="Student Profile"
              >
                <img
                  src={photoUrl || '/assets/default-avatar.svg'}
                  alt={profile.name}
                  className="w-7 h-7 rounded-full object-contain bg-white dark:bg-slate-900"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/default-avatar.svg';
                  }}
                />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-all cursor-pointer border ml-1 ${
                mobileMenuOpen
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* 5. Mobile & Tablet Drawer Menu (< lg) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 dark:bg-slate-900/98 border-t border-slate-200 dark:border-slate-800 px-4 pt-3 pb-5 space-y-3 shadow-xl backdrop-blur-md animate-in slide-in-from-top duration-200">
          {profile && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-slate-800/80 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={photoUrl || '/assets/default-avatar.svg'}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-contain bg-white dark:bg-slate-900 border-2 border-emerald-500 shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/assets/default-avatar.svg';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ID: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{profile.studentId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleTabClick('profile')}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 cursor-pointer shadow-2xs"
              >
                Profile
              </button>
            </div>
          )}

          {/* Nav List */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.id === 'directory'
                  ? activeTab === 'directory' || (activeTab === 'others' && othersSubView === 'directory')
                  : item.id === 'others'
                  ? activeTab === 'others' && othersSubView === 'hub'
                  : activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'directory') {
                      handleOthersSubClick('directory');
                    } else if (item.id === 'others') {
                      handleOthersSubClick('hub');
                    } else {
                      handleTabClick(item.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'directory' && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                      Directory
                    </span>
                  )}
                  {item.id === 'others' && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'}`}>
                      Tools
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout from Student Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
