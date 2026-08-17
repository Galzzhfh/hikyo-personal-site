CREATE TABLE `doujin_likes` (
	`post_id` text NOT NULL,
	`device_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`post_id`, `device_id`)
);
