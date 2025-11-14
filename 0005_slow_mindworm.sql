CREATE TABLE `webhookLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`merchantId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`url` text NOT NULL,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`responseStatus` int,
	`errorMessage` text,
	`retryCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `merchants` ADD `webhookUrl` text;--> statement-breakpoint
ALTER TABLE `merchants` ADD `webhookSecret` varchar(128);