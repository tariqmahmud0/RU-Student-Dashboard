import React from 'react';
import { StudentInfo, SemesterResult, FeeItem, NoticeItem, CourseAttendanceSemester, TabType } from '../types';
import { getStudentPhotoUrl } from '../api';
import { User, Award, BookOpen, Building2, Calendar, Receipt, Bell, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Layers, CalendarCheck } from 'lucide-react';

interface OverviewViewProps {
  profile: StudentInfo | null;
  results: SemesterResult[];
  fees: FeeItem[];
  courseAttendance?: CourseAttendanceSemester[];
  notices: NoticeItem[];
  setActiveTab: (tab: TabType) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  profile,
  results,
  fees,
  courseAttendance = [],
  notices,
  setActiveTab,
}) => {
  const photoUrl = getStudentPhotoUrl(profile);

  // Latest semester result
  const latestResult = results.length > 0 ? results[0] : null;

  // Compute total credits earned across published results
  const totalEarnedCredits = results.reduce(
    (acc, curr) => acc + (curr.master?.totalEarnCredit || 0),
    0
  );

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 relative z-10">
          
          {/* Profile Photo Avatar */}
          <div className="w-fit h-fit max-w-[120px] sm:max-w-[140px] max-h-[150px] sm:max-h-[180px] rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-emerald-600/30 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <img
              id="studentPhoto"
              src={photoUrl || '/assets/default-avatar.svg'}
              alt={profile?.name || "Student Photo"}
              className="max-w-[110px] sm:max-w-[130px] max-h-[140px] sm:max-h-[170px] w-auto h-auto rounded-lg block"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/assets/default-avatar.svg';
              }}
            />
          </div>

          {/* Student Welcome Summary */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded font-semibold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border dark:border-emerald-800 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-700 dark:text-emerald-400" />
              Authenticated Student
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              {profile?.name || "Student Dashboard"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Student ID: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{profile?.studentId}</span>
            </p>

            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300">
              <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center font-medium">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mr-1.5" />
                {profile?.programName || "Academic Program"}
              </span>
              <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center font-medium">
                <Building2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mr-1.5" />
                {profile?.departmentName || "Department"}
              </span>
              <span className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mr-1.5" />
                Session: {profile?.sessionName || "—"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* RU Offices & Personnel Directory Quick Action Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-emerald-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30 shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-snug flex items-center gap-2 justify-center sm:justify-start">
              <span>RU Offices & Personnel Directory</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">Live RU API</span>
            </h3>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              বিশ্ববিদ্যালয়ের সকল অনুষদ, বিভাগ, শিক্ষক ও কর্মকর্তাদের ফোন, ইমেইল ও গবেষণা প্রোফাইল অনুসন্ধান
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('directory')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span>Open Directory</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Course History & Attendance Quick Action Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-teal-700/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-snug flex items-center gap-2 justify-center sm:justify-start">
              <span>Course History & Attendance</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                RU Exam Portal
              </span>
            </h3>
            <p className="text-xs text-teal-100/80 mt-0.5">
              কোর্সের ইতিহাস, শিক্ষক পরিচিতি এবং সেমিস্টার ফাইনাল পরীক্ষার উপস্থিতির শতকরা হিসাব
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('courses')}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shrink-0 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span>View Course History</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Academic Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current Status</span>
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {profile?.yearAndSemesterName || "Year & Semester"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Faculty of {profile?.facultyName || "—"}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            Session: {profile?.sessionName || "—"}
          </div>
        </div>

        {/* Card 2: Hall & Residence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hall Attachment</span>
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {profile?.hallName || "Hall Name"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Status: <span className="text-indigo-700 dark:text-indigo-400 font-semibold">{profile?.residentStatusName || "—"}</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
            Residential Record Validated
          </div>
        </div>

        {/* Card 3: Latest Published GPA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Latest GPA</span>
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            {latestResult ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {latestResult.master.gradePoint?.toFixed(2) || "0.00"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                  latestResult.master.resultValue === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                }`}>
                  {latestResult.master.resultValue || 'RESULT'}
                </span>
              </div>
            ) : (
              <p className="text-base font-semibold text-slate-400 dark:text-slate-500">No published result</p>
            )}
            {latestResult && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {latestResult.master.yearAndSemester}
              </p>
            )}
          </div>
          <button
            onClick={() => setActiveTab('results')}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center justify-between w-full"
          >
            <span>View All Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Total Earned Credits */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Credits</span>
              <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {totalEarnedCredits} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Credits</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across {results.length} published semester(s)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-cyan-700 dark:text-cyan-400 font-semibold">
            Academic Progress Tracked
          </div>
        </div>

      </div>

      {/* Grid Section: Quick Results & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latest Semester Summary Preview (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Latest Semester Performance</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Summary of recent examination marks & grades
              </p>
            </div>
            <button
              onClick={() => setActiveTab('results')}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>Full Statement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestResult ? (
            <div className="space-y-4">
              
              {/* Semester Master Info Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Semester</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{latestResult.master.yearAndSemester}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Session</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{latestResult.master.sessionName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">GPA / Point</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{latestResult.master.gradePoint}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Earned Credit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {latestResult.master.totalEarnCredit} / {latestResult.master.totalCourseCredit}
                  </span>
                </div>
              </div>

              {/* Latest Semester Courses Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Course Code</th>
                      <th className="px-4 py-3">Course Title</th>
                      <th className="px-4 py-3 text-center">Credit</th>
                      <th className="px-4 py-3 text-center bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-x border-slate-200 dark:border-slate-800">Internal Mark</th>
                      <th className="px-4 py-3 text-center">Final Mark</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {latestResult.detailsList.map((course, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-800 dark:text-emerald-400">{course.courseCode}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{course.courseName || course.courseTitle || '—'}</td>
                        <td className="px-4 py-3 text-center font-mono">{course.courseCredit}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-x border-slate-100 dark:border-slate-800">{course.caMark ?? '—'}</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-700 dark:text-slate-300">{course.finalMark ?? '—'}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-slate-100">{course.gradeName || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No published semester results currently available for this account.
            </div>
          )}
        </div>

        {/* Notices Quick Feed (1 Col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Recent University Notices</span>
              </h3>
              <button
                onClick={() => setActiveTab('notices')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            {notices.length > 0 ? (
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {notice.noticeTitle}
                    </p>
                    {notice.noticeDate && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Date: {new Date(notice.noticeDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
                No recent notices available.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('notices')}
            className="w-full mt-4 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Open Notice Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Quick Access to Others / Student Tools Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-xl p-5 sm:p-6 border border-emerald-900/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-base flex items-center justify-center sm:justify-start space-x-2">
            <span>🧮 Student Tools & University Resources (Others)</span>
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Calculate your semester SGPA & target CGPA, check the official RU grading table, find emergency campus contacts, and visit official university websites.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('others')}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-sm flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Explore Others</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

