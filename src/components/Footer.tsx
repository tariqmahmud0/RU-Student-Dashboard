import React, { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, Activity, X, Globe, Download } from 'lucide-react';

type Language = 'en' | 'bn';
type DocumentType = 'terms' | 'privacy' | 'disclaimer' | 'uptime' | null;

const docsData = {
  terms: {
    en: {
      title: "Terms and Conditions",
      sections: [
        { title: "Introduction", body: "By using this unofficial dashboard, you agree to these terms." },
        { title: "Unofficial Nature", body: "This application is an independent tool and is NOT affiliated with, endorsed by, or sponsored by Rajshahi University (RU) or its official e-result portal." },
        { title: "Data Usage", body: "We act solely as a secure bridge to fetch your data directly from the official RU servers using the credentials you provide." },
        { title: "No Warranty", body: "We provide this tool \"as is\" without any guarantees of continuous uptime, flawless accuracy, or absolute reliability." },
        { title: "User Responsibility", body: "You are solely responsible for maintaining the confidentiality and security of your login credentials." }
      ]
    },
    bn: {
      title: "শর্তাবলী (Terms)",
      sections: [
        { title: "ভূমিকা", body: "এই আনঅফিসিয়াল ড্যাশবোর্ডটি ব্যবহার করলে ধরে নেওয়া হবে আপনি এর নিয়মগুলো মেনে নিয়েছেন।" },
        { title: "আনঅফিসিয়াল উদ্যোগ", body: "এটি সম্পূর্ণ একটি স্বাধীন উদ্যোগ। রাজশাহী বিশ্ববিদ্যালয় (RU) বা তাদের অফিসিয়াল ই-রেজাল্ট ওয়েবসাইটের সাথে এর কোনো আনুষ্ঠানিক সম্পর্ক নেই।" },
        { title: "ডাটা ব্যবহার", body: "আপনার দেওয়া তথ্য ব্যবহার করে আমরা শুধুমাত্র মূল ওয়েবসাইট থেকে আপনার রেজাল্ট ও প্রোফাইল সরাসরি আপনার সামনে তুলে ধরি।" },
        { title: "কোনো গ্যারান্টি নেই", body: "এটি \"যেমন আছে\" ভিত্তিতে দেওয়া হচ্ছে। সব সময় এটি ঠিকমতো কাজ করবে বা সম্পূর্ণ নির্ভুল হবে, এমন কোনো নিশ্চয়তা দেওয়া যাচ্ছে না।" },
        { title: "আপনার দায়িত্ব", body: "আপনার স্টুডেন্ট আইডি ও পাসওয়ার্ড নিরাপদে রাখার দায়িত্ব পুরোপুরি আপনার নিজের।" }
      ]
    }
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      sections: [
        { title: "Data Collection", body: "We do not store, save, or log your Rajshahi University Student ID or password on any of our servers or databases." },
        { title: "Authentication", body: "Your credentials are used momentarily and securely to authenticate with the official RU API directly." },
        { title: "Local Storage", body: "We only use your device's local storage to save your visual preferences (such as light/dark mode)." },
        { title: "No Third-Party Sharing", body: "Your personal data (including profile, results, and fees) is fetched directly to your browser and is never shared with any third party." }
      ]
    },
    bn: {
      title: "গোপনীয়তা নীতি (Privacy)",
      sections: [
        { title: "তথ্য সংগ্রহ", body: "আমরা আপনার স্টুডেন্ট আইডি বা পাসওয়ার্ড আমাদের কোনো সার্ভার বা ডাটাবেসে সেভ করে রাখি না।" },
        { title: "লগিন প্রক্রিয়া", body: "আপনার দেওয়া তথ্যগুলো শুধুমাত্র লগিন করার ওই নির্দিষ্ট মুহূর্তে রাজশাহী বিশ্ববিদ্যালয়ের মূল সার্ভারে পাঠানো হয়।" },
        { title: "লোকাল স্টোরেজ", body: "ডার্ক মোড বা লাইট মোডের মতো সাধারণ সেটিং মনে রাখার জন্য শুধুমাত্র আপনার ডিভাইসের লোকাল স্টোরেজ ব্যবহার করা হয়।" },
        { title: "তথ্য শেয়ার", body: "আপনার কোনো ব্যক্তিগত তথ্য (যেমন রেজাল্ট, ফি, বা প্রোফাইল) তৃতীয় কোনো ব্যক্তি বা প্রতিষ্ঠানের কাছে কখনো শেয়ার করা হয় না।" }
      ]
    }
  },
  disclaimer: {
    en: {
      title: "Disclaimer",
      sections: [
        { title: "Independent Project", body: "This dashboard is a personal, independent project created to provide a more modern, fast, and accessible user interface for students of Rajshahi University." },
        { title: "Data Source", body: "All data displayed here is retrieved in real-time directly from the official RU e-result servers." },
        { title: "No Guarantees", body: "We do not guarantee the accuracy, completeness, or timeliness of the information shown. For any official records or inquiries, please refer to the official Rajshahi University administration." },
        { title: "Use at Own Risk", body: "Use of this application is at your own risk." }
      ]
    },
    bn: {
      title: "দাবিত্যাগ (Disclaimer)",
      sections: [
        { title: "স্বাধীন প্রজেক্ট", body: "রাজশাহী বিশ্ববিদ্যালয়ের শিক্ষার্থীদের জন্য রেজাল্ট দেখার অভিজ্ঞতা আরও সুন্দর, দ্রুত ও সহজ করতেই এই প্রজেক্টটি তৈরি করা হয়েছে।" },
        { title: "তথ্যের উৎস", body: "এখানে দেখানো সব তথ্য সরাসরি রাজশাহী বিশ্ববিদ্যালয়ের ই-রেজাল্ট সার্ভার থেকে আসে।" },
        { title: "কোনো নিশ্চয়তা নেই", body: "এখানে দেখানো তথ্যের শতভাগ নির্ভুলতার গ্যারান্টি আমরা দিচ্ছি ভু না। যেকোনো অফিসিয়াল কাজে সরাসরি বিশ্ববিদ্যালয়ের ওয়েবসাইট বা প্রশাসনের সাথে যোগাযোগ করার অনুরোধ করা হচ্ছে।" },
        { title: "নিজ দায়িত্বে ব্যবহার", body: "এই ওয়েবসাইটটির ব্যবহার সম্পূর্ণ আপনার নিজের দায়িত্বে করতে হবে।" }
      ]
    }
  },
  uptime: {
    en: {
      title: "Uptime & Status",
      sections: [
        { title: "Current Status", body: "The dashboard is operational. We rely on the availability of the official RU e-result servers." },
        { title: "API Dependency", body: "If the official Rajshahi University e-result portal is down or undergoing maintenance, this dashboard will also be unable to fetch your data." },
        { title: "Hosting", body: "This frontend interface is hosted on reliable cloud infrastructure, aiming for 99.9% uptime for the UI itself." }
      ]
    },
    bn: {
      title: "আপটাইম এবং স্ট্যাটাস (Uptime)",
      sections: [
        { title: "বর্তমান স্ট্যাটাস", body: "ড্যাশবোর্ডটি বর্তমানে সচল রয়েছে। তবে এটি সম্পূর্ণভাবে রাজশাহী বিশ্ববিদ্যালয়ের মূল ই-রেজাল্ট সার্ভারের উপর নির্ভরশীল।" },
        { title: "API নির্ভরতা", body: "যদি রাজশাহী বিশ্ববিদ্যালয়ের অফিসিয়াল রেজাল্ট পোর্টাল বন্ধ থাকে বা মেইনটেনেন্সে থাকে, তবে এই ড্যাশবোর্ডটিও কোনো তথ্য দেখাতে পারবে না।" },
        { title: "হোস্টিং", body: "এই ওয়েবসাইটের ইন্টারফেসটি ক্লাউড সার্ভারে হোস্ট করা হয়েছে, যার আপটাইম সাধারণত ৯৯.৯% থাকে।" }
      ]
    }
  }
};

const commonStrings = {
  en: {
    toggleLang: "বাংলায় দেখুন",
    close: "Close",
    links: {
      terms: "Terms and Conditions",
      privacy: "Privacy Policy",
      disclaimer: "Disclaimer",
      uptime: "Uptime & Status"
    }
  },
  bn: {
    toggleLang: "View in English",
    close: "বন্ধ করুন",
    links: {
      terms: "Terms and Conditions",
      privacy: "Privacy Policy",
      disclaimer: "Disclaimer",
      uptime: "Uptime & Status"
    }
  }
};

function UptimeGraph() {
  const [data, setData] = useState<{ms: number, status: 'up' | 'down'}[]>([]);
  const [status, setStatus] = useState<'checking' | 'up' | 'down'>('checking');

  useEffect(() => {
    let mounted = true;
    const checkPing = async () => {
      const start = Date.now();
      try {
        await fetch('/api/proxy/ping-check', { method: 'GET', headers: { 'Accept': 'application/json' } });
        const ms = Date.now() - start;
        if (mounted) {
          setStatus('up');
          setData(prev => [...prev.slice(-59), {ms, status: 'up'}]);
        }
      } catch (e) {
         if (mounted) {
           setStatus('down');
           setData(prev => [...prev.slice(-59), {ms: 0, status: 'down'}]);
         }
      }
    };

    checkPing();
    const int = setInterval(checkPing, 3000);
    return () => { mounted = false; clearInterval(int); };
  }, []);

  const totalChecks = data.length;
  const upChecks = data.filter(d => d.status === 'up').length;
  const sessionUptime = totalChecks > 0 ? ((upChecks / totalChecks) * 100).toFixed(2) : '100.00';

  const upMs = data.filter(d => d.status === 'up').map(d => d.ms);
  const avgResponse = upMs.length > 0 ? Math.round(upMs.reduce((a, b) => a + b, 0) / upMs.length) : 0;
  const currentResponse = upMs.length > 0 ? upMs[upMs.length - 1] : 0;

  const maxMs = Math.max(...data.map(d => d.ms), 200);

  // Fill array for pills (top section) - show last 40 checks
  const pills = Array.from({ length: 40 }).map((_, i) => {
    const dataIdx = data.length - 40 + i;
    if (dataIdx >= 0 && data[dataIdx]) {
      return data[dataIdx].status;
    }
    return null; // no data yet
  });

  return (
    <div className="mt-6 p-5 sm:p-6 border border-slate-800 rounded-xl bg-[#0b1120] text-slate-100 font-sans shadow-xl overflow-x-auto">
      {/* Top section: Pills and Status */}
      <div className="flex items-start justify-between gap-4 ml-6 sm:ml-8">
         <div className="flex-1 min-w-0">
            <div className="flex gap-[2px] sm:gap-1 items-end h-8">
              {pills.map((st, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full ${st === 'up' ? 'bg-[#5eead4] h-full shadow-[0_0_8px_rgba(94,234,212,0.4)]' : st === 'down' ? 'bg-rose-500 h-full' : 'bg-slate-800 h-1/2 opacity-50'}`}
                ></div>
              ))}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-3 font-medium">
              Check every 3 seconds
            </div>
         </div>
         <div className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-lg flex items-center justify-center min-w-[60px] sm:min-w-[80px] shrink-0 shadow-lg ${status === 'up' ? 'bg-[#5eead4] text-[#0f172a] shadow-[#5eead4]/20' : status === 'down' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-800 text-slate-400'}`}>
            {status === 'up' ? 'Up' : status === 'down' ? 'Down' : 'Wait'}
         </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800/60">
        <div className="text-center">
          <div className="text-slate-300 text-xs sm:text-base font-semibold mb-1">Response<br/><span className="text-[9px] sm:text-[11px] font-normal text-slate-500">(Current)</span></div>
          <div className="text-[#5eead4] font-mono text-xs sm:text-sm underline decoration-slate-700 underline-offset-4">{currentResponse} ms</div>
        </div>
        <div className="text-center">
          <div className="text-slate-300 text-xs sm:text-base font-semibold mb-1">Avg. Response<br/><span className="text-[9px] sm:text-[11px] font-normal text-slate-500">(Session)</span></div>
          <div className="text-slate-400 font-mono text-xs sm:text-sm">{avgResponse} ms</div>
        </div>
        <div className="text-center">
          <div className="text-slate-300 text-xs sm:text-base font-semibold mb-1">Uptime<br/><span className="text-[9px] sm:text-[11px] font-normal text-slate-500">(Session)</span></div>
          <div className="text-slate-400 font-mono text-xs sm:text-sm">{sessionUptime}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-8 relative h-32 flex items-end gap-1 ml-8 sm:ml-10 border-b border-slate-800/80 pb-1">
        <span className="absolute -left-10 sm:-left-12 top-1/2 -translate-y-1/2 -translate-x-1/2 -rotate-90 text-[9px] text-slate-600 font-mono whitespace-nowrap">
          Resp. Time (ms)
        </span>
        {/* Y-axis guidelines */}
        <div className="absolute inset-0 flex flex-col justify-between text-[9px] text-slate-500 pb-1 -left-6 sm:-left-8 font-mono">
          <div className="relative"><span className="absolute -top-1.5">{maxMs}</span><div className="absolute left-5 sm:left-7 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] border-t border-slate-800/50"></div></div>
          <div className="relative"><span className="absolute -top-1.5">{Math.round(maxMs/2)}</span><div className="absolute left-5 sm:left-7 w-[calc(100%+1.5rem)] sm:w-[calc(100%+2rem)] border-t border-slate-800/50"></div></div>
          <div className="relative"><span className="absolute -top-1.5">0</span></div>
        </div>

        {/* Bars */}
        <div className="flex-1 h-full flex items-end gap-[1px] sm:gap-[2px] z-10 pl-1">
          {Array.from({ length: 60 }).map((_, i) => {
             const dataIdx = data.length - 60 + i;
             if (dataIdx >= 0 && data[dataIdx]) {
                const d = data[dataIdx];
                const height = d.ms > 0 ? Math.max((d.ms / maxMs) * 100, 2) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                    <div
                      className={`w-full rounded-t-[1px] transition-all duration-300 ${d.ms > 1000 ? 'bg-rose-500' : d.ms > 400 ? 'bg-amber-400' : 'bg-[#5eead4]/80 group-hover:bg-[#5eead4]'}`}
                      style={{ height: `${height}%` }}
                    ></div>
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 shadow-xl">
                      {d.ms} ms
                    </div>
                  </div>
                );
             }
             return <div key={i} className="flex-1"></div>;
          })}
        </div>
      </div>
      <div className="flex justify-between items-center text-[9px] text-slate-600 mt-2 font-mono pl-8 sm:pl-10">
         <span>Session Start</span>
         <span>Now</span>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-slate-400 font-sans border-t border-slate-800/60 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5eead4]/80"></span>
          <span>Fast (&lt; 400ms)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Average (400 - 1000ms)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Slow (&gt; 1000ms)</span>
        </div>
      </div>
    </div>
  );
}

export function Footer({ children }: { children?: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const [activeDoc, setActiveDoc] = useState<DocumentType>(null);
  const [isDownloadingApp, setIsDownloadingApp] = useState(false);

  const handleDownloadLatestApp = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      setIsDownloadingApp(true);
      const response = await fetch("https://api.github.com/repos/tariqmahmud0/RU-Student/releases/latest");
      if (!response.ok) {
        throw new Error("Failed to fetch latest release");
      }
      const release = await response.json();
      const apk = release.assets.find((asset: any) => asset.name.toLowerCase().endsWith(".apk"));
      if (!apk) {
        throw new Error("APK not found");
      }
      window.location.href = apk.browser_download_url;
    } catch (error) {
      console.error(error);
      alert("Unable to download the latest version. Please try again.");
    } finally {
      setIsDownloadingApp(false);
    }
  };

  const t = commonStrings[lang];

  const getDocData = () => {
    if (!activeDoc) return null;
    const doc = docsData[activeDoc][lang];

    let icon = <FileText className="w-5 h-5" />;
    if (activeDoc === 'privacy') icon = <Shield className="w-5 h-5" />;
    if (activeDoc === 'disclaimer') icon = <AlertTriangle className="w-5 h-5" />;
    if (activeDoc === 'uptime') icon = <Activity className="w-5 h-5" />;

    return { ...doc, icon };
  };

  const currentDoc = getDocData();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 z-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">

        {/* Previous Text Container */}
        {children && (
          <div className="w-full text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            {children}
          </div>
        )}

        {/* Legal Links (Always English in Footer) */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setActiveDoc('terms')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {t.links.terms}
          </button>
          <button onClick={() => setActiveDoc('privacy')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {t.links.privacy}
          </button>
          <button onClick={() => setActiveDoc('disclaimer')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            {t.links.disclaimer}
          </button>
          <button onClick={() => setActiveDoc('uptime')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t.links.uptime}
          </button>
          <a
            href="#"
            id="downloadLatestApp"
            onClick={handleDownloadLatestApp}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            {isDownloadingApp ? "Finding latest version..." : "Download App"}
          </a>
        </div>
      </div>

      {/* Modal */}
      {activeDoc && currentDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                {currentDoc.icon}
                {currentDoc.title}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-xs font-medium text-slate-600 dark:text-slate-300 mr-2"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {t.toggleLang}
                </button>
                <button
                  onClick={() => setActiveDoc(null)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                  title={t.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              {currentDoc.sections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    {section.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
              {activeDoc === 'uptime' && <UptimeGraph />}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-right shrink-0">
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
