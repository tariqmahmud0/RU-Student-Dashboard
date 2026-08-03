import React, { useState } from 'react';
import { FeeItem, StudentInfo, CompanyInfo } from '../types';
import { Receipt, Calendar, CreditCard, MoreVertical, FileText, Download, ShieldCheck, Loader2 } from 'lucide-react';
import { generateMoneyReceiptPDF, generateAdmitCardPDF } from '../utils/pdfGenerator';
import { generateOfficialReportPDF } from '../api';

interface FeesViewProps {
  fees: FeeItem[];
  profile?: StudentInfo | null;
  companyInfo?: CompanyInfo | null;
  token?: string | null;
}

export const FeesView: React.FC<FeesViewProps> = ({ fees, profile = null, companyInfo = null, token = null }) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!fees || fees.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3 shadow-sm transition-colors">
        <Receipt className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Fee Records Available</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          No online fee collection receipts or payment records were found for your student account.
        </p>
      </div>
    );
  }

  const totalCollected = fees.reduce((sum, item) => sum + (item.collectionAmount || 0), 0);

  const handleDownloadAdmitCard = async (fee: FeeItem) => {
    setActiveMenuIndex(null);
    const pMainId = fee.feesProcessId || fee.id;
    setDownloadingId(`admit-${fee.id}`);

    if (token && pMainId) {
      const pdfUrl = await generateOfficialReportPDF(token, pMainId, "7");
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
        setDownloadingId(null);
        return;
      }
    }

    // Fallback to client PDF generator
    const examName = fee.feesTypeName ? `${fee.feesTypeName} - Admit Card` : "Semester Final Examination";
    generateAdmitCardPDF(profile, companyInfo, {
      examName,
      session: profile?.sessionName || "2023-2024",
      examRoll: profile?.studentId || "Student Roll",
      regNo: profile?.registrationNo || "RU-REG-01",
      centerName: "University of Rajshahi Campus",
      issueDate: new Date().toLocaleDateString(),
      clearanceStatus: "CLEARED & PAID",
      courses: [
        {
          courseCode: "DEP 101",
          courseTitle: "Core Departmental Course I",
          courseCredit: 3,
          examDate: "15/08/2026",
          examTime: "10:00 AM - 01:00 PM",
          roomNo: "Exam Hall A",
        },
        {
          courseCode: "DEP 102",
          courseTitle: "Core Departmental Course II",
          courseCredit: 3,
          examDate: "18/08/2026",
          examTime: "10:00 AM - 01:00 PM",
          roomNo: "Exam Hall A",
        },
      ],
    });
    setDownloadingId(null);
  };

  const handleDownloadMoneyReceipt = async (fee: FeeItem) => {
    setActiveMenuIndex(null);
    const pMainId = fee.feesProcessId || fee.id;
    setDownloadingId(`receipt-${fee.id}`);

    if (token && pMainId) {
      const pdfUrl = await generateOfficialReportPDF(token, pMainId, "9");
      if (pdfUrl) {
        window.open(pdfUrl, "_blank");
        setDownloadingId(null);
        return;
      }
    }

    // Fallback to client PDF generator
    generateMoneyReceiptPDF(fee, profile, companyInfo);
    setDownloadingId(null);
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Fees Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            <span>Student Fee Collections & Payment History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official money receipts, fee payment history & examination admit card downloads
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-right">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Total Collected Fees</span>
          <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-400 font-mono">
            ৳ {totalCollected.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">BDT</span>
          </span>
        </div>
      </div>

      {/* Fee Collections Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6 transition-colors overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3">Receipt No</th>
              <th className="px-4 py-3">Fee Type</th>
              <th className="px-4 py-3">Payment Method</th>
              <th className="px-4 py-3">Collection Date</th>
              <th className="px-4 py-3 text-right">Amount (BDT)</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {fees.map((fee, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors relative">
                
                {/* Receipt No */}
                <td className="px-4 py-3.5 font-mono font-bold text-emerald-800 dark:text-emerald-400">
                  {fee.moneyReceiptNo || "—"}
                </td>

                {/* Fee Type */}
                <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                  {fee.feesTypeName || "General / Exam Fee"}
                </td>

                {/* Payment Method */}
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <CreditCard className="w-3 h-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                    {fee.paymentTypeName || "Online Payment"}
                  </span>
                </td>

                {/* Collection Date */}
                <td className="px-4 py-3.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                  {fee.collectionDate ? new Date(fee.collectionDate).toLocaleString() : "—"}
                </td>

                {/* Amount */}
                <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-800 dark:text-emerald-400">
                  ৳ {(fee.collectionAmount || 0).toLocaleString()}
                </td>

                {/* 3-Dot Action Menu */}
                <td className="px-4 py-3.5 text-center relative">
                  <button
                    onClick={() => setActiveMenuIndex(activeMenuIndex === idx ? null : idx)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center justify-center border border-slate-200 dark:border-slate-700"
                    title="View options & downloads"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu Popup */}
                  {activeMenuIndex === idx && (
                    <div className="absolute right-4 top-12 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 text-left space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                      
                      {/* Option 1: Money Receipt PDF */}
                      <button
                        onClick={() => handleDownloadMoneyReceipt(fee)}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>Download Money Receipt</span>
                      </button>

                      {/* Option 2: Download Admit Card PDF */}
                      <button
                        onClick={() => handleDownloadAdmitCard(fee)}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>Download Admit Card</span>
                      </button>

                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
