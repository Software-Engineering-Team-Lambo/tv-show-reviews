-- AlterTable
ALTER TABLE `Show` ADD COLUMN `seasons` INTEGER NULL,
    ADD COLUMN `status` VARCHAR(191) NULL,
    ADD COLUMN `year` INTEGER NULL,
    MODIFY `description` TEXT NULL;

-- CreateTable
CREATE TABLE `Genre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Genre_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShowGenre` (
    `showId` INTEGER NOT NULL,
    `genreId` INTEGER NOT NULL,

    PRIMARY KEY (`showId`, `genreId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Actor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShowCast` (
    `showId` INTEGER NOT NULL,
    `actorId` INTEGER NOT NULL,
    `role` VARCHAR(191) NULL,
    `order` INTEGER NULL,

    PRIMARY KEY (`showId`, `actorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShowGenre` ADD CONSTRAINT `ShowGenre_showId_fkey` FOREIGN KEY (`showId`) REFERENCES `Show`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShowGenre` ADD CONSTRAINT `ShowGenre_genreId_fkey` FOREIGN KEY (`genreId`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShowCast` ADD CONSTRAINT `ShowCast_showId_fkey` FOREIGN KEY (`showId`) REFERENCES `Show`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShowCast` ADD CONSTRAINT `ShowCast_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `Actor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
