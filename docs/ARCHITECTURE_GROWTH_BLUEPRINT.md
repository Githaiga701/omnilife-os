# OmniLife OS Architecture Growth Blueprint

## Purpose

This document explains what OmniLife OS is today, how the implemented system is structured, where the architecture has room to mature, and what path can turn it into a stronger production-grade personal operating system.

It intentionally separates:

- Current architecture: what exists in the codebase now.
- Target architecture: where the product should grow.
- Gap analysis: what must change to get there safely.

The current product is a Next.js monolith, not a microservice system. That is acceptable for this stage. The right next move is not to prematurely split services, but to create stronger internal module boundaries so the monolith can scale cleanly.

## Product Vision

OmniLife OS is a personal operating system for managing the major operational areas of a user's life:

- Learning and skill growth.
- Projects and execution.
- Calendar and events.
- Bills, income, and cash flow.
- Hobbies and personal routines.
- AI-assisted command execution across all modules.

The core product promise is: one natural-language input should be able to update the correct parts of the user's life system without forcing the user to click through multiple screens.

Example:

```text
I studied Next.js for 90 minutes, paid rent, and moved the portfolio project to completed.
```

The system should understand the intent, find the right records, perform authorized updates, and show a clear audit trail of what changed.

## Current Implemented Architecture

### Runtime Shape

```text
Browser
  |
  | React UI, forms, command palette
  v
Next.js App Router
  |
  | Server Components read data directly
  | Server Actions mutate data
  | API routes handle AI and cron jobs
  v
Application helpers in src/lib
  |
  | Prisma queries and business helpers
  v
PostgreSQL through Prisma
```

### Main Layers

| Layer | Current Location | Responsibility |
| --- | --- | --- |
| Presentation | `src/app/*/page.tsx`, `src/components/*` | Render pages, forms, cards, dashboard summaries, command UI. |
| Server actions | `src/app/actions/*`, `src/lib/omni-actions.ts` | Handle form submissions and trusted mutations. |
| AI interface | `src/app/api/chat/route.ts`, `src/lib/ai-tools.ts` | Convert user messages into tool calls and stream model responses. |
| Application helpers | `src/lib/*` | Shared server-side logic, validation, account helpers, finance service. |
| Data access | `src/lib/db.ts`, `prisma/schema.prisma` | Prisma client, fallback DB, database schema. |
| Auth boundary | `src/proxy.ts`, `src/lib/mock-auth.ts`, `src/lib/supabase/*` | Supabase session handling and current user lookup. |
| Background jobs | `src/app/api/cron/*` | Daily rollover and morning briefing endpoints. |

### Current Data Flow

#### Page Read Flow

```text
User opens page
  -> Next.js Server Component runs
  -> getCurrentUser/getMockUser resolves authenticated user
  -> page queries Prisma directly
  -> page computes derived metrics in memory
  -> rendered HTML is returned
```

Examples:

- Dashboard reads projects, accounts, bills, income, events, learning paths, assignments, study sessions, and journal entries.
- Finance page reads bills and income entries.
- Learning page reads learning paths, units, assignments, study sessions, and journal entries.

#### Manual Write Flow

```text
User submits form
  -> Server Action receives FormData
  -> Zod validation or manual validation runs
  -> ownership checks run
  -> Prisma mutation executes
  -> revalidatePath refreshes affected UI
```

Examples:

- `createBill`
- `markBillAsPaid`
- `createLearningPath`
- `updateProjectStatus`
- `createCalendarEvent`

#### AI Write Flow

```text
User enters natural language command
  -> /api/chat receives message list
  -> AI model decides which tools to call
  -> tool reads context if needed
  -> tool performs Prisma-backed mutation
  -> streamed response summarizes changes
```

The AI tool layer now shares the finance mutation service for bills and income, reducing drift between manual actions and AI actions.

## Domain Model

```text
User
  |
  +-- Project
  |     +-- Task
  |
  +-- Account
  |     +-- Transaction
  |
  +-- Bill
  |     +-- optional linked Transaction
  |
  +-- IncomeEntry
  |
  +-- CalendarEvent
  |
  +-- Skill
  |
  +-- LearningPath
  |     +-- Unit
  |           +-- Assignment
  |
  +-- StudySession
  |
  +-- JournalEntry
  |
  +-- Hobby
```

## Current Module Breakdown

### Dashboard

Purpose: system overview.

Responsibilities:

- Summarize active projects.
- Show total balance and unpaid bills.
- Highlight overdue bills and upcoming assignments.
- Surface study time and learning progress.
- Link to primary modules.

Current limitation:

- It performs broad reads and in-memory aggregation. This will become expensive as records grow.

### Finances

Purpose: track obligations, receivables, and ledger activity.

Responsibilities:

- Create bills.
- Create expected income.
- Mark bills as paid.
- Optionally create linked transactions.
- Log partial or full income payments.

Current improvement made:

- Shared finance service now owns core bill/income mutations.

Growth opportunity:

- Introduce account balances, transaction reconciliation, categories, budgets, recurring bill generation, and audit logs.

### Learning

Purpose: structure study and track progress.

Responsibilities:

- Create learning paths.
- Track units.
- Toggle assignment status.
- Log study sessions.
- Add journal entries.

Growth opportunity:

- Connect assignments to calendar deadlines.
- Add spaced repetition, goals, curriculum templates, and AI-generated study plans.

### Projects

Purpose: manage active initiatives.

Responsibilities:

- Create projects.
- Update project status.
- Display active, paused, and completed counts.

Growth opportunity:

- Add task workflow, milestones, deadlines, project notes, related skills, and finance links.

### Calendar and Events

Purpose: schedule time and track upcoming commitments.

Responsibilities:

- Create calendar events.
- Delete calendar events.
- Show week load and event pipeline.

Growth opportunity:

- Split "calendar" and "event logistics" into clearer domain concepts.
- Add reminders, recurring events, focus blocks, and cross-module scheduling.

### Skills and Hobbies

Purpose: track growth areas and personal rhythms.

Responsibilities:

- Create skills.
- Update skill levels.
- Create hobbies.
- Update hobby progress.
- Delete hobbies.

Current limitation:

- Skill and hobby actions live in the calendar action file, which blurs module ownership.

## Architectural Problems To Address

### 1. Documentation Does Not Match Implementation

Some existing docs describe an event-driven microservice architecture. The code is currently a Next.js monolith. This mismatch can cause bad decisions because engineers may optimize for architecture that does not exist.

Recommendation:

- Treat this blueprint as the current architecture source of truth.
- Keep the older event-driven document as a future vision only, or rewrite it to mark proposed pieces clearly.

### 2. Direct Prisma Reads In Pages

Pages query Prisma directly and compute summaries inline. This is fast to build but hard to maintain as logic grows.

Risk:

- Duplicate dashboard logic across pages.
- Harder testing.
- More expensive queries.
- UI and domain logic become tangled.

Recommendation:

- Move read use cases into query modules, for example:
  - `src/modules/finance/finance.queries.ts`
  - `src/modules/dashboard/dashboard.queries.ts`
  - `src/modules/learning/learning.queries.ts`

### 3. Module Boundaries Are Weak

Actions for calendar, skills, and hobbies live together. Project actions live in `src/lib/omni-actions.ts` instead of a clear module.

Risk:

- New features become harder to place.
- Ownership is unclear.
- Shared concepts get duplicated.

Recommendation:

- Introduce domain module folders before adding more features.

Target shape:

```text
src/modules/
  finance/
    finance.actions.ts
    finance.queries.ts
    finance.service.ts
    finance.schemas.ts
    finance.types.ts
  learning/
    learning.actions.ts
    learning.queries.ts
    learning.service.ts
    learning.schemas.ts
  projects/
  calendar/
  skills/
  hobbies/
  ai/
```

### 4. AI Tools Can Drift From Manual Actions

AI tools and form actions both mutate data. If they implement business rules separately, behavior will diverge.

Improvement already started:

- Finance AI tools and finance form actions now share `finance-service.ts`.

Recommendation:

- Continue moving all AI write tools onto the same application services used by manual actions.

### 5. Authorization Is Spread Across Call Sites

Ownership checks are repeated inside actions and AI tools.

Risk:

- Easy to forget a check.
- Hard to audit.
- Security behavior varies by module.

Recommendation:

- Create shared ownership helpers or repository methods that always include `userId`.
- Prefer queries like `where: { id, userId }` where Prisma schema supports it.

### 6. Cron Authorization Is Too Permissive By Default

Current cron routes allow access when `CRON_SECRET` is missing.

Risk:

- A production deployment without `CRON_SECRET` exposes maintenance endpoints.

Recommendation:

- In production, fail closed when `CRON_SECRET` is missing.

### 7. Money Uses Float

Financial amounts are modeled as `Float`.

Risk:

- Floating point precision errors in financial calculations.

Recommendation:

- Migrate monetary fields to `Decimal` or integer cents.

### 8. Observability Is Minimal

Errors are mostly logged to console.

Risk:

- Hard to debug production issues.
- No audit trail for AI actions.

Recommendation:

- Add structured logging, action audit records, and error tracking.

## Target Architecture

The target architecture should remain a modular monolith until the codebase has enough scale to justify service extraction.

### Target Runtime Shape

```text
Browser / Mobile Client
  |
  v
Next.js App Router
  |
  +-- Server Components
  +-- Server Actions
  +-- API Routes
  |
  v
Application Use Cases
  |
  +-- finance service
  +-- learning service
  +-- project service
  +-- calendar service
  +-- AI orchestration service
  |
  v
Domain Policies
  |
  +-- authorization
  +-- validation
  +-- audit logging
  +-- event emission
  |
  v
Data Access
  |
  +-- Prisma repositories
  +-- PostgreSQL
  +-- optional cache/read models
```

### Target Code Ownership

Each module should own:

- Its read queries.
- Its write use cases.
- Its validation schemas.
- Its authorization rules.
- Its AI tool bindings.
- Its tests.

Shared infrastructure should own:

- Database client.
- Auth/session utilities.
- Route constants.
- Logging.
- Audit trail.
- Date/time utilities.
- Background job helpers.

## Event System Growth Path

Do not start with distributed infrastructure. Start with an in-process domain event layer.

### Phase 1: In-Process Events

Add a small event dispatcher that records events during server actions.

Example events:

```text
bill.paid
income.payment_logged
study_session.logged
assignment.completed
project.created
calendar_event.created
```

Use cases:

- Audit log.
- Dashboard notifications.
- AI memory.
- Later background workflows.

### Phase 2: Persistent Outbox

Add a database-backed `EventOutbox` table.

Purpose:

- Persist important events.
- Retry failed event handlers.
- Enable async processing.

### Phase 3: Background Processing

Move heavy work out of request/response paths.

Candidates:

- AI summarization.
- Reminder generation.
- Pattern detection.
- Recurring bill creation.
- Daily insight generation.

### Phase 4: External Event Bus Only If Needed

Only introduce queues or separate services when there is a real operational need:

- Separate scaling profile.
- Long-running workloads.
- Multiple apps consuming the same events.
- Independent deployment requirements.

## AI Architecture Growth Path

### Current AI Behavior

The AI route receives chat messages, uses a system prompt, exposes tools, and streams a response.

### Target AI Behavior

The AI should become a controlled orchestrator, not a direct collection of ad hoc tools.

Target components:

- Intent classifier.
- Context retriever.
- Tool planner.
- Permission checker.
- Tool executor.
- Audit logger.
- Result summarizer.

### AI Safety Rules

The AI should:

- Read before writing when resolving names to records.
- Require confirmation for destructive actions.
- Log every mutation it performs.
- Return structured tool results.
- Never bypass module services.
- Respect user ownership on every read and write.

## Data Architecture Growth Path

### Immediate Improvements

- Add indexes for common filters:
  - `userId`
  - `dueDate`
  - `status`
  - `createdAt`
  - `startTime`
- Replace money floats with decimal-safe storage.
- Add unique constraints where domain rules require them.
- Add cascading behavior intentionally.

### Medium-Term Improvements

- Add audit tables.
- Add event outbox.
- Add notification table.
- Add user preferences.
- Add tags and cross-module links.

### Long-Term Improvements

- Add read models for dashboard summaries.
- Add vector memory for AI context.
- Add analytics tables for trends.

## Security Architecture Growth Path

### Current Security Boundary

- Supabase session middleware protects routes.
- Server actions run on the server.
- User ownership is checked manually in many places.

### Target Security Boundary

- All user-scoped queries must require `userId`.
- All mutations must pass through service functions.
- All AI actions must be audited.
- Cron endpoints must fail closed in production.
- Rate limiting must protect `/api/chat`.
- Sensitive finance fields should be handled with stricter access patterns.

Recommended additions:

- `requireCurrentUser()`
- `assertOwnedRecord()`
- `withAuditLog()`
- `withRateLimit()`
- `requireCronSecret()`

## Performance Growth Path

### Current Performance Risks

- Dashboard does many broad reads.
- Study session totals are computed in memory.
- Bill and income totals are computed in memory.
- Pages may over-fetch records.

### Improvement Strategy

1. Add query modules with intentional `select` fields.
2. Use aggregate queries for totals.
3. Add pagination for long lists.
4. Add indexes for user-scoped lists.
5. Add dashboard summary read model if needed.
6. Cache stable low-risk reads after correctness is proven.

## Testing Strategy

### Current Gap

There is no visible automated test suite for domain behavior.

### Recommended Test Layers

| Test Type | Purpose |
| --- | --- |
| Unit tests | Validate pure services and calculations. |
| Integration tests | Validate Prisma-backed use cases. |
| Server action tests | Validate form parsing, auth, and revalidation behavior. |
| AI tool tests | Validate that tools call services and enforce ownership. |
| E2E tests | Validate critical user journeys. |

High-value test targets:

- Mark bill as paid with transaction.
- Mark bill as paid without transaction.
- Log partial income payment.
- Reject overpayment.
- Reject cross-user record mutation.
- Log study session.
- Complete assignment.

## Suggested Roadmap

### Stage 1: Stabilize The Monolith

- Rename `getMockUser` to `getCurrentUser` everywhere.
- Split calendar, skills, and hobbies actions.
- Move project actions out of `src/lib/omni-actions.ts`.
- Move direct page reads into query modules.
- Add tests for finance and learning services.

### Stage 2: Make AI Trustworthy

- Route every AI mutation through application services.
- Add AI action audit logging.
- Add rate limiting to `/api/chat`.
- Add confirmation flow for destructive operations.
- Add structured tool result types.

### Stage 3: Add Domain Events

- Add event names and payload types.
- Add in-process event publishing from services.
- Persist events to an audit log.
- Use events for notifications and dashboard activity.

### Stage 4: Scale Data And Background Work

- Add aggregate queries and indexes.
- Add recurring bill generation.
- Add reminder generation.
- Add persistent outbox for background jobs.
- Add dashboard summary read model if query cost grows.

### Stage 5: Expand Product Surface

- Add deeper project management.
- Add stronger learning planning.
- Add contact/social module.
- Add health or habit module.
- Add mobile app only after the domain model stabilizes.

## Definition Of A Production-Grade OmniLife OS

The project becomes production-grade when:

- Every mutation has one canonical service implementation.
- Every user-scoped read/write enforces ownership.
- AI tools cannot bypass business rules.
- Money is represented safely.
- Critical flows have automated tests.
- Cron endpoints are secure by default.
- Dashboard data is aggregated efficiently.
- Docs describe implemented reality and future vision separately.
- The codebase has clear module ownership.
- AI actions are observable and auditable.

## North Star

OmniLife OS should grow into a trusted control plane for personal execution.

The product should not merely store life data. It should help the user answer:

- What needs my attention today?
- What did I commit to?
- What is blocked?
- What is due?
- Where is my money going?
- What am I learning?
- What should I do next?

The architecture should make those answers reliable, explainable, secure, and easy to extend.
