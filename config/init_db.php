<?php
/**
 * Database Initialization Script
 * 
 * This script creates the necessary tables for the Gym Management System.
 * Run this script once to set up the database structure.
 */

require_once __DIR__ . '/database.php';

// Create database if it doesn't exist
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";

if ($conn->query($sql) === FALSE) {
    die("Error creating database: " . $conn->error);
}

$conn->close();

// Connect to the database
$conn = getDbConnection();

if (!$conn) {
    die("Connection to database failed");
}

// Create users table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'trainer', 'member') NOT NULL DEFAULT 'member',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    reset_token VARCHAR(100),
    reset_token_expires DATETIME,
    status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === FALSE) {
    die("Error creating users table: " . $conn->error);
}

// Create members table with additional member-specific information
$sql = "CREATE TABLE IF NOT EXISTS members (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) UNSIGNED NOT NULL,
    membership_type ENUM('basic', 'standard', 'premium') NOT NULL DEFAULT 'basic',
    membership_start_date DATE NOT NULL,
    membership_end_date DATE NOT NULL,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    health_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === FALSE) {
    die("Error creating members table: " . $conn->error);
}

// Create trainers table with additional trainer-specific information
$sql = "CREATE TABLE IF NOT EXISTS trainers (
    id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) UNSIGNED NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT(3) NOT NULL,
    certification TEXT,
    bio TEXT,
    working_hours TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === FALSE) {
    die("Error creating trainers table: " . $conn->error);
}

// Create a default admin user if none exists
$checkAdmin = "SELECT COUNT(*) as count FROM users WHERE role = 'admin'";
$result = $conn->query($checkAdmin);
$row = $result->fetch_assoc();

if ($row['count'] == 0) {
    // Create default admin user
    $username = 'admin';
    $email = 'admin@gym.com';
    $password = password_hash('Admin@123', PASSWORD_DEFAULT); // Default password: Admin@123
    $firstName = 'System';
    $lastName = 'Administrator';
    
    $sql = "INSERT INTO users (username, email, password, role, first_name, last_name, status) 
            VALUES ('$username', '$email', '$password', 'admin', '$firstName', '$lastName', 'active')";
    
    if ($conn->query($sql) === FALSE) {
        echo "Error creating default admin user: " . $conn->error . "<br>";
    } else {
        echo "Default admin user created successfully. Username: $username, Password: Admin@123<br>";
    }
}

echo "Database initialization completed successfully!";

$conn->close();
?>