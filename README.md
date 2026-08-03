# 🎓 RU Student Dashboard

A simple and modern student dashboard built for University of Rajshahi students.

I started this project to make academic information from the RU Exam Portal easier to view and navigate. Instead of going through different sections of the portal, the dashboard brings the important information together in one clean interface.

Students can log in with their own account and view the information available for that account.

---

## ✨ What can you do with it?

After logging in, the dashboard can show information such as:

- 👤 Student profile and photograph
- 🎓 Academic information
- 📚 Course history
- 📊 Semester-wise results
- 📝 Internal, final and total marks
- ⭐ Grades and GPA
- 💳 Fees and payment history
- 📢 Student notices
- 🏠 Hall notices
- 🎫 Admit card
- 🧾 Money receipt

The available information depends on what is currently provided by the RU system for the logged-in student.

---

## 🔐 Login

Students use their own **Student ID and password** to log in.

After a successful login, the application identifies the current student and loads the information connected with that account.

There is no need to manually enter an internal student ID or change the source code for different students.

```text
Student Login
      ↓
Authentication
      ↓
Current Student Identified
      ↓
Profile & Photograph
      ↓
Course History & Results
      ↓
Fees & Notices
      ↓
Available Documents
```

---

## 👤 Student Profile

The Profile section provides an organized view of student information such as:

- Name
- Student ID
- Photograph
- Session
- Program
- Faculty
- Department
- Year & Semester
- Residence Hall
- Residential Status

The student photograph is also loaded dynamically based on the information returned for the logged-in account.

---

## 📚 Course History & Results

One of the main goals of this project is to make academic results easier to read.

Results can be viewed semester by semester with information such as:

| Information | Description |
|---|---|
| Course Code | Official course code |
| Course Title | Name of the course |
| Credit | Course credit |
| Internal Mark | Internal/continuous assessment mark |
| Final Mark | Final examination mark |
| Total Mark | Combined mark |
| Grade | Letter grade |
| Grade Point | Grade point |

Semester GPA and other available result information are also shown where provided.

> The backend `caMark` value is displayed as **Internal Mark** in the dashboard for easier understanding.

---

## 💳 Fees

The Fees section is designed to make fee and payment information easier to understand.

Students can view the fee records available for their account and, where supported by the RU system, access related documents such as:

**🎫 Admit Card**  
**🧾 Money Receipt**

These actions are connected with the relevant student records rather than being based on hardcoded student information.

---

## 📢 Notices

The dashboard also brings together available:

- General student notices
- Recent notices
- Hall notices

This makes it easier to check important updates without moving through multiple pages.

---

## 📱 Built for Mobile Too

The dashboard is responsive, so it can be used comfortably on:

**Desktop • Laptop • Tablet • Android • iPhone**

Tables and other large sections are designed to remain usable on smaller screens.

---

## 🛠️ Built With

The project uses modern web technologies such as:

- React
- TypeScript / JavaScript
- Vite
- HTML & CSS
- REST API integration
- Bearer-token authentication
- Responsive web design

---

## 🚀 Running the Project

Clone the repository:

```bash
git clone <your-repository-url>
```

Go to the project directory:

```bash
cd ru-student-dashboard
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

For a production build:

```bash
npm run build
```

---

## 🔒 Privacy

Student privacy is important for this project.

The repository should never contain:

- Student passwords
- Authentication tokens
- Authorization headers
- Private student records
- Hardcoded personal information
- Secret environment variables

The application is intended to work with the **currently authenticated student's own account and information**.

If you are contributing to the project, please never include your password, token, or private student information in an issue or pull request.

---

## ⚠️ Disclaimer

**RU Student Dashboard is an independent student project.**

It is **not an official University of Rajshahi website or application**, and it is not maintained or endorsed by the University of Rajshahi.

The official university systems remain the authoritative source for academic records and information. Important information should always be verified through the official portal.

---

## 🌱 Why I Built This

The idea behind this project is simple: make the student portal experience cleaner, easier to navigate, and more convenient—especially on mobile devices.

There is still room for improvement, and I plan to continue working on the project as I learn more and as the available student services evolve.

Some ideas for the future:

- Better result visualization
- GPA and academic progress charts
- Improved fee history
- Better semester filtering
- Notice notifications
- Dark mode
- PWA/mobile experience
- Improved document management

---

## 🤝 Contributions

Found a bug or have an idea?

Feel free to open an **Issue** or submit a **Pull Request**.

When reporting a problem, please remove any personal information, passwords, or authentication tokens from screenshots and logs.

---

<div align="center">

### 🎓 RU Student Dashboard

**Making RU academic information a little easier to access.**

</div>

```bash
https://ru-student-dashboard.vercel.app/
```
```bash
https://ru-student-dashboard.onrender.com
```
