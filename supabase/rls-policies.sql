-- Enable RLS on all user-owned tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Skill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LearningPath" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IncomeEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Hobby" ENABLE ROW LEVEL SECURITY;

-- Helper: auth.uid() returns uuid, cast to text for our text-based id columns

-- User: users can only see/update their own record
CREATE POLICY "Users can view own record" ON "User"
  FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Users can update own record" ON "User"
  FOR UPDATE USING (id = auth.uid()::text);
CREATE POLICY "Users can insert own record" ON "User"
  FOR INSERT WITH CHECK (id = auth.uid()::text);

-- Project
CREATE POLICY "Users can view own projects" ON "Project"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own projects" ON "Project"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own projects" ON "Project"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own projects" ON "Project"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- Task (owned via Project -> User)
CREATE POLICY "Users can view own tasks" ON "Task"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Project"
      WHERE "Project".id = "Task"."projectId"
      AND "Project"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can create own tasks" ON "Task"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Project"
      WHERE "Project".id = "projectId"
      AND "Project"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can update own tasks" ON "Task"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Project"
      WHERE "Project".id = "Task"."projectId"
      AND "Project"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can delete own tasks" ON "Task"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Project"
      WHERE "Project".id = "Task"."projectId"
      AND "Project"."userId" = auth.uid()::text
    )
  );

-- Account
CREATE POLICY "Users can view own accounts" ON "Account"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own accounts" ON "Account"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own accounts" ON "Account"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own accounts" ON "Account"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- Transaction (owned directly via userId)
CREATE POLICY "Users can view own transactions" ON "Transaction"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own transactions" ON "Transaction"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own transactions" ON "Transaction"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own transactions" ON "Transaction"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- CalendarEvent
CREATE POLICY "Users can view own events" ON "CalendarEvent"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own events" ON "CalendarEvent"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own events" ON "CalendarEvent"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own events" ON "CalendarEvent"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- Skill
CREATE POLICY "Users can view own skills" ON "Skill"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own skills" ON "Skill"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own skills" ON "Skill"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own skills" ON "Skill"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- LearningPath
CREATE POLICY "Users can view own learning paths" ON "LearningPath"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own learning paths" ON "LearningPath"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own learning paths" ON "LearningPath"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own learning paths" ON "LearningPath"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- Unit (owned via LearningPath -> User)
CREATE POLICY "Users can view own units" ON "Unit"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "LearningPath"
      WHERE "LearningPath".id = "Unit"."learningPathId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can create own units" ON "Unit"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "LearningPath"
      WHERE "LearningPath".id = "learningPathId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can update own units" ON "Unit"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "LearningPath"
      WHERE "LearningPath".id = "Unit"."learningPathId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can delete own units" ON "Unit"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "LearningPath"
      WHERE "LearningPath".id = "Unit"."learningPathId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );

-- Assignment (owned via Unit -> LearningPath -> User)
CREATE POLICY "Users can view own assignments" ON "Assignment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Unit"
      JOIN "LearningPath" ON "LearningPath".id = "Unit"."learningPathId"
      WHERE "Unit".id = "Assignment"."unitId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can create own assignments" ON "Assignment"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Unit"
      JOIN "LearningPath" ON "LearningPath".id = "Unit"."learningPathId"
      WHERE "Unit".id = "unitId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can update own assignments" ON "Assignment"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Unit"
      JOIN "LearningPath" ON "LearningPath".id = "Unit"."learningPathId"
      WHERE "Unit".id = "Assignment"."unitId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );
CREATE POLICY "Users can delete own assignments" ON "Assignment"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Unit"
      JOIN "LearningPath" ON "LearningPath".id = "Unit"."learningPathId"
      WHERE "Unit".id = "Assignment"."unitId"
      AND "LearningPath"."userId" = auth.uid()::text
    )
  );

-- Bill
CREATE POLICY "Users can view own bills" ON "Bill"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own bills" ON "Bill"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own bills" ON "Bill"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own bills" ON "Bill"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- IncomeEntry
CREATE POLICY "Users can view own income" ON "IncomeEntry"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own income" ON "IncomeEntry"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own income" ON "IncomeEntry"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own income" ON "IncomeEntry"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- JournalEntry
CREATE POLICY "Users can view own journal" ON "JournalEntry"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own journal" ON "JournalEntry"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own journal" ON "JournalEntry"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own journal" ON "JournalEntry"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- StudySession
CREATE POLICY "Users can view own study sessions" ON "StudySession"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own study sessions" ON "StudySession"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own study sessions" ON "StudySession"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own study sessions" ON "StudySession"
  FOR DELETE USING ("userId" = auth.uid()::text);

-- Hobby
CREATE POLICY "Users can view own hobbies" ON "Hobby"
  FOR SELECT USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can create own hobbies" ON "Hobby"
  FOR INSERT WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY "Users can update own hobbies" ON "Hobby"
  FOR UPDATE USING ("userId" = auth.uid()::text);
CREATE POLICY "Users can delete own hobbies" ON "Hobby"
  FOR DELETE USING ("userId" = auth.uid()::text);
