import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SemesterResult, StudentInfo, CompanyInfo, FeeItem } from '../types';

/**
 * Sanitizes strings for jsPDF standard fonts (Helvetica/Latin-1)
 * to prevent character encoding crashes or question marks with non-ASCII / Bangla text.
 */
export function cleanText(str?: string | null): string {
  if (!str) return '';
  if (str.includes('রাজশাহী') || str.includes('বিশ্ববিদ্যালয়')) {
    return 'University of Rajshahi';
  }
  // Strip non-printable ASCII / non-Latin range that breaks jsPDF default Helvetica
  return str.replace(/[^\x00-\x7F]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function generateTranscriptPDF(
  results: SemesterResult[],
  profile: StudentInfo | null,
  companyInfo: CompanyInfo | null,
  singleSemester?: SemesterResult
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 118, 110); // Emerald 700
  const uniName = cleanText(companyInfo?.name) || 'UNIVERSITY OF RAJSHAHI';
  doc.text(uniName.toUpperCase(), pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate 500
  const subTitle = 'Rajshahi - 6205, Bangladesh';
  doc.text(subTitle, pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Slate 800
  const docType = singleSemester
    ? `SEMESTER MARK SUMMARY (${singleSemester.master.yearAndSemester || ''})`
    : 'OFFICIAL ACADEMIC TRANSCRIPT & MARK SUMMARY';
  doc.text(docType, pageWidth / 2, 29, { align: 'center' });

  // Decorative divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 33, pageWidth - 14, 33);

  // Student Info Box
  let y = 37;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(14, y, pageWidth - 28, 30, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 30, 'S');

  doc.setFontSize(9);

  const col1X = 18;
  const col2X = 110;

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`Student Name:`, col1X, y + 6);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.name || 'N/A'}`, col1X + 28, y + 6);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Student ID:`, col1X, y + 12);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.studentId || 'N/A'}`, col1X + 28, y + 12);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Program:`, col1X, y + 18);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.programName || 'N/A'}`, col1X + 28, y + 18);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Department:`, col1X, y + 24);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.departmentName || 'N/A'}`, col1X + 28, y + 24);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Faculty:`, col2X, y + 6);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.facultyName || 'N/A'}`, col2X + 22, y + 6);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Session:`, col2X, y + 12);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.sessionName || 'N/A'}`, col2X + 22, y + 12);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Hall Attachment:`, col2X, y + 18);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.hallName || 'N/A'}`, col2X + 26, y + 18);

  doc.setFont('Helvetica', 'bold');
  doc.text(`Generated Date:`, col2X, y + 24);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${new Date().toLocaleDateString()}`, col2X + 26, y + 24);

  y += 36;

  const targetResults = singleSemester ? [singleSemester] : results;

  targetResults.forEach((sem) => {
    const master = sem.master;

    // Check vertical space for table
    if (y > 230) {
      doc.addPage();
      y = 15;
    }

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87); // Emerald 700
    doc.text(
      `${master.yearAndSemester || 'Semester'} — Session: ${master.sessionName || 'N/A'} | GPA: ${
        master.gradePoint !== undefined && master.gradePoint !== null
          ? master.gradePoint.toFixed(2)
          : '—'
      } | Status: ${master.resultValue || 'PASS'}`,
      14,
      y
    );

    y += 3;

    const tableData = sem.detailsList.map((c) => [
      c.courseCode || '—',
      c.courseName || c.courseTitle || '—',
      String(c.courseCredit ?? '—'),
      c.caMark !== null && c.caMark !== undefined ? String(c.caMark) : '—',
      c.finalMark !== null && c.finalMark !== undefined ? String(c.finalMark) : '—',
      c.totalMark !== null && c.totalMark !== undefined ? String(c.totalMark) : '—',
      c.gradeName || '—',
      c.gradePoint !== null && c.gradePoint !== undefined ? c.gradePoint.toFixed(2) : '—',
    ]);

    autoTable(doc, {
      startY: y,
      head: [
        [
          'Course Code',
          'Course Title',
          'Credit',
          'Internal Mark',
          'Final Mark',
          'Total Mark',
          'Grade',
          'GPA',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [6, 95, 70], // Emerald 800
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 26 },
        1: { halign: 'left' },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
        4: { halign: 'center', cellWidth: 20 },
        5: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 15, fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 8;
  });

  // Footer on all pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `University of Rajshahi Student e-Result Portal • Page ${i} of ${pageCount} • Generated: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      288,
      { align: 'center' }
    );
  }

  const fileName = singleSemester
    ? `Transcript_${profile?.studentId || 'Student'}_${(singleSemester.master.yearAndSemester || 'Semester').replace(/\s+/g, '_')}.pdf`
    : `Academic_Transcript_${profile?.studentId || 'Student'}.pdf`;

  doc.save(fileName);
}

export interface AdmitCardExamDetails {
  examName: string;
  session: string;
  examRoll: string;
  regNo: string;
  centerName: string;
  issueDate: string;
  clearanceStatus: string;
  courses: Array<{
    courseCode: string;
    courseTitle: string;
    courseCredit: number;
    examDate: string;
    examTime: string;
    roomNo: string;
  }>;
}

export function generateAdmitCardPDF(
  profile: StudentInfo | null,
  companyInfo: CompanyInfo | null,
  examDetails: AdmitCardExamDetails
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Outer Border Box (Official Certificate look)
  doc.setDrawColor(15, 118, 110); // Emerald 700
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, 281);

  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, 277);

  // Top Header Banner
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.rect(10.3, 10.3, pageWidth - 20.6, 28, 'F');

  // University Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(6, 95, 70); // Emerald 800
  const uniName = companyInfo?.name || 'UNIVERSITY OF RAJSHAHI';
  doc.text(uniName.toUpperCase(), pageWidth / 2, 17, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(companyInfo?.address || 'Rajshahi - 6205, Bangladesh', pageWidth / 2, 22, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(examDetails.examName.toUpperCase(), pageWidth / 2, 29, { align: 'center' });

  // ADMIT CARD Badge Pill
  doc.setFillColor(6, 95, 70);
  doc.roundedRect(pageWidth / 2 - 25, 32, 50, 7, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL ADMIT CARD', pageWidth / 2, 36.8, { align: 'center' });

  let y = 43;

  // Candidate Particulars Card
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 48, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(14, y, pageWidth - 28, 48, 'S');

  doc.setFontSize(8.5);
  const leftX = 18;
  const rightX = 112;

  // Left Column
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('Student Name:', leftX, y + 6);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.name || 'N/A'}`, leftX + 28, y + 6);

  doc.setFont('Helvetica', 'bold');
  doc.text('Student ID / Roll:', leftX, y + 12);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${examDetails.examRoll || profile?.studentId || 'N/A'}`, leftX + 28, y + 12);

  doc.setFont('Helvetica', 'bold');
  doc.text('Registration No:', leftX, y + 18);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${examDetails.regNo || 'RU-2023-88941'}`, leftX + 28, y + 18);

  doc.setFont('Helvetica', 'bold');
  doc.text('Academic Program:', leftX, y + 24);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.programName || 'B.Sc. (Honours)'}`, leftX + 28, y + 24);

  doc.setFont('Helvetica', 'bold');
  doc.text('Department:', leftX, y + 30);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.departmentName || 'N/A'}`, leftX + 28, y + 30);

  doc.setFont('Helvetica', 'bold');
  doc.text('Faculty:', leftX, y + 36);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.facultyName || 'N/A'}`, leftX + 28, y + 36);

  doc.setFont('Helvetica', 'bold');
  doc.text("Father's Name:", leftX, y + 42);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.fatherName || 'N/A'}`, leftX + 28, y + 42);

  // Right Column
  doc.setFont('Helvetica', 'bold');
  doc.text('Hall Attachment:', rightX, y + 6);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.hallName || 'N/A'}`, rightX + 28, y + 6);

  doc.setFont('Helvetica', 'bold');
  doc.text('Resident Status:', rightX, y + 12);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.residentStatusName || 'Attached'}`, rightX + 28, y + 12);

  doc.setFont('Helvetica', 'bold');
  doc.text('Session:', rightX, y + 18);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${examDetails.session || profile?.sessionName || 'N/A'}`, rightX + 28, y + 18);

  doc.setFont('Helvetica', 'bold');
  doc.text('Exam Center:', rightX, y + 24);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${examDetails.centerName}`, rightX + 28, y + 24);

  doc.setFont('Helvetica', 'bold');
  doc.text('Issue Date:', rightX, y + 30);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${examDetails.issueDate}`, rightX + 28, y + 30);

  doc.setFont('Helvetica', 'bold');
  doc.text('Clearance Status:', rightX, y + 36);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`${examDetails.clearanceStatus}`, rightX + 28, y + 36);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text("Mother's Name:", rightX, y + 42);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${profile?.motherName || 'N/A'}`, rightX + 28, y + 42);

  y += 53;

  // Exam Courses Schedule Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(6, 95, 70);
  doc.text('REGISTERED COURSES & EXAMINATION SCHEDULE', 14, y);

  y += 3;

  const tableData = examDetails.courses.map((c, i) => [
    String(i + 1),
    c.courseCode,
    c.courseTitle,
    String(c.courseCredit),
    c.examDate,
    c.examTime,
    c.roomNo,
  ]);

  autoTable(doc, {
    startY: y,
    head: [
      ['SL', 'Course Code', 'Course Title', 'Credit', 'Exam Date', 'Time Slot', 'Room / Building']
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 95, 70],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 26 },
      2: { halign: 'left' },
      3: { halign: 'center', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 26, fontStyle: 'bold' },
      5: { halign: 'center', cellWidth: 28 },
      6: { halign: 'center', cellWidth: 32 },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 8;

  // Rules and Regulations
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('RULES AND INSTRUCTIONS FOR EXAM CANDIDATES:', 14, y);

  y += 4;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const rules = [
    '1. Candidates must bring this original printed Admit Card along with their official University Student ID Card.',
    '2. Entrance to the examination hall is allowed up to 15 minutes prior to commencement of the exam.',
    '3. Mobile phones, programmable calculators, smart watches, and unauthorized paper notes are strictly forbidden.',
    '4. Candidate must verify that the course code and title on the question paper match their registered admit card.',
    '5. Misbehavior, impersonation, or possession of unpermitted materials will result in immediate disqualification.',
    '6. Candidates cannot leave the examination room during the first hour or during the last 15 minutes of exam.',
  ];

  rules.forEach((rule) => {
    doc.text(rule, 14, y);
    y += 4;
  });

  y += 10;

  // Signatures Area
  const sigY = 265;

  // Candidate Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.line(18, sigY, 65, sigY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Candidate Signature', 41.5, sigY + 4, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('(Sign inside during exam)', 41.5, sigY + 8, { align: 'center' });

  // Verification Seal (Middle)
  doc.setDrawColor(6, 95, 70);
  doc.setLineWidth(0.4);
  doc.circle(pageWidth / 2, sigY - 4, 10, 'S');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 95, 70);
  doc.text('RU EXAM CELL', pageWidth / 2, sigY - 5, { align: 'center' });
  doc.text('VERIFIED', pageWidth / 2, sigY - 2, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('★ 2026 ★', pageWidth / 2, sigY + 2, { align: 'center' });

  // Controller of Examinations Signature Line
  doc.line(pageWidth - 65, sigY, pageWidth - 18, sigY);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('Controller of Examinations', pageWidth - 41.5, sigY + 4, { align: 'center' });
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('University of Rajshahi', pageWidth - 41.5, sigY + 8, { align: 'center' });

  const fileName = `AdmitCard_${profile?.studentId || 'Student'}_${examDetails.session.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

export function generateMoneyReceiptPDF(
  fee: FeeItem,
  profile: StudentInfo | null,
  companyInfo: CompanyInfo | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Border Outer Frame
  doc.setDrawColor(6, 95, 70);
  doc.setLineWidth(0.6);
  doc.rect(6, 6, pageWidth - 12, 198);

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(6, 95, 70);
  const uniName = cleanText(companyInfo?.name) || 'UNIVERSITY OF RAJSHAHI';
  doc.text(uniName.toUpperCase(), pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Rajshahi - 6205, Bangladesh • Student e-Payment Cell', pageWidth / 2, 20, { align: 'center' });

  // Receipt Banner
  doc.setFillColor(6, 95, 70);
  doc.roundedRect(pageWidth / 2 - 30, 24, 60, 6.5, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MONEY RECEIPT', pageWidth / 2, 28.5, { align: 'center' });

  let y = 36;

  // Receipt Details Table Grid
  const receiptNo = fee.moneyReceiptNo || 'RU-REC-2026-88';
  const payDate = fee.collectionDate ? new Date(fee.collectionDate).toLocaleDateString() : '—';
  const amountStr = `BDT ${(fee.collectionAmount || 0).toLocaleString()} /-`;

  doc.setFillColor(248, 250, 252);
  doc.rect(10, y, pageWidth - 20, 72, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(10, y, pageWidth - 20, 72, 'S');

  doc.setFontSize(8.5);
  const xLeft = 14;
  const xVal = 52;

  const rows = [
    ['Money Receipt No:', receiptNo],
    ['Student Name:', cleanText(profile?.name) || 'N/A'],
    ['Student ID / Roll:', profile?.studentId || 'N/A'],
    ['Registration No:', profile?.registrationNo || 'RU-2023-88941'],
    ['Department:', cleanText(profile?.departmentName) || 'N/A'],
    ['Hall Attachment:', cleanText(profile?.hallName) || 'N/A'],
    ['Fee Description:', cleanText(fee.feesTypeName) || 'General Exam / Semester Collection Fee'],
    ['Payment Method:', fee.paymentTypeName || 'Online Payment'],
    ['Collection Date:', payDate],
    ['Total Paid Amount:', amountStr],
  ];

  rows.forEach(([label, val], idx) => {
    const rowY = y + 7 + idx * 6.5;
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(label, xLeft, rowY);

    if (label === 'Total Paid Amount:') {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(6, 95, 70);
    } else {
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
    }
    doc.text(val, xVal, rowY);
  });

  y += 82;

  // Verification Badge & Footer Signatures
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text('STATUS: PAID & VERIFIED ELECTRONICALLY', 10, y);

  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - 55, y + 20, pageWidth - 10, y + 20);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Finance Officer', pageWidth - 32.5, y + 24, { align: 'center' });
  doc.text('University of Rajshahi', pageWidth - 32.5, y + 28, { align: 'center' });

  const fileName = `MoneyReceipt_${receiptNo.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

