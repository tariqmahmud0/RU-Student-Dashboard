import React, { useState, useEffect } from 'react';
import {
  CompanyInfo,
  StudentInfo,
  SemesterResult,
  FeeItem,
  NoticeItem,
  AppState,
  TabType,
} from './types';
import {
  getCompanyInfo,
  loginStudent,
  discoverStudentInfoId,
  getStudentProfile,
  getCourseMarks,
  getFeeRecords,
  getRecentNotices,
  getHallNotices,
} from './api';

import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { OverviewView } from './components/OverviewView';
import { ProfileView } from './components/ProfileView';
import { ResultsView } from './components/ResultsView';
import { FeesView } from './components/FeesView';
import { NoticesView } from './components/NoticesView';
import { OthersView } from './components/OthersView';
import { RuDirectory } from './components/RuDirectory';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorAlert } from './components/ErrorAlert';
import { Footer } from './components/Footer';
import { Building2, ArrowLeft, Sun, Moon } from 'lucide-react';

const STORAGE_KEYS = {
  TOKEN: 'ru_auth_token',
  STUDENT_INFO_ID: 'ru_student_info_id',
  PROFILE: 'ru_student_profile',
  RESULTS: 'ru_results',
  FEES: 'ru_fees',
  RECENT_NOTICES: 'ru_recent_notices',
  HALL_NOTICES: 'ru_hall_notices',
  ACTIVE_TAB: 'ru_active_tab',
};

function getInitialState(): AppState {
  const defaultState: AppState = {
    token: null,
    studentInfoId: null,
    companyInfo: null,
    profile: null,
    results: [],
    fees: [],
    recentNotices: [],
    hallNotices: [],
    activeTab: 'overview',
    othersSubView: 'directory',
    isLoading: false,
    error: null,
  };

  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const studentInfoIdStr = localStorage.getItem(STORAGE_KEYS.STUDENT_INFO_ID);

    if (token && studentInfoIdStr) {
      const studentInfoId = parseInt(studentInfoIdStr, 10);
      const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || 'null');
      const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
      const fees = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEES) || '[]');
      const recentNotices = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_NOTICES) || '[]');
      const hallNotices = JSON.parse(localStorage.getItem(STORAGE_KEYS.HALL_NOTICES) || '[]');
      const activeTab = (localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as TabType) || 'overview';

      return {
        ...defaultState,
        token,
        studentInfoId,
        profile,
        results,
        fees,
        recentNotices,
        hallNotices,
        activeTab: activeTab || 'overview',
      };
    }
  } catch (_e) {
    // Fall back to default
  }

  return defaultState;
}

function saveSession(data: {
  token: string;
  studentInfoId: number;
  profile?: any;
  results?: any[];
  fees?: any[];
  recentNotices?: any[];
  hallNotices?: any[];
}) {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.STUDENT_INFO_ID, String(data.studentInfoId));
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
    if (data.results) localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(data.results));
    if (data.fees) localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(data.fees));
    if (data.recentNotices) localStorage.setItem(STORAGE_KEYS.RECENT_NOTICES, JSON.stringify(data.recentNotices));
    if (data.hallNotices) localStorage.setItem(STORAGE_KEYS.HALL_NOTICES, JSON.stringify(data.hallNotices));
  } catch (_e) {}
}

function clearSession() {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (_e) {}
}

export default function App() {
  const [isGuestDirectoryOpen, setIsGuestDirectoryOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ru_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [state, setState] = useState<AppState>(getInitialState);

  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Apply dark mode class to root document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ru_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load public University Info on initial mount
  useEffect(() => {
    let isMounted = true;
    getCompanyInfo().then((info) => {
      if (isMounted) {
        setState((prev) => ({ ...prev, companyInfo: info }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Silently revalidate latest student data in background on mount if restored from saved session
  useEffect(() => {
    const savedToken = state.token;
    const savedId = state.studentInfoId;
    if (!savedToken || !savedId) return;

    let isMounted = true;
    Promise.all([
      getStudentProfile(savedToken, savedId).catch(() => null),
      getCourseMarks(savedToken, savedId).catch(() => null),
      getFeeRecords(savedToken, savedId).catch(() => null),
      getRecentNotices(savedToken).catch(() => null),
      getHallNotices(savedToken).catch(() => null),
    ]).then(([freshProfile, freshResults, freshFees, freshRecentNotices, freshHallNotices]) => {
      if (!isMounted) return;
      if (freshProfile) {
        setState((prev) => ({
          ...prev,
          profile: freshProfile,
          results: freshResults && freshResults.length ? freshResults : prev.results,
          fees: freshFees && freshFees.length ? freshFees : prev.fees,
          recentNotices: freshRecentNotices && freshRecentNotices.length ? freshRecentNotices : prev.recentNotices,
          hallNotices: freshHallNotices && freshHallNotices.length ? freshHallNotices : prev.hallNotices,
        }));
        saveSession({
          token: savedToken,
          studentInfoId: savedId,
          profile: freshProfile,
          results: freshResults || undefined,
          fees: freshFees || undefined,
          recentNotices: freshRecentNotices || undefined,
          hallNotices: freshHallNotices || undefined,
        });
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Universal Login Handler:
   * Authenticates against RU e-Result API, discovers studentInfoId dynamically, and loads student datasets.
   */
  const handleLogin = async (username: string, pass: string) => {
    setAuthLoading(true);
    setState((prev) => ({ ...prev, error: null }));

    try {
      // 1. Authenticate login credentials
      const loginRes = await loginStudent(username, pass);

      if (!loginRes.status || !loginRes.data?.token) {
        setState((prev) => ({
          ...prev,
          error: loginRes.message || "Invalid Student ID or password.",
        }));
        setAuthLoading(false);
        return;
      }

      const jwtToken = loginRes.data.token;

      // 2. Dynamic Student ID Discovery (Crucial Requirement)
      const resolvedStudentInfoId = await discoverStudentInfoId(jwtToken);

      if (!resolvedStudentInfoId) {
        setState((prev) => ({
          ...prev,
          error: "Unable to determine your student profile ID from the university system. Please contact the administrator.",
        }));
        setAuthLoading(false);
        return;
      }

      // 3. Fetch student profile, course marks, fee records, and notices concurrently
      const [profileData, courseMarksData, feeRecordsData, recentNoticesData, hallNoticesData] =
        await Promise.all([
          getStudentProfile(jwtToken, resolvedStudentInfoId),
          getCourseMarks(jwtToken, resolvedStudentInfoId),
          getFeeRecords(jwtToken, resolvedStudentInfoId),
          getRecentNotices(jwtToken),
          getHallNotices(jwtToken),
        ]);

      saveSession({
        token: jwtToken,
        studentInfoId: resolvedStudentInfoId,
        profile: profileData,
        results: courseMarksData,
        fees: feeRecordsData,
        recentNotices: recentNoticesData,
        hallNotices: hallNoticesData,
      });

      setState((prev) => ({
        ...prev,
        token: jwtToken,
        studentInfoId: resolvedStudentInfoId,
        profile: profileData,
        results: courseMarksData,
        fees: feeRecordsData,
        recentNotices: recentNoticesData,
        hallNotices: hallNoticesData,
        activeTab: 'overview',
        error: null,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "An unexpected error occurred during authentication.",
      }));
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Secure Logout:
   * Clears token and student datasets from storage and memory.
   */
  const handleLogout = () => {
    clearSession();
    setState((prev) => ({
      ...prev,
      token: null,
      studentInfoId: null,
      profile: null,
      results: [],
      fees: [],
      recentNotices: [],
      hallNotices: [],
      activeTab: 'overview',
      error: null,
    }));
  };

  /**
   * Tab Navigation Switcher (Persists active tab in storage)
   */
  const setActiveTab = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
    } catch (_e) {}
  };

  const setOthersSubView = (subView: import('./types').OthersSubView) => {
    setState((prev) => ({ ...prev, othersSubView: subView }));
  };

  // If not authenticated, render Login Screen or Guest RU Directory
  if (!state.token) {
    if (isGuestDirectoryOpen) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors">
          <header className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 p-2 flex items-center justify-center shrink-0 shadow-sm border border-emerald-800">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-base sm:text-lg leading-tight text-emerald-900 dark:text-emerald-400">
                      {state.companyInfo?.name || "University of Rajshahi"}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Public Offices & Personnel Directory • রাজশাহী বিশ্ববিদ্যালয়
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Toggle Theme"
                  >
                    {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
                  </button>
                  <button
                    onClick={() => setIsGuestDirectoryOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Student Login</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
            <RuDirectory profile={null} />
          </main>

          <Footer>
            <>
              <p>© {new Date().getFullYear()} {state.companyInfo?.name || "University of Rajshahi"}. Public Directory.</p>
              <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                Official RU Profile & Directory Integration
              </p>
            </>
          </Footer>
        </div>
      );
    }

    return (
      <LoginView
        companyInfo={state.companyInfo}
        onLogin={handleLogin}
        isLoading={authLoading}
        error={state.error}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenDirectory={() => setIsGuestDirectoryOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white transition-colors">
      
      {/* Navbar Header */}
      <Navbar
        companyInfo={state.companyInfo}
        profile={state.profile}
        activeTab={state.activeTab}
        setActiveTab={setActiveTab}
        othersSubView={state.othersSubView}
        setOthersSubView={setOthersSubView}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        
        {/* Error Banner if any runtime fetch fails */}
        {state.error && (
          <div className="mb-6">
            <ErrorAlert
              message={state.error}
              onRetry={() => {
                if (state.token && state.studentInfoId) {
                  // Retry loading datasets
                  getStudentProfile(state.token, state.studentInfoId).then((p) =>
                    setState((prev) => ({ ...prev, profile: p }))
                  );
                }
              }}
            />
          </div>
        )}

        {/* Dynamic View Tab Content */}
        {state.activeTab === 'overview' && (
          <OverviewView
            profile={state.profile}
            results={state.results}
            fees={state.fees}
            notices={state.recentNotices}
            setActiveTab={setActiveTab}
          />
        )}

        {state.activeTab === 'profile' && (
          <ProfileView profile={state.profile} />
        )}

        {state.activeTab === 'results' && (
          <ResultsView
            results={state.results}
            profile={state.profile}
            companyInfo={state.companyInfo}
          />
        )}

        {state.activeTab === 'fees' && (
          <FeesView
            fees={state.fees}
            profile={state.profile}
            companyInfo={state.companyInfo}
            token={state.token}
          />
        )}

        {state.activeTab === 'notices' && (
          <NoticesView
            recentNotices={state.recentNotices}
            hallNotices={state.hallNotices}
          />
        )}

        {(state.activeTab === 'others' || state.activeTab === 'directory') && (
          <OthersView
            profile={state.profile}
            results={state.results}
            companyInfo={state.companyInfo}
            othersSubView={state.activeTab === 'directory' ? 'directory' : state.othersSubView}
            setOthersSubView={setOthersSubView}
          />
        )}

      </main>

      {/* Footer */}
      <Footer>
        <>
          <p>
            © {new Date().getFullYear()} {state.companyInfo?.name || "University of Rajshahi"}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
            Secure Student Portal • e-Result System Integration
          </p>
        </>
      </Footer>

    </div>
  );
}
