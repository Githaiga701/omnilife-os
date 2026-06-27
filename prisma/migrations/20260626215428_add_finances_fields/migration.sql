/*
  Warnings:

  - You are about to drop the column `title` on the `IncomeEntry` table. All the data in the column will be lost.
  - Added the required column `sourceName` to the `IncomeEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillFrequency" AS ENUM ('ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "frequency" "BillFrequency" NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "IncomeEntry" DROP COLUMN "title",
ADD COLUMN     "sourceName" TEXT NOT NULL;
