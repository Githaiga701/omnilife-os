# OmniLife OS: Product Requirements Document (PRD) v2.0

## 1. Executive Summary
**Product Name:** OmniLife OS  
**Vision:** A centralized, AI-autonomous personal operating system designed to unify a user's projects, finances, time, and specifically their **academic/lifelong learning journey** and **financial obligations/receivables**.  
**Core Philosophy:** "One input, universal action." Leveraging agentic AI to manage complex, interconnected life data without manual data entry.

## 2. Target Audience & Use Cases
While designed as a "life OS," the current feature set heavily optimizes for:
1. **Students & Academics:** Tracking courses, unit progress, assignments, study hours, and learning journals.
2. **Freelancers & Gig Workers:** Tracking specific receivables (invoices), partial payments, and recurring business expenses.
3. **Lifelong Learners & Hobbyists:** Self-teaching skills with structured progress tracking and reflection.

## 3. Core Modules & Feature Specifications

### 3.1. 🧠 AI Command Center (The Brain)
- **Global Command Palette:** Accessible via `Cmd/Ctrl + K`.
- **Natural Language Processing:** Accepts complex, multi-module commands (e.g., *"Log 2 hours of studying React, mark Unit 3 as 100% complete, and pay the $50 internet bill"*).
- **Autonomous Execution:** Uses function-calling to mutate state across the database in real-time.

### 3.2. 🎓 Learning & Student Module (NEW)
- **Learning Paths:** Top-level entities for Courses, Degrees, or Self-Taught Skills.
- **Units & Progress:** Granular tracking of chapters/modules with 0-100% progress bars. Overall path progress is auto-calculated.
- **Assignments:** Task lists with strict `PENDING`, `IN_PROGRESS`, and `DONE` statuses, including due dates.
- **Study Timer:** Built-in Pomodoro/Stopwatch that logs exact minutes to the database, tied to a specific Learning Path.
- **Learning Journal:** A dedicated text area for daily reflections, breakthroughs, and tagging (e.g., #difficult, #idea).

### 3.3. 💰 Advanced Finances Module (UPDATED)
- **Accounts & Ledger:** Standard checking/savings tracking.
- **Bills (Payables):** Specific tracking for obligations (Rent, Tuition, Subscriptions).
    - *Features:* Due dates, Recurring frequencies (Weekly/Monthly), and `UNPAID`/`PAID`/`OVERDUE` statuses.
- **Income (Receivables):** Tracking money owed to the user (Freelance, Salary).
    - *Features:* Total expected amount, `amountPaid` (supports partial payments), and `UNPAID`/`PARTIAL`/`PAID` statuses.
- **Transaction Linking:** When a Bill is marked "Paid", it can automatically generate a corresponding negative Transaction in the Ledger.

### 3.4. 🚀 Projects, 📅 Calendar, 🎯 Events, 🎨 Hobbies
- *(Standard modules as defined in v1.0, featuring Kanban boards, time-blocking, and event lifecycle tracking).*

## 4. Technical Architecture & Stack

### 4.1. Frontend (Web-First)
- **Framework:** Next.js 14+ (App Router, TypeScript).
- **Styling:** Tailwind CSS.
- **UI Components:** shadcn/ui (for accessible, beautiful primitives like Command Dialogs, Data Tables, and Progress bars).
- **State Management:** React Server Components (for data fetching) + Zustand (for client-side UI state).

### 4.2. Backend & Database
- **Database:** Supabase (Managed PostgreSQL).
- **ORM:** Prisma (for type-safe database queries and schema management).
- **Data Mutations:** Next.js Server Actions (for secure, direct database writes without exposing API endpoints).

### 4.3. AI Engine (Planned for Phase 3)
- **Orchestration:** Vercel AI SDK / LangChain.
- **Model:** OpenAI GPT-4o or Anthropic Claude 3.5 (utilizing Tool/Function calling).

## 5. Current Development Status
- ✅ **Phase 1 Complete:** UI Shell (Sidebar, AI Command Palette), Database Schema (Supabase connected via Prisma).
- ✅ **Phase 2 Complete:** Learning & Student Module (Fully functional UI, Study Timer, Journaling, Unit Progress).
- 🔄 **Phase 3 (In Progress):** Advanced Finances Module (Bills, Income, Partial Payments).
- ⏳ **Phase 4 (Upcoming):** AI Integration (Connecting the Command Palette to actual Server Actions).
- ⏳ **Phase 5 (Future):** Authentication, Mobile App transition (React Native).
