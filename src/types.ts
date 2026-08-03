export interface CompanyInfo {
  id: number;
  name: string;
  banglaName: string;
  code: string;
  address: string;
  addressBn: string;
  logoFileName?: string;
  logoFileLocation?: string;
  backgroundFileName?: string;
  backgroundFileLocation?: string;
  active?: boolean;
}

export interface LoginResponse {
  status: boolean;
  message?: string;
  data?: {
    id: number;
    token: string;
  };
}

export interface StudentInfo {
  id: number;
  studentId: string;
  registrationNo?: string;
  name: string;
  dob?: string;
  fileLocation?: string;
  fileName?: string;
  fatherName?: string;
  motherName?: string;
  mobileNo?: string;
  genderName?: string;
  bloodGroupName?: string;
  programName?: string;
  facultyName?: string;
  departmentName?: string;
  sessionName?: string;
  adSessionName?: string;
  yearAndSemesterName?: string;
  hallName?: string;
  residentStatusName?: string;
  hallInfoMasterId?: string;
}

export interface CourseMarkDetail {
  id: number;
  courseId?: number;
  courseCode: string;
  courseName?: string;
  courseTitle?: string;
  courseCredit: number;
  caMark: number | null; // Must be displayed as "Internal Mark"
  finalMark: number | null;
  totalMark: number | null;
  gradeName?: string;
  gradePoint?: number;
  sgp?: number;
  improveStatement?: string;
  active?: boolean;
}

export interface CourseMarkMaster {
  id: number;
  yearAndSemester: string;
  sessionName: string;
  gradePoint: number;
  resultValue: string; // e.g. "PASS", "FAIL"
  totalCourseCredit: number;
  totalEarnCredit: number;
  resultPublishDate?: string;
  improveStatement?: string;
  dependentResult?: boolean;
  merit?: number;
}

export interface SemesterResult {
  master: CourseMarkMaster;
  detailsList: CourseMarkDetail[];
}

export interface FeeItem {
  id: number;
  feesProcessId?: number;
  studentInfoId?: number;
  studentId?: string;
  studentName?: string;
  collectionAmount: number;
  collectionDate?: string;
  moneyReceiptNo?: string;
  paymentTypeName?: string;
  feesTypeName?: string;
  isPayable?: string;
}

export interface NoticeItem {
  id: number;
  noticeTitle: string;
  noticeDescription: string;
  noticeDate?: string;
  fileName?: string;
  fileLocation?: string;
  isImportant?: boolean;
  isHall?: boolean;
}

export interface AppState {
  token: string | null;
  studentInfoId: number | null;
  companyInfo: CompanyInfo | null;
  profile: StudentInfo | null;
  results: SemesterResult[];
  fees: FeeItem[];
  recentNotices: NoticeItem[];
  hallNotices: NoticeItem[];
  activeTab: 'overview' | 'profile' | 'results' | 'fees' | 'notices';
  isLoading: boolean;
  error: string | null;
}
