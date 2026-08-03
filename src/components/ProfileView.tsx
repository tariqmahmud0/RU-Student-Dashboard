import React from 'react';
import { StudentInfo } from '../types';
import { getStudentPhotoUrl } from '../api';
import { User, BookOpen, Building2, Calendar, Phone, Heart, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface ProfileViewProps {
  profile: StudentInfo | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shadow-sm">
        Student profile details unavailable.
      </div>
    );
  }

  const photoUrl = getStudentPhotoUrl(profile);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          
          {/* Avatar Photo */}
          <div className="w-fit h-fit max-w-[140px] sm:max-w-[180px] max-h-[180px] sm:max-h-[220px] rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-emerald-600/30 p-1 shadow-sm shrink-0 overflow-hidden flex items-center justify-center">
            <img
              id="studentPhoto"
              src={photoUrl || '/assets/default-avatar.svg'}
              alt={profile.name}
              className="max-w-[130px] sm:max-w-[170px] max-h-[170px] sm:max-h-[210px] w-auto h-auto rounded-lg block"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/assets/default-avatar.svg';
              }}
            />
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-700 dark:text-emerald-400" />
              Official Student Profile
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              {profile.name}
            </h2>
            <p className="text-sm font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              Student ID: {profile.studentId}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.programName || "Program"} • {profile.departmentName || "Department"}
            </p>
          </div>

        </div>
      </div>

      {/* Grid of Profile Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Academic & Program Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Academic Information</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Program Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.programName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Department</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.departmentName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Faculty</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.facultyName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Academic Session</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">{profile.sessionName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Admission Session</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{profile.adSessionName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Current Year & Semester</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">{profile.yearAndSemesterName || "—"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Hall & Residence Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Hall & Residential Record</span>
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Hall Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.hallName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Residence Status</span>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 dark:border dark:border-indigo-800">
                {profile.residentStatusName || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Gender</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.genderName || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Blood Group</span>
              <span className="font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                {profile.bloodGroupName || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Date of Birth</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {profile.dob ? new Date(profile.dob).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Personal & Family Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 md:col-span-2 transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Personal & Family Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Father's Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{profile.fatherName || "—"}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-xs block">Mother's Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{profile.motherName || "—"}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Mobile Number</span>
              </span>
              <span className="font-semibold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
                {profile.mobileNo || "—"}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
