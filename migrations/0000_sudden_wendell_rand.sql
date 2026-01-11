CREATE TABLE `prompts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_input` text NOT NULL,
	`input_type` text NOT NULL,
	`refined_prompt` text NOT NULL,
	`confidence_score` real,
	`metadata` text,
	`created_at` integer
);
