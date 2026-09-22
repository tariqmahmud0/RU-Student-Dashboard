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
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorAlert } from './components/ErrorAlert';
import { Footer } from './components/Footer';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ru_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [state, setState] = useState<AppState>({
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
  });

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
   * Clears token and student datasets from memory.
   */
  const handleLogout = () => {
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
   * Tab Navigation Switcher
   */
  const setActiveTab = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const setOthersSubView = (subView: import('./types').OthersSubView) => {
    setState((prev) => ({ ...prev, othersSubView: subView }));
  };

  // If not authenticated, render Login Screen
  if (!state.token) {
    return (
      <LoginView
        companyInfo={state.companyInfo}
        onLogin={handleLogin}
        isLoading={authLoading}
        error={state.error}
        theme={theme}
        onToggleTheme={toggleTheme}
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

        {state.activeTab === 'others' && (
          <OthersView
            profile={state.profile}
            results={state.results}
            companyInfo={state.companyInfo}
            othersSubView={state.othersSubView}
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
