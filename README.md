# RU Student Dashboard

A secure, responsive student-facing dashboard for University of Rajshahi students to view academic profiles, semester course marks, published examination results, fee collection history, and university notices.

---

## 📌 Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend / Proxy**: Express.js server providing Vite development middleware and a secure, zero-persistence fallback proxy (`/api/proxy/*`) to seamlessly handle cross-origin or port 9603 network restrictions in browser preview sandboxes.
- **API Integration**: Direct connection to the official University of Rajshahi e-result API endpoint (`https://eresult.ru.ac.bd:9603/api`).

---

## 🔐 Key Security & Design Principles

1. **Strict Non-Admin Scope**: The application is strictly student-facing. It never enumerates student IDs or attempts to access another student's private data.
2. **Universal Multi-Account Support**: Zero hardcoded student IDs (such as `2157` or `2164`). The application dynamically discovers the authenticated user's internal `studentInfoId` at login.
3. **In-Memory Token Management**: JWT tokens and private profile details are held only in JavaScript memory during the active session. They are never stored in `localStorage` or `sessionStorage` and are completely purged upon Logout.
4. **Mark Nomenclature Mapping**: As required by university grading standards, the backend field `caMark` is displayed to students as **"Internal Mark"** (never "CA Mark").
5. **Zero Mock Data**: All displayed profile details, GPA scores, course marks, fee collection records, and notices are fetched directly from the authenticated user's account APIs.

---

## 🔄 Complete API & Authentication Flow

1. **Public Info Fetch**:
   `GET /public/sya/company-info/get-by-id/1`
   Loads university branding, English name, Bangla name (*রাজশাহী বিশ্ববিদ্যালয়*), logo, background, and address.

2. **Student Login**:
   `POST /auth/login`
   Request Body:
   ```json
   {
     "username": "<STUDENT_ID>",
     "password": "<PASSWORD>",
     "userTypeId": 2
   }
   ```
   Receives authentication status and JWT `token`.

3. **Dynamic Student ID Discovery**:
   `GET /private/student/course-attendance/course-attendance-details-by-app-user-id`
   Inspects the returned master record array to extract `master.studentInfoId` dynamically for the current session.

4. **Private Student Data Retrieval**:
   - **Profile**: `GET /private/student/student-info/get-by-id/${studentInfoId}`
   - **Course Marks & GPA**: `GET /private/student/course-mark/get-course-mark-by-student-id/${studentInfoId}`
   - **Fee Collections**: `GET /private/student/fees-collection/get-by-student-id/${studentInfoId}/0`
   - **Recent Notices**: `GET /private/student/notice/get-last-five-notice-list-for-student-by-app-user-id`
   - **Hall Notices**: `GET /private/student/notice/get-hall-notice-list-for-student-by-app-user-id`

---

## 📊 Mark Nomenclature Mapping Table

| Backend Field | UI Display Heading | Notes |
| :--- | :--- | :--- |
| `caMark` | **Internal Mark** | Displayed as Internal Mark per specification |
| `finalMark` | **Final Mark** | Final examination score |
| `totalMark` | **Total Mark** | Combined total score |
| `null` / `undefined` | **—** | Null values rendered as dash, never coerced to `0` |

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js 18+ installed

### Development Server
```bash
npm run dev
```
Starts the Express + Vite server at `http://localhost:3000`.

### Production Build & Launch
```bash
npm run build
npm start
```

---

## 🧪 Testing Checklist

1. **Successful Login**: Enter valid student ID & password. Observe smooth transition into student dashboard.
2. **Invalid Login**: Enter wrong password or ID. Confirm clear error banner ("Invalid Student ID or password.").
3. **Dynamic studentInfoId Discovery**: Log in with different student accounts. Verify that `studentInfoId` is resolved dynamically without hardcoding.
4. **Profile Loading**: Check that name, roll, department, hall, session, and photo load correctly.
5. **Result Loading**: View semester-wise cards with GPA, pass status, and earned credits.
6. **Internal Mark Mapping**: Check result tables to confirm `caMark` appears as **"Internal Mark"**.
7. **Different Student Accounts**: Logout and log in as a second student account. Confirm zero stale data from the previous account.
8. **Logout**: Click Logout. Confirm token and state are cleared and user returns to login screen.
9. **Expired Token / Error Handling**: Network errors or expired tokens show human-readable banners with a retry button.
10. **Mobile Responsiveness**: Test on mobile or tablet dimensions. Verify result tables support smooth horizontal scrolling.

---

## 🔒 CORS & Proxy Details

The frontend first attempts a direct fetch to `https://eresult.ru.ac.bd:9603/api`. If browser security or cross-origin restrictions block port 9603 in preview environments, requests fall back seamlessly to the server proxy at `/api/proxy/*`. The proxy forwards authorization headers without logging or persisting credentials.
