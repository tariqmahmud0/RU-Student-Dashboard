import React, { useState } from 'react';
import { SemesterResult, StudentInfo, CompanyInfo } from '../types';
import { Award, CheckCircle2, XCircle, Calendar, BookOpen, Search, HelpCircle, AlertCircle, Download, FileText } from 'lucide-react';
import { generateTranscriptPDF } from '../utils/pdfGenerator';

interface ResultsViewProps {
  results: SemesterResult[];
  profile?: StudentInfo | null;
  companyInfo?: CompanyInfo | null;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ results, profile = null, companyInfo = null }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!results || results.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm">
        <Award className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Published Results Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No published examination course marks or semester grade statements were returned for your account at this time.
        </p>
      </div>
    );
  }

  // Filter semester results by search term if provided
  const filteredResults = results.filter((sem) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const semTitle = (sem.master.yearAndSemester || '').toLowerCase();
    const session = (sem.master.sessionName || '').toLowerCase();
    const hasMatchingCourse = sem.detailsList.some(
      (c) =>
        (c.courseCode || '').toLowerCase().includes(term) ||
        (c.courseName || c.courseTitle || '').toLowerCase().includes(term)
    );
    return semTitle.includes(term) || session.includes(term) || hasMatchingCourse;
  });

  const handleDownloadFullTranscript = () => {
    generateTranscriptPDF(results, profile, companyInfo);
  };

  const handleDownloadSemesterPDF = (sem: SemesterResult) => {
    generateTranscriptPDF(results, profile, companyInfo, sem);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Action Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Academic Course Marks & Results</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official semester grade statements and course mark details
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Download Full Transcript Button */}
          <button
            onClick={handleDownloadFullTranscript}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            title="Download full academic transcript PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Transcript (PDF)</span>
          </button>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search course, semester..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* List of Semesters */}
      {filteredResults.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 text-sm shadow-sm">
          No courses or semesters match "{searchTerm}".
        </div>
      ) : (
        filteredResults.map((sem, semIdx) => {
          const master = sem.master;
          const isPass = master.resultValue === "PASS";

          return (
            <div
              key={semIdx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all"
            >
              
              {/* Semester Master Header Bar */}
              <div className="bg-slate-50/80 dark:bg-slate-950 p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                
                {/* Title & Badges */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {master.yearAndSemester || "Semester Result"}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded font-bold text-xs border ${
                        isPass
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                          : "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
                      }`}
                    >
                      {isPass ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
                      {master.resultValue || "PUBLISHED"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Session: <span className="text-slate-800 dark:text-slate-200 font-semibold">{master.sessionName || "—"}</span>
                    {master.resultPublishDate && (
                      <span className="ml-3 text-slate-500 dark:text-slate-400">
                        Published: {new Date(master.resultPublishDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>

                {/* Metrics Summary & PDF Export */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Semester GPA</span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                      {master.gradePoint !== undefined && master.gradePoint !== null
                        ? master.gradePoint.toFixed(2)
                        : "—"}
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-2xs">
                    <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Earned Credits</span>
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {master.totalEarnCredit} / {master.totalCourseCredit}
                    </span>
                  </div>

                  {master.improveStatement && (
                    <div className="bg-amber-50 dark:bg-amber-950/60 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                      {master.improveStatement}
                    </div>
                  )}

                  <button
                    onClick={() => handleDownloadSemesterPDF(sem)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    title="Export PDF for this semester"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Export PDF</span>
                  </button>
                </div>

              </div>

              {/* Course Marks Table with Horizontal Mobile Scroll */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                      <th className="px-4 py-3 min-w-[110px]">Course Code</th>
                      <th className="px-4 py-3 min-w-[200px]">Course Title</th>
                      <th className="px-3 py-3 text-center min-w-[70px]">Credit</th>
                      
                      {/* Internal Mark */}
                      <th className="px-3 py-3 text-center min-w-[100px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-x border-slate-200 dark:border-slate-800">
                        Internal Mark
                      </th>
                      
                      <th className="px-3 py-3 text-center min-w-[90px]">Final Mark</th>
                      <th className="px-3 py-3 text-center min-w-[90px]">Total Mark</th>
                      <th className="px-3 py-3 text-center min-w-[70px]">Grade</th>
                      <th className="px-3 py-3 text-center min-w-[80px]">Grade Point</th>
                      <th className="px-3 py-3 text-left min-w-[120px]">Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    {sem.detailsList.map((course, cIdx) => (
                      <tr key={cIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Course Code */}
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                          {course.courseCode}
                        </td>

                        {/* Course Title */}
                        <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-100">
                          {course.courseName || course.courseTitle || "—"}
                        </td>

                        {/* Credit */}
                        <td className="px-3 py-3.5 text-center font-mono text-slate-600 dark:text-slate-300">
                          {course.courseCredit}
                        </td>

                        {/* Internal Mark (caMark) */}
                        <td className="px-3 py-3.5 text-center font-mono font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 border-x border-slate-100 dark:border-slate-800">
                          {course.caMark !== null && course.caMark !== undefined ? course.caMark : "—"}
                        </td>

                        {/* Final Mark */}
                        <td className="px-3 py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">
                          {course.finalMark !== null && course.finalMark !== undefined ? course.finalMark : "—"}
                        </td>

                        {/* Total Mark */}
                        <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-900 dark:text-slate-100">
                          {course.totalMark !== null && course.totalMark !== undefined ? course.totalMark : "—"}
                        </td>

                        {/* Grade */}
                        <td className="px-3 py-3.5 text-center">
                          <span className="font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
                            {course.gradeName || "—"}
                          </span>
                        </td>

                        {/* Grade Point */}
                        <td className="px-3 py-3.5 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                          {course.gradePoint !== null && course.gradePoint !== undefined ? course.gradePoint.toFixed(2) : "—"}
                        </td>

                        {/* Improvement */}
                        <td className="px-3 py-3.5 text-xs text-slate-500 dark:text-slate-400 italic">
                          {course.improveStatement || "—"}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          );
        })
      )}

    </div>
  );
};

