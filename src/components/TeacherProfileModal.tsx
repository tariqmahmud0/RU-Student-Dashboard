import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  FileText,
  Globe,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Sparkles,
  Link as LinkIcon,
  Layers,
  ChevronRight,
  ChevronLeft,
  Share2
} from 'lucide-react';
import { EmployeeItem, FullProfileData } from '../types';
import { getFullRuEmployeeProfile, downloadRuEmployeeCv, formatProfileImgUrl } from '../api';

interface TeacherProfileModalProps {
  employee: EmployeeItem;
  onClose: () => void;
}

type ProfileTab =
  | 'basic'
  | 'academic'
  | 'experience'
  | 'publications'
  | 'research'
  | 'awards'
  | 'resources'
  | 'others';

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ employee, onClose }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('basic');
  
  // Instant initial data so user sees teacher info in 0ms without waiting!
  const [data, setData] = useState<FullProfileData>(() => ({
    about: {
      id: employee.id,
      display_name: employee.display_name || employee.name,
      designation: employee.display_designation || employee.designation,
      office: employee.office,
      university_mail: employee.university_mail,
      profile_img: employee.profile_img,
      contact_no: employee.contact_no,
      office_address: employee.office_address,
      short_biography: '',
    },
    detail: null,
    educations: [],
    employments: [],
    publications: [],
    researchInterests: [],
    researchProjects: [],
    researchSupervisions: [],
    researchTalks: [],
    awards: [],
    memberships: [],
    extraDuties: [],
    resources: [],
    socialLinks: null,
    others: null,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingCv, setIsDownloadingCv] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [pubFilter, setPubFilter] = useState<string>('all');
  
  const mobileTabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const fullData = await getFullRuEmployeeProfile(employee.salary_id);
        if (!mounted) return;
        setData((prev) => ({
          ...prev,
          ...fullData,
          about: fullData.about || prev.about,
        }));
      } catch (_e) {
        // Retain fallback data
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [employee.salary_id]);

  const handleCopyEmail = (emailText: string) => {
    navigator.clipboard.writeText(emailText);
    setCopiedEmail(emailText);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCvDownload = async () => {
    setIsDownloadingCv(true);
    try {
      await downloadRuEmployeeCv(employee.salary_id, employee.display_name || employee.name);
    } finally {
      setIsDownloadingCv(false);
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    if (mobileTabContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      mobileTabContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const about = data.about;
  const detail = data.detail;
  const educations = data.educations || [];
  const employments = data.employments || [];
  const publications = data.publications || [];
  const researchInterests = data.researchInterests || [];
  const researchProjects = data.researchProjects || [];
  const researchSupervisions = data.researchSupervisions || [];
  const researchTalks = data.researchTalks || [];
  const awards = data.awards || [];
  const memberships = data.memberships || [];
  const extraDuties = data.extraDuties || [];
  const resources = data.resources || [];
  const socialLinks = data.socialLinks;
  const others = data.others;

  const photoUrl = formatProfileImgUrl(detail?.detail?.profile_img || about?.profile_img || employee.profile_img);
  const name = about?.display_name || employee.display_name || employee.name;
  const designation = about?.designation || employee.display_designation || employee.designation;
  const department = about?.office || employee.office;
  const isChairman = employee.is_chairman;
  const email = about?.university_mail || employee.university_mail;
  const phone = about?.contact_no;
  const officeAddress = about?.office_address || detail?.detail?.office_address || employee.office_address;

  // Filtered publications
  const filteredPublications = publications.filter((p) => {
    if (pubFilter === 'all') return true;
    return (p.type || '').toLowerCase() === pubFilter.toLowerCase();
  });

  const publicationTypes = Array.from(new Set(publications.map((p) => p.type).filter(Boolean)));

  const tabs: { id: ProfileTab; label: string; icon: any; count?: number }[] = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'academic', label: 'Academic History', icon: GraduationCap, count: educations.length },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: employments.length },
    { id: 'publications', label: 'Publications', icon: BookOpen, count: publications.length },
    {
      id: 'research',
      label: 'Research Activities',
      icon: Sparkles,
      count: researchInterests.length + researchProjects.length + researchSupervisions.length + researchTalks.length,
    },
    {
      id: 'awards',
      label: 'Awards & Memberships',
      icon: Award,
      count: awards.length + memberships.length + extraDuties.length,
    },
    { id: 'resources', label: 'Resources', icon: FileText, count: resources.length },
    { id: 'others', label: 'Others', icon: Layers, count: others ? 1 : 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full h-[94vh] sm:h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Top Loading Progress Bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-200 dark:bg-emerald-950 overflow-hidden z-20">
            <div className="h-full bg-emerald-500 animate-pulse w-3/4 rounded-full" />
          </div>
        )}

        {/* Modal Top Header with Cover Gradient & Teacher Info */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors cursor-pointer z-10"
            title="Close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={name}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl object-cover border-2 border-white/40 shadow-md bg-slate-800"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/default-avatar.svg';
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl bg-emerald-600 font-bold text-xl sm:text-2xl flex items-center justify-center border-2 border-white/40 shadow-md">
                    {name.charAt(0)}
                  </div>
                )}
                {isChairman && (
                  <span
                    className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-md shadow-xs"
                    title="Chairman"
                  >
                    Chairman
                  </span>
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight truncate leading-tight">
                    {name}
                  </h3>
                  {isLoading && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-600/50 text-emerald-100 animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>
                <p className="text-emerald-200 text-xs sm:text-sm font-semibold truncate">
                  {designation}
                </p>
                {department && (
                  <p className="text-emerald-100/80 text-xs flex items-center gap-1 truncate">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{department}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Header Action Buttons (Download CV & RU Profile Link) */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
              <button
                onClick={handleCvDownload}
                disabled={isDownloadingCv}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all border border-emerald-400/40 cursor-pointer disabled:opacity-60"
                title="Download Teacher CV PDF"
              >
                {isDownloadingCv ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingCv ? 'Downloading...' : 'Download CV'}</span>
              </button>

              <a
                href={`https://profile.ru.ac.bd/public/profile/${employee.salary_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors border border-white/20 cursor-pointer"
                title="View on Official RU Profile Website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* MOBILE TOP TAB BAR (< lg screens) WITH SCROLL BUTTONS */}
        <div className="lg:hidden bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 flex items-center px-1 py-1.5 relative shrink-0">
          <button
            onClick={() => scrollTabs('left')}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-2xs cursor-pointer z-10 shrink-0"
            title="Scroll tabs left"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={mobileTabContainerRef}
            className="flex items-center space-x-1.5 overflow-x-auto px-2 py-1 scroll-smooth custom-scrollbar flex-1 text-xs font-semibold"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollTabs('right')}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 rounded-lg shadow-2xs cursor-pointer z-10 shrink-0"
            title="Scroll tabs right"
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* MAIN BODY: 2-COLUMN LAYOUT ON DESKTOP (lg), FULL WIDTH ON MOBILE */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* DESKTOP LEFT SIDEBAR: ALL 8 TABS ALWAYS 100% VISIBLE */}
          <aside className="hidden lg:flex flex-col w-72 bg-slate-50/80 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 p-3 shrink-0 overflow-y-auto custom-scrollbar justify-between">
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Profile Sections
              </p>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      <span className="truncate">{tab.label}</span>
                    </div>

                    {typeof tab.count === 'number' && tab.count > 0 ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-800 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {tab.count}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Contact Box on Desktop Sidebar */}
            <div className="mt-4 p-3 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Quick Contact
              </p>
              {email && (
                <div className="flex items-center justify-between gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="truncate font-medium">{email}</span>
                  <button
                    onClick={() => handleCopyEmail(email)}
                    className="p-1 hover:text-emerald-600 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail === email ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {phone && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{phone}</span>
                </p>
              )}
              {officeAddress && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 line-clamp-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{officeAddress}</span>
                </p>
              )}
            </div>
          </aside>

          {/* RIGHT CONTENT AREA: BEAUTIFULLY STYLED & CUSTOM SCROLLBAR */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200 custom-scrollbar">
            
            {/* Active Section Breadcrumb/Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                {(() => {
                  const currTab = tabs.find((t) => t.id === activeTab);
                  const TabIcon = currTab ? currTab.icon : User;
                  return (
                    <>
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                        <TabIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {currTab?.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Official University of Rajshahi PMS Record
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Action or filter on header if applicable */}
              {activeTab === 'publications' && publicationTypes.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold">
                  <button
                    onClick={() => setPubFilter('all')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      pubFilter === 'all'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    All ({publications.length})
                  </button>
                  {publicationTypes.map((type) => (
                    <button
                      key={String(type)}
                      onClick={() => setPubFilter(String(type))}
                      className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                        pubFilter.toLowerCase() === String(type || '').toLowerCase()
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {String(type)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Contact & Location Card */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    <span>Contact & Office Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {email && (
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate font-medium">{email}</span>
                        </div>
                        <button
                          onClick={() => handleCopyEmail(email)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Copy email"
                        >
                          {copiedEmail === email ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}

                    {phone && (
                      <div className="flex items-center space-x-2.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{phone}</span>
                      </div>
                    )}

                    {officeAddress && (
                      <div className="sm:col-span-2 flex items-start space-x-2.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{officeAddress}</span>
                      </div>
                    )}

                    {detail?.detail?.joining_date && (
                      <div className="flex items-center space-x-2.5 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Joined University: <strong className="font-semibold text-emerald-700 dark:text-emerald-400">{detail.detail.joining_date}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social & Academic Profile Links */}
                {socialLinks && Object.values(socialLinks).some(Boolean) && (
                  <div className="p-4 sm:p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      <span>Academic & Research Portals</span>
                    </h4>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {socialLinks.google_scholar && (
                        <a
                          href={socialLinks.google_scholar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors font-medium cursor-pointer shadow-2xs"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                          <span>Google Scholar</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      {socialLinks.research_gate && (
                        <a
                          href={socialLinks.research_gate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors font-medium cursor-pointer shadow-2xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                          <span>ResearchGate</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      {socialLinks.linkedin && (
                        <a
                          href={socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors font-medium cursor-pointer shadow-2xs"
                        >
                          <Share2 className="w-3.5 h-3.5 text-blue-700" />
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      {socialLinks.github && (
                        <a
                          href={socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors font-medium cursor-pointer shadow-2xs"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-purple-600" />
                          <span>GitHub</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      {socialLinks.orcid && (
                        <a
                          href={socialLinks.orcid.startsWith('http') ? socialLinks.orcid : `https://orcid.org/${socialLinks.orcid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors font-medium cursor-pointer shadow-2xs"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>ORCID</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      {socialLinks.facebook && (
                        <a
                          href={socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors font-medium cursor-pointer shadow-2xs"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>Facebook</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Biography */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Biography & Profile Statement
                  </h4>
                  {about?.short_biography ? (
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-slate-200 dark:border-slate-800 shadow-2xs">
                      {about.short_biography}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                      {isLoading ? 'Loading biography from RU database...' : 'No detailed biography statement provided.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC HISTORY */}
            {activeTab === 'academic' && (
              <div className="space-y-4 animate-fadeIn">
                {educations.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    {isLoading ? 'Fetching academic qualification records...' : 'No academic history records found on profile.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {educations.map((edu, idx) => (
                      <div
                        key={edu.id || idx}
                        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                              {edu.degree}
                            </span>
                            {edu.level && (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md">
                                {edu.level}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {edu.institution}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {edu.passing_year && (
                            <span className="inline-block px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 shadow-2xs">
                              {edu.passing_year}
                            </span>
                          )}
                          {edu.result_type && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{edu.result_type}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-4 animate-fadeIn">
                {employments.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    {isLoading ? 'Fetching employment history...' : 'No employment records listed.'}
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-300 dark:before:bg-emerald-800">
                    {employments.map((emp, idx) => (
                      <div key={emp.id || idx} className="relative space-y-1">
                        <span className="absolute -left-6 top-2 w-3.5 h-3.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-slate-900 shadow-xs" />
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
                          <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {emp.position}
                          </h5>
                          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {emp.office || emp.institute || 'University of Rajshahi'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            {emp.start_date || 'N/A'} — {emp.end_date || 'Present'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: PUBLICATIONS */}
            {activeTab === 'publications' && (
              <div className="space-y-4 animate-fadeIn">
                {filteredPublications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    {isLoading ? 'Loading research publications...' : 'No publications found for selected filter.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPublications.map((pub, idx) => (
                      <div
                        key={pub.id || idx}
                        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                            {pub.title}
                          </h5>
                          {pub.type && (
                            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md shrink-0">
                              {pub.type}
                            </span>
                          )}
                        </div>

                        {pub.authors && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                            {pub.authors}
                          </p>
                        )}

                        {pub.presented_published && (
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                            {pub.presented_published}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                          {pub.publication_year && <span>Year: <strong>{pub.publication_year}</strong></span>}
                          {pub.doi && (
                            <a
                              href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                            >
                              <span>DOI: {pub.doi}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {pub.url && (
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                            >
                              <span>View Paper</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: RESEARCH ACTIVITIES */}
            {activeTab === 'research' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Research Interests */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Research Interests ({researchInterests.length})
                  </h4>
                  {researchInterests.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      {isLoading ? 'Loading research interests...' : 'No research interests listed.'}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {researchInterests.map((interest, idx) => (
                        <span
                          key={interest.id || idx}
                          className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800 shadow-2xs"
                        >
                          {interest.interest_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Research Projects */}
                {researchProjects.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Funded Research Projects ({researchProjects.length})
                    </h4>
                    <div className="space-y-2.5">
                      {researchProjects.map((proj, idx) => (
                        <div key={proj.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                            {proj.project_title || proj.title}
                          </h5>
                          {proj.funding_agency && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                              Agency: {proj.funding_agency} {proj.role ? `• Role: ${proj.role}` : ''}
                            </p>
                          )}
                          {(proj.start_date || proj.budget) && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {proj.start_date ? `Duration: ${proj.start_date} to ${proj.end_date || 'Present'}` : ''}
                              {proj.budget ? ` • Budget: ${proj.budget}` : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Supervisions */}
                {researchSupervisions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Thesis & Research Supervisions ({researchSupervisions.length})
                    </h4>
                    <div className="space-y-2.5">
                      {researchSupervisions.map((sup, idx) => (
                        <div key={sup.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {sup.thesis_title}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Student: <strong>{sup.student_name}</strong> {sup.degree ? `(${sup.degree})` : ''} {sup.year ? `• Year: ${sup.year}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Research Talks */}
                {researchTalks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Keynote & Research Talks ({researchTalks.length})
                    </h4>
                    <div className="space-y-2.5">
                      {researchTalks.map((talk, idx) => (
                        <div key={talk.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 shadow-2xs">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {talk.talk_title || talk.title}
                          </h5>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400">
                            {talk.event_name} {talk.location ? `• ${talk.location}` : ''} {talk.date ? `(${talk.date})` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: AWARDS & MEMBERSHIPS */}
            {activeTab === 'awards' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Awards */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Awards & Honors ({awards.length})</span>
                  </h4>

                  {awards.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      {isLoading ? 'Checking awards records...' : 'No awards listed.'}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {awards.map((award, idx) => (
                        <div key={award.id || idx} className="p-4 bg-amber-50/30 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-1.5 shadow-2xs">
                          <div className="flex items-start justify-between gap-3">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                              {award.title}
                            </h5>
                            {award.year && (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-lg shrink-0">
                                {award.year}
                              </span>
                            )}
                          </div>
                          {award.award_type && (
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                              {award.award_type} Award {award.country ? `• ${award.country}` : ''}
                            </p>
                          )}
                          {award.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              {award.description}
                            </p>
                          )}
                          {award.link && (
                            <a
                              href={award.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:underline pt-1"
                            >
                              <span>Verification Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Professional Memberships */}
                {memberships.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Professional Memberships ({memberships.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {memberships.map((mem, idx) => (
                        <div key={mem.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                            {mem.membership_name}
                          </h5>
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            {mem.type || 'Member'} {mem.membership_year ? `(${mem.membership_year})` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Administrative Duties */}
                {extraDuties.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Extra Administrative Duties ({extraDuties.length})
                    </h4>
                    <div className="space-y-2">
                      {extraDuties.map((duty, idx) => (
                        <div key={duty.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{duty.duty_name}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{duty.office} {duty.start_date ? `(${duty.start_date} - ${duty.end_date || 'Present'})` : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: RESOURCES */}
            {activeTab === 'resources' && (
              <div className="space-y-4 animate-fadeIn">
                {resources.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    {isLoading ? 'Checking teaching resources...' : 'No course handouts or resources listed.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {resources.map((res, idx) => (
                      <div key={res.id || idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs">
                        <div className="flex items-start justify-between gap-3">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                            {res.course_name}
                          </h5>
                          {res.offering_now && (
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md">
                              Offering Now
                            </span>
                          )}
                        </div>
                        {res.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">{res.description}</p>
                        )}
                        {res.resource_url && (
                          <a
                            href={res.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline pt-1"
                          >
                            <span>Access Course Resource</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: OTHERS */}
            {activeTab === 'others' && (
              <div className="space-y-4 animate-fadeIn">
                {others ? (
                  <div
                    className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs"
                    dangerouslySetInnerHTML={{ __html: others }}
                  />
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    {isLoading ? 'Checking other remarks...' : 'No other custom remarks available.'}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            University of Rajshahi • Profile Management System (profile.ru.ac.bd)
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCvDownload}
              disabled={isDownloadingCv}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CV</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
