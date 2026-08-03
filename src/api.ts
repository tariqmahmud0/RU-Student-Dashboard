import { CompanyInfo, LoginResponse, StudentInfo, SemesterResult, FeeItem, NoticeItem } from './types';

const RU_DIRECT_BASE = "https://eresult.ru.ac.bd:9603/api";
const PROXY_BASE = "/api/proxy";

/**
 * Universal API Request handler with automatic fallback to local proxy if direct browser fetch fails (CORS / network).
 */
async function apiRequest<T>(
  endpoint: string,
  options: {
    method?: string;
    token?: string | null;
    body?: any;
  } = {}
): Promise<{ status: boolean; data?: T; message?: string }> {
  const { method = "GET", token, body } = options;

  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  // Attempt 1: Direct Fetch to RU API
  try {
    const directUrl = `${RU_DIRECT_BASE}${endpoint}`;
    const res = await fetch(directUrl, fetchOptions);
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (_directErr) {
    // Silent fail over to server proxy
  }

  // Attempt 2: Fallback via local server proxy
  try {
    const proxyUrl = `${PROXY_BASE}${endpoint}`;
    const res = await fetch(proxyUrl, fetchOptions);
    const json = await res.json();
    return json;
  } catch (proxyErr: any) {
    return {
      status: false,
      message: "Network error: Unable to connect to University of Rajshahi servers. Please check your internet connection.",
    };
  }
}

/**
 * Fetch Public University Information (Name, Logo, Background, Address)
 */
export async function getCompanyInfo(): Promise<CompanyInfo | null> {
  const res = await apiRequest<CompanyInfo>("/public/sya/company-info/get-by-id/1");
  if (res.status && res.data) {
    return res.data;
  }
  return null;
}

/**
 * Login with Student ID & Password
 */
export async function loginStudent(username: string, password: string): Promise<LoginResponse> {
  const res = await apiRequest<{ id: number; token: string }>("/auth/login", {
    method: "POST",
    body: {
      username: username.trim(),
      password,
      userTypeId: 2,
    },
  });

  if (res.status && res.data && res.data.token) {
    return {
      status: true,
      data: res.data,
    };
  }

  return {
    status: false,
    message: res.message || "Invalid Student ID or password.",
  };
}

/**
 * Dynamic Student ID Discovery:
 * Retrieves course attendance details to find the logged-in student's master.studentInfoId.
 * NEVER hardcodes IDs.
 */
export async function discoverStudentInfoId(token: string): Promise<number | null> {
  const res = await apiRequest<any[]>("/private/student/course-attendance/course-attendance-details-by-app-user-id", {
    token,
  });

  if (res.status && Array.isArray(res.data) && res.data.length > 0) {
    for (const item of res.data) {
      if (item && item.master && typeof item.master.studentInfoId === "number") {
        return item.master.studentInfoId;
      }
      if (item && item.master && typeof item.master.studentInfoId === "string") {
        const parsed = parseInt(item.master.studentInfoId, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
  }

  return null;
}

/**
 * Get Student Profile Information by studentInfoId
 */
export async function getStudentProfile(token: string, studentInfoId: number): Promise<StudentInfo | null> {
  const res = await apiRequest<StudentInfo>(`/private/student/student-info/get-by-id/${studentInfoId}`, {
    token,
  });

  if (res.status && res.data) {
    return res.data;
  }
  return null;
}

/**
 * Get Published Course Marks / Results for Student
 */
export async function getCourseMarks(token: string, studentInfoId: number): Promise<SemesterResult[]> {
  const res = await apiRequest<SemesterResult[]>(`/private/student/course-mark/get-course-mark-by-student-id/${studentInfoId}`, {
    token,
  });

  if (res.status && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * Get Student Fees Collection Information
 */
export async function getFeeRecords(token: string, studentInfoId: number): Promise<FeeItem[]> {
  const res = await apiRequest<FeeItem[]>(`/private/student/fees-collection/get-by-student-id/${studentInfoId}/0`, {
    token,
  });

  if (res.status && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * Get Recent General University Notices
 */
export async function getRecentNotices(token: string): Promise<NoticeItem[]> {
  const res = await apiRequest<NoticeItem[]>("/private/student/notice/get-last-five-notice-list-for-student-by-app-user-id", {
    token,
  });

  if (res.status && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * Get Student Hall Notices
 */
export async function getHallNotices(token: string): Promise<NoticeItem[]> {
  const res = await apiRequest<NoticeItem[]>("/private/student/notice/get-hall-notice-list-for-student-by-app-user-id", {
    token,
  });

  if (res.status && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

/**
 * Generate Official Report PDF (Admit Card = reportId 7, Money Receipt = reportId 9)
 * Returns a Blob URL if successful, or null if server report is unavailable.
 */
export async function generateOfficialReportPDF(
  token: string,
  pMainId: string | number,
  reportId: "7" | "9"
): Promise<string | null> {
  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      "Accept": "application/pdf, application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      P_MAIN_ID: String(pMainId),
      id: String(reportId),
      reportFormat: "pdf",
    }),
  };

  try {
    const directUrl = `${RU_DIRECT_BASE}/private/student/report-configure/generate-report/print`;
    const res = await fetch(directUrl, fetchOptions);
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("pdf")) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch (_err) {
    // Silent fallback
  }

  try {
    const proxyUrl = `${PROXY_BASE}/private/student/report-configure/generate-report/print`;
    const res = await fetch(proxyUrl, fetchOptions);
    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("pdf")) {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch (_err) {
    // Silent fallback
  }

  return null;
}

/**
 * Get direct student photograph URL from confirmed RU API public image endpoint.
 */
export function getStudentPhotoUrl(profile?: StudentInfo | null): string | null {
  if (!profile?.fileName) return null;

  const url = `https://eresult.ru.ac.bd:9603/api/public/sya/file/view/image/${encodeURIComponent(profile.fileName.trim())}`;

  console.log("Profile fileName:", profile?.fileName);
  console.log("Student photo URL:", url);

  return url;
}

/**
 * Helper to construct direct media/image URLs for university logos & backgrounds
 */
export function buildImageUrl(fileLocation?: string, fileName?: string): string | null {
  if (!fileName) return null;

  const trimmed = fileName.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://eresult.ru.ac.bd:9603/api/public/sya/file/view/image/${encodeURIComponent(trimmed)}`;
}
