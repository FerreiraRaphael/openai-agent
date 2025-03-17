CREATE TABLE `trip_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer,
	`destination` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`tags` text NOT NULL,
	`days` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action
);
