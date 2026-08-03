# 🎓 RU Student Dashboard

<div align="center">

### University of Rajshahi Student Academic Dashboard

A modern, responsive web application for accessing student academic information through the University of Rajshahi Exam Portal APIs.

**Results • Course History • Internal Marks • Fees • Notices • Admit Card • Money Receipt** <br>
<br>
<a href="https://ru-student-dashboard.vercel.app/" target="_blank">RU Student Dashboard Vercel</a>&nbsp;&nbsp;&nbsp;
<a href="https://ru-student-dashboard.onrender.com" target="_blank">RU Student Dashboard Render</a>&nbsp;&nbsp;&nbsp;
<a href="https://rustudent.netlify.app" target="_blank">RU Student Dashboard Netlify</a>
</div>

---

## 📖 About the Project

**RU Student Dashboard** is a student-focused web application designed to provide University of Rajshahi students with a simple and organized interface for viewing their own academic information.

Students authenticate using their RU student credentials, after which the application dynamically retrieves information associated with the authenticated account from the University of Rajshahi student portal APIs.

The application does **not hardcode individual student IDs or profile information**. Student-specific identifiers and information are resolved dynamically for the currently authenticated account.

---

## ✨ Features

### 🔐 Student Authentication
- Login using Student ID and password
- Bearer-token based authenticated API requests
- Dynamic identification of the logged-in student
- Secure session handling
- Logout functionality

### 👤 Student Profile
View academic and personal profile information including:

- Student Name
- Student ID
- Student Photograph
- Admission Session
- Current Session
- Faculty
- Department
- Program
- Current Year & Semester
- Residence Hall
- Residential Status

### 🖼️ Student Photograph

Student photographs are dynamically retrieved using the filename provided by the authenticated student's profile.

The application does not hardcode individual student image filenames.

### 📚 Course History

Students can view their academic courses organized by semester, including:

- Course Code
- Course Title
- Course Type
- Course Teacher
- Semester
- Academic Session

### 📊 Academic Results

Detailed semester-wise result information can include:

- Course Code
- Course Title
- Credit
- Internal Mark
- Final Mark
- Total Mark
- Letter Grade
- Grade Point
- Semester GPA
- Earned Credit
- Result Status

> **Note:** The RU backend field `caMark` is presented in the interface as **Internal Mark**.

### 💳 Fees

The Fees section provides available fee-related information associated with the authenticated student.

Depending on the information and actions made available by the RU system, students may access relevant academic documents from their fee records.

### 🎫 Admit Card

Where available, the application can request the authenticated student's admit card through the RU report-generation system.

### 🧾 Money Receipt

Students can access available money receipts associated with their own applicable fee/payment records.

### 📢 Notices

The dashboard supports:

- Recent Student Notices
- Hall Notices

---

## 🔄 How It Works

```text
Student Opens Dashboard
        │
        ▼
Enter Student ID & Password
        │
        ▼
RU Authentication
        │
        ▼
Authenticated Session
        │
        ▼
Resolve Current Student
        │
        ├───────────────┐
        ▼               ▼
 Student Profile    Course Information
        │               │
        ▼               ▼
 Student Photo      Academic Results
        │
        ├───────────────┐
        ▼               ▼
      Fees           Notices
        │
        ▼
Available Documents
        │
        ├── Admit Card
        │
        └── Money Receipt
```

---

## 🛠️ Technology

The project is built using modern web technologies and REST API integration.

Depending on the current implementation, the stack may include:

- HTML5
- CSS3
- JavaScript / TypeScript
- React
- Vite
- REST APIs
- JWT / Bearer Authentication
- Responsive Web Design

---

## 📱 Responsive Design

RU Student Dashboard is designed to work across different screen sizes:

- 🖥️ Desktop
- 💻 Laptop
- 📱 Android
- 📱 iPhone
- 📟 Tablet

Tables and dashboard components are optimized for smaller displays where possible.

---

## 🔒 Privacy & Security

This project is designed around authenticated, current-user access.

The application should:

- Never hardcode student passwords
- Never hardcode authentication tokens
- Never expose Bearer tokens publicly
- Never store passwords unnecessarily
- Never enumerate student IDs
- Never enumerate private record IDs
- Never scrape student photographs
- Never intentionally retrieve another student's private information

Private academic information should only be requested for the **currently authenticated student**.

---

## ⚠️ Important Disclaimer

> **This is an independent student project and is NOT an official University of Rajshahi website or application.**

This project is not affiliated with, endorsed by, maintained by, or officially connected with the **University of Rajshahi**.

The University of Rajshahi and its official systems remain the authoritative source for academic information.

The project interacts only with services that are accessible to the authenticated student and is intended for educational and personal-use purposes.

Users should always verify important academic information through the official University portal.

---

## 🚫 No Student Data Included

This repository should **not contain real student credentials, authentication tokens, or private student records**.

Before making the repository public, verify that you have not committed:

```text
Passwords
JWT/Bearer Tokens
Authorization Headers
Private API Responses
Student Personal Information
Debug Logs containing credentials
.env files containing secrets
```

Use `.gitignore` for local environment and secret files where appropriate.

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone <your-repository-url>
```

Open the project directory:

```bash
cd ru-student-dashboard
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open the local URL displayed by Vite in your browser.

---

## 📦 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🗺️ Project Goals

The main goals of RU Student Dashboard are to:

- Provide a cleaner student experience
- Organize academic information in one dashboard
- Make course results easier to understand
- Improve mobile accessibility
- Dynamically support different authenticated students
- Provide convenient access to available academic documents
- Avoid hardcoded student-specific information

---

## 🔮 Future Improvements

Possible future improvements include:

- Better semester filtering
- Result analytics
- GPA visualization
- Improved fee-history presentation
- Notice notifications
- Dark mode
- PWA support
- Better mobile tables
- Academic progress visualization
- Downloadable academic summaries

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome.

If you find a problem:

1. Open an Issue
2. Clearly describe the problem
3. Include steps to reproduce it
4. Do **not** include passwords, tokens, or private student information

---

## 📄 License

Add the appropriate license for this project before distributing or accepting external contributions.

---

<div align="center">

### 🎓 RU Student Dashboard

**A cleaner way to view your RU academic information.**

Built as an independent student project for University of Rajshahi students.

</div>


