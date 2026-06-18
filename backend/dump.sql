-- Users table
DROP TABLE IF EXISTS "users";
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"permission" INTEGER NOT NULL,
    "user_image" TEXT,
	"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Permision Types
-- 1 admin -- read/read-logs/write/create-users
-- 2 read/read-logs/write
-- 3 read/write
-- 4 read only


-- users_stock_phone pivot table
DROP TABLE IF EXISTS "subscriptions";
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "line" INTEGER NOT NULL,
    "imei" TEXT

);

-- stock table
DROP TABLE IF EXISTS "stock";
CREATE TABLE IF NOT EXISTS "stock"(
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "imei" TEXT,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "phone_image" TEXT

);

-- lines table
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
    "action" TEXT NOT NULL, -- function called from front
    "method" TEXT NOT NULL, -- server method called from back
    "ip" TEXT NOT NULL,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);



-- Insert sample users (passwords are stored as plain text as per your authenticate function)
-- Password: admin123
INSERT INTO users
(username, email, password, permission, user_image)
VALUES
('admin', 'admin@example.com', '$2y$10$Gf9SXYpcTOsZEPlrIscPyugax5/CFmYXohRek9ZA2Txo5kufFvM6S', 1, 'test_image_1.jpg'),

('john_doe', 'john@example.com', '$2y$10$GaVcjDQiMS9HWd6CS9XvceQrA6JSq2mzm/P23miScRCvieEfVoYoW', 2, 'test_image_2.jpg'),

('jane_smith', 'jane@example.com', '$2y$10$uwArcm2Xe96LOOQNPllgNOg71MnmoGNxhsk6dRJz7FFbHYyYZOEdC', 3, 'test_image_3.jpg'),

('test_user', 'test@example.com', '$2y$10$bVNePQ7d7EZObLsi2VkIgeOSJfh94llUgnSMY6X/rM7SuE6oJTI1O', 4, 'test_image_4.jpg');


-- Optional: Insert some sample logs (for testing purposes)
INSERT INTO logs (username, action, method, ip) VALUES 
('admin', 'login', 'POST', '127.0.0.1'),
('john_doe', 'login', 'POST', '192.168.1.100'),
('admin', 'get_users', 'GET', '127.0.0.1'),
('jane_smith', 'login', 'POST', '10.0.0.1');



-- Sample stock data
INSERT INTO stock
(imei, model, brand, provider, phone_image)
VALUES
('356789012345671', 'iPhone 14', 'Apple', 'Movistar', 'test_image_1.jpg'),

('356789012345672', 'Galaxy S23', 'Samsung', 'Personal', 'test_image_2.jpg'),

('356789012345673', 'Moto G84', 'Motorola', 'Claro', 'test_image_3.jpg');


-- Sample phone lines
INSERT INTO lines (line, provider) VALUES
(1150010001, 'Movistar'),
(1150010002, 'Personal'),
(1150010003, 'Claro');

-- Sample users_stock_phone assignments
INSERT INTO subscriptions (user_id, line, imei) VALUES
(1, 1150010001, '356789012345671'),
(2, 1150010002, '356789012345672'),
(3, 1150010003, '356789012345673');