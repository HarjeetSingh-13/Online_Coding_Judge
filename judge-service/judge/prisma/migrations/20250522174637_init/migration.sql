/*
  Warnings:

  - Added the required column `memoryLimit` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeLimit` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "memoryLimit" INTEGER NOT NULL,
ADD COLUMN     "timeLimit" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
