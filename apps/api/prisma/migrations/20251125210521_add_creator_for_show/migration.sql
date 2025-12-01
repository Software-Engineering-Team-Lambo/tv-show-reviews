-- CreateTable
CREATE TABLE `Creator` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShowCreator` (
    `showId` INTEGER NOT NULL,
    `creatorId` INTEGER NOT NULL,

    PRIMARY KEY (`showId`, `creatorId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShowCreator` ADD CONSTRAINT `ShowCreator_showId_fkey` FOREIGN KEY (`showId`) REFERENCES `Show`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShowCreator` ADD CONSTRAINT `ShowCreator_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `Creator`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
