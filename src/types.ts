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

export type TabType = 'overview' | 'profile' | 'results' | 'fees' | 'notices' | 'directory' | 'others';

export type OthersSubView = 'hub' | 'directory';

export interface OfficeItem {
  id: number;
  office_id: string;
  office_name: string;
  office_address: string | null;
  office_type: 'department' | 'faculty' | 'institute' | 'hall' | 'administration' | string | null;
}

export interface EmployeeItem {
  salary_id: string;
  name: string;
  display_name?: string;
  display_designation?: string;
  designation?: string;
  office?: string;
  office_id?: number;
  status?: string;
  is_visible?: boolean;
  office_address?: string | null;
  education_short?: string | null;
  profile_img?: string | null;
  university_mail?: string | null;
  is_chairman?: boolean;
  research_interests?: Array<any>;
  duty_names?: string[];
  role_category?: 'teacher' | 'officer' | 'staff';
}

export interface EmployeeDetailItem {
  detail?: {
    joining_date?: string;
    office_address?: string;
    education_short?: string;
    profile_img?: string;
  };
  other_contacts?: Array<{
    id: number;
    contact_type: string;
    contact: string;
    public_visible?: boolean;
  }>;
}

export interface EmployeeAboutItem {
  salary_id: string;
  name: string;
  display_name?: string;
  display_designation?: string;
  office_id?: number;
  office?: string;
  office_address?: string;
  designation_id?: number;
  designation?: string;
  status?: string;
  salary_scale?: string;
  short_biography?: string;
  image?: string | null;
  profile_img?: string | null;
  education_short?: string | null;
  contact_no?: string | null;
  university_mail?: string | null;
  grade?: string;
}

export interface EducationItem {
  id: number;
  level?: string;
  degree: string;
  institution: string;
  passing_year?: string;
  result_type?: string;
  marks_gpa?: string | null;
}

export interface EmploymentItem {
  id: number;
  position: string;
  office?: string;
  institute?: string;
  start_date?: string;
  end_date?: string;
}

export interface PublicationItem {
  id: number;
  title: string;
  type?: string;
  authors?: string;
  presented_published?: string;
  publication_year?: string;
  doi?: string;
  url?: string;
}

export interface ResearchInterestItem {
  id: number;
  interest_name: string;
}

export interface ResearchProjectItem {
  id: number;
  title?: string;
  project_title?: string;
  funding_agency?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  budget?: string;
}

export interface ResearchSupervisionItem {
  id: number;
  student_name?: string;
  thesis_title?: string;
  degree?: string;
  year?: string;
}

export interface ResearchTalkItem {
  id: number;
  title?: string;
  talk_title?: string;
  event_name?: string;
  date?: string;
  location?: string;
}

export interface AwardItem {
  id: number;
  title: string;
  award_type?: string;
  year?: string;
  country?: string;
  description?: string;
  link?: string;
}

export interface MembershipItem {
  id: number;
  membership_name: string;
  type?: string;
  membership_year?: string;
  expire_year?: string;
}

export interface ExtraDutyItem {
  id: number;
  duty_name: string;
  office?: string;
  start_date?: string;
  end_date?: string;
}

export interface ResourceItem {
  id: number;
  course_name: string;
  description?: string;
  offering_now?: boolean;
  resource_url?: string;
}

export interface SocialLinksItem {
  id?: number;
  facebook?: string | null;
  github?: string | null;
  x?: string | null;
  google_scholar?: string | null;
  linkedin?: string | null;
  research_gate?: string | null;
  youtube?: string | null;
  orcid?: string | null;
  web?: string | null;
}

export interface FullProfileData {
  about: EmployeeAboutItem | null;
  detail: EmployeeDetailItem | null;
  educations: EducationItem[];
  employments: EmploymentItem[];
  publications: PublicationItem[];
  researchInterests: ResearchInterestItem[];
  researchProjects: ResearchProjectItem[];
  researchSupervisions: ResearchSupervisionItem[];
  researchTalks: ResearchTalkItem[];
  awards: AwardItem[];
  memberships: MembershipItem[];
  extraDuties: ExtraDutyItem[];
  resources: ResourceItem[];
  socialLinks: SocialLinksItem | null;
  others: string | null;
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
  activeTab: TabType;
  othersSubView: OthersSubView;
  isLoading: boolean;
  error: string | null;
}



