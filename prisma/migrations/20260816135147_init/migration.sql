-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `phoneVerifiedAt` DATETIME(3) NULL,
    `name` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'HOST', 'ADMIN') NOT NULL,
    `kycStatus` ENUM('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'NOT_SUBMITTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_kycStatus_idx`(`kycStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `KycProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `idType` ENUM('DRIVING_LICENCE', 'PASSPORT', 'VOTER_ID') NOT NULL,
    `idLastFour` VARCHAR(191) NOT NULL,
    `idFileKey` VARCHAR(191) NOT NULL,
    `selfieFileKey` VARCHAR(191) NOT NULL,
    `addressLine` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `ownershipProofFileKey` VARCHAR(191) NULL,
    `emergencyContactName` VARCHAR(191) NULL,
    `emergencyContactPhone` VARCHAR(191) NULL,
    `alternatePhone` VARCHAR(191) NULL,
    `status` ENUM('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedById` VARCHAR(191) NULL,
    `reviewNote` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `KycProfile_userId_key`(`userId`),
    INDEX `KycProfile_status_idx`(`status`),
    INDEX `KycProfile_reviewedById_idx`(`reviewedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Property` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `type` ENUM('FLAT', 'PG_ROOM', 'ROOM', 'TERRACE', 'FARMHOUSE', 'BANQUET') NOT NULL,
    `description` TEXT NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `locality` VARCHAR(191) NOT NULL,
    `addressLine` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `maxGuests` INTEGER NOT NULL,
    `basePricePaise` INTEGER NOT NULL,
    `perHeadPricePaise` INTEGER NOT NULL,
    `guestDetailLevel` ENUM('COUNT_ONLY', 'NAME_PHONE', 'FULL_ID') NOT NULL DEFAULT 'NAME_PHONE',
    `societyPermissionRequired` BOOLEAN NOT NULL DEFAULT false,
    `musicCutoffTime` VARCHAR(191) NOT NULL DEFAULT '23:00',
    `status` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED') NOT NULL DEFAULT 'DRAFT',
    `rejectionReason` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `completedParties` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Property_slug_key`(`slug`),
    INDEX `Property_city_status_idx`(`city`, `status`),
    INDEX `Property_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Property_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertyImage` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `fileKey` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,

    INDEX `PropertyImage_propertyId_idx`(`propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HouseRule` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `category` ENUM('MUSIC', 'ALCOHOL', 'SMOKING', 'TIMING', 'GUESTS', 'SAFETY', 'OTHER') NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `HouseRule_code_key`(`code`),
    INDEX `HouseRule_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertyRule` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `houseRuleId` VARCHAR(191) NOT NULL,
    `allowed` BOOLEAN NOT NULL,
    `note` VARCHAR(191) NULL,

    INDEX `PropertyRule_propertyId_idx`(`propertyId`),
    INDEX `PropertyRule_houseRuleId_idx`(`houseRuleId`),
    UNIQUE INDEX `PropertyRule_propertyId_houseRuleId_key`(`propertyId`, `houseRuleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlockedDate` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,

    INDEX `BlockedDate_propertyId_idx`(`propertyId`),
    UNIQUE INDEX `BlockedDate_propertyId_date_key`(`propertyId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyRequest` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `hostId` VARCHAR(191) NOT NULL,
    `eventDate` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `guestCount` INTEGER NOT NULL,
    `finalGuestCount` INTEGER NULL,
    `perHeadBudgetPaise` INTEGER NOT NULL,
    `occasion` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `rulesSnapshot` JSON NOT NULL,
    `rulesAcceptedAt` DATETIME(3) NOT NULL,
    `guestDetailLevel` ENUM('COUNT_ONLY', 'NAME_PHONE', 'FULL_ID') NOT NULL,
    `guestListToken` VARCHAR(191) NOT NULL,
    `guestListLockedAt` DATETIME(3) NULL,
    `ownerRespondedAt` DATETIME(3) NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PartyRequest_code_key`(`code`),
    UNIQUE INDEX `PartyRequest_guestListToken_key`(`guestListToken`),
    INDEX `PartyRequest_propertyId_status_idx`(`propertyId`, `status`),
    INDEX `PartyRequest_hostId_status_idx`(`hostId`, `status`),
    INDEX `PartyRequest_eventDate_idx`(`eventDate`),
    INDEX `PartyRequest_status_idx`(`status`),
    INDEX `PartyRequest_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PartyGuest` (
    `id` VARCHAR(191) NOT NULL,
    `partyRequestId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `idType` ENUM('DRIVING_LICENCE', 'PASSPORT', 'VOTER_ID') NULL,
    `idLastFour` VARCHAR(191) NULL,
    `idFileKey` VARCHAR(191) NULL,
    `selfCheckedInAt` DATETIME(3) NULL,
    `purgeAfter` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PartyGuest_partyRequestId_idx`(`partyRequestId`),
    INDEX `PartyGuest_purgeAfter_idx`(`purgeAfter`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactUnlock` (
    `id` VARCHAR(191) NOT NULL,
    `partyRequestId` VARCHAR(191) NOT NULL,
    `hostId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `unlockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ContactUnlock_partyRequestId_key`(`partyRequestId`),
    UNIQUE INDEX `ContactUnlock_paymentId_key`(`paymentId`),
    INDEX `ContactUnlock_hostId_idx`(`hostId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionPlan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `listingLimit` INTEGER NOT NULL,
    `durationMonths` INTEGER NOT NULL,
    `pricePaise` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `SubscriptionPlan_slug_key`(`slug`),
    INDEX `SubscriptionPlan_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `razorpaySubscriptionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_razorpaySubscriptionId_key`(`razorpaySubscriptionId`),
    INDEX `Subscription_ownerId_status_idx`(`ownerId`, `status`),
    INDEX `Subscription_endsAt_idx`(`endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `purpose` ENUM('SUBSCRIPTION', 'UNLOCK') NOT NULL,
    `amountPaise` INTEGER NOT NULL,
    `razorpayOrderId` VARCHAR(191) NULL,
    `razorpayPaymentId` VARCHAR(191) NULL,
    `razorpaySignature` VARCHAR(191) NULL,
    `status` ENUM('CREATED', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Payment_razorpayOrderId_key`(`razorpayOrderId`),
    UNIQUE INDEX `Payment_razorpayPaymentId_key`(`razorpayPaymentId`),
    INDEX `Payment_userId_status_idx`(`userId`, `status`),
    INDEX `Payment_purpose_status_idx`(`purpose`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InAppNotification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `templateKey` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `linkUrl` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InAppNotification_userId_readAt_idx`(`userId`, `readAt`),
    INDEX `InAppNotification_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `channel` ENUM('EMAIL', 'IN_APP') NOT NULL,
    `templateKey` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `providerMessageId` VARCHAR(191) NULL,
    `error` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NotificationLog_userId_idx`(`userId`),
    INDEX `NotificationLog_templateKey_idx`(`templateKey`),
    INDEX `NotificationLog_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `partyRequestId` VARCHAR(191) NOT NULL,
    `byUserId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Review_partyRequestId_key`(`partyRequestId`),
    INDEX `Review_byUserId_idx`(`byUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `status` ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `resolvedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Report_propertyId_idx`(`propertyId`),
    INDEX `Report_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdLead` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `campaign` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `intent` VARCHAR(191) NULL,
    `status` ENUM('NEW', 'CONTACTED', 'CONVERTED', 'DROPPED') NOT NULL DEFAULT 'NEW',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdLead_status_idx`(`status`),
    INDEX `AdLead_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `ip` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditLog_actorId_idx`(`actorId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `KycProfile` ADD CONSTRAINT `KycProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `KycProfile` ADD CONSTRAINT `KycProfile_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyImage` ADD CONSTRAINT `PropertyImage_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyRule` ADD CONSTRAINT `PropertyRule_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertyRule` ADD CONSTRAINT `PropertyRule_houseRuleId_fkey` FOREIGN KEY (`houseRuleId`) REFERENCES `HouseRule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedDate` ADD CONSTRAINT `BlockedDate_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyRequest` ADD CONSTRAINT `PartyRequest_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyRequest` ADD CONSTRAINT `PartyRequest_hostId_fkey` FOREIGN KEY (`hostId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartyGuest` ADD CONSTRAINT `PartyGuest_partyRequestId_fkey` FOREIGN KEY (`partyRequestId`) REFERENCES `PartyRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactUnlock` ADD CONSTRAINT `ContactUnlock_partyRequestId_fkey` FOREIGN KEY (`partyRequestId`) REFERENCES `PartyRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactUnlock` ADD CONSTRAINT `ContactUnlock_hostId_fkey` FOREIGN KEY (`hostId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactUnlock` ADD CONSTRAINT `ContactUnlock_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `SubscriptionPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InAppNotification` ADD CONSTRAINT `InAppNotification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationLog` ADD CONSTRAINT `NotificationLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_partyRequestId_fkey` FOREIGN KEY (`partyRequestId`) REFERENCES `PartyRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_byUserId_fkey` FOREIGN KEY (`byUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_resolvedById_fkey` FOREIGN KEY (`resolvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
