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
    "imei" INTEGER NOT NULL,

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
    "provider" TEXT NOT NULL,
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
INSERT INTO users (username, email, password) VALUES 
('admin', 'admin@example.com', 'admin123');

-- Password: user123
INSERT INTO users (username, email, password) VALUES 
('john_doe', 'john@example.com', 'user123');

-- Password: demo123
INSERT INTO users (username, email, password) VALUES 
('jane_smith', 'jane@example.com', 'demo123');

-- Password: test123
INSERT INTO users (username, email, password) VALUES 
('test_user', 'test@example.com', 'test123');

-- Optional: Insert some sample logs (for testing purposes)
INSERT INTO logs (username, action, method, ip) VALUES 
('admin', 'login', 'POST', '127.0.0.1'),
('john_doe', 'login', 'POST', '192.168.1.100'),
('admin', 'get_users', 'GET', '127.0.0.1'),
('jane_smith', 'login', 'POST', '10.0.0.1');
