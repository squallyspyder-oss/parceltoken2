CREATE TABLE `openFinanceConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemId` varchar(255) NOT NULL,
	`connectorId` varchar(255),
	`connectorName` varchar(255),
	`status` enum('connected','disconnected','error') NOT NULL DEFAULT 'connected',
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `openFinanceConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `openFinanceMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`averageIncome` int DEFAULT 0,
	`averageExpense` int DEFAULT 0,
	`totalBalance` int DEFAULT 0,
	`incomeStability` int DEFAULT 0,
	`cashFlowPositive` int DEFAULT 0,
	`cashFlowTrend` enum('increasing','stable','decreasing') DEFAULT 'stable',
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	`dataFrom` timestamp,
	`dataTo` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `openFinanceMetrics_id` PRIMARY KEY(`id`)
);
