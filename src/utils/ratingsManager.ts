import { TeacherRatingSummary, StudentReview, RatingCriteria } from '../types';

const STORAGE_RATINGS_KEY = 'ru_teacher_ratings';
const RATINGS_UPDATED_EVENT = 'ru_teacher_ratings_updated';

// In-memory cache for ultra-fast component re-renders
let cachedRatings: Record<string, TeacherRatingSummary> | null = null;

/**
 * Normalizes teacher names to a canonical alphanumeric slug to match between
 * Course Attendance teacher string and RU Directory profile names.
 * Example:
 *  - "Prof. Dr. Md. Tariqul Islam" -> "tariqul_islam"
 *  - "Dr. Md. Tariqul Islam" -> "tariqul_islam"
 *  - "Md. Emran Ali" -> "emran_ali"
 */
export function normalizeTeacherKey(name?: string, salaryId?: string): string {
  if (salaryId && salaryId.trim()) {
    return salaryId.trim();
  }
  if (!name || !name.trim()) return '';

  let cleaned = name.trim().toLowerCase();

  // Strip punctuation and dots first so honorifics match clean word boundaries
  cleaned = cleaned.replace(/\./g, ' ');

  // Strip academic and formal titles
  cleaned = cleaned
    .replace(/\b(prof|professor|dr|doctor|engr|engineer|lecturer|asst|assoc|assistant|associate)\b/gi, ' ')
    .replace(/\b(md|mohammad|muhammad|mst|mrs|mr|ms)\b/gi, ' ')
    .replace(/\b(afm|akm|ma|msc|phd|bsc)\b/gi, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Convert to snake_case
  return cleaned.replace(/\s+/g, '_');
}

// Optional Supabase Free Cloud Database Configuration
const RAW_SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL?.trim() || '';
const SUPABASE_URL = RAW_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.trim() ||
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  '';
const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function isCloudConfigured(): boolean {
  return isSupabaseConfigured;
}

/**
 * Load all ratings from Supabase Cloud or backend API, with fallback to localStorage
 */
export async function fetchAllRatings(): Promise<Record<string, TeacherRatingSummary>> {
  // Priority 1: Supabase Free Cloud Database (Works on Vercel, Netlify, Render, Local)
  if (isSupabaseConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/teacher_ratings?select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const rows = await res.json();
        const map: Record<string, TeacherRatingSummary> = {};
        if (Array.isArray(rows)) {
          rows.forEach((row: any) => {
            const item: TeacherRatingSummary = {
              teacherKey: row.teacher_key,
              teacherName: row.teacher_name,
              salaryId: row.salary_id || undefined,
              department: row.department || undefined,
              averageRating: Number(row.average_rating || 0),
              totalReviews: Number(row.total_reviews || 0),
              criteriaAverages: row.criteria_averages || undefined,
              reviews: Array.isArray(row.reviews) ? row.reviews : [],
            };
            map[row.teacher_key] = item;
            if (row.salary_id) {
              map[row.salary_id] = item;
            }
          });
          cachedRatings = map;
          try {
            localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(map));
          } catch (_e) {}
          dispatchRatingsUpdate();
          return map;
        }
      }
    } catch (_err) {
      // Fall through to local API
    }
  }

  // Priority 2: Local Node.js Express server (/api/ratings)
  try {
    const res = await fetch('/api/ratings');
    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        cachedRatings = json.data;
        try {
          localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(json.data));
        } catch (_e) {}
        dispatchRatingsUpdate();
        return json.data;
      }
    }
  } catch (_err) {
    // Silent fallback to local storage
  }

  // Priority 3: LocalStorage
  try {
    const local = localStorage.getItem(STORAGE_RATINGS_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      cachedRatings = parsed;
      return parsed;
    }
  } catch (_e) {}

  cachedRatings = {};
  return {};
}

/**
 * Synchronous getter for current ratings (uses memory cache or localStorage)
 */
export function getAllRatingsSync(): Record<string, TeacherRatingSummary> {
  if (cachedRatings) {
    return cachedRatings;
  }
  try {
    const local = localStorage.getItem(STORAGE_RATINGS_KEY);
    if (local) {
      cachedRatings = JSON.parse(local);
      return cachedRatings || {};
    }
  } catch (_e) {}
  return {};
}

/**
 * Get rating summary for a teacher by Name or Salary ID
 */
export function getTeacherRating(name?: string, salaryId?: string): TeacherRatingSummary | null {
  const ratings = getAllRatingsSync();
  if (salaryId && ratings[salaryId.trim()]) {
    return ratings[salaryId.trim()];
  }
  const key = normalizeTeacherKey(name);
  if (key && ratings[key]) {
    return ratings[key];
  }

  // Fuzzy search if direct key not found
  if (key) {
    const allKeys = Object.keys(ratings);
    const matchedKey = allKeys.find((k) => k.includes(key) || key.includes(k));
    if (matchedKey) return ratings[matchedKey];
  }

  return null;
}

/**
 * Find the logged-in student's own review for a specific teacher
 */
export function getStudentReviewForTeacher(
  name?: string,
  studentId?: string,
  salaryId?: string
): StudentReview | null {
  if (!studentId) return null;
  const rating = getTeacherRating(name, salaryId);
  if (!rating || !rating.reviews) return null;

  return rating.reviews.find((r) => r.studentId === studentId) || null;
}

/**
 * Submit or update a student rating for a teacher
 */
export async function submitTeacherRating(params: {
  teacherName: string;
  salaryId?: string;
  department?: string;
  studentId: string;
  studentName?: string;
  rating: number;
  criteria?: RatingCriteria;
  comment?: string;
  courseCode?: string;
  isAnonymous?: boolean;
}): Promise<{ success: boolean; data?: TeacherRatingSummary; message?: string }> {
  const {
    teacherName,
    salaryId,
    department,
    studentId,
    studentName,
    rating,
    criteria,
    comment,
    courseCode,
    isAnonymous,
  } = params;

  const teacherKey = normalizeTeacherKey(teacherName, salaryId) || salaryId || 'teacher';

  // Compute updated review & summary
  const ratings = getAllRatingsSync();
  const existing: TeacherRatingSummary = ratings[teacherKey] || {
    teacherKey,
    teacherName,
    salaryId: salaryId || '',
    department: department || '',
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  };

  const newReview: StudentReview = {
    studentId,
    studentName: isAnonymous ? 'Anonymous Student' : (studentName || 'Student'),
    rating: Math.round(rating * 10) / 10,
    criteria,
    comment: (comment || '').trim(),
    courseCode: (courseCode || '').trim(),
    isAnonymous: !!isAnonymous,
    date: new Date().toISOString(),
  };

  const existingIdx = existing.reviews.findIndex((r) => r.studentId === studentId);
  if (existingIdx >= 0) {
    existing.reviews[existingIdx] = newReview;
  } else {
    existing.reviews.push(newReview);
  }

  existing.totalReviews = existing.reviews.length;
  const sum = existing.reviews.reduce((acc, r) => acc + r.rating, 0);
  existing.averageRating = Math.round((sum / existing.totalReviews) * 10) / 10;

  // Recalculate criteria averages
  const criteriaKeys: (keyof RatingCriteria)[] = [
    'teachingQuality',
    'punctuality',
    'helpfulness',
    'fairness',
  ];
  const criteriaAverages: Partial<RatingCriteria> = {};
  criteriaKeys.forEach((key) => {
    const valid = existing.reviews.filter((r) => r.criteria && typeof r.criteria[key] === 'number');
    if (valid.length > 0) {
      const cSum = valid.reduce((acc, r) => acc + (r.criteria![key] || 0), 0);
      criteriaAverages[key] = Math.round((cSum / valid.length) * 10) / 10;
    }
  });
  existing.criteriaAverages = Object.keys(criteriaAverages).length > 0 ? (criteriaAverages as RatingCriteria) : undefined;

  // 1. If Supabase is configured, upsert into Supabase Cloud
  if (isSupabaseConfigured) {
    try {
      const row = {
        teacher_key: teacherKey,
        teacher_name: teacherName,
        salary_id: salaryId || null,
        department: department || null,
        average_rating: existing.averageRating,
        total_reviews: existing.totalReviews,
        criteria_averages: existing.criteriaAverages || null,
        reviews: existing.reviews,
        updated_at: new Date().toISOString(),
      };

      const supaRes = await fetch(`${SUPABASE_URL}/rest/v1/teacher_ratings`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      });

      if (supaRes.ok) {
        ratings[teacherKey] = existing;
        if (salaryId && salaryId.trim()) {
          ratings[salaryId.trim()] = existing;
        }
        cachedRatings = { ...ratings };
        try {
          localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(cachedRatings));
        } catch (_e) {}
        dispatchRatingsUpdate();
        return { success: true, data: existing, message: 'আপনার মূল্যায়ন ক্লাউডে সফলভাবে সংরক্ষিত হয়েছে।' };
      }
    } catch (_e) {
      // Fall through to other persisters
    }
  }

  // 2. Try Local Node.js Express server
  try {
    const payload = {
      teacherKey,
      teacherName,
      salaryId,
      department,
      studentId,
      studentName,
      rating,
      criteria,
      comment,
      courseCode,
      isAnonymous,
    };

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.status && json.data) {
        ratings[teacherKey] = json.data;
        if (salaryId && salaryId.trim()) {
          ratings[salaryId.trim()] = json.data;
        }
        cachedRatings = { ...ratings };
        try {
          localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(cachedRatings));
        } catch (_e) {}
        dispatchRatingsUpdate();
        return { success: true, data: json.data, message: 'আপনার মূল্যায়ন সফলভাবে সংরক্ষিত হয়েছে।' };
      }
    }
  } catch (_e) {
    // Fallback to local storage persistence
  }

  // 3. Fallback to localStorage
  ratings[teacherKey] = existing;
  if (salaryId && salaryId.trim()) {
    ratings[salaryId.trim()] = existing;
  }
  cachedRatings = { ...ratings };
  try {
    localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(cachedRatings));
  } catch (_e) {}

  dispatchRatingsUpdate();
  return { success: true, data: existing, message: 'আপনার মূল্যায়ন সংরক্ষিত হয়েছে।' };
}

/**
 * Delete a student's rating for a teacher
 */
export async function deleteTeacherRating(params: {
  teacherName?: string;
  salaryId?: string;
  studentId: string;
}): Promise<{ success: boolean; data?: TeacherRatingSummary | null; message?: string }> {
  const { teacherName, salaryId, studentId } = params;
  if (!studentId) {
    return { success: false, message: 'Student ID is required' };
  }

  const teacherKey = normalizeTeacherKey(teacherName, salaryId) || salaryId || '';
  if (!teacherKey) {
    return { success: false, message: 'Teacher identifier is required' };
  }

  const ratings = getAllRatingsSync();
  const existing = ratings[teacherKey];
  if (!existing || !Array.isArray(existing.reviews)) {
    return { success: true, message: 'কোনো রিভিউ পাওয়া যায়নি।' };
  }

  // Filter out the student's review
  existing.reviews = existing.reviews.filter((r) => r.studentId !== studentId);
  existing.totalReviews = existing.reviews.length;

  if (existing.totalReviews > 0) {
    const sum = existing.reviews.reduce((acc, r) => acc + r.rating, 0);
    existing.averageRating = Math.round((sum / existing.totalReviews) * 10) / 10;

    const criteriaKeys: (keyof RatingCriteria)[] = [
      'teachingQuality',
      'punctuality',
      'helpfulness',
      'fairness',
    ];
    const criteriaAverages: Partial<RatingCriteria> = {};
    criteriaKeys.forEach((key) => {
      const valid = existing.reviews.filter((r) => r.criteria && typeof r.criteria[key] === 'number');
      if (valid.length > 0) {
        const cSum = valid.reduce((acc, r) => acc + (r.criteria![key] || 0), 0);
        criteriaAverages[key] = Math.round((cSum / valid.length) * 10) / 10;
      }
    });
    existing.criteriaAverages = Object.keys(criteriaAverages).length > 0 ? (criteriaAverages as RatingCriteria) : undefined;
  } else {
    existing.averageRating = 0;
    existing.criteriaAverages = undefined;
  }

  // 1. Supabase Cloud Sync
  if (isSupabaseConfigured) {
    try {
      const row = {
        teacher_key: teacherKey,
        teacher_name: existing.teacherName || teacherName,
        salary_id: salaryId || null,
        department: existing.department || null,
        average_rating: existing.averageRating,
        total_reviews: existing.totalReviews,
        criteria_averages: existing.criteriaAverages || null,
        reviews: existing.reviews,
        updated_at: new Date().toISOString(),
      };

      await fetch(`${SUPABASE_URL}/rest/v1/teacher_ratings`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify(row),
      });
    } catch (_e) {}
  }

  // 2. Node Backend Sync
  try {
    await fetch('/api/ratings', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teacherKey,
        studentId,
        salaryId,
      }),
    });
  } catch (_e) {}

  // 3. Local Cache & Storage
  ratings[teacherKey] = existing;
  if (salaryId && salaryId.trim()) {
    ratings[salaryId.trim()] = existing;
  }
  cachedRatings = { ...ratings };
  try {
    localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(cachedRatings));
  } catch (_e) {}

  dispatchRatingsUpdate();
  return { success: true, data: existing, message: 'আপনার মূল্যায়ন মুছে ফেলা হয়েছে।' };
}

function dispatchRatingsUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(RATINGS_UPDATED_EVENT));
  }
}

/**
 * React Hook helper to listen for ratings update event
 */
export function onRatingsUpdate(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(RATINGS_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(RATINGS_UPDATED_EVENT, listener);
  };
}

// Automatically fetch ratings on startup in browser environment
if (typeof window !== 'undefined') {
  fetchAllRatings();
}

