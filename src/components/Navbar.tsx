import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  BookOpen
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
  const [mobileOthersExpanded, setMobileOthersExpanded] = useState(true);
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

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: Home },
    { id: 'profile' as const, label: 'Profile', icon: User },
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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

            {/* Others Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOthersDropdownOpen(!othersDropdownOpen)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'others'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className={`w-4 h-4 ${activeTab === 'others' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>Others</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${othersDropdownOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
              </button>

              {othersDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      University Resources & Tools
                    </p>
                  </div>

                  {/* Option 1: RU Offices & Directory */}
                  <button
                    onClick={() => handleOthersSubClick('directory')}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 cursor-pointer ${
                      activeTab === 'others' && othersSubView === 'directory'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-snug">
                        RU Offices & Directory
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        শিক্ষক ও কর্মকর্তা ডিরেক্টরি (profile.ru.ac.bd)
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Student Hub & Academic Tools */}
                  <button
                    onClick={() => handleOthersSubClick('hub')}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 mt-1 cursor-pointer ${
                      activeTab === 'others' && othersSubView === 'hub'
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-snug">
                        Student Hub & Academic Tools
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        CGPA ক্যালকুলেটর, বীমা, পোর্টাল ও হেল্পলাইন
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* User Info, Theme Toggle & Logout Button */}
          <div className="hidden sm:flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800 cursor-pointer"
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
                className="sm:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
                aria-label="Toggle dark mode"
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

          {/* Mobile Others Category with direct sub-links */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Others & Directory
            </p>
            
            <button
              onClick={() => handleOthersSubClick('directory')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'others' && othersSubView === 'directory'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>🏛️ RU Offices & Directory</span>
            </button>

            <button
              onClick={() => handleOthersSubClick('hub')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === 'others' && othersSubView === 'hub'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>🎓 Student Hub & Tools</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
