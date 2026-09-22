import React, { useState, useMemo, useEffect } from 'react';
import { StudentInfo, SemesterResult, CompanyInfo, OthersSubView } from '../types';
import { RuDirectory } from './RuDirectory';
import {
  Calculator,
  Award,
  Globe,
  PhoneCall,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Bus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Search,
  Copy,
  Check,
  Calendar,
  Layers,
  Sliders,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Edit3,
  CopyPlus,
  History,
  Info,
  ListPlus,
  HeartPulse,
  Filter,
  GraduationCap
} from 'lucide-react';

interface OthersViewProps {
  profile: StudentInfo | null;
  results: SemesterResult[];
  companyInfo: CompanyInfo | null;
  othersSubView?: OthersSubView;
  setOthersSubView?: (subView: OthersSubView) => void;
}

interface CourseItem {
  id: string;
  code: string;
  title: string;
  credits: number;
  gradePoint: number;
}

interface CustomSemester {
  id: string;
  name: string;
  credits: number;
  sgpa: number;
  isCourseMode: boolean;
  courses: CourseItem[];
  isExpandedCourses: boolean;
}

interface CustomYear {
  id: string;
  yearName: string;
  semesters: CustomSemester[];
}

interface SimulatedUpcomingSemester {
  id: string;
  name: string;
  credits: number;
  sgpa: number;
}

const RU_GRADE_SCALE = [
  { range: '80% and above', grade: 'A+', gpa: 4.00, remarks: 'Outstanding' },
  { range: '75% to less than 80%', grade: 'A', gpa: 3.75, remarks: 'Excellent' },
  { range: '70% to less than 75%', grade: 'A-', gpa: 3.50, remarks: 'Very Good' },
  { range: '65% to less than 70%', grade: 'B+', gpa: 3.25, remarks: 'Good' },
  { range: '60% to less than 65%', grade: 'B', gpa: 3.00, remarks: 'Satisfactory' },
  { range: '55% to less than 60%', grade: 'B-', gpa: 2.75, remarks: 'Above Average' },
  { range: '50% to less than 55%', grade: 'C+', gpa: 2.50, remarks: 'Average' },
  { range: '45% to less than 50%', grade: 'C', gpa: 2.25, remarks: 'Below Average' },
  { range: '40% to less than 45%', grade: 'D', gpa: 2.00, remarks: 'Pass' },
  { range: 'Less than 40%', grade: 'F', gpa: 0.00, remarks: 'Fail' },
];

const RU_OFFICIAL_LINKS = [
  {
    title: 'Student Health & Life Insurance (Zenith Life BD)',
    banglaTitle: 'শিক্ষার্থী স্বাস্থ্য ও জীবন বীমা (জেনিত ইসলামী লাইফ)',
    url: 'https://www.zenithlifebd.com/',
    desc: 'Official health & life takaful insurance coverage for RU enrolled students. Check policy benefits, claim guidelines, hospitalization coverage, and network hospitals.',
    category: 'Health & Insurance',
    badge: 'Student Insurance',
    isFeatured: true,
  },
  {
    title: 'Application for Certificate & Transcript',
    banglaTitle: 'সার্টিফিকেট ও ট্রান্সক্রিপ্ট অনলাইন আবেদন',
    url: 'https://applycert.ru.ac.bd/',
    desc: 'Apply online for provisional/original graduation certificates, academic transcripts, and marksheet verification without physical queues.',
    category: 'Academic & Exam',
    badge: 'Transcript & Degree',
    isFeatured: true,
  },
  {
    title: 'Exam Form Fill-up Portal (Session 2022-23+)',
    banglaTitle: 'পরীক্ষার ফর্ম ফিলাপ পোর্টাল (২০২২-২৩ সেশন হতে)',
    url: 'https://exam-portal.ru.ac.bd/',
    desc: 'Semester examination online form fill-up, admit card download, and course registration for undergraduate & master’s regular sessions.',
    category: 'Academic & Exam',
    badge: 'Exam Portal',
    isFeatured: true,
  },
  {
    title: 'Student Services & Form Fill-up (Legacy)',
    banglaTitle: 'শিক্ষার্থী সেবা ও ফর্ম ফিলাপ সিস্টেম',
    url: 'http://rurfid.ru.ac.bd/ru_services/public/login',
    desc: 'Examination registration, fee receipt submission, and student identity services for previous sessions.',
    category: 'Academic & Exam',
    badge: 'RFID Services',
  },
  {
    title: 'Student Information Update Portal',
    banglaTitle: 'শিক্ষার্থী তথ্য ও প্রোফাইল আপডেট',
    url: 'http://profile.ru.ac.bd/login',
    desc: 'Update your student RFID digital profile, photograph, contact numbers, residential hall info, and personal bio-data.',
    category: 'Academic & Exam',
    badge: 'Student Profile',
  },
  {
    title: 'Hall Residency Application System',
    banglaTitle: 'আবাসিক হল সিট আবেদন সিস্টেম',
    url: 'https://csd.ru.ac.bd/residency/',
    desc: 'Apply online for hall residential seats, room allocation, hall clearance certificate, and provost office services.',
    category: 'Hall & Campus',
    badge: 'Hall Seat',
    isFeatured: true,
  },
  {
    title: 'Registration Form Download System',
    banglaTitle: 'রেজিস্ট্রেশন ফর্ম ডাউনলোড সিস্টেম',
    url: 'https://academic.ru.ac.bd/regform/formdown.php',
    desc: 'Download official department enrollment slips, semester registration documents, and academic slips.',
    category: 'Academic & Exam',
    badge: 'Forms',
  },
  {
    title: 'RU Central Library & OPAC e-Resources',
    banglaTitle: 'কেন্দ্রীয় গ্রন্থাগার ও ই-রিসোর্স (OPAC)',
    url: 'http://library.ru.ac.bd/',
    desc: 'Online library catalog search (OPAC), digital repository, research thesis archives, and open-access journals.',
    category: 'IT, Email & Library',
    badge: 'Library',
  },
  {
    title: 'RU Medical Center Portal',
    banglaTitle: 'বিশ্ববিদ্যালয় চিকিৎসা কেন্দ্র সেবা',
    url: 'https://medical.ru.ac.bd/',
    desc: 'Doctor consultation schedules, diagnostic lab test facilities, ambulance booking info, and campus health services.',
    category: 'Health & Insurance',
    badge: 'Medical Center',
  },
  {
    title: 'RU Institutional Webmail Access',
    banglaTitle: 'বিশ্ববিদ্যালয় প্রাতিষ্ঠানিক ওয়েবমেইল',
    url: 'https://mail.ru.ac.bd/',
    desc: 'Access your official @ru.ac.bd institutional student and researcher email inbox for university communications.',
    category: 'IT, Email & Library',
    badge: 'Webmail',
  },
  {
    title: 'Student Feedback System (SFS)',
    banglaTitle: 'শিক্ষার্থী মতামত ও মূল্যায়ন ব্যবস্থা',
    url: 'http://sfs.ru.ac.bd/',
    desc: 'Submit confidential course evaluations, faculty feedback, and academic quality assurance ratings.',
    category: 'Academic & Exam',
    badge: 'Course Feedback',
  },
  {
    title: 'ICT Center RU',
    banglaTitle: 'আইসিটি সেন্টার (নেটওয়ার্ক ও টেকনিক্যাল সাপোর্ট)',
    url: 'https://ict.ru.ac.bd/',
    desc: 'Campus Wi-Fi connectivity, Eduroam network access, student domain services, and technical support helpdesk.',
    category: 'IT, Email & Library',
    badge: 'IT Support',
  },
  {
    title: 'RU All Online Services Directory',
    banglaTitle: 'রাজশাহী বিশ্ববিদ্যালয় অনলাইন সার্ভিসেস হাব',
    url: 'https://www.ru.ac.bd/online-services/',
    desc: 'Central directory of all university online applications, forms, student welfare links, and administrative portals.',
    category: 'University Portals',
    badge: 'Services Hub',
  },
  {
    title: 'RU Admission Portal',
    banglaTitle: 'ভর্তি সংক্রান্ত ওয়েবসাইট',
    url: 'https://admission.ru.ac.bd/',
    desc: 'Undergraduate, Master\'s, MPhil and PhD admission notices, application guidelines, seat plans, and merit lists.',
    category: 'University Portals',
    badge: 'Admissions',
  },
  {
    title: 'RU Main Official Website',
    banglaTitle: 'রাজশাহী বিশ্ববিদ্যালয় মূল ওয়েবসাইট',
    url: 'https://www.ru.ac.bd/',
    desc: 'Official homepage of University of Rajshahi with institutional circulars, academic notices, ordinances, and news.',
    category: 'University Portals',
    badge: 'Main Portal',
  },
  {
    title: 'Campus Residence Internet Registration',
    banglaTitle: 'ক্যাম্পাস ইন্টারনেট সংযোগ ও নিবন্ধন',
    url: 'http://residence.ru.ac.bd/',
    desc: 'Registration and technical support for university residential broadband network connection.',
    category: 'IT, Email & Library',
    badge: 'Broadband',
  },
  {
    title: 'RU Guest House Booking',
    banglaTitle: 'গেস্ট হাউস বুকিং পোর্টাল',
    url: 'https://guesthouse.ru.ac.bd/member/login',
    desc: 'Online booking and reservation system for university guest houses and visitor accommodation.',
    category: 'Hall & Campus',
    badge: 'Guest House',
  },
];

const EMERGENCY_CONTACTS = [
  {
    name: 'RU Medical Centre',
    bangla: 'রাজশাহী বিশ্ববিদ্যালয় চিকিৎসা কেন্দ্র',
    phone: '+880-721-711130',
    mobile: '01711-000000',
    available: '24/7 Emergency Service',
    icon: PhoneCall,
    color: 'emerald',
    note: 'Free ambulance and on-duty medical officer for enrolled students.',
  },
  {
    name: 'Office of the Proctor',
    bangla: 'প্রক্টর অফিস ও নিরাপত্তা শাখা',
    phone: '+880-721-750041',
    mobile: '01712-123456',
    available: 'Campus Security & Discipline',
    icon: ShieldCheck,
    color: 'blue',
    note: 'For campus safety, student disputes, and immediate security assistance.',
  },
  {
    name: 'Transport Section (Bus Schedule)',
    bangla: 'পরিবহন দপ্তর',
    phone: '+880-721-711126',
    available: 'Route & Schedule Inquiries',
    icon: Bus,
    color: 'amber',
    note: 'Campus-to-city student bus schedules, route adjustments, and passes.',
  },
  {
    name: 'Motihar Police Station (Rajshahi)',
    bangla: 'মতিহার থানা (রাজশাহী)',
    phone: '+880-721-750222',
    mobile: '01320-061800',
    available: 'Law Enforcement',
    icon: Building2,
    color: 'rose',
    note: 'Nearest police station for official GD, lost student IDs, and legal support.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'How does the RU Student Insurance (Zenith Life BD) work?',
    a: 'Every enrolled student of Rajshahi University is covered under the Group Health and Life Insurance policy with Zenith Islami Life Insurance PLC. Students can claim reimbursement for hospitalization, major diseases, and accidental medical expenses by submitting medical prescriptions, bills, and discharge summaries through the official insurance portal.',
  },
  {
    q: 'How is SGPA and CGPA calculated when there is a retake/improvement?',
    a: 'Under Rajshahi University ordinance, when a student retakes an examination or appears for grade improvement, the latest/improved passing mark and grade point earned replaces the previous attempt for that course/semester in the final cumulative CGPA calculation.',
  },
  {
    q: 'What are the rules for Grade Improvement Examination?',
    a: 'Students obtaining a grade of "C+", "C", "D" or "F" may appear in the improvement examination in subsequent sessions with the immediately following batch as per university faculty ordinance. The improved mark will be reflected in the updated marksheet.',
  },
  {
    q: 'How can I collect my Official Academic Transcript or Certificate?',
    a: 'Apply online through https://applycert.ru.ac.bd/ with hall clearance and payment receipt. You will need no-dues clearance from your residential hall, central library, and accounts section before submitting to the Controller of Examinations.',
  },
  {
    q: 'What should I do if my payment status shows unpaid after completing transaction?',
    a: 'Payments made through online banking or mobile financial services (MFS) may take 24-48 business hours to sync with the university accounts database. If it remains unpaid, contact the ICT Center or Hall/Department office with your transaction ID and receipt.',
  },
];

export const OthersView: React.FC<OthersViewProps> = ({
  profile,
  results,
  companyInfo,
  othersSubView = 'directory',
  setOthersSubView,
}) => {
  const [localSubView, setLocalSubView] = useState<OthersSubView>(othersSubView || 'directory');

  useEffect(() => {
    if (othersSubView) {
      setLocalSubView(othersSubView);
    }
  }, [othersSubView]);

  const handleSubViewChange = (sub: OthersSubView) => {
    setLocalSubView(sub);
    if (setOthersSubView) {
      setOthersSubView(sub);
    }
  };

  const [activeSection, setActiveSection] = useState<'calculator' | 'grading' | 'links' | 'emergency' | 'faq'>('links');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedSemIndex, setExpandedSemIndex] = useState<string | null>(null);
  const [calculatorMode, setCalculatorMode] = useState<'account' | 'custom'>('account');

  // Portal filters
  const [portalCategory, setPortalCategory] = useState<string>('All');
  const [portalSearchQuery, setPortalSearchQuery] = useState<string>('');

  // =========================================================================
  // 1. AUTO YEAR-WISE & SEMESTER-WISE PARSER WITH LATEST RETAKE / IMPROVEMENT
  // =========================================================================
  const parsedAccountData = useMemo(() => {
    if (!results || results.length === 0) {
      return {
        years: [],
        totalCredits: 0,
        totalEarnedCredits: 0,
        overallCgpa: 0,
        totalSemestersCount: 0,
        retakeSemestersCount: 0,
      };
    }

    const semesterAttemptsMap = new Map<string, SemesterResult[]>();

    results.forEach((sem) => {
      const rawTitle = (sem.master.yearAndSemester || 'General Semester').trim();
      const normalizedKey = rawTitle.toLowerCase().replace(/\s+/g, ' ');
      if (!semesterAttemptsMap.has(normalizedKey)) {
        semesterAttemptsMap.set(normalizedKey, []);
      }
      semesterAttemptsMap.get(normalizedKey)!.push(sem);
    });

    let retakeSemestersCount = 0;
    const activeSemesters: {
      active: SemesterResult;
      allAttempts: SemesterResult[];
      isRetake: boolean;
      previousAttemptSessions: string[];
    }[] = [];

    semesterAttemptsMap.forEach((attempts) => {
      if (attempts.length > 1) {
        retakeSemestersCount++;
        const sortedAttempts = [...attempts].sort((a, b) => {
          const aPass = a.master.resultValue === 'PASS' ? 1 : 0;
          const bPass = b.master.resultValue === 'PASS' ? 1 : 0;
          if (aPass !== bPass) return bPass - aPass;

          const aSession = a.master.sessionName || '';
          const bSession = b.master.sessionName || '';
          if (aSession !== bSession) return bSession.localeCompare(aSession);

          return (b.master.id || 0) - (a.master.id || 0);
        });

        const latestAttempt = sortedAttempts[0];
        const previousSessions = sortedAttempts.slice(1).map((s) => s.master.sessionName || 'Earlier');

        activeSemesters.push({
          active: latestAttempt,
          allAttempts: sortedAttempts,
          isRetake: true,
          previousAttemptSessions: previousSessions,
        });
      } else {
        activeSemesters.push({
          active: attempts[0],
          allAttempts: attempts,
          isRetake: false,
          previousAttemptSessions: [],
        });
      }
    });

    activeSemesters.sort((a, b) => {
      const nameA = a.active.master.yearAndSemester || '';
      const nameB = b.active.master.yearAndSemester || '';
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });

    const yearGroupsMap: {
      [key: string]: {
        yearName: string;
        semesters: typeof activeSemesters;
      };
    } = {};

    activeSemesters.forEach((item) => {
      const rawTitle = item.active.master.yearAndSemester || 'General Semester';
      let yearKey = '1st Year (প্রথম বর্ষ)';

      if (/1st\s*year/i.test(rawTitle)) yearKey = '1st Year (প্রথম বর্ষ)';
      else if (/2nd\s*year/i.test(rawTitle)) yearKey = '2nd Year (দ্বিতীয় বর্ষ)';
      else if (/3rd\s*year/i.test(rawTitle)) yearKey = '3rd Year (তৃতীয় বর্ষ)';
      else if (/4th\s*year/i.test(rawTitle)) yearKey = '4th Year (চতুর্থ বর্ষ)';
      else if (/5th\s*year/i.test(rawTitle)) yearKey = '5th Year (পঞ্চম বর্ষ)';
      else if (/master|ms|m\.sc|msc|ma|mba|llm/i.test(rawTitle)) yearKey = 'Master\'s (মাস্টার্স)';
      else {
        const parts = rawTitle.split(/semester/i);
        yearKey = parts[0]?.trim() || rawTitle;
      }

      if (!yearGroupsMap[yearKey]) {
        yearGroupsMap[yearKey] = {
          yearName: yearKey,
          semesters: [],
        };
      }
      yearGroupsMap[yearKey].semesters.push(item);
    });

    let runningTotalPoints = 0;
    let runningTotalCredits = 0;
    let runningTotalEarnedCredits = 0;

    const years = Object.values(yearGroupsMap).map((group, yIndex) => {
      let yearPoints = 0;
      let yearCredits = 0;
      let yearEarnedCredits = 0;

      const processedSemesters = group.semesters.map((item, sIndex) => {
        const sem = item.active;
        const credits = Number(sem.master.totalEarnCredit) || Number(sem.master.totalCourseCredit) || 0;
        const sgpa = Number(sem.master.gradePoint) || 0;
        const totalCred = Number(sem.master.totalCourseCredit) || credits;

        yearPoints += credits * sgpa;
        yearCredits += credits;
        yearEarnedCredits += Number(sem.master.totalEarnCredit) || 0;

        runningTotalPoints += credits * sgpa;
        runningTotalCredits += credits;
        runningTotalEarnedCredits += Number(sem.master.totalEarnCredit) || 0;

        return {
          uniqueKey: `sem-${yIndex}-${sIndex}`,
          raw: sem,
          title: sem.master.yearAndSemester || 'Semester',
          session: sem.master.sessionName || '—',
          sgpa,
          credits,
          totalCourseCredit: totalCred,
          resultValue: sem.master.resultValue || 'PASS',
          cumulativeCgpaSoFar: runningTotalCredits > 0 ? runningTotalPoints / runningTotalCredits : 0,
          isRetake: item.isRetake,
          previousAttemptSessions: item.previousAttemptSessions,
          attemptsCount: item.allAttempts.length,
        };
      });

      const yearGpa = yearCredits > 0 ? yearPoints / yearCredits : 0;

      return {
        yearName: group.yearName,
        semesters: processedSemesters,
        yearCredits,
        yearEarnedCredits,
        yearGpa,
      };
    });

    const overallCgpa = runningTotalCredits > 0 ? runningTotalPoints / runningTotalCredits : 0;

    return {
      years,
      totalCredits: runningTotalCredits,
      totalEarnedCredits: runningTotalEarnedCredits,
      overallCgpa,
      totalSemestersCount: activeSemesters.length,
      retakeSemestersCount,
    };
  }, [results]);

  // =========================================================================
  // 2. SIMULATION & UPCOMING SEMESTER FORECAST
  // =========================================================================
  const [simulatedSemesters, setSimulatedSemesters] = useState<SimulatedUpcomingSemester[]>([
    { id: 'sim-1', name: 'Upcoming Semester 1', credits: 18.0, sgpa: 3.75 },
  ]);
  const [targetGoalCgpa, setTargetGoalCgpa] = useState<number>(3.75);

  const addSimulatedSemester = () => {
    const nextIdx = simulatedSemesters.length + 1;
    setSimulatedSemesters((prev) => [
      ...prev,
      { id: `sim-${Date.now()}`, name: `Upcoming Semester ${nextIdx}`, credits: 18.0, sgpa: 3.75 },
    ]);
  };

  const removeSimulatedSemester = (id: string) => {
    setSimulatedSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSimulatedSemester = (id: string, field: 'name' | 'credits' | 'sgpa', val: any) => {
    setSimulatedSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const forecastResults = useMemo(() => {
    const baseCredits = parsedAccountData.totalCredits;
    const basePoints = parsedAccountData.totalCredits * parsedAccountData.overallCgpa;

    const simCredits = simulatedSemesters.reduce((acc, s) => acc + (Number(s.credits) || 0), 0);
    const simPoints = simulatedSemesters.reduce(
      (acc, s) => acc + (Number(s.credits) || 0) * (Number(s.sgpa) || 0),
      0
    );

    const projectedTotalCredits = baseCredits + simCredits;
    const projectedCgpa =
      projectedTotalCredits > 0 ? (basePoints + simPoints) / projectedTotalCredits : 0;

    const requiredSgpaForGoal =
      simCredits > 0
        ? (targetGoalCgpa * projectedTotalCredits - basePoints) / simCredits
        : 0;

    return {
      projectedTotalCredits,
      projectedCgpa,
      simCredits,
      requiredSgpaForGoal,
      cgpaDiff: projectedCgpa - parsedAccountData.overallCgpa,
    };
  }, [parsedAccountData, simulatedSemesters, targetGoalCgpa]);

  // =========================================================================
  // 3. CUSTOM MODE: FULL YEAR-WISE & SEMESTER-WISE CUSTOM CALCULATOR
  // =========================================================================
  const createDefaultSemester = (id: string, name: string, sgpa = 3.75, credits = 18.0): CustomSemester => ({
    id,
    name,
    credits,
    sgpa,
    isCourseMode: false,
    isExpandedCourses: false,
    courses: [
      { id: `c-${Date.now()}-1`, code: 'Course-1', title: 'Subject 1', credits: 3.0, gradePoint: 4.0 },
      { id: `c-${Date.now()}-2`, code: 'Course-2', title: 'Subject 2', credits: 3.0, gradePoint: 3.75 },
      { id: `c-${Date.now()}-3`, code: 'Course-3', title: 'Subject 3', credits: 3.0, gradePoint: 3.50 },
      { id: `c-${Date.now()}-4`, code: 'Course-4', title: 'Subject 4', credits: 3.0, gradePoint: 3.75 },
      { id: `c-${Date.now()}-5`, code: 'Course-5', title: 'Subject 5', credits: 3.0, gradePoint: 3.50 },
      { id: `c-${Date.now()}-6`, code: 'Lab-1', title: 'Practical / Lab', credits: 1.5, gradePoint: 4.0 },
    ],
  });

  const defaultCustomYears: CustomYear[] = [
    {
      id: 'y-1',
      yearName: '1st Year (প্রথম বর্ষ)',
      semesters: [
        createDefaultSemester('y1-s1', '1st Year 1st Semester', 3.75, 18.0),
        createDefaultSemester('y1-s2', '1st Year 2nd Semester', 3.75, 18.0),
      ],
    },
    {
      id: 'y-2',
      yearName: '2nd Year (দ্বিতীয় বর্ষ)',
      semesters: [
        createDefaultSemester('y2-s1', '2nd Year 1st Semester', 3.50, 18.0),
        createDefaultSemester('y2-s2', '2nd Year 2nd Semester', 3.50, 18.0),
      ],
    },
    {
      id: 'y-3',
      yearName: '3rd Year (তৃতীয় বর্ষ)',
      semesters: [
        createDefaultSemester('y3-s1', '3rd Year 1st Semester', 3.50, 18.0),
        createDefaultSemester('y3-s2', '3rd Year 2nd Semester', 3.50, 18.0),
      ],
    },
    {
      id: 'y-4',
      yearName: '4th Year (চতুর্থ বর্ষ)',
      semesters: [
        createDefaultSemester('y4-s1', '4th Year 1st Semester', 3.75, 18.0),
        createDefaultSemester('y4-s2', '4th Year 2nd Semester', 3.75, 18.0),
      ],
    },
  ];

  const [customYears, setCustomYears] = useState<CustomYear[]>(defaultCustomYears);

  const handleCloneFromAccount = () => {
    if (parsedAccountData.years.length === 0) return;
    const cloned: CustomYear[] = parsedAccountData.years.map((y, yIdx) => ({
      id: `custom-y-${yIdx}-${Date.now()}`,
      yearName: y.yearName,
      semesters: y.semesters.map((s, sIdx) => {
        const rawCourses = s.raw.detailsList || [];
        const mappedCourses: CourseItem[] = rawCourses.map((c, cIdx) => ({
          id: `c-${yIdx}-${sIdx}-${cIdx}-${Date.now()}`,
          code: c.courseCode || `C-${cIdx + 1}`,
          title: c.courseName || c.courseTitle || c.courseCode || `Course ${cIdx + 1}`,
          credits: Number(c.courseCredit) || 3.0,
          gradePoint: Number(c.gradePoint) || 3.75,
        }));

        return {
          id: `custom-s-${yIdx}-${sIdx}-${Date.now()}`,
          name: s.title,
          credits: s.credits,
          sgpa: s.sgpa,
          isCourseMode: mappedCourses.length > 0,
          isExpandedCourses: false,
          courses: mappedCourses.length > 0 ? mappedCourses : createDefaultSemester(`d-${Date.now()}`, s.title).courses,
        };
      }),
    }));
    setCustomYears(cloned);
    setCalculatorMode('custom');
  };

  const handleAddCustomYear = () => {
    const nextNum = customYears.length + 1;
    const yearTitle = nextNum <= 4 ? `${nextNum}${nextNum === 1 ? 'st' : nextNum === 2 ? 'nd' : nextNum === 3 ? 'rd' : 'th'} Year` : nextNum === 5 ? '5th Year' : `Year ${nextNum}`;
    const newYId = `custom-y-${Date.now()}`;
    setCustomYears((prev) => [
      ...prev,
      {
        id: newYId,
        yearName: `${yearTitle}`,
        semesters: [
          createDefaultSemester(`s-${Date.now()}-1`, `${yearTitle} 1st Semester`, 3.75, 18.0),
          createDefaultSemester(`s-${Date.now()}-2`, `${yearTitle} 2nd Semester`, 3.75, 18.0),
        ],
      },
    ]);
  };

  const handleRemoveCustomYear = (yearId: string) => {
    if (customYears.length <= 1) return;
    setCustomYears((prev) => prev.filter((y) => y.id !== yearId));
  };

  const handleAddCustomSemester = (yearId: string) => {
    setCustomYears((prev) =>
      prev.map((y) => {
        if (y.id !== yearId) return y;
        const semNum = y.semesters.length + 1;
        return {
          ...y,
          semesters: [
            ...y.semesters,
            createDefaultSemester(
              `sem-${Date.now()}`,
              `${y.yearName} ${semNum}${semNum === 1 ? 'st' : semNum === 2 ? 'nd' : semNum === 3 ? 'rd' : 'th'} Semester`,
              3.75,
              18.0
            ),
          ],
        };
      })
    );
  };

  const handleRemoveCustomSemester = (yearId: string, semId: string) => {
    setCustomYears((prev) =>
      prev.map((y) => {
        if (y.id !== yearId) return y;
        return {
          ...y,
          semesters: y.semesters.filter((s) => s.id !== semId),
        };
      })
    );
  };

  const handleUpdateCustomSemester = (
    yearId: string,
    semId: string,
    field: 'name' | 'credits' | 'sgpa' | 'isCourseMode' | 'isExpandedCourses',
    val: any
  ) => {
    setCustomYears((prev) =>
      prev.map((y) => {
        if (y.id !== yearId) return y;
        return {
          ...y,
          semesters: y.semesters.map((s) => (s.id === semId ? { ...s, [field]: val } : s)),
        };
      })
    );
  };

  const handleAddCourseToSemester = (yearId: string, semId: string) => {
    setCustomYears((prev) =>
      prev.map((y) => {
        if (y.id !== yearId) return y;
        return {
          ...y,
          semesters: y.semesters.map((s) => {
            if (s.id !== semId) return s;
            const newCourse: CourseItem = {
              id: `c-${Date.now()}`,
              code: `CSE-${s.courses.length + 1}01`,
              title: `Course ${s.courses.length + 1}`,
              credits: 3.0,
              gradePoint: 3.75,
            };
            return {
              ...s,
              isCourseMode: true,
              isExpandedCourses: true,
              courses: [...s.courses, newCourse],
            };
          }),
        };
      })
    );
  };

  const handleRemoveCourseFromSemester = (yearId: string, semId: string, courseId: string) => {
    setCustomYears((prev) =>
      prev.map((y) => {
        if (y.id !== yearId) return y;
        return {
          ...y,
          semesters: y.semesters.map((s) => {
            if (s.id !== semId) return s;
            return {
              ...s,
              courses: s.courses.filter((c) => c.id !== courseId),
            };
          }),
        };
      })
    );
  };

  const handleUpdateCourseInSemester = (
    yearId: string,
    semId: string,
    courseId: string,
    field: 'code' | 'title' | 'credits' | 'gradePoint',
    val: any
  ) => {
    setCustomYears((prev) =>
      prev.map((y) => {
        if (y.id !== yearId) return y;
        return {
          ...y,
          semesters: y.semesters.map((s) => {
            if (s.id !== semId) return s;
            return {
              ...s,
              isCourseMode: true,
              courses: s.courses.map((c) => (c.id === courseId ? { ...c, [field]: val } : c)),
            };
          }),
        };
      })
    );
  };

  const customCalculations = useMemo(() => {
    let runningPoints = 0;
    let runningCredits = 0;

    const yearsData = customYears.map((year) => {
      let yPoints = 0;
      let yCredits = 0;

      const semData = year.semesters.map((sem) => {
        let effectiveCredits = Number(sem.credits) || 0;
        let effectiveSgpa = Number(sem.sgpa) || 0;

        if (sem.isCourseMode && sem.courses && sem.courses.length > 0) {
          const cCred = sem.courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
          const cPoints = sem.courses.reduce(
            (sum, c) => sum + (Number(c.credits) || 0) * (Number(c.gradePoint) || 0),
            0
          );
          effectiveCredits = cCred;
          effectiveSgpa = cCred > 0 ? cPoints / cCred : 0;
        }

        yPoints += effectiveCredits * effectiveSgpa;
        yCredits += effectiveCredits;

        runningPoints += effectiveCredits * effectiveSgpa;
        runningCredits += effectiveCredits;

        return {
          ...sem,
          effectiveCredits,
          effectiveSgpa,
          cumulGpaSoFar: runningCredits > 0 ? runningPoints / runningCredits : 0,
        };
      });

      const yearGpa = yCredits > 0 ? yPoints / yCredits : 0;

      return {
        ...year,
        semesters: semData,
        yearCredits: yCredits,
        yearGpa,
      };
    });

    const totalCredits = runningCredits;
    const overallCgpa = totalCredits > 0 ? runningPoints / totalCredits : 0;

    return {
      years: yearsData,
      totalCredits,
      overallCgpa,
    };
  }, [customYears]);

  // Filtered Portals List
  const filteredPortals = useMemo(() => {
    return RU_OFFICIAL_LINKS.filter((item) => {
      const matchCat = portalCategory === 'All' || item.category === portalCategory;
      const q = portalSearchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.banglaTitle.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q);

      return matchCat && matchSearch;
    });
  }, [portalCategory, portalSearchQuery]);

  const portalCategoriesList = ['All', 'Health & Insurance', 'Academic & Exam', 'Hall & Campus', 'IT, Email & Library', 'University Portals'];

  const handleCopyPhone = (phone: string, index: number) => {
    navigator.clipboard.writeText(phone);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Primary View Switcher: RU Offices & Directory vs Student Hub */}
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0 border border-emerald-300/40 dark:border-emerald-800/40">
            {localSubView === 'directory' ? <Building2 className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {localSubView === 'directory' ? 'RU Offices & Directory (অফিস ও শিক্ষক-কর্মকর্তা ডিরেক্টরি)' : 'Student Hub & Academic Tools (শিক্ষার্থী কর্নার ও টুলস)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {localSubView === 'directory'
                ? 'রাজশাহী বিশ্ববিদ্যালয় শিক্ষক, কর্মকর্তা ও কর্মচারীদের লাইভ সার্চ ও বিভাগভিত্তিক ডিরেক্টরি'
                : 'সিজিপিএ ক্যালকুলেটর, জেনিত লাইফ বীমা, সার্টিফিকেট আবেদন, অফিশিয়াল পোর্টাল ও হেল্পলাইন'}
            </p>
          </div>
        </div>

        {/* View Selection Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto shrink-0">
          <button
            onClick={() => handleSubViewChange('directory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              localSubView === 'directory'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>RU Offices & Directory</span>
          </button>
          <button
            onClick={() => handleSubViewChange('hub')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              localSubView === 'hub'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Hub & Tools</span>
          </button>
        </div>
      </div>

      {/* 1. RU Offices & Directory View (Dynamically powered by profile.ru.ac.bd) */}
      {localSubView === 'directory' && (
        <RuDirectory profile={profile} />
      )}

      {/* 2. Student Hub & Academic Tools (All previous features unchanged) */}
      {localSubView === 'hub' && (
        <div className="space-y-6">

          {/* Top Banner Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-700/50 dark:border-emerald-800/40 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 dark:bg-emerald-500/20 text-emerald-100 border border-white/20 dark:border-emerald-500/30 mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Academic Hub & Student Utilities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Student Services & Academic Hub (শিক্ষার্থী সেবা ও টুলস)
              </h2>
              <p className="mt-2 text-sm sm:text-base text-emerald-100/90 dark:text-slate-300 max-w-2xl leading-relaxed">
                Official RU e-Services, Student Health & Life Insurance (Zenith Life), Certificate Application, Year/Semester CGPA Analytics, and campus emergency helplines.
              </p>
            </div>

            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'links', label: 'Official RU Portals & Insurance', icon: Globe },
          { id: 'calculator', label: 'Year & Semester CGPA Calculator', icon: Calculator },
          { id: 'grading', label: 'Grading Scale & Rules', icon: Award },
          { id: 'emergency', label: 'Campus Helplines', icon: PhoneCall },
          { id: 'faq', label: 'Student FAQ & Guides', icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: OFFICIAL RU PORTALS & STUDENT INSURANCE                        */}
      {/* ========================================================================= */}
      {activeSection === 'links' && (
        <div className="space-y-6">

          {/* Featured Highlights (Student Insurance & Certificate Application) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Student Insurance Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 border border-emerald-700/50 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                    Student Health & Life Takaful
                  </span>
                  <HeartPulse className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold">
                  RU Student Insurance (Zenith Islami Life)
                </h3>
                <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                  শিক্ষার্থী স্বাস্থ্য ও জীবন বীমা প্রকল্প (Zenith Life BD)
                </p>
                <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">
                  All enrolled students of Rajshahi University are covered for hospitalization medical bills, accident coverage, critical illness, and life takaful. Access claim forms and policy benefits.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-emerald-800/60 flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-mono">zenithlifebd.com</span>
                <a
                  href="https://www.zenithlifebd.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Open Insurance Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Certificate & Transcript Application Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 border border-emerald-800/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                    Official Online Application
                  </span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold">
                  Certificate & Academic Transcript Application
                </h3>
                <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                  সার্টিফিকেট ও ট্রান্সক্রিপ্ট অনলাইন আবেদন পোর্টাল
                </p>
                <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">
                  Apply online for provisional/original graduation certificates, academic transcripts, and marksheet verification with automated fee payment and tracking.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-mono">applycert.ru.ac.bd</span>
                <a
                  href="https://applycert.ru.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Apply Online</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

          {/* Search & Category Filter Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={portalSearchQuery}
                  onChange={(e) => setPortalSearchQuery(e.target.value)}
                  placeholder="Search portals, insurance, certificates, exam..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <strong>{filteredPortals.length}</strong> university portals & online services
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
              {portalCategoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPortalCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    portalCategory === cat
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Portals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPortals.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {link.badge}
                    </span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                    {link.banglaTitle}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {link.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="font-mono text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    {link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span>Visit</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: YEAR-WISE & SEMESTER-WISE CGPA ANALYTICS & TARGET CALCULATOR   */}
      {/* ========================================================================= */}
      {activeSection === 'calculator' && (
        <div className="space-y-6">

          {/* Mode Switcher Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs gap-3">
            <div className="flex items-center space-x-2.5 pl-1">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {calculatorMode === 'account' ? 'Auto-Synced Account Mode (অ্যাকাউন্ট থেকে অটো লোড)' : 'Custom Year-wise & Semester-wise Mode (কাস্টম মোড)'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {calculatorMode === 'account'
                    ? `Results auto-loaded for ${profile?.name || 'Student'} (Latest Retake/Improvement counted)`
                    : 'Manually type SGPA/credits or add individual courses in any semester freely'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {calculatorMode === 'custom' && (
                <button
                  onClick={handleCloneFromAccount}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center space-x-1 cursor-pointer"
                  title="Copy real account results and courses into custom calculator"
                >
                  <CopyPlus className="w-3.5 h-3.5" />
                  <span>Copy from Account</span>
                </button>
              )}

              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setCalculatorMode('account')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    calculatorMode === 'account'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Auto Account Data
                </button>
                <button
                  onClick={() => setCalculatorMode('custom')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    calculatorMode === 'custom'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Custom Calculator
                </button>
              </div>
            </div>
          </div>

          {/* 1. AUTO ACCOUNT DATA MODE */}
          {calculatorMode === 'account' && (
            <div className="space-y-6">
              
              {/* Retake Notice Badge */}
              {parsedAccountData.retakeSemestersCount > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Retake / Improvement Sync Active:</strong> Detected {parsedAccountData.retakeSemestersCount} semester(s) with previous retakes/improvements. The <strong>latest passed/updated session attempt</strong> has been automatically counted for your official CGPA.
                  </span>
                </div>
              )}

              {/* Account CGPA Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Overall CGPA (সিজিপিএ)</span>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {parsedAccountData.overallCgpa > 0 ? parsedAccountData.overallCgpa.toFixed(2) : '—'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 inline" />
                    Latest results auto-calculated
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Earned Credits (ক্রেডিট)</span>
                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    {parsedAccountData.totalEarnedCredits} <span className="text-base font-medium text-slate-500 dark:text-slate-400">/ {parsedAccountData.totalCredits}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Across {parsedAccountData.totalSemestersCount} published semester(s)
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Academic Standing</span>
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {parsedAccountData.overallCgpa >= 3.75
                      ? 'First Class with Distinction'
                      : parsedAccountData.overallCgpa >= 3.0
                      ? 'First Class (১ম শ্রেণি)'
                      : parsedAccountData.overallCgpa >= 2.25
                      ? 'Second Class (২য় শ্রেণি)'
                      : 'Passing Threshold'}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                    RU Official Ordinance Standard
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Completed Progress</span>
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    {parsedAccountData.years.length} <span className="text-base font-medium text-slate-500 dark:text-slate-400">Year(s)</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Session: {profile?.sessionName || '—'}
                  </p>
                </div>

              </div>

              {/* Year-by-Year & Semester-by-Semester Matrix */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Year-wise & Semester-wise Completed Results</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Auto-loaded from your student account. Click any semester to view course mark details.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Live Account Data
                  </span>
                </div>

                {parsedAccountData.years.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No completed semester results found in your account.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {parsedAccountData.years.map((yearGroup, yIdx) => (
                      <div
                        key={yIdx}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-4"
                      >
                        {/* Year Header Bar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                              {yearGroup.yearName}
                            </h4>
                          </div>

                          <div className="flex items-center space-x-3 text-xs">
                            <div className="bg-emerald-100/70 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <span className="text-slate-600 dark:text-slate-400">Year GPA (YGPA): </span>
                              <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                                {yearGroup.yearGpa.toFixed(2)}
                              </span>
                            </div>
                            <div className="bg-slate-200/70 dark:bg-slate-800 px-3 py-1 rounded-lg">
                              <span className="text-slate-600 dark:text-slate-400">Credits: </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {yearGroup.yearEarnedCredits} / {yearGroup.yearCredits}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Semesters inside Year */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {yearGroup.semesters.map((sem) => {
                            const isExpanded = expandedSemIndex === sem.uniqueKey;
                            const isPass = sem.resultValue === 'PASS';

                            return (
                              <div
                                key={sem.uniqueKey}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                                      {sem.title}
                                    </h5>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                      Session: {sem.session}
                                    </p>
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    {sem.isRetake && (
                                      <span
                                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                                        title={`Retaken/Improved attempt (Session: ${sem.session})`}
                                      >
                                        Latest Retake
                                      </span>
                                    )}
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        isPass
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                          : 'bg-rose-50 text-rose-700 border-rose-200'
                                      }`}
                                    >
                                      {sem.resultValue}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                                  <div>
                                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">SGPA</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-base">
                                      {sem.sgpa.toFixed(2)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Credits</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                      {sem.credits} Cr
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Cumul. CGPA</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                      {sem.cumulativeCgpaSoFar.toFixed(2)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={() => setExpandedSemIndex(isExpanded ? null : sem.uniqueKey)}
                                  className="w-full text-center py-1.5 px-2 rounded text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                                >
                                  <span>{isExpanded ? 'Hide Course Marks' : 'View Course Marks'}</span>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {isExpanded && sem.raw.detailsList && (
                                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
                                    <table className="w-full text-left text-[11px]">
                                      <thead>
                                        <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                          <th className="pb-1">Code</th>
                                          <th className="pb-1 text-center">Credit</th>
                                          <th className="pb-1 text-center">Internal</th>
                                          <th className="pb-1 text-center">Final</th>
                                          <th className="pb-1 text-center">Grade</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {sem.raw.detailsList.map((c, cIdx) => (
                                          <tr key={cIdx} className="text-slate-700 dark:text-slate-300">
                                            <td className="py-1 font-mono">{c.courseCode}</td>
                                            <td className="py-1 text-center">{c.courseCredit}</td>
                                            <td className="py-1 text-center text-emerald-700 dark:text-emerald-400 font-medium">
                                              {c.caMark ?? '—'}
                                            </td>
                                            <td className="py-1 text-center">{c.finalMark ?? '—'}</td>
                                            <td className="py-1 text-center font-bold text-emerald-700 dark:text-emerald-400">
                                              {c.gradeName || '—'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Semester Forecast & Target Simulator */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Upcoming Semester Forecast & Target CGPA Simulator</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Simulate upcoming semesters to forecast your final graduation CGPA.
                    </p>
                  </div>
                  <button
                    onClick={addSimulatedSemester}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Future Semester</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                      Projected Final CGPA
                    </span>
                    <p className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                      {forecastResults.projectedCgpa.toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                      {forecastResults.cgpaDiff >= 0 ? `+${forecastResults.cgpaDiff.toFixed(2)} from current` : `${forecastResults.cgpaDiff.toFixed(2)} from current`}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Total Projected Credits
                    </span>
                    <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                      {forecastResults.projectedTotalCredits} Cr
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Current: {parsedAccountData.totalCredits} Cr + Sim: {forecastResults.simCredits} Cr
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                      Required Avg SGPA for Goal ({targetGoalCgpa.toFixed(2)})
                    </span>
                    <p className={`text-3xl font-extrabold mt-1 ${forecastResults.requiredSgpaForGoal > 4.0 ? 'text-rose-600' : 'text-amber-900 dark:text-amber-200'}`}>
                      {forecastResults.requiredSgpaForGoal > 4.0
                        ? 'N/A (> 4.00)'
                        : forecastResults.requiredSgpaForGoal <= 0
                        ? 'Already Achieved'
                        : forecastResults.requiredSgpaForGoal.toFixed(2)}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      Needed across future simulated semesters
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Set Target Cumulative CGPA Goal (কাঙ্ক্ষিত সিজিপিএ লক্ষ্য):</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm font-mono">
                      {targetGoalCgpa.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2.50"
                    max="4.00"
                    step="0.05"
                    value={targetGoalCgpa}
                    onChange={(e) => setTargetGoalCgpa(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>2.50</span>
                    <span>3.00 (First Class)</span>
                    <span>3.50</span>
                    <span>3.75 (Distinction)</span>
                    <span>4.00 (Max)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Simulated Future Semesters:
                  </label>

                  {simulatedSemesters.map((sim, idx) => (
                    <div
                      key={sim.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={sim.name}
                          onChange={(e) => updateSimulatedSemester(sim.id, 'name', e.target.value)}
                          placeholder={`Upcoming Semester ${idx + 1}`}
                          className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                        />
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-28">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Credits</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={sim.credits}
                            onChange={(e) => updateSimulatedSemester(sim.id, 'credits', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold"
                          />
                        </div>

                        <div className="w-36">
                          <label className="text-[10px] text-slate-400 block mb-0.5">Target SGPA</label>
                          <select
                            value={sim.sgpa}
                            onChange={(e) => updateSimulatedSemester(sim.id, 'sgpa', parseFloat(e.target.value))}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold"
                          >
                            {RU_GRADE_SCALE.map((g) => (
                              <option key={g.grade} value={g.gpa}>
                                {g.grade} ({g.gpa.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => removeSimulatedSemester(sim.id)}
                          className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove Semester"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

          {/* 2. CUSTOM MODE: YEAR-WISE & SEMESTER-WISE BUILDER */}
          {calculatorMode === 'custom' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Custom Cumulative CGPA</span>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {customCalculations.overallCgpa.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Live calculated across all custom years
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Total Custom Credits</span>
                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    {customCalculations.totalCredits} Cr
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Across {customCalculations.years.length} Academic Year(s)
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Standing Classification</span>
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {customCalculations.overallCgpa >= 3.75
                      ? 'First Class with Distinction'
                      : customCalculations.overallCgpa >= 3.0
                      ? 'First Class (১ম শ্রেণি)'
                      : customCalculations.overallCgpa >= 2.25
                      ? 'Second Class (২য় শ্রেণি)'
                      : 'Passing Threshold'}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                    RU 4.00 Scale Standard
                  </p>
                </div>

              </div>

              {/* Year-by-Year Custom Builder */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-6">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span>Custom Year-wise & Semester-wise Calculator</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Type SGPA/credits manually or expand any semester to add individual courses!
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddCustomYear}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Year</span>
                    </button>
                    <button
                      onClick={() => setCustomYears(defaultCustomYears)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                      Reset Template
                    </button>
                  </div>
                </div>

                {/* Years List */}
                <div className="space-y-6">
                  {customCalculations.years.map((yearGroup) => (
                    <div
                      key={yearGroup.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
                          <input
                            type="text"
                            value={yearGroup.yearName}
                            onChange={(e) =>
                              setCustomYears((prev) =>
                                prev.map((y) => (y.id === yearGroup.id ? { ...y, yearName: e.target.value } : y))
                              )
                            }
                            className="font-bold text-base text-slate-900 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-600 px-1"
                          />
                        </div>

                        <div className="flex items-center space-x-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
                          <div className="bg-emerald-100/70 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <span className="text-slate-600 dark:text-slate-400">Year GPA: </span>
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                              {yearGroup.yearGpa.toFixed(2)}
                            </span>
                          </div>

                          <div className="bg-slate-200/70 dark:bg-slate-800 px-3 py-1 rounded-lg">
                            <span className="text-slate-600 dark:text-slate-400">Credits: </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {yearGroup.yearCredits} Cr
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddCustomSemester(yearGroup.id)}
                            className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                            title="Add Semester to this year"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleRemoveCustomYear(yearGroup.id)}
                            disabled={customYears.length <= 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Remove Year"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Semesters Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {yearGroup.semesters.map((sem) => (
                          <div
                            key={sem.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={sem.name}
                                onChange={(e) =>
                                  handleUpdateCustomSemester(yearGroup.id, sem.id, 'name', e.target.value)
                                }
                                className="font-bold text-sm text-slate-800 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-600 px-1 w-2/3"
                              />

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() =>
                                    handleUpdateCustomSemester(
                                      yearGroup.id,
                                      sem.id,
                                      'isExpandedCourses',
                                      !sem.isExpandedCourses
                                    )
                                  }
                                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-colors flex items-center space-x-1 cursor-pointer ${
                                    sem.isExpandedCourses
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                  }`}
                                  title="Add or Edit Courses inside this semester"
                                >
                                  <ListPlus className="w-3.5 h-3.5" />
                                  <span>{sem.isExpandedCourses ? 'Hide Courses' : `Courses (${sem.courses.length})`}</span>
                                </button>

                                <button
                                  onClick={() => handleRemoveCustomSemester(yearGroup.id, sem.id)}
                                  disabled={yearGroup.semesters.length <= 1}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  title="Remove Semester"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Direct Typing Inputs */}
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    Credits (ক্রেডিট)
                                  </label>
                                  {sem.isCourseMode && (
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Auto-Sum
                                    </span>
                                  )}
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={sem.isCourseMode ? sem.effectiveCredits : sem.credits}
                                  disabled={sem.isCourseMode}
                                  onChange={(e) =>
                                    handleUpdateCustomSemester(
                                      yearGroup.id,
                                      sem.id,
                                      'credits',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border ${
                                    sem.isCourseMode
                                      ? 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                                  }`}
                                />
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    Semester SGPA
                                  </label>
                                  {sem.isCourseMode && (
                                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Course-Calc
                                    </span>
                                  )}
                                </div>

                                {sem.isCourseMode ? (
                                  <input
                                    type="text"
                                    disabled
                                    value={sem.effectiveSgpa.toFixed(2)}
                                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-emerald-700 dark:text-emerald-400 cursor-not-allowed"
                                  />
                                ) : (
                                  <div className="flex items-center space-x-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max="4.0"
                                      step="0.01"
                                      value={sem.sgpa}
                                      onChange={(e) =>
                                        handleUpdateCustomSemester(
                                          yearGroup.id,
                                          sem.id,
                                          'sgpa',
                                          Math.min(4.0, Math.max(0, parseFloat(e.target.value) || 0))
                                        )
                                      }
                                      className="w-full px-2 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400"
                                    />
                                    <select
                                      value={sem.sgpa}
                                      onChange={(e) =>
                                        handleUpdateCustomSemester(
                                          yearGroup.id,
                                          sem.id,
                                          'sgpa',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-16 px-1 py-1.5 text-[10px] font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    >
                                      {RU_GRADE_SCALE.map((g) => (
                                        <option key={g.grade} value={g.gpa}>
                                          {g.grade}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex items-center justify-between text-[11px] px-1">
                              <label className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sem.isCourseMode}
                                  onChange={(e) =>
                                    handleUpdateCustomSemester(
                                      yearGroup.id,
                                      sem.id,
                                      'isCourseMode',
                                      e.target.checked
                                    )
                                  }
                                  className="accent-emerald-600 rounded"
                                />
                                <span className="text-slate-600 dark:text-slate-300 font-medium">
                                  Calculate SGPA from individual courses
                                </span>
                              </label>

                              <span className="font-mono text-slate-500 text-[10px]">
                                Cumul: <strong className="text-slate-800 dark:text-slate-200">{sem.cumulGpaSoFar.toFixed(2)}</strong>
                              </span>
                            </div>

                            {/* Expandable Course List */}
                            {sem.isExpandedCourses && (
                              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Courses in {sem.name}:
                                  </span>
                                  <button
                                    onClick={() => handleAddCourseToSemester(yearGroup.id, sem.id)}
                                    className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add Course</span>
                                  </button>
                                </div>

                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                  {sem.courses.map((course, cIdx) => (
                                    <div
                                      key={course.id}
                                      className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs"
                                    >
                                      <input
                                        type="text"
                                        value={course.title}
                                        onChange={(e) =>
                                          handleUpdateCourseInSemester(
                                            yearGroup.id,
                                            sem.id,
                                            course.id,
                                            'title',
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Course ${cIdx + 1}`}
                                        className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                      />

                                      <div className="w-16">
                                        <input
                                          type="number"
                                          min="0.5"
                                          step="0.5"
                                          value={course.credits}
                                          onChange={(e) =>
                                            handleUpdateCourseInSemester(
                                              yearGroup.id,
                                              sem.id,
                                              course.id,
                                              'credits',
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-1.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-center font-semibold"
                                          placeholder="Cr"
                                        />
                                      </div>

                                      <div className="w-24">
                                        <select
                                          value={course.gradePoint}
                                          onChange={(e) =>
                                            handleUpdateCourseInSemester(
                                              yearGroup.id,
                                              sem.id,
                                              course.id,
                                              'gradePoint',
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className="w-full px-1.5 py-1 text-xs font-bold rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400"
                                        >
                                          {RU_GRADE_SCALE.map((g) => (
                                            <option key={g.grade} value={g.gpa}>
                                              {g.grade} ({g.gpa.toFixed(2)})
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <button
                                        onClick={() => handleRemoveCourseFromSemester(yearGroup.id, sem.id, course.id)}
                                        disabled={sem.courses.length <= 1}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded disabled:opacity-30 transition-colors"
                                        title="Remove Course"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: GRADING SCALE & ACADEMIC ORDINANCE                             */}
      {/* ========================================================================= */}
      {activeSection === 'grading' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Official RU Uniform Grading System (রাজশাহী বিশ্ববিদ্যালয় গ্রেডিং স্কেল)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Standard 4.00 CGPA Scale approved by Academic Council for all faculties.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                4.00 Max Point
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Numerical Marks Range</th>
                    <th className="py-3 px-4">Letter Grade</th>
                    <th className="py-3 px-4">Grade Point</th>
                    <th className="py-3 px-4">Performance Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {RU_GRADE_SCALE.map((item, idx) => (
                    <tr
                      key={item.grade}
                      className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/40'}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                        {item.range}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                        {item.grade}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-100">
                        {item.gpa.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {item.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  First Class with Distinction
                </p>
                <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200 mt-1">
                  CGPA 3.75 - 4.00
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                  Highest honor graduation benchmark
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                  First Class
                </p>
                <p className="text-xl font-extrabold text-blue-900 dark:text-blue-200 mt-1">
                  CGPA 3.00 - 3.74
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                  Standard Honors distinction
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  Second Class
                </p>
                <p className="text-xl font-extrabold text-amber-900 dark:text-amber-200 mt-1">
                  CGPA 2.25 - 2.99
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                  Qualifying graduation threshold
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: CAMPUS HELPLINES                                               */}
      {/* ========================================================================= */}
      {activeSection === 'emergency' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMERGENCY_CONTACTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        {item.name}
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        {item.bangla}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.note}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Landline:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.phone}</span>
                        <button
                          onClick={() => handleCopyPhone(item.phone, idx * 2)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 cursor-pointer"
                          title="Copy Number"
                        >
                          {copiedIndex === idx * 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {item.mobile && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Mobile / Direct:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.mobile}</span>
                          <button
                            onClick={() => handleCopyPhone(item.mobile!, idx * 2 + 1)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 cursor-pointer"
                            title="Copy Number"
                          >
                            {copiedIndex === idx * 2 + 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: FAQ & GUIDANCE                                                 */}
      {/* ========================================================================= */}
      {activeSection === 'faq' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              Student Help & Academic Guidelines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Common questions regarding Zenith Life insurance coverage, result publication, improvement criteria, transcripts, and portal synchronization.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {FAQ_ITEMS.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-start space-x-2">
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Q:</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

        </div>
      )}

    </div>
  );
};

