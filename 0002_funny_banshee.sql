ALTER TABLE `installmentPlans` ADD `tokenId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `installmentPlans` ADD `totalInstallments` int NOT NULL;--> statement-breakpoint
ALTER TABLE `installmentPlans` ADD `paidAmount` int DEFAULT 0;