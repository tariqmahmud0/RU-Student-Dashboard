import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Users,
  Copy,
  Check,
  X,
  BookOpen,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import { OfficeItem, EmployeeItem, StudentInfo } from '../types';
import { TeacherProfileModal } from './TeacherProfileModal';
import {
  getRuOffices,
  getRuTeachers,
  getRuOfficers,
  getRuStaffs,
  searchRuEmployees,
  formatProfileImgUrl
} from '../api';

interface RuDirectoryProps {
  profile?: StudentInfo | null;
}

type OfficeCategory = 'all' | 'department' | 'faculty' | 'institute' | 'hall' | 'administration';
type RoleFilter = 'all' | 'teacher' | 'officer' | 'staff';

// Extract research interests string list safely
function parseResearchInterests(interests?: any[]): string[] {
  if (!interests || !Array.isArray(interests)) return [];
  const list: string[] = [];
  interests.forEach((item) => {
    if (typeof item === 'string' && item.trim().length > 0) {
      list.push(item.trim());
    } else if (item && typeof item === 'object') {
      const val = item.topic || item.interest || item.research_topic || item.name || '';
      if (typeof val === 'string' && val.trim().length > 0) {
        list.push(val.trim());
      }
    }
  });
  return list;
}

export const RuDirectory: React.FC<RuDirectoryProps> = ({ profile }) => {
  // State
  const [offices, setOffices] = useState<OfficeItem[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [officeCategory, setOfficeCategory] = useState<OfficeCategory>('department');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [remoteSearchResults, setRemoteSearchResults] = useState<EmployeeItem[]>([]);
  
  // Office cache to avoid re-fetching: officeId -> { teachers, officers, staffs }
  const officeCache = useRef<Map<number, { teachers: EmployeeItem[]; officers: EmployeeItem[]; staffs: EmployeeItem[] }>>(new Map());
  
  const [teachers, setTeachers] = useState<EmployeeItem[]>([]);
  const [officers, setOfficers] = useState<EmployeeItem[]>([]);
  const [staffs, setStaffs] = useState<EmployeeItem[]>([]);
  
  const [isLoadingOffices, setIsLoadingOffices] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copied email tooltip state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Selected employee for full profile modal
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);

  // Initial Load: Fetch Offices
  useEffect(() => {
    let mounted = true;
    async function loadOffices() {
      setIsLoadingOffices(true);
      setError(null);
      try {
        const list = await getRuOffices();
        if (!mounted) return;
        
        // Filter out invalid/empty offices
        const validList = list.filter(
          (o) => o && o.office_name && o.office_name.trim().length > 0 && o.office_name !== '723'
        );
        setOffices(validList);

        // Match student's department or default to CSE or first department
        let initialOffice = validList.find(
          (o) => profile?.departmentName && o.office_name.toLowerCase().includes(profile.departmentName.toLowerCase())
        );

        if (!initialOffice) {
          initialOffice = validList.find((o) => o.id === 37) || validList.find((o) => o.office_type === 'department') || validList[0];
        }

        if (initialOffice) {
          setSelectedOfficeId(initialOffice.id);
          if (initialOffice.office_type) {
            setOfficeCategory(initialOffice.office_type as OfficeCategory);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError('Failed to connect to RU Profile directory. Please check network connection.');
        }
      } finally {
        if (mounted) setIsLoadingOffices(false);
      }
    }
    loadOffices();
    return () => {
      mounted = false;
    };
  }, [profile]);

  // Load personnel for selected office (with in-memory cache)
  useEffect(() => {
    if (!selectedOfficeId) return;

    // Check cache first
    if (officeCache.current.has(selectedOfficeId)) {
      const cached = officeCache.current.get(selectedOfficeId)!;
      setTeachers(cached.teachers);
      setOfficers(cached.officers);
      setStaffs(cached.staffs);
      return;
    }

    let mounted = true;
    async function loadOfficePersonnel() {
      setIsLoadingMembers(true);
      setError(null);
      try {
        const [teacherList, officerList, staffList] = await Promise.all([
          getRuTeachers(selectedOfficeId!),
          getRuOfficers(selectedOfficeId!),
          getRuStaffs(selectedOfficeId!),
        ]);

        if (!mounted) return;
        officeCache.current.set(selectedOfficeId!, {
          teachers: teacherList,
          officers: officerList,
          staffs: staffList,
        });

        setTeachers(teacherList);
        setOfficers(officerList);
        setStaffs(staffList);
      } catch (err: any) {
        if (mounted) setError('Failed to load personnel list for selected office.');
      } finally {
        if (mounted) setIsLoadingMembers(false);
      }
    }

    loadOfficePersonnel();
    return () => {
      mounted = false;
    };
  }, [selectedOfficeId]);

  // Universal Search Handler (Debounced remote search + department matching)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setRemoteSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        // Check if search query matches a department name:
        const matchingOffice = offices.find((o) =>
          o.office_name.toLowerCase().includes(trimmed.toLowerCase())
        );

        if (matchingOffice && matchingOffice.id !== selectedOfficeId) {
          // Pre-fetch matching department faculty if not in cache
          if (!officeCache.current.has(matchingOffice.id)) {
            const [tList, oList, sList] = await Promise.all([
              getRuTeachers(matchingOffice.id),
              getRuOfficers(matchingOffice.id),
              getRuStaffs(matchingOffice.id),
            ]);
            officeCache.current.set(matchingOffice.id, {
              teachers: tList,
              officers: oList,
              staffs: sList,
            });
          }
        }

        // Call remote API public-search
        const results = await searchRuEmployees(trimmed);
        setRemoteSearchResults(results || []);
      } catch (_e) {
        setRemoteSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, offices, selectedOfficeId]);

  // Copy email helper
  const handleCopyEmail = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Current selected office
  const currentOffice = useMemo(() => {
    return offices.find((o) => o.id === selectedOfficeId) || null;
  }, [offices, selectedOfficeId]);

  // Filtered offices based on category & search query
  const filteredOffices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = offices;
    if (officeCategory !== 'all') {
      list = list.filter((o) => o.office_type === officeCategory);
    }
    if (q.length >= 2) {
      // Prioritize offices matching query
      const matching = list.filter((o) => o.office_name.toLowerCase().includes(q));
      if (matching.length > 0) return matching;
    }
    return list;
  }, [offices, officeCategory, searchQuery]);

  // Unified Personnel List (Hybrid Local Filter + Remote Search + Cached Offices)
  const displayPersonnel = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. If searching, aggregate from active office + matching cached offices + remote search results
    if (q.length >= 1) {
      const pool: EmployeeItem[] = [];

      // A) All personnel in current office
      pool.push(...teachers, ...officers, ...staffs);

      // B) Any cached offices matching search
      officeCache.current.forEach((data) => {
        pool.push(...data.teachers, ...data.officers, ...data.staffs);
      });

      // C) Remote search API results
      pool.push(...remoteSearchResults);

      // Filter pool by query string (Name, Designation, Office, Education, Email, Research Interests)
      const matches = pool.filter((emp) => {
        const name = (emp.display_name || emp.name || '').toLowerCase();
        const designation = (emp.display_designation || emp.designation || '').toLowerCase();
        const office = (emp.office || '').toLowerCase();
        const edu = (emp.education_short || '').toLowerCase();
        const mail = (emp.university_mail || '').toLowerCase();
        const interests = parseResearchInterests(emp.research_interests).join(' ').toLowerCase();

        return (
          name.includes(q) ||
          designation.includes(q) ||
          office.includes(q) ||
          edu.includes(q) ||
          mail.includes(q) ||
          interests.includes(q)
        );
      });

      // Deduplicate by salary_id or name
      const seen = new Set<string>();
      const unique = matches.filter((item) => {
        const key = item.salary_id || item.name;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Apply Role Filter
      if (roleFilter === 'all') return unique;
      return unique.filter((emp) => {
        const des = (emp.designation || emp.display_designation || '').toLowerCase();
        if (roleFilter === 'teacher') {
          return des.includes('professor') || des.includes('lecturer') || des.includes('teacher') || emp.role_category === 'teacher';
        }
        if (roleFilter === 'officer') {
          return (
            des.includes('officer') ||
            des.includes('engineer') ||
            des.includes('programmer') ||
            des.includes('registrar') ||
            des.includes('director') ||
            emp.role_category === 'officer'
          );
        }
        if (roleFilter === 'staff') {
          return (
            des.includes('staff') ||
            des.includes('attendant') ||
            des.includes('assistant') ||
            des.includes('driver') ||
            des.includes('peon') ||
            emp.role_category === 'staff'
          );
        }
        return true;
      });
    }

    // 2. Normal Office Mode (No Search Query)
    let list: EmployeeItem[] = [];
    if (roleFilter === 'all') {
      list = [...teachers, ...officers, ...staffs];
    } else if (roleFilter === 'teacher') {
      list = teachers;
    } else if (roleFilter === 'officer') {
      list = officers;
    } else if (roleFilter === 'staff') {
      list = staffs;
    }

    return list;
  }, [searchQuery, teachers, officers, staffs, remoteSearchResults, roleFilter]);

  const quickSearchTags = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Pharmacy',
    'Law',
    'Economics',
    'English',
    'Professor',
    'Lecturer',
    'Chairman'
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header & Search Section */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-emerald-600/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-600/50 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100 mb-2 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>profile.ru.ac.bd Official Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              RU Offices & Personnel Directory
            </h2>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl">
              রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষক ও কর্মকর্তাদের তথ্য, যোগাযোগ ও প্রোফাইল ডিরেক্টরি।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://profile.ru.ac.bd/public"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors border border-white/20 shadow-sm"
            >
              <span>RU Profile Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Unified Search Bar */}
        <div className="mt-6 relative z-10">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by teacher name (e.g. Shamim, Musa), designation (e.g. Professor), department (e.g. CSE), or email..."
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-xl shadow-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm sm:text-base placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Search Suggestion Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5 text-xs">
            <span className="text-emerald-200/80 font-medium">Quick Search:</span>
            {quickSearchTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors border border-white/10 cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Office / Department Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  RU Offices & Departments
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold rounded-full">
                {offices.length} Total
              </span>
            </div>

            {/* Office Category Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setOfficeCategory('department')}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  officeCategory === 'department'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Departments (59)
              </button>
              <button
                onClick={() => setOfficeCategory('faculty')}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  officeCategory === 'faculty'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Faculties (12)
              </button>
              <button
                onClick={() => setOfficeCategory('institute')}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  officeCategory === 'institute'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Institutes (11)
              </button>
              <button
                onClick={() => setOfficeCategory('hall')}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  officeCategory === 'hall'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Halls (17)
              </button>
              <button
                onClick={() => setOfficeCategory('administration')}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  officeCategory === 'administration'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Admin (43)
              </button>
              <button
                onClick={() => setOfficeCategory('all')}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  officeCategory === 'all'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All (144)
              </button>
            </div>

            {/* Office List */}
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {isLoadingOffices ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs">Loading RU Offices...</p>
                </div>
              ) : filteredOffices.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No offices in this category.</p>
              ) : (
                filteredOffices.map((office) => {
                  const isSelected = selectedOfficeId === office.id && searchQuery.trim().length === 0;
                  return (
                    <button
                      key={office.id}
                      onClick={() => {
                        setSelectedOfficeId(office.id);
                        setSearchQuery(''); // Reset search query to focus on selected office
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-start justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold leading-snug">
                          {office.office_name}
                        </p>
                        {office.office_type && (
                          <span className="inline-block text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {office.office_type}
                          </span>
                        )}
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 mt-0.5 shrink-0 transition-transform ${
                          isSelected ? 'text-emerald-600 rotate-90' : 'text-slate-400 group-hover:translate-x-0.5'
                        }`}
                      />
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Personnel List & Search Results */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header Bar with Office Info & Role Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {searchQuery.trim().length >= 1 ? (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Search Results for &quot;{searchQuery}&quot;</span>
                    {isSearching && (
                      <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Found {displayPersonnel.length} personnel matching your search
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentOffice?.office_name || 'Select Department / Office'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>👨‍🏫 Teachers: <strong className="text-emerald-600 dark:text-emerald-400">{teachers.length}</strong></span>
                    <span>👔 Officers: <strong className="text-blue-600 dark:text-blue-400">{officers.length}</strong></span>
                    <span>👥 Staff: <strong className="text-purple-600 dark:text-purple-400">{staffs.length}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({displayPersonnel.length})
              </button>
              <button
                onClick={() => setRoleFilter('teacher')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'teacher'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Teachers
              </button>
              <button
                onClick={() => setRoleFilter('officer')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'officer'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Officers
              </button>
              <button
                onClick={() => setRoleFilter('staff')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleFilter === 'staff'
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Staff
              </button>
            </div>
          </div>

          {/* Personnel Cards Grid */}
          {isLoadingMembers && searchQuery.trim().length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                </div>
              ))}
            </div>
          ) : displayPersonnel.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No Personnel Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery.trim().length >= 1
                  ? `No teacher or staff found matching "${searchQuery}". Try searching by teacher's first or last name, department, or designation.`
                  : 'No personnel records available for this selected office and role filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayPersonnel.map((emp) => {
                const photoUrl = formatProfileImgUrl(emp.profile_img);
                const isChairman = emp.is_chairman;
                const designation = emp.display_designation || emp.designation || 'Faculty Member';
                const name = emp.display_name || emp.name;
                const email = emp.university_mail && emp.university_mail !== 'na' ? emp.university_mail : null;
                const interestsList = parseResearchInterests(emp.research_interests);

                return (
                  <div
                    key={emp.salary_id || emp.name}
                    className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                      isChairman
                        ? 'border-amber-400/60 dark:border-amber-500/40 bg-gradient-to-b from-amber-50/20 to-transparent dark:from-amber-950/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top: Avatar & Academic Identity */}
                      <div className="flex items-start space-x-3.5">
                        <div className="relative shrink-0">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={name}
                              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600/30 bg-slate-100 dark:bg-slate-800"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/assets/default-avatar.svg';
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-lg border border-emerald-300 dark:border-emerald-800">
                              {name.charAt(0)}
                            </div>
                          )}

                          {isChairman && (
                            <span
                              className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xs text-[10px]"
                              title="Department Chairman / Head"
                            >
                              ★
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">
                              {name}
                            </h4>
                            {isChairman && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold rounded-md border border-amber-300 dark:border-amber-800 text-[10px]">
                                Chairman
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 leading-snug">
                            {designation}
                          </p>

                          {emp.office && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">{emp.office}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Educational Credentials */}
                      {emp.education_short && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 line-clamp-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate font-medium">{emp.education_short}</span>
                        </div>
                      )}

                      {/* Research Interests Tags */}
                      {interestsList.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Research Interest:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {interestsList.slice(0, 3).map((interest, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] rounded-md font-medium border border-emerald-200/60 dark:border-emerald-800/50 truncate max-w-[200px]"
                              >
                                {interest}
                              </span>
                            ))}
                            {interestsList.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{interestsList.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Office Room / Place */}
                      {emp.office_address && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                          <span className="truncate">{emp.office_address}</span>
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {email ? (
                          <>
                            <a
                              href={`mailto:${email}`}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg text-xs transition-colors cursor-pointer"
                              title={`Send email to ${email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={(e) => handleCopyEmail(email, e)}
                              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                              title="Copy email address"
                            >
                              {copiedEmail === email ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] sm:max-w-[150px]">
                              {email}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No email public</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>View Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://profile.ru.ac.bd/public/profile/${emp.salary_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-xl text-xs transition-colors cursor-pointer"
                          title="Open official RU profile in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* Complete Teacher Profile Modal (With Basic, Academic History, Experience, Publications, Research, Awards, Resources, Others & CV) */}
      {selectedEmployee && (
        <TeacherProfileModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

    </div>
  );
};

