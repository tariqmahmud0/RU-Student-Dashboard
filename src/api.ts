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

// ----------------------------------------------------------------------
// RU Profile Directory (profile.ru.ac.bd) APIs
// ----------------------------------------------------------------------

const RU_PROFILE_API_KEY = "pms_ylb3lkyko0sruj8jao3n_GB65osTJfN3WDtweBxD48Wvpkwpihdq5R3eUTm5X1I1kuYNt";
const RU_PROFILE_LOCAL_PROXY = "/api/ru-profile";
const RU_PROFILE_DIRECT_BASE = "https://profile.ru.ac.bd/api";

async function ruProfileRequest<T>(endpoint: string): Promise<T | null> {
  const headers = {
    "Accept": "application/json",
    "api-key": RU_PROFILE_API_KEY,
  };

  // Attempt 1: Local proxy (bypasses browser CORS automatically)
  try {
    const res = await fetch(`${RU_PROFILE_LOCAL_PROXY}${endpoint}`);
    if (res.ok) {
      const data = await res.json();
      return data as T;
    }
  } catch (_e) {
    // Fall back to direct
  }

  // Attempt 2: Direct call to profile.ru.ac.bd
  try {
    const res = await fetch(`${RU_PROFILE_DIRECT_BASE}${endpoint}`, { headers });
    if (res.ok) {
      const data = await res.json();
      return data as T;
    }
  } catch (_e) {
    // Both failed
  }

  return null;
}

/**
 * Fetch all RU Offices (Departments, Faculties, Institutes, Halls, Administration)
 */
export async function getRuOffices(): Promise<import('./types').OfficeItem[]> {
  const res = await ruProfileRequest<{ offices: import('./types').OfficeItem[] }>("/offices");
  return res?.offices || [];
}

/**
 * Fetch Teachers of a specific office/department
 */
export async function getRuTeachers(officeId: number): Promise<import('./types').EmployeeItem[]> {
  const res = await ruProfileRequest<{ teachers: import('./types').EmployeeItem[] }>(`/teachers/${officeId}`);
  const teachers = res?.teachers || [];
  return teachers.map(t => ({ ...t, role_category: 'teacher' }));
}

/**
 * Fetch Officers of a specific office/department
 */
export async function getRuOfficers(officeId: number): Promise<import('./types').EmployeeItem[]> {
  const res = await ruProfileRequest<{ officers: import('./types').EmployeeItem[] }>(`/officers/${officeId}`);
  const officers = res?.officers || [];
  return officers.map(o => ({ ...o, role_category: 'officer' }));
}

/**
 * Fetch Staffs of a specific office/department
 */
export async function getRuStaffs(officeId: number): Promise<import('./types').EmployeeItem[]> {
  const res = await ruProfileRequest<{
    staffs?: import('./types').EmployeeItem[];
    sohayok_staffs?: import('./types').EmployeeItem[];
    general_staffs?: import('./types').EmployeeItem[];
  }>(`/staffs/${officeId}`);

  const list: import('./types').EmployeeItem[] = [];
  if (res?.staffs) list.push(...res.staffs);
  if (res?.sohayok_staffs) list.push(...res.sohayok_staffs);
  if (res?.general_staffs) list.push(...res.general_staffs);

  // Deduplicate by salary_id
  const seen = new Set<string>();
  const unique = list.filter(item => {
    if (!item.salary_id || seen.has(item.salary_id)) return false;
    seen.add(item.salary_id);
    return true;
  });

  return unique.map(s => ({ ...s, role_category: 'staff' }));
}

/**
 * Global dynamic search for teachers/staff/officers across the university
 */
export async function searchRuEmployees(query: string): Promise<import('./types').EmployeeItem[]> {
  if (!query || query.trim().length === 0) return [];
  const res = await ruProfileRequest<{ employees: import('./types').EmployeeItem[] }>(
    `/employees/public-search?q=${encodeURIComponent(query.trim())}`
  );
  return res?.employees || [];
}

/**
 * Fetch detailed biography & info for a specific teacher/employee
 */
export async function getRuEmployeeAbout(salaryId: string): Promise<import('./types').EmployeeAboutItem | null> {
  const res = await ruProfileRequest<{ employee: import('./types').EmployeeAboutItem }>(`/employee/${salaryId}/about`);
  return res?.employee || null;
}

/**
 * Fetch additional contact and profile detail
 */
export async function getRuEmployeeDetail(salaryId: string): Promise<import('./types').EmployeeDetailItem | null> {
  const res = await ruProfileRequest<import('./types').EmployeeDetailItem>(`/employee/${salaryId}/detail`);
  return res || null;
}

/**
 * Fetch Academic History / Educations
 */
export async function getRuEmployeeEducations(salaryId: string): Promise<import('./types').EducationItem[]> {
  const res = await ruProfileRequest<{ educations: import('./types').EducationItem[] }>(`/employee/${salaryId}/educations`);
  return res?.educations || [];
}

/**
 * Fetch Experience / Employments
 */
export async function getRuEmployeeEmployments(salaryId: string): Promise<import('./types').EmploymentItem[]> {
  const res = await ruProfileRequest<{ employments: import('./types').EmploymentItem[] }>(`/employee/${salaryId}/employments`);
  return res?.employments || [];
}

/**
 * Fetch Publications
 */
export async function getRuEmployeePublications(salaryId: string): Promise<import('./types').PublicationItem[]> {
  const res = await ruProfileRequest<{ publications: import('./types').PublicationItem[] }>(`/employee/${salaryId}/publications`);
  return res?.publications || [];
}

/**
 * Fetch Research Interests
 */
export async function getRuEmployeeResearchInterests(salaryId: string): Promise<import('./types').ResearchInterestItem[]> {
  const res = await ruProfileRequest<{ research_interests: import('./types').ResearchInterestItem[] }>(`/employee/${salaryId}/research-interests`);
  return res?.research_interests || [];
}

/**
 * Fetch Research Projects
 */
export async function getRuEmployeeResearchProjects(salaryId: string): Promise<import('./types').ResearchProjectItem[]> {
  const res = await ruProfileRequest<{ research_projects: import('./types').ResearchProjectItem[] }>(`/employee/${salaryId}/research-projects`);
  return res?.research_projects || [];
}

/**
 * Fetch Research Supervisions
 */
export async function getRuEmployeeResearchSupervisions(salaryId: string): Promise<import('./types').ResearchSupervisionItem[]> {
  const res = await ruProfileRequest<{ research_supervisions: import('./types').ResearchSupervisionItem[] }>(`/employee/${salaryId}/research-supervisions`);
  return res?.research_supervisions || [];
}

/**
 * Fetch Research Talks
 */
export async function getRuEmployeeResearchTalks(salaryId: string): Promise<import('./types').ResearchTalkItem[]> {
  const res = await ruProfileRequest<{ research_talks: import('./types').ResearchTalkItem[] }>(`/employee/${salaryId}/research-talks`);
  return res?.research_talks || [];
}

/**
 * Fetch Awards & Honors
 */
export async function getRuEmployeeAwards(salaryId: string): Promise<import('./types').AwardItem[]> {
  const res = await ruProfileRequest<{ awards: import('./types').AwardItem[] }>(`/employee/${salaryId}/awards`);
  return res?.awards || [];
}

/**
 * Fetch Memberships
 */
export async function getRuEmployeeMemberships(salaryId: string): Promise<import('./types').MembershipItem[]> {
  const res = await ruProfileRequest<{ memberships: import('./types').MembershipItem[] }>(`/employee/${salaryId}/memberships`);
  return res?.memberships || [];
}

/**
 * Fetch Extra Duties
 */
export async function getRuEmployeeExtraDuties(salaryId: string): Promise<import('./types').ExtraDutyItem[]> {
  const res = await ruProfileRequest<{ extra_duties: import('./types').ExtraDutyItem[] }>(`/employee/${salaryId}/extra-duties`);
  return res?.extra_duties || [];
}

/**
 * Fetch Teaching Resources
 */
export async function getRuEmployeeResources(salaryId: string): Promise<import('./types').ResourceItem[]> {
  const res = await ruProfileRequest<{ resources: import('./types').ResourceItem[] }>(`/employee/${salaryId}/resources`);
  return res?.resources || [];
}

/**
 * Fetch Social Links
 */
export async function getRuEmployeeSocialLinks(salaryId: string): Promise<import('./types').SocialLinksItem | null> {
  const res = await ruProfileRequest<{ social_links: import('./types').SocialLinksItem }>(`/employee/${salaryId}/social-links`);
  return res?.social_links || null;
}

/**
 * Fetch Others / Custom Remarks
 */
export async function getRuEmployeeOthers(salaryId: string): Promise<string | null> {
  const res = await ruProfileRequest<{ others: { value?: string } }>(`/employee/${salaryId}/others`);
  return res?.others?.value || null;
}

// In-memory client cache for lightning-fast repeated clicks
const clientProfileCache = new Map<string, import('./types').FullProfileData>();

/**
 * Concurrently fetch the COMPLETE profile data for any teacher/employee with client & server caching
 */
export async function getFullRuEmployeeProfile(salaryId: string): Promise<import('./types').FullProfileData> {
  // Check client memory cache first (0ms)
  const cached = clientProfileCache.get(salaryId);
  if (cached) {
    return cached;
  }

  try {
    // 1. Attempt ultra-fast 1-shot aggregated server endpoint
    const aggregated = await ruProfileRequest<import('./types').FullProfileData>(`/employee/${salaryId}/full`);
    if (aggregated && (aggregated.about || aggregated.educations || aggregated.publications)) {
      clientProfileCache.set(salaryId, aggregated);
      return aggregated;
    }
  } catch (_e) {
    // Fallback to parallel requests if aggregated is unavailable
  }

  // 2. Parallel requests fallback
  const [
    about,
    detail,
    educations,
    employments,
    publications,
    researchInterests,
    researchProjects,
    researchSupervisions,
    researchTalks,
    awards,
    memberships,
    extraDuties,
    resources,
    socialLinks,
    others
  ] = await Promise.all([
    getRuEmployeeAbout(salaryId).catch(() => null),
    getRuEmployeeDetail(salaryId).catch(() => null),
    getRuEmployeeEducations(salaryId).catch(() => []),
    getRuEmployeeEmployments(salaryId).catch(() => []),
    getRuEmployeePublications(salaryId).catch(() => []),
    getRuEmployeeResearchInterests(salaryId).catch(() => []),
    getRuEmployeeResearchProjects(salaryId).catch(() => []),
    getRuEmployeeResearchSupervisions(salaryId).catch(() => []),
    getRuEmployeeResearchTalks(salaryId).catch(() => []),
    getRuEmployeeAwards(salaryId).catch(() => []),
    getRuEmployeeMemberships(salaryId).catch(() => []),
    getRuEmployeeExtraDuties(salaryId).catch(() => []),
    getRuEmployeeResources(salaryId).catch(() => []),
    getRuEmployeeSocialLinks(salaryId).catch(() => null),
    getRuEmployeeOthers(salaryId).catch(() => null)
  ]);

  const result: import('./types').FullProfileData = {
    about,
    detail,
    educations,
    employments,
    publications,
    researchInterests,
    researchProjects,
    researchSupervisions,
    researchTalks,
    awards,
    memberships,
    extraDuties,
    resources,
    socialLinks,
    others
  };

  clientProfileCache.set(salaryId, result);
  return result;
}

/**
 * Download official Curriculum Vitae (CV) PDF
 */
export async function downloadRuEmployeeCv(salaryId: string, employeeName?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/ru-profile/employee/${salaryId}/cv`);
    if (!res.ok) {
      // Fallback direct
      window.open(`https://profile.ru.ac.bd/api/employee/${salaryId}/cv`, '_blank');
      return true;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(employeeName || salaryId).toLowerCase().replace(/[^a-z0-9]+/g, '_')}_CV.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (_e) {
    window.open(`https://profile.ru.ac.bd/public/profile/${salaryId}`, '_blank');
    return false;
  }
}

/**
 * Normalize profile image URLs to HTTPS
 */
export function formatProfileImgUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, 'https://');
}


