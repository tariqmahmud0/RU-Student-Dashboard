import React, { useState } from 'react';
import { NoticeItem } from '../types';
import { buildImageUrl } from '../api';
import { Bell, Calendar, Download, Building2, FileText, CheckCircle2 } from 'lucide-react';

interface NoticesViewProps {
  recentNotices: NoticeItem[];
  hallNotices: NoticeItem[];
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  recentNotices,
  hallNotices,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'hall'>('general');

  const currentNotices = activeTab === 'general' ? recentNotices : hallNotices;

  return (
    <div className="space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            <span>Official University Notices & Announcements</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with general university notifications and hall circulars
          </p>
        </div>

        {/* Notice Type Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'general'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>General Notices ({recentNotices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hall')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'hall'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hall Notices ({hallNotices.length})</span>
          </button>
        </div>
      </div>

      {/* Notice List */}
      {currentNotices.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3 shadow-sm transition-colors">
          <Bell className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No notices available.</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            There are no active {activeTab === 'general' ? 'general' : 'hall'} notices for your student profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentNotices.map((notice, idx) => {
            const attachmentUrl = buildImageUrl(notice.fileLocation, notice.fileName);

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                
                {/* Notice Card Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {notice.noticeTitle}
                    </h3>
                  </div>

                  {notice.noticeDate && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>{new Date(notice.noticeDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Notice Content Description */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none">
                  {notice.noticeDescription ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: notice.noticeDescription }}
                    />
                  ) : (
                    <p className="italic text-slate-400 dark:text-slate-500">No description text provided for this notice.</p>
                  )}
                </div>

                {/* Attachment Download Link */}
                {attachmentUrl && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Attached document: <strong className="text-slate-800 dark:text-slate-200">{notice.fileName}</strong></span>
                    </span>
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Attachment</span>
                    </a>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
