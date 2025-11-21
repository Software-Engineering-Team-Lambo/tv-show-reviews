-- AlterTable
ALTER TABLE `Show` ADD COLUMN `episodes` INTEGER NULL,
    ADD COLUMN `posterPath` VARCHAR(191) NULL,
    ADD COLUMN `releaseDate` DATETIME(3) NULL;
