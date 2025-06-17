-- Gym Management System SQL Import File
-- This file can be imported multiple times without causing errors

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `gym_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE `gym_management`;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'trainer', 'member') NOT NULL DEFAULT 'member',
    `fullname` VARCHAR(100) NOT NULL,  -- Changed from first/last name
    `phone` VARCHAR(20),
    `address` TEXT,
    `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create members table if it doesn't exist
CREATE TABLE IF NOT EXISTS `members` (
    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT(11) UNSIGNED NOT NULL,
    `membership_type` ENUM('basic', 'standard', 'premium') NOT NULL DEFAULT 'basic',
    `membership_start_date` DATE NOT NULL,
    `membership_end_date` DATE NOT NULL,
    `emergency_contact_name` VARCHAR(100),
    `emergency_contact_phone` VARCHAR(20),
    `health_conditions` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create trainers table if it doesn't exist
CREATE TABLE IF NOT EXISTS `trainers` (
    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT(11) UNSIGNED NOT NULL,
    `specialization` VARCHAR(100) NOT NULL,
    `experience_years` INT(3) NOT NULL,
    `certification` TEXT,
    `bio` TEXT,
    `working_hours` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user if it doesn't exist
-- First check if admin user exists
SET @admin_exists = (SELECT COUNT(*) FROM `users` WHERE `role` = 'admin');

-- Only insert if no admin exists
SET @default_admin_password = '$2y$10$8i5Eo8AYgAMAj.q.jUKKXO5JUKuTzYxBJJJBvp6E.uYHrOQgJ3IGy'; -- Hash for 'Admin@123'

INSERT INTO `users` (`username`, `email`, `password`, `role`, `first_name`, `last_name`, `status`)
SELECT 'admin', 'admin@gym.com', @default_admin_password, 'admin', 'System', 'Administrator', 'active'
WHERE @admin_exists = 0;

-- Add any additional tables or data below this line
-- For future extensions, follow the same pattern of using IF NOT EXISTS and conditional inserts

-- Example of how to add a new table in the future:
/*
CREATE TABLE IF NOT EXISTS `equipment` (
    `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `purchase_date` DATE,
    `maintenance_date` DATE,
    `status` ENUM('active', 'maintenance', 'retired') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

-- Example of how to add data to a table in the future:
/*
SET @item_exists = (SELECT COUNT(*) FROM `equipment` WHERE `name` = 'Treadmill Model X');

INSERT INTO `equipment` (`name`, `description`, `purchase_date`, `status`)
SELECT 'Treadmill Model X', 'Commercial grade treadmill', '2023-01-15', 'active'
WHERE @item_exists = 0;
*/