CREATE TABLE `installmentPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`installmentNumber` int NOT NULL,
	`amount` int NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paidAt` timestamp,
	`status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installmentPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installmentPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`userId` int NOT NULL,
	`totalAmount` int NOT NULL,
	`installments` int NOT NULL,
	`installmentAmount` int NOT NULL,
	`paidInstallments` int DEFAULT 0,
	`status` enum('active','completed','defaulted','cancelled') NOT NULL DEFAULT 'active',
	`nextDueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installmentPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `merchants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`tradeName` varchar(255),
	`document` varchar(20),
	`category` varchar(100),
	`feePercentage` int DEFAULT 50,
	`instantSettlement` boolean DEFAULT true,
	`totalTransactions` int DEFAULT 0,
	`totalVolume` int DEFAULT 0,
	`active` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchantId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`offerType` enum('cashback','discount','extra_installments','zero_fee') NOT NULL,
	`value` int NOT NULL,
	`minAmount` int,
	`maxAmount` int,
	`validFrom` timestamp NOT NULL,
	`validUntil` timestamp NOT NULL,
	`active` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`maxUsage` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parcelTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`creditLimit` int NOT NULL,
	`maxInstallments` int DEFAULT 4,
	`interestRate` int DEFAULT 0,
	`status` enum('active','used','revoked','expired') NOT NULL DEFAULT 'active',
	`usedAmount` int DEFAULT 0,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parcelTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `parcelTokens_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `smartQRs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchantId` int NOT NULL,
	`qrCode` text NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`maxInstallments` int DEFAULT 4,
	`allowedPaymentMethods` text,
	`cashbackPercentage` int DEFAULT 0,
	`discountPercentage` int DEFAULT 0,
	`status` enum('pending','paid','expired','cancelled') NOT NULL DEFAULT 'pending',
	`sessionId` varchar(128),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smartQRs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`merchantId` int NOT NULL,
	`parcelTokenId` int,
	`smartQRId` int,
	`amount` int NOT NULL,
	`feeAmount` int DEFAULT 0,
	`netAmount` int NOT NULL,
	`savingsAmount` int DEFAULT 0,
	`installments` int DEFAULT 1,
	`installmentAmount` int NOT NULL,
	`paymentMethod` enum('parceltoken','pix','card','other') NOT NULL,
	`paymentRail` varchar(50),
	`status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`settledAt` timestamp,
	`settlementMethod` varchar(50),
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBadges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` varchar(500),
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`viewed` boolean DEFAULT false,
	CONSTRAINT `userBadges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','merchant') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `creditLimit` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `availableCredit` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `totalSavings` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `level` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `users` ADD `points` int DEFAULT 0;