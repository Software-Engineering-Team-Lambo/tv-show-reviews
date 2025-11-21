/*
  Warnings:

  - You are about to drop the column `year` on the `Show` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Show` DROP COLUMN `year`,
    ADD COLUMN `popularity` DOUBLE NULL;
