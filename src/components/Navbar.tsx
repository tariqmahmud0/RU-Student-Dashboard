import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  ChevronDown,
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
  const [othersDropdownOpen, setOthersDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logoUrl = companyInfo
    ? buildImageUrl(companyInfo.logoFileLocation, companyInfo.logoFileName)
    : null;

  const photoUrl = getStudentPhotoUrl(profile);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOthersDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setOthersDropdownOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Desktop Nav Items (Excluding Others which has its own dropdown)
  const mainNavItems = [
    { id: 'overview' as const, label: 'Overview', icon: Home },
    { id: 'results' as const, label: 'Results & Marks', icon: Award },
    { id: 'fees' as const, label: 'Fees History', icon: Receipt },
    { id: 'notices' as const, label: 'Notices', icon: Bell },
  ];

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setOthersDropdownOpen(false);
  };

  const handleOthersSubClick = (sub: OthersSubView) => {
    setActiveTab('others');
    if (setOthersSubView) {
      setOthersSubView(sub);
    }
    setMobileMenuOpen(false);
    setOthersDropdownOpen(false);
  };

  const isOthersActive = activeTab === 'others' || activeTab === 'directory';

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

          {/* 2. Desktop Navigation Links with Others Dropdown (Center) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 shrink-0">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/90 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Others Dropdown Button containing RU Directory & Student Hub */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOthersDropdownOpen(!othersDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isOthersActive
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/90 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-700/50'
                }`}
                title="RU Directory & Student Tools"
                aria-expanded={othersDropdownOpen}
              >
                <Layers className={`w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0 ${isOthersActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>Others</span>
                <ChevronDown className={`w-3 h-3 xl:w-3.5 xl:h-3.5 transition-transform duration-150 ${othersDropdownOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
              </button>

              {/* Others Dropdown Popover */}
              {othersDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      University Resources & Tools
                    </p>
                  </div>

                  {/* Option 1: RU Offices & Directory */}
                  <button
                    onClick={() => handleOthersSubClick('directory')}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 cursor-pointer ${
                      activeTab === 'directory' || (activeTab === 'others' && othersSubView === 'directory')
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold leading-snug">RU Directory</p>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                          Live
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        অফিস ও শিক্ষক-কর্মকর্তা ডিরেক্টরি
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Student Hub & Academic Tools */}
                  <button
                    onClick={() => handleOthersSubClick('hub')}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 cursor-pointer mt-1 ${
                      activeTab === 'others' && othersSubView === 'hub'
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-snug">Student Hub</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        CGPA ক্যালকুলেটর, বীমা ও পোর্টাল টুলস
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Others Category with direct sub-links */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Others & Resources
            </p>
            
            <div className="space-y-1">
              <button
                onClick={() => handleOthersSubClick('directory')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'directory' || (activeTab === 'others' && othersSubView === 'directory')
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-4 h-4" />
                  <span>RU Directory</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'directory' || (activeTab === 'others' && othersSubView === 'directory')
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  Live
                </span>
              </button>

              <button
                onClick={() => handleOthersSubClick('hub')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'others' && othersSubView === 'hub'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Hub</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'others' && othersSubView === 'hub'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  Tools
                </span>
              </button>
            </div>
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
