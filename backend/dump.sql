-- Users table
DROP TABLE IF EXISTS "users";
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"permission" INTEGER NOT NULL,
	"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permision Types
-- 1 admin -- read/read-logs/write/create-users
-- 2 read/read-logs/write
-- 3 read/write
-- 4 read only


--Inventory table
DROP TABLE IF EXISTS "inventory";
CREATE TABLE IF NOT EXISTS "inventory" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "phone_number" INTEGER NOT NULL,
    "imei" INTEGER NOT NULL

);

--Phone Stock table
DROP TABLE IF EXISTS "stock";
CREATE TABLE IF NOT EXISTS "stock"(
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "imei", INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "provider" TEXT NOT NULL

);

--Phone Lines table
DROP TABLE IF EXISTS "lines";
CREATE TABLE IF NOT EXISTS "lines"(
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "line" INTEGER NOT NULL,
    "provider" TEXT NOT NULL
);



-- Logs table for auditing

DROP TABLE IF EXISTS "logs";
CREATE TABLE IF NOT EXISTS "logs" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "action" TEXT NOT NULL, --function called from front
    "method" TEXT NOT NULL, --server method called from back
    "ip" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);



-- Insert sample users (passwords are stored as plain text as per your authenticate function)
-- Password: admin123
INSERT INTO users (username, email, password, permission) VALUES 
('admin', 'admin@example.com', '$2y$10$Gf9SXYpcTOsZEPlrIscPyugax5/CFmYXohRek9ZA2Txo5kufFvM6S', 1);

-- Password: user123
INSERT INTO users (username, email, password, permission) VALUES 
('john_doe', 'john@example.com', '$2y$10$GaVcjDQiMS9HWd6CS9XvceQrA6JSq2mzm/P23miScRCvieEfVoYoW', 2);

-- Password: demo123
INSERT INTO users (username, email, password, permission) VALUES 
('jane_smith', 'jane@example.com', '$2y$10$uwArcm2Xe96LOOQNPllgNOg71MnmoGNxhsk6dRJz7FFbHYyYZOEdC', 3);

-- Password: test123
INSERT INTO users (username, email, password, permission) VALUES 
('test_user', 'test@example.com', '$2y$10$bVNePQ7d7EZObLsi2VkIgeOSJfh94llUgnSMY6X/rM7SuE6oJTI1O', 4);

-- Optional: Insert some sample logs (for testing purposes)
INSERT INTO logs (username, action, method, ip) VALUES 
('admin', 'login', 'POST', '127.0.0.1'),
('john_doe', 'login', 'POST', '192.168.1.100'),
('admin', 'get_users', 'GET', '127.0.0.1'),
('jane_smith', 'login', 'POST', '10.0.0.1');
