import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getTeacherRating, onRatingsUpdate } from '../utils/ratingsManager';

interface TeacherRatingBadgeProps {
  teacherName?: string;
  salaryId?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const TeacherRatingBadge: React.FC<TeacherRatingBadgeProps> = ({
  teacherName,
  salaryId,
  onClick,
  size = 'sm',
  showCount = true,
}) => {
  const [, setTick] = useState(0);

  // Subscribe to live rating updates across any component
  useEffect(() => {
    return onRatingsUpdate(() => setTick((t) => t + 1));
  }, []);

  const summary = getTeacherRating(teacherName, salaryId);

  const hasRatings = summary && summary.totalReviews > 0;
  const avg = hasRatings ? summary.averageRating.toFixed(1) : null;
  const count = hasRatings ? summary.totalReviews : 0;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3.5 py-1.5 space-x-2',
  }[size];

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      title={
        hasRatings
          ? `${teacherName || 'Teacher'}: ${avg} out of 5 stars (${count} student reviews) [Experimental Beta]. Click to view & rate.`
          : `Click to evaluate ${teacherName || 'Teacher'} [Experimental Beta]`
      }
      className={`inline-flex items-center rounded-lg font-bold transition-all cursor-pointer select-none group shadow-2xs ${sizeClasses} ${
        hasRatings
          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:hover:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
      }`}
    >
      <Star
        className={`${starSizes} shrink-0 ${
          hasRatings
            ? 'text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform'
            : 'text-slate-400 group-hover:text-amber-500 transition-colors'
        }`}
      />
      {hasRatings ? (
        <span>
          {avg}
          {showCount && (
            <span className="font-normal text-amber-700 dark:text-amber-400 ml-1 text-[10px]">
              ({count})
            </span>
          )}
        </span>
      ) : (
        <span className="font-semibold text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 flex items-center space-x-1">
          <span>Rate</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase">
            Beta
          </span>
        </span>
      )}
    </button>
  );
};
