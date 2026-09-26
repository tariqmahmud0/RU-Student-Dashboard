import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  User,
  GraduationCap,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  HeartHandshake,
  Scale,
  BookOpen,
  Send,
  Edit3,
  FlaskConical,
  Trash2,
} from 'lucide-react';
import { StudentInfo, StudentReview, TeacherRatingSummary, RatingCriteria } from '../types';
import {
  getTeacherRating,
  getStudentReviewForTeacher,
  submitTeacherRating,
  deleteTeacherRating,
  onRatingsUpdate,
} from '../utils/ratingsManager';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

interface TeacherRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  salaryId?: string;
  department?: string;
  courseCode?: string;
  profile?: StudentInfo | null;
}

export const TeacherRatingModal: React.FC<TeacherRatingModalProps> = ({
  isOpen,
  onClose,
  teacherName,
  salaryId,
  department,
  courseCode: initialCourseCode,
  profile,
}) => {
  const [ratingSummary, setRatingSummary] = useState<TeacherRatingSummary | null>(null);
  const [myReview, setMyReview] = useState<StudentReview | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Form State
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [teachingQuality, setTeachingQuality] = useState<number>(5);
  const [punctuality, setPunctuality] = useState<number>(5);
  const [helpfulness, setHelpfulness] = useState<number>(5);
  const [fairness, setFairness] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>(initialCourseCode || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const isLoggedIn = !!profile?.studentId;

  // Refresh data when modal opens or live ratings update
  const refreshData = () => {
    const summary = getTeacherRating(teacherName, salaryId);
    setRatingSummary(summary);

    if (profile?.studentId) {
      const existing = getStudentReviewForTeacher(teacherName, profile.studentId, salaryId);
      setMyReview(existing);
      if (existing) {
        setOverallRating(existing.rating);
        if (existing.criteria) {
          setTeachingQuality(existing.criteria.teachingQuality || 5);
          setPunctuality(existing.criteria.punctuality || 5);
          setHelpfulness(existing.criteria.helpfulness || 5);
          setFairness(existing.criteria.fairness || 5);
        }
        setComment(existing.comment || '');
        setCourseCode(existing.courseCode || initialCourseCode || '');
        setIsAnonymous(!!existing.isAnonymous);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setIsEditing(false);
      setSubmitSuccessMsg(null);
    }
  }, [isOpen, teacherName, salaryId, profile]);

  useEffect(() => {
    return onRatingsUpdate(() => {
      refreshData();
    });
  }, [teacherName, salaryId, profile]);

  // Close on ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.studentId) return;

    setSubmitting(true);
    setSubmitSuccessMsg(null);

    const criteria: RatingCriteria = {
      teachingQuality,
      punctuality,
      helpfulness,
      fairness,
    };

    const res = await submitTeacherRating({
      teacherName,
      salaryId,
      department: department || profile?.departmentName,
      studentId: profile.studentId,
      studentName: profile.name,
      rating: overallRating,
      criteria,
      comment,
      courseCode,
      isAnonymous,
    });

    setSubmitting(false);
    if (res.success) {
      setSubmitSuccessMsg('আপনার মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে!');
      setIsEditing(false);
      refreshData();
    }
  };

  const handleDelete = () => {
    if (!profile?.studentId) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAction = async () => {
    if (!profile?.studentId) return;
    setDeleting(true);
    try {
      const res = await deleteTeacherRating({
        teacherName,
        salaryId,
        studentId: profile.studentId,
      });
      if (res.success) {
        setShowDeleteConfirm(false);
        setMyReview(null);
        setIsEditing(false);
        setSubmitSuccessMsg('আপনার মূল্যায়ন সফলভাবে মুছে ফেলা হয়েছে।');
        setOverallRating(5);
        setTeachingQuality(5);
        setPunctuality(5);
        setHelpfulness(5);
        setFairness(5);
        setComment('');
        refreshData();
        setTimeout(() => setSubmitSuccessMsg(null), 3500);
      }
    } finally {
      setDeleting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: 'Poor / অসন্তোষজনক',
    2: 'Fair / চলনসই',
    3: 'Good / ভালো',
    4: 'Very Good / খুব ভালো',
    5: 'Excellent / অসাধারণ',
  };

  const avg = ratingSummary && ratingSummary.totalReviews > 0 ? ratingSummary.averageRating : 0;
  const count = ratingSummary ? ratingSummary.totalReviews : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                {teacherName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {department || 'University of Rajshahi Faculty'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">

          {/* 🧪 Experimental Beta Notice */}
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="flex-1 leading-relaxed">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white">পরীক্ষামূলক শিক্ষক মূল্যায়ন (Experimental Feature)</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider">
                  BETA
                </span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                এই শিক্ষক মূল্যায়ন ও রেটিং ব্যবস্থাটি বর্তমানে একটি পরীক্ষামূলক (Beta) উদ্যোগ। শিক্ষার্থীদের মতামতের আলোকে শিক্ষার সার্বিক পরিবেশ ও পারস্পরিক মিথস্ক্রিয়া বৃদ্ধির লক্ষ্যে এটি তৈরি করা হচ্ছে।
              </p>
            </div>
          </div>

          {/* 1. Overall Aggregated Rating Card (Visible to Everyone) */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/40 border border-amber-200/80 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Big Score */}
              <div className="flex items-center space-x-4 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center shadow-md shrink-0">
                  <span className="text-2xl font-black leading-none">{avg > 0 ? avg.toFixed(1) : '—'}</span>
                  <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mt-0.5">out of 5</span>
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= Math.round(avg)
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mt-1">
                    {count > 0 ? `${count} জন শিক্ষার্থীর মূল্যায়ন` : 'এখনো কোনো রেটিং নেই'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষার্থীদের প্রদত্ত সার্বিক রেটিং
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center sm:text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                  RU Student Evaluation
                </span>
              </div>
            </div>

            {/* Criteria Breakdown Progress Bars */}
            {ratingSummary?.criteriaAverages && (
              <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Teaching Quality */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      পাঠদানের দক্ষতা (Teaching Quality)
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      {ratingSummary.criteriaAverages.teachingQuality?.toFixed(1) || '5.0'} ★
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${((ratingSummary.criteriaAverages.teachingQuality || 5) / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Punctuality */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      সময়ানুবর্তিতা (Punctuality)
                    </span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">
                      {ratingSummary.criteriaAverages.punctuality?.toFixed(1) || '5.0'} ★
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${((ratingSummary.criteriaAverages.punctuality || 5) / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Helpfulness */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
                      সহযোগিতা ও আচরণ (Helpfulness)
                    </span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">
                      {ratingSummary.criteriaAverages.helpfulness?.toFixed(1) || '5.0'} ★
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${((ratingSummary.criteriaAverages.helpfulness || 5) / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Fairness */}
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-amber-600" />
                      নিরপেক্ষ মূল্যায়ন (Fairness)
                    </span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">
                      {ratingSummary.criteriaAverages.fairness?.toFixed(1) || '5.0'} ★
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${((ratingSummary.criteriaAverages.fairness || 5) / 5) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* 2. Login Requirement Notice or Student's Rating Section */}
          {!isLoggedIn ? (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-300">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800 dark:text-slate-100 text-sm">
                  রেটিং দিতে লগইন প্রয়োজন
                </strong>
                <p className="mt-0.5">
                  শিক্ষকদের রেটিং ও রিভিউ প্রদানের জন্য রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষার্থীর আইডি দ্বারা লগইন করা আবশ্যক।
                  আপনি বর্তমানে অতিথি মোডে সার্বিক ফলাফল পর্যবেক্ষণ করছেন।
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs">
              
              {/* Success Alert */}
              {submitSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              {/* View My Existing Review (if already rated and not editing) */}
              {myReview && !isEditing ? (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        আপনার দেওয়া মূল্যায়ন (Your Review)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                        title="রেটিং ও মন্তব্য এডিট করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>

                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800 disabled:opacity-50"
                        title="আপনার দেওয়া রিভিউটি সম্পূর্ণ মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>{deleting ? 'মুছে যাচ্ছে...' : 'মুছুন'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline space-x-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= myReview.rating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                      {myReview.rating}.0
                    </span>
                    {myReview.courseCode && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                        {myReview.courseCode}
                      </span>
                    )}
                  </div>

                  {myReview.comment && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      "{myReview.comment}"
                    </p>
                  )}

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                    তারিখ: {new Date(myReview.date).toLocaleDateString()} • {myReview.isAnonymous ? 'নাম গোপন রাখা হয়েছে' : 'পাবলিক নাম'}
                  </p>
                </div>
              ) : (
                /* Rating Submission / Edit Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>{myReview ? 'রেটিং আপডেট করুন' : 'শিক্ষককে রেটিং দিন'}</span>
                    </h4>
                    {myReview && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        বাতিল
                      </button>
                    )}
                  </div>

                  {/* Interactive Star Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      সার্বিক মূল্যায়ন (Overall Star Rating):
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            onClick={() => setOverallRating(star)}
                            className="p-1 rounded hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= (hoverRating ?? overallRating)
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                        {ratingLabels[hoverRating ?? overallRating]}
                      </span>
                    </div>
                  </div>

                  {/* Sub-Criteria Sliders / Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>পাঠদান দক্ষতা:</span>
                        <span className="font-bold text-amber-600">{teachingQuality} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={teachingQuality}
                        onChange={(e) => setTeachingQuality(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>সময়ানুবর্তিতা:</span>
                        <span className="font-bold text-amber-600">{punctuality} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={punctuality}
                        onChange={(e) => setPunctuality(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>সহযোগিতাপূর্ণ আচরণ:</span>
                        <span className="font-bold text-amber-600">{helpfulness} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={helpfulness}
                        onChange={(e) => setHelpfulness(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                        <span>নিরপেক্ষ মূল্যায়ন:</span>
                        <span className="font-bold text-amber-600">{fairness} ★</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={fairness}
                        onChange={(e) => setFairness(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Course Code Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      কোর্স কোড (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ICE 4111 or CSE 2101"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:text-white"
                    />
                  </div>

                  {/* Comment Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      মন্তব্য ও অভিজ্ঞতা (ঐচ্ছিক):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="শিক্ষকের ক্লাস পরিচালনা বা সহযোগিতা সম্পর্কে ইতিবাচক গঠনমূলক মন্তব্য লিখুন..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:outline-none dark:text-white"
                    />
                  </div>

                  {/* Anonymous Checkbox */}
                  <label className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>আমার নাম প্রকাশ না করে বেনামে রিভিউ প্রদর্শন করুন (Keep Anonymous)</span>
                  </label>

                  {/* Submit Button */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      disabled={submitting || deleting}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submitting ? 'সংরক্ষণ হচ্ছে...' : myReview ? 'আপডেট সংরক্ষণ করুন (Update Rating)' : 'মূল্যায়ন জমা দিন (Submit Rating)'}</span>
                    </button>

                    {myReview && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting || submitting}
                        className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:text-rose-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>{deleting ? 'মুছে ফেলা হচ্ছে...' : 'আমার রিভিউ সম্পূর্ণ মুছে ফেলুন (Delete My Review)'}</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

            </div>
          )}

          {/* 3. All Public Reviews List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>সকল শিক্ষার্থীর রিভিউ ({ratingSummary?.reviews?.length || 0})</span>
              </h4>
            </div>

            {(!ratingSummary?.reviews || ratingSummary.reviews.length === 0) ? (
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
                এখনো কোনো বিস্তারিত রিভিউ পোস্ট করা হয়নি। প্রথম রিভিউটি দিতে লগইন করে রেটিং দিন!
              </div>
            ) : (
              <div className="space-y-3">
                {ratingSummary.reviews.map((rev, idx) => {
                  const isMine = profile?.studentId === rev.studentId;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        isMine
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isMine
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {rev.isAnonymous ? 'Anonymous Student' : rev.studentName}
                          </span>
                          {isMine && (
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                                You
                              </span>
                              <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                                title="আমার এই মূল্যায়নটি মুছে ফেলুন"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {rev.comment}
                        </p>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{rev.courseCode ? `Course: ${rev.courseCode}` : 'General Review'}</span>
                        <span>{new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>

      {/* Custom Confirmation Dialog for Rating Deletion */}
      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        isLoading={deleting}
        onConfirm={confirmDeleteAction}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
