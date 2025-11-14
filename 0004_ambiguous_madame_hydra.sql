CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionCompleted` boolean DEFAULT true,
	`installmentPaid` boolean DEFAULT true,
	`installmentDueSoon` boolean DEFAULT true,
	`installmentOverdue` boolean DEFAULT true,
	`tokenCreated` boolean DEFAULT true,
	`tokenApproved` boolean DEFAULT true,
	`creditLimitIncreased` boolean DEFAULT true,
	`webhookReceived` boolean DEFAULT true,
	`smartqrGenerated` boolean DEFAULT true,
	`newSale` boolean DEFAULT true,
	`paymentReceived` boolean DEFAULT true,
	`systemAnnouncement` boolean DEFAULT true,
	`emailEnabled` boolean DEFAULT true,
	`pushEnabled` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('transaction_completed','installment_paid','installment_due_soon','installment_overdue','token_created','token_approved','credit_limit_increased','webhook_received','smartqr_generated','new_sale','payment_received','system_announcement') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`actionUrl` varchar(500),
	`metadata` text,
	`read` boolean DEFAULT false,
	`readAt` timestamp,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
