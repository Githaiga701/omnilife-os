# OmniLife OS: User Journey & Workflow Flows v2.0

This document maps out the exact step-by-step experiences of the user interacting with the newly defined Learning and Finance modules, both manually and via the AI Command Center.

---

## 1. The "Deep Work" Study Journey (Learning Module)

**Persona:** A university student or self-taught developer sitting down to study.

### Step 1: Initialization
1. User opens the **Learning** tab in the sidebar.
2. User sees their active "Learning Paths" (e.g., "Advanced Next.js").
3. User checks the **Assignments** list and checks off "Build a custom hook" (Status changes to `DONE`, UI strikes through the text).

### Step 2: The Study Session
1. User locates the **Study Timer** card for "Advanced Next.js".
2. User types a quick note: *"Working on Server Actions"*.
3. User clicks **Start**. The timer begins ticking (00:00:01...).
4. *Background Process:* The UI is purely client-side; no database spam occurs while the timer runs.

### Step 3: Reflection & Logging
1. After 45 minutes, the user clicks **Stop & Log**.
2. A Server Action (`logStudySession`) fires, saving `durationMins: 45` and the notes to the `StudySession` table in Supabase.
3. The UI instantly revalidates. The "Total Study Time" card at the top of the page updates from `12h 10m` to `12h 55m`.

### Step 4: Journaling & Progress
1. User scrolls to the **Journal** section and types: *"Finally understood how revalidatePath works. Felt like a breakthrough."*
2. User goes to **Unit 3: Server Actions** and drags/updates the progress input from `40%` to `100%`.
3. The overall Learning Path progress bar automatically recalculates and updates.

---

## 2. The "End of Month" Financial Reconciliation Journey

**Persona:** A freelancer managing their personal rent and client invoices.

### Step 1: Reviewing Obligations (Bills)
1. User navigates to the **Finances** tab.
2. User looks at the **Upcoming Bills** section. They see "Apartment Rent" ($1,500, Due in 3 days, Status: `UNPAID`).
3. User opens their banking app, transfers the money, and comes back to OmniLife.
4. User clicks the "Mark as Paid" button next to the Rent bill.
5. *System Action:* The Bill status changes to `PAID`. The system prompts: *"Log this as a transaction from your Checking Account?"* User clicks Yes. A `-$1,500` Transaction is created and linked to the Bill.

### Step 2: Tracking Receivables (Income)
1. User checks the **Income Tracker** section. They see "Client A - Website Redesign" ($3,000 total).
2. User receives an email that Client A paid the first half.
3. User clicks "Log Payment" on the Income Entry, enters `$1,500`.
4. *System Action:* The `amountPaid` updates to 1500. The status automatically shifts from `UNPAID` to `PARTIAL`. A progress bar shows 50% collected.

---

## 3. The AI Autonomous Command Journey (The "Magic" Flow)

**Persona:** The user wants to update multiple modules without clicking through the UI.

### The Prompt
User presses `Cmd + K` to open the AI Command Palette and types:
> *"I just finished my Spanish assignment, studied for 2 hours, and my client just paid the remaining $500 of my invoice."*

### The AI Execution Flow (Behind the Scenes)
1. **Intent Recognition:** The AI parses the prompt and identifies three distinct actions across two modules.
2. **Tool Call 1 (Learning):**
   - *Action:* `toggleAssignment`
   - *Target:* Finds the active "Spanish" Learning Path, finds the pending assignment, marks it `DONE`.
3. **Tool Call 2 (Learning):**
   - *Action:* `logStudySession`
   - *Target:* Creates a new `StudySession` for "Spanish" with `durationMins: 120`.
4. **Tool Call 3 (Finance):**
   - *Action:* `updateIncomeEntry`
   - *Target:* Finds the "Client A" Income Entry, adds 500 to `amountPaid`, changes status to `PAID`.

### The User Feedback Loop
1. The Command Palette doesn't just close. It opens a "Streaming Results" view.
2. The AI responds in natural language:
   > ✅ *"Marked your Spanish assignment as Done."*
   > ⏱️ *"Logged 2 hours of study time to Spanish."*
   > 💰 *"Updated Client A's invoice. It is now fully PAID!"*
3. When the user closes the palette and looks at their Dashboard, all data is already updated.

---

## 4. Daily System Workflow (Automated Background Tasks)

To make the system truly feel like an "OS", it runs automated checks via Cron jobs (using Supabase Edge Functions or Vercel Cron).

- **08:00 AM - The Morning Briefing:**
  - Checks `Bill` table for items due today.
  - Checks `Assignment` table for items due today.
  - Generates a summary on the main Dashboard: *"You have 2 assignments due and $1,200 in bills due today."*
- **11:59 PM - The Daily Rollover:**
  - Checks `Bill` table. Any bill with `status: UNPAID` and `dueDate < today` is automatically updated to `status: OVERDUE`.
  - Calculates total study time for the day and prepares the "Yesterday's Stats" card for the next morning.
