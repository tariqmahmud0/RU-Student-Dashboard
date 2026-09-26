import React, { useState, useMemo } from 'react';
import { CourseAttendanceSemester, CourseAttendanceItem, StudentInfo, CompanyInfo } from '../types';
import {
  Layers,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  TrendingUp,
  Info,
  Clock,
  Sparkles,
  Download,
  School,
  GraduationCap,
} from 'lucide-react';

import { TeacherRatingBadge } from './TeacherRatingBadge';
import { TeacherRatingModal } from './TeacherRatingModal';

interface CourseHistoryViewProps {
  courseAttendance: CourseAttendanceSemester[];
  profile: StudentInfo | null;
  companyInfo?: CompanyInfo | null;
}

export const CourseHistoryView: React.FC<CourseHistoryViewProps> = ({
  courseAttendance,
  profile,
  companyInfo,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'courses' | 'guidelines'>('attendance');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDemoIfEmpty, setShowDemoIfEmpty] = useState<boolean>(false);
  const [selectedTeacherForRating, setSelectedTeacherForRating] = useState<{
    name: string;
    courseCode?: string;
    department?: string;
  } | null>(null);

  // Extract distinct semester names
  const availableSemesters = useMemo(() => {
    const sems = new Set<string>();
    courseAttendance.forEach((sem) => {
      const name = sem.master?.yearAndSemesterName || sem.master?.sessionName;
      if (name) sems.add(name);
    });
    return Array.from(sems);
  }, [courseAttendance]);

  // Demo fallback data if student's profile has no published attendance records yet
  const demoAttendance: CourseAttendanceSemester[] = useMemo(() => [
    {
      master: {
        id: 1,
        yearAndSemesterName: profile?.yearAndSemesterName || '4th Year 1st Semester',
        sessionName: profile?.sessionName || '2021-2022',
        programName: profile?.programName || 'B.Sc. Engineering',
        departmentName: profile?.departmentName || 'Information and Communication Engineering',
      },
      detailsList: [
        {
          id: 101,
          courseCode: 'ICE 4111',
          courseTitle: 'Wireless & Mobile Communication',
          courseType: 'Theory',
          courseTeacher: 'Prof. Dr. Md. Tariqul Islam',
          courseCredit: 3.0,
          totalClass: 40,
          totalPresent: 36,
        },
        {
          id: 102,
          courseCode: 'ICE 4112',
          courseTitle: 'Wireless Communication Sessional',
          courseType: 'Sessional',
          courseTeacher: 'Dr. Mohammad Shafiul Alam',
          courseCredit: 1.5,
          totalClass: 14,
          totalPresent: 13,
        },
        {
          id: 103,
          courseCode: 'ICE 4121',
          courseTitle: 'Digital Signal Processing',
          courseType: 'Theory',
          courseTeacher: 'Prof. Dr. Mirza A.F.M. Rashidul Hasan',
          courseCredit: 3.0,
          totalClass: 38,
          totalPresent: 31,
        },
        {
          id: 104,
          courseCode: 'ICE 4122',
          courseTitle: 'Digital Signal Processing Lab',
          courseType: 'Sessional',
          courseTeacher: 'Md. Emran Ali',
          courseCredit: 1.5,
          totalClass: 14,
          totalPresent: 11,
        },
        {
          id: 105,
          courseCode: 'ICE 4131',
          courseTitle: 'Optical Fiber Communication',
          courseType: 'Theory',
          courseTeacher: 'Prof. Dr. Md. Selim Hossain',
          courseCredit: 3.0,
          totalClass: 36,
          totalPresent: 28,
        },
        {
          id: 106,
          courseCode: 'ICE 4100',
          courseTitle: 'Project & Thesis (Phase-I)',
          courseType: 'Project',
          courseTeacher: 'Department Academic Committee',
          courseCredit: 2.0,
          totalClass: 12,
          totalPresent: 12,
        },
      ],
    },
  ], [profile]);

  const rawDisplayList = (courseAttendance && courseAttendance.length > 0)
    ? courseAttendance
    : (showDemoIfEmpty ? demoAttendance : []);

  // Filter by semester and search
  const filteredSemesters = useMemo(() => {
    return rawDisplayList
      .filter((sem) => {
        if (selectedSemester === 'all') return true;
        const name = sem.master?.yearAndSemesterName || sem.master?.sessionName;
        return name === selectedSemester;
      })
      .map((sem) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return sem;

        const filteredCourses = sem.detailsList.filter((c) => {
          const code = (c.courseCode || '').toLowerCase();
          const title = (c.courseTitle || c.courseName || '').toLowerCase();
          const teacher = (c.courseTeacher || c.teacherName || '').toLowerCase();
          const type = (c.courseType || '').toLowerCase();
          return code.includes(query) || title.includes(query) || teacher.includes(query) || type.includes(query);
        });

        return {
          ...sem,
          detailsList: filteredCourses,
        };
      })
      .filter((sem) => sem.detailsList.length > 0);
  }, [rawDisplayList, selectedSemester, searchQuery]);

  // Overall Statistics across all filtered courses
  const stats = useMemo(() => {
    let totalClasses = 0;
    let totalPresent = 0;
    let totalCourses = 0;

    rawDisplayList.forEach((sem) => {
      sem.detailsList.forEach((c) => {
        totalCourses++;
        totalClasses += c.totalClass || 0;
        totalPresent += c.totalPresent || 0;
      });
    });

    const totalAbsent = Math.max(0, totalClasses - totalPresent);
    const overallPct = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    // Collegiate rules according to Rajshahi University ordinances:
    // >= 75%: Collegiate (Eligible)
    // 60% - 74.99%: Non-Collegiate (Eligible with university fine)
    // < 60%: Discollegiate (Not eligible for semester examination)
    let statusCategory: 'collegiate' | 'non-collegiate' | 'discollegiate' = 'collegiate';
    if (totalClasses > 0) {
      if (overallPct >= 75) {
        statusCategory = 'collegiate';
      } else if (overallPct >= 60) {
        statusCategory = 'non-collegiate';
      } else {
        statusCategory = 'discollegiate';
      }
    }

    return {
      totalCourses,
      totalClasses,
      totalPresent,
      totalAbsent,
      overallPct,
      statusCategory,
    };
  }, [rawDisplayList]);

  const getPercentage = (c: CourseAttendanceItem): number => {
    if (typeof c.percentage === 'number') return c.percentage;
    const total = c.totalClass || 0;
    const present = c.totalPresent || 0;
    return total > 0 ? (present / total) * 100 : 0;
  };

  const getStatusBadge = (pct: number, hasClassData: boolean) => {
    if (!hasClassData) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Pending
        </span>
      );
    }
    if (pct >= 75) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
          Collegiate (নিয়মিত)
        </span>
      );
    }
    if (pct >= 60) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600 dark:text-amber-400" />
          Non-Collegiate (অনিয়মিত)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
        <XCircle className="w-3 h-3 mr-1 text-rose-600 dark:text-rose-400" />
        Discollegiate (অযোগ্য)
      </span>
    );
  };

  return (
    <div className="space-y-6">

      {/* 1. Header Banner & Official Portal Integration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md border border-emerald-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Course History & Attendance
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  কোর্সের ইতিহাস ও উপস্থিতি
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Direct integration with University of Rajshahi Exam Portal (<code className="font-mono text-emerald-600 dark:text-emerald-400">exam-portal.ru.ac.bd</code>)
              </p>
            </div>
          </div>

          {/* Quick link button to official exam-portal */}
          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0 w-full md:w-auto">
            <a
              href="https://exam-portal.ru.ac.bd/course-history"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto justify-center inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              <span>RU Exam Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'attendance'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span>Course Attendance (উপস্থিতি)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('courses')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'courses'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Registered Courses (কোর্সসমূহ)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guidelines')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeSubTab === 'guidelines'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>RU Attendance Ordinance (উপস্থিতি নীতিমালা)</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards (When data is available or preview active) */}
      {(courseAttendance.length > 0 || showDemoIfEmpty) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Overall Attendance Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Overall Attendance
              </span>
              <div className={`p-2 rounded-lg ${
                stats.overallPct >= 75
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                  : stats.overallPct >= 60
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                  : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
              }`}>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                stats.overallPct >= 75
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stats.overallPct >= 60
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {stats.overallPct.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                ({stats.totalPresent}/{stats.totalClasses} classes)
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.overallPct >= 75
                    ? 'bg-emerald-500'
                    : stats.overallPct >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, stats.overallPct))}%` }}
              />
            </div>
          </div>

          {/* Card 2: RU Collegiate Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Eligibility Status
              </span>
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
                <School className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              {stats.statusCategory === 'collegiate' && (
                <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Collegiate (নিয়মিত)</span>
                </div>
              )}
              {stats.statusCategory === 'non-collegiate' && (
                <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold text-sm sm:text-base">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Non-Collegiate (অনিয়মিত)</span>
                </div>
              )}
              {stats.statusCategory === 'discollegiate' && (
                <div className="flex items-center space-x-1.5 text-rose-700 dark:text-rose-400 font-bold text-sm sm:text-base">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>Discollegiate (অযোগ্য)</span>
                </div>
              )}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {stats.statusCategory === 'collegiate'
                  ? 'Eligible for examination without penalty'
                  : stats.statusCategory === 'non-collegiate'
                  ? 'Eligible for examination with fine'
                  : 'Requires departmental clearance'}
              </p>
            </div>
          </div>

          {/* Card 3: Classes Attended vs Missed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Present vs Absent
              </span>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-3">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalPresent}
                </span>
                <span className="text-[10px] text-slate-400 block">Attended</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 text-lg">/</span>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {stats.totalAbsent}
                </span>
                <span className="text-[10px] text-slate-400 block">Absent</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Total Recorded: <strong className="text-slate-600 dark:text-slate-300">{stats.totalClasses}</strong> classes
            </p>
          </div>

          {/* Card 4: Total Registered Courses */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Enrolled Courses
              </span>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {stats.totalCourses}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Courses Registered</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Session: <strong className="text-slate-600 dark:text-slate-300">{profile?.sessionName || 'Active'}</strong>
            </p>
          </div>

        </div>
      )}

      {/* 3. Empty State with Informational Banner & Demo Preview Toggle */}
      {courseAttendance.length === 0 && !showDemoIfEmpty && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800/60">
            <Layers className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">
            কোন উপস্থিতি বা কোর্সের তথ্য পাওয়া যায়নি
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
            রাজশাহী বিশ্ববিদ্যালয়ের পরীক্ষার পোর্টাল (<code className="text-emerald-600 dark:text-emerald-400 font-mono">exam-portal.ru.ac.bd</code>)-এ আপনার সংশ্লিষ্ট ডিপার্টমেন্ট বা শিক্ষক কর্তৃক উপস্থিতি এখনো সার্ভারে প্রকাশ করা হয়নি।
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <button
              onClick={() => setShowDemoIfEmpty(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>নমুনা ডেটা দিয়ে ডেমো দেখুন (Preview Demo Layout)</span>
            </button>

            <a
              href="https://exam-portal.ru.ac.bd/course-history"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>এক্সাম পোর্টাল চেক করুন</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 max-w-md mx-auto text-left text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
              উপস্থিতি কবে পাওয়া যায়?
            </p>
            <p>
              সেমিস্টার ফাইনাল পরীক্ষার ফর্ম ফিলাপ চলাকালীন কোর্স শিক্ষকগণ নিয়মিত হাজিরা অনলাইনে এন্ট্রি ও ফাইনাল করেন। তখন অটোমেটিক এই ড্যাশবোর্ডে তা প্রদর্শিত হবে।
            </p>
          </div>
        </div>
      )}

      {/* 4. Controls: Filter by Semester and Search */}
      {(rawDisplayList.length > 0) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code, title, teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-white"
            />
          </div>

          {/* Semester dropdown filter */}
          {availableSemesters.length > 1 && (
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-stretch sm:justify-end">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full sm:w-auto px-3 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 dark:text-white cursor-pointer"
              >
                <option value="all">All Semesters (সকল সেমিস্টার)</option>
                {availableSemesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showDemoIfEmpty && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 text-center">
              Demo Preview Mode Active
            </span>
          )}
        </div>
      )}

      {/* 5. Sub-Tab 1: Course Attendance View */}
      {activeSubTab === 'attendance' && filteredSemesters.length > 0 && (
        <div className="space-y-6">
          {filteredSemesters.map((sem, sIdx) => {
            const semTotalClasses = sem.detailsList.reduce((acc, c) => acc + (c.totalClass || 0), 0);
            const semTotalPresent = sem.detailsList.reduce((acc, c) => acc + (c.totalPresent || 0), 0);
            const semPct = semTotalClasses > 0 ? (semTotalPresent / semTotalClasses) * 100 : 0;

            return (
              <div
                key={sIdx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors"
              >
                {/* Semester Header Bar */}
                <div className="bg-slate-50 dark:bg-slate-800/60 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {sIdx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                        {sem.master?.yearAndSemesterName || `Semester ${sIdx + 1}`}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Session: {sem.master?.sessionName || profile?.sessionName || '—'} • {sem.detailsList.length} Courses
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-start sm:self-auto pl-11 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Semester Average</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {semPct.toFixed(1)}% ({semTotalPresent}/{semTotalClasses})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desktop & Tablet Multi-Column Table View (Screen >= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">
                          <span className="flex items-center space-x-1.5">
                            <span>Course Teacher</span>
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                              Beta
                            </span>
                          </span>
                        </th>
                        <th className="py-3 px-4 text-center">Total Class</th>
                        <th className="py-3 px-4 text-center">Present</th>
                        <th className="py-3 px-4 text-center">Absent</th>
                        <th className="py-3 px-4 min-w-[140px]">Attendance %</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sem.detailsList.map((course, cIdx) => {
                        const total = course.totalClass || 0;
                        const present = course.totalPresent || 0;
                        const absent = Math.max(0, total - present);
                        const pct = getPercentage(course);
                        const hasClassData = total > 0;

                        return (
                          <tr
                            key={cIdx}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            {/* Course Code & Title */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                                {course.courseCode}
                              </div>
                              <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs sm:text-sm mt-0.5">
                                {course.courseTitle || course.courseName || '—'}
                              </div>
                            </td>

                            {/* Course Type */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                course.courseType?.toLowerCase().includes('sessional') || course.courseType?.toLowerCase().includes('lab')
                                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                                  : course.courseType?.toLowerCase().includes('project')
                                  ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                {course.courseType || 'Theory'}
                              </span>
                            </td>

                            {/* Course Teacher & Live Rating Badge */}
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-xs">
                              <div className="flex flex-col items-start gap-1">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {course.courseTeacher || course.teacherName || '—'}
                                </span>
                                {(course.courseTeacher || course.teacherName) && (
                                  <TeacherRatingBadge
                                    teacherName={course.courseTeacher || course.teacherName}
                                    onClick={() =>
                                      setSelectedTeacherForRating({
                                        name: course.courseTeacher || course.teacherName || '',
                                        courseCode: course.courseCode,
                                        department: sem.master?.departmentName,
                                      })
                                    }
                                    size="sm"
                                  />
                                )}
                              </div>
                            </td>

                            {/* Total Class */}
                            <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                              {total || 0}
                            </td>

                            {/* Present */}
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {present || 0}
                            </td>

                            {/* Absent */}
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-500 dark:text-rose-400">
                              {absent}
                            </td>

                            {/* Percentage with Visual Bar */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`font-mono font-bold text-xs ${
                                  pct >= 75
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : pct >= 60
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                  {pct.toFixed(1)}%
                                </span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden min-w-[50px]">
                                  <div
                                    className={`h-full ${
                                      pct >= 75
                                        ? 'bg-emerald-500'
                                        : pct >= 60
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* RU Collegiate Status */}
                            <td className="py-3.5 px-4 text-right">
                              {getStatusBadge(pct, hasClassData)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile-Optimized Card-Based Attendance View (Screen < md) */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {sem.detailsList.map((course, cIdx) => {
                    const total = course.totalClass || 0;
                    const present = course.totalPresent || 0;
                    const absent = Math.max(0, total - present);
                    const pct = getPercentage(course);
                    const hasClassData = total > 0;

                    return (
                      <div key={cIdx} className="p-4 space-y-3">
                        {/* Top: Course Code, Type, and Status Badge */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {course.courseCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              course.courseType?.toLowerCase().includes('sessional') || course.courseType?.toLowerCase().includes('lab')
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                              {course.courseType || 'Theory'}
                            </span>
                          </div>
                          <div>
                            {getStatusBadge(pct, hasClassData)}
                          </div>
                        </div>

                        {/* Course Title */}
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {course.courseTitle || course.courseName || '—'}
                        </h4>

                        {/* Teacher & Rating Badge */}
                        {(course.courseTeacher || course.teacherName) && (
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 min-w-0">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{course.courseTeacher || course.teacherName}</span>
                            </div>
                            <TeacherRatingBadge
                              teacherName={course.courseTeacher || course.teacherName || ''}
                              onClick={() =>
                                setSelectedTeacherForRating({
                                  name: course.courseTeacher || course.teacherName || '',
                                  courseCode: course.courseCode,
                                  department: sem.master?.departmentName,
                                })
                              }
                              size="sm"
                            />
                          </div>
                        )}

                        {/* Metric Boxes & Attendance Progress */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-800">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                              <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                                {total}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Present</span>
                              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                                {present}
                              </span>
                            </div>
                            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/60">
                              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Absent</span>
                              <span className="font-mono font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                                {absent}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar & Percentage */}
                          <div className="pt-1.5 flex items-center space-x-2.5">
                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  pct >= 75
                                    ? 'bg-emerald-500'
                                    : pct >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                            <span className={`font-mono font-extrabold text-xs shrink-0 ${
                              pct >= 75
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : pct >= 60
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}>
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 6. Sub-Tab 2: Registered Courses View (Matching exam-portal Tab 1) */}
      {activeSubTab === 'courses' && filteredSemesters.length > 0 && (
        <div className="space-y-6">
          {filteredSemesters.map((sem, sIdx) => (
            <div
              key={sIdx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
            >
              <div className="bg-slate-50 dark:bg-slate-800/60 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                    {sem.master?.yearAndSemesterName || `Semester ${sIdx + 1}`}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Session: {sem.master?.sessionName || profile?.sessionName || '—'}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                  {sem.detailsList.length} Courses Enrolled
                </span>
              </div>

              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {sem.detailsList.map((course, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                          {course.courseCode}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {course.courseType || 'Theory'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-snug">
                        {course.courseTitle || course.courseName || '—'}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                          {course.courseTeacher || course.teacherName || 'Assigned Department Faculty'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 pt-1 sm:pt-0">
                        {typeof course.courseCredit === 'number' && (
                          <span className="font-semibold text-slate-600 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px]">
                            {course.courseCredit} Cr
                          </span>
                        )}
                        {(course.courseTeacher || course.teacherName) && (
                          <TeacherRatingBadge
                            teacherName={course.courseTeacher || course.teacherName}
                            onClick={() =>
                              setSelectedTeacherForRating({
                                name: course.courseTeacher || course.teacherName || '',
                                courseCode: course.courseCode,
                                department: sem.master?.departmentName,
                              })
                            }
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Sub-Tab 3: Rajshahi University Attendance Ordinance Guidelines */}
      {activeSubTab === 'guidelines' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  রাজশাহী বিশ্ববিদ্যালয় উপস্থিতি ও পরীক্ষা যোগ্যতা নীতিমালা
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rules for Admission to University Examinations (Attendance Ordinance)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              
              {/* Category 1: Collegiate */}
              <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold mb-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <h4>Collegiate (নিয়মিত)</h4>
                </div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                  ≥ 75%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  যেসব শিক্ষার্থী সংশ্লিষ্ট সেমিস্টারের প্রতিটি কোর্সে কমপক্ষে ৭৫% ক্লাসে উপস্থিত থাকে, তারা নিয়মিত (Collegiate) পরীক্ষার্থী হিসেবে সরাসরি পরীক্ষায় অংশগ্রহণের যোগ্য।
                </p>
              </div>

              {/* Category 2: Non-Collegiate */}
              <div className="p-4 sm:p-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 font-bold mb-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4>Non-Collegiate (অনিয়মিত)</h4>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-2">
                  60% – 74.9%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  উপস্থিতি ৬০% থেকে ৭৪.৯%-এর মধ্যে থাকলে শিক্ষার্থী অনিয়মিত (Non-Collegiate) বিবেচিত হয়। নির্ধারিত জরিমানা (Fine) পরিশোধ সাপেক্ষে তারা পরীক্ষায় অংশগ্রহণের অনুমতি পায়।
                </p>
              </div>

              {/* Category 3: Discollegiate */}
              <div className="p-4 sm:p-5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20">
                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-300 font-bold mb-2">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <h4>Discollegiate (অযোগ্য)</h4>
                </div>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mb-2">
                  &lt; 60%
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  উপস্থিতি ৬০%-এর কম হলে শিক্ষার্থী অযোগ্য (Discollegiate) বিবেচিত হয়। বিশ্ববিদ্যালয়ের অর্ডিন্যান্স অনুযায়ী তারা ওই সেমিস্টার পরীক্ষায় বসতে পারে না এবং পুনঃভর্তি (Re-admission) নিতে হয়।
                </p>
              </div>

            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                📌 গুরুত্বপূর্ণ দ্রষ্টব্য:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>উপস্থিতি হিসাব সংশ্লিষ্ট কোর্সের থিওরি ও ল্যাব ক্লাসের জন্য পৃথকভাবে নির্ধারিত হতে পারে।</li>
                <li>মেডিকেল ছুটি বা বিশেষ ছুটির কারণে অনুপস্থিতির ক্ষেত্রে বিভাগীয় সভাপতির মাধ্যমে যথাযথ কর্তৃপক্ষের অনুমোদন প্রয়োজন।</li>
                <li>যেকোনো অসঙ্গতি থাকলে সংশ্লিষ্ট কোর্স শিক্ষক বা পরীক্ষা কমিটির সভাপতির সাথে অতিসত্বর যোগাযোগ করুন।</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Rating & Student Review Modal */}
      {selectedTeacherForRating && (
        <TeacherRatingModal
          isOpen={!!selectedTeacherForRating}
          onClose={() => setSelectedTeacherForRating(null)}
          teacherName={selectedTeacherForRating.name}
          courseCode={selectedTeacherForRating.courseCode}
          department={selectedTeacherForRating.department}
          profile={profile}
        />
      )}

    </div>
  );
};
