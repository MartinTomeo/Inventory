-- Users table
DROP TABLE IF EXISTS "users";
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"role" INTEGER NOT NULL,
    "user_image" TEXT,
	"created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Permision Types
-- 1 admin -- full permision
-- 2 aduit -- full permision except users
-- 3 editor -- suscribe, stock.


-- users_stock pivot table
DROP TABLE IF EXISTS "subscriptions";
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "stock_id" INTEGER NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("stock_id") REFERENCES "stock" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_stock ON subscriptions(user_id, stock_id);

-- stock table
DROP TABLE IF EXISTS "stock";
CREATE TABLE IF NOT EXISTS "stock"(
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "imei" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "ph_provider" TEXT NOT NULL,
    "phone_image" TEXT,
    "line" INTEGER NOT NULL,
    "line_provider" TEXT NOT NULL

);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_imei ON stock(imei);

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


-- ============================================
-- 1. USUARIOS (50 usuarios con 3 niveles de permiso)
-- ============================================

INSERT INTO users (username, email, password, role, user_image) VALUES
-- Administradores (role 1) - full permision
('admin', 'admin@example.com', '$2y$10$Gf9SXYpcTOsZEPlrIscPyugax5/CFmYXohRek9ZA2Txo5kufFvM6S', 1, NULL),
('ana_martinez', 'ana@example.com', '$2y$10$XxYyZz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJ', 1, NULL),
('carlos_ruiz', 'carlos.ruiz@example.com', '$2y$10$YyZz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJK', 1, NULL),
('marta_fernandez', 'marta@example.com', '$2y$10$Zz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL', 1, NULL),
('javier_moreno', 'javier@example.com', '$2y$10$0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM', 1, NULL),

-- Nivel 2 (role 2) - full permision except users (audit)
('john_doe', 'john@example.com', '$2y$10$GaVcjDQiMS9HWd6CS9XvceQrA6JSq2mzm/P23miScRCvieEfVoYoW', 2, NULL),
('mario_garcia', 'mario@example.com', '$2y$10$123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN', 2, NULL),
('pedro_lopez', 'pedro@example.com', '$2y$10$23456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNO', 2, NULL),
('isabel_ramirez', 'isabel@example.com', '$2y$10$3456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP', 2, NULL),
('fernando_diaz', 'fernando@example.com', '$2y$10$456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ', 2, NULL),
('laura_gomez', 'laura@example.com', '$2y$10$56789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQR', 2, NULL),
('ricardo_santos', 'ricardo@example.com', '$2y$10$6789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRS', 2, NULL),
('patricia_reyes', 'patricia@example.com', '$2y$10$789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST', 2, NULL),
('andres_herrera', 'andres@example.com', '$2y$10$89abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU', 2, NULL),
('monica_castro', 'monica@example.com', '$2y$10$9abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV', 2, NULL),

-- Nivel 3 (role 3) - suscribe, stock (editor)
('jane_smith', 'jane@example.com', '$2y$10$uwArcm2Xe96LOOQNPllgNOg71MnmoGNxhsk6dRJz7FFbHYyYZOEdC', 3, NULL),
('lucia_fernandez', 'lucia@example.com', '$2y$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 3, NULL),
('maria_sanchez', 'maria@example.com', '$2y$10$bcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY', 3, NULL),
('jose_luis', 'joseluis@example.com', '$2y$10$cdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 3, NULL),
('carmen_martin', 'carmen@example.com', '$2y$10$defghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZA', 3, NULL),
('david_garcia', 'david@example.com', '$2y$10$efghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZAB', 3, NULL),
('sandra_mora', 'sandra@example.com', '$2y$10$fghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABC', 3, NULL),
('roberto_vega', 'roberto@example.com', '$2y$10$ghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCD', 3, NULL),
('teresa_romo', 'teresa@example.com', '$2y$10$hijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDE', 3, NULL),
('jorge_navarro', 'jorge@example.com', '$2y$10$ijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEF', 3, NULL),
('elena_ortiz', 'elena@example.com', '$2y$10$jklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFG', 3, NULL),
('francisco_moya', 'francisco@example.com', '$2y$10$klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGH', 3, NULL),
('angela_vargas', 'angela@example.com', '$2y$10$lmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHI', 3, NULL),
('antonio_jimenez', 'antonio@example.com', '$2y$10$mnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJ', 3, NULL),
('silvia_guerra', 'silvia@example.com', '$2y$10$nopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK', 3, NULL),
('test_user', 'test@example.com', '$2y$10$bVNePQ7d7EZObLsi2VkIgeOSJfh94llUgnSMY6X/rM7SuE6oJTI1O', 3, NULL),
('carlos_rodriguez', 'carlos@example.com', '$2y$10$opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKL', 3, NULL),
('jose_gonzalez', 'jose@example.com', '$2y$10$pqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLM', 3, NULL),
('gloria_pena', 'gloria@example.com', '$2y$10$qrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMN', 3, NULL),
('hector_rey', 'hector@example.com', '$2y$10$rstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO', 3, NULL),
('irene_soto', 'irene@example.com', '$2y$10$stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOP', 3, NULL),
('karla_mendez', 'karla@example.com', '$2y$10$tuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQ', 3, NULL),
('luis_espinoza', 'luis@example.com', '$2y$10$uvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQR', 3, NULL),
('noelia_arias', 'noelia@example.com', '$2y$10$vwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRS', 3, NULL),
('oscar_cordero', 'oscar@example.com', '$2y$10$wxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRST', 3, NULL),
('paula_fuentes', 'paula@example.com', '$2y$10$xyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTU', 3, NULL),
('raquel_campos', 'raquel@example.com', '$2y$10$yzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUV', 3, NULL),
('sergio_molina', 'sergio@example.com', '$2y$10$zABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVW', 3, NULL),
('tania_oviedo', 'tania@example.com', '$2y$10$ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWX', 3, NULL),
('ulises_salazar', 'ulises@example.com', '$2y$10$BCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXY', 3, NULL),
('valeria_rios', 'valeria@example.com', '$2y$10$CDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ', 3, NULL),
('walter_cruz', 'walter@example.com', '$2y$10$DEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZA', 3, NULL),
('ximena_mora', 'ximena@example.com', '$2y$10$EFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZAB', 3, NULL),
('yolanda_meza', 'yolanda@example.com', '$2y$10$FGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABC', 3, NULL),
('zoe_fernandez', 'zoe@example.com', '$2y$10$GHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCD', 3, NULL);


-- ============================================
-- 3. STOCK (100 teléfonos)
-- ============================================
INSERT INTO stock (imei, model, brand, ph_provider, phone_image, line, line_provider) VALUES
-- Apple (25 teléfonos)
('356789012345671', 'iPhone 14', 'Apple', 'Movistar', NULL, '1153000001', 'Movistar'),
('356789012345672', 'iPhone 14', 'Apple', 'Personal', NULL, '1133000001', 'Personal'),
('356789012345673', 'iPhone 14', 'Apple', 'Claro', NULL, '1161000001', 'Claro'),
('356789012345674', 'iPhone 14 Pro', 'Apple', 'Movistar', NULL, '1153000002', 'Movistar'),
('356789012345675', 'iPhone 14 Pro', 'Apple', 'Personal', NULL, '1133000002', 'Personal'),
('356789012345676', 'iPhone 14 Pro', 'Apple', 'Claro', NULL, '1161000002', 'Claro'),
('356789012345677', 'iPhone 14 Pro Max', 'Apple', 'Movistar', NULL, '1153000003', 'Movistar'),
('356789012345678', 'iPhone 14 Pro Max', 'Apple', 'Personal', NULL, '1133000003', 'Personal'),
('356789012345679', 'iPhone 14 Pro Max', 'Apple', 'Claro', NULL, '1161000003', 'Claro'),
('356789012345680', 'iPhone 15', 'Apple', 'Movistar', NULL, '1153000004', 'Movistar'),
('356789012345681', 'iPhone 15', 'Apple', 'Personal', NULL, '1133000004', 'Personal'),
('356789012345682', 'iPhone 15', 'Apple', 'Claro', NULL, '1161000004', 'Claro'),
('356789012345683', 'iPhone 15 Plus', 'Apple', 'Movistar', NULL, '1153000005', 'Movistar'),
('356789012345684', 'iPhone 15 Plus', 'Apple', 'Personal', NULL, '1133000005', 'Personal'),
('356789012345685', 'iPhone 15 Plus', 'Apple', 'Claro', NULL, '1161000005', 'Claro'),
('356789012345686', 'iPhone 15 Pro', 'Apple', 'Movistar', NULL, '1153000006', 'Movistar'),
('356789012345687', 'iPhone 15 Pro', 'Apple', 'Personal', NULL, '1133000006', 'Personal'),
('356789012345688', 'iPhone 15 Pro', 'Apple', 'Claro', NULL, '1161000006', 'Claro'),
('356789012345689', 'iPhone 15 Pro Max', 'Apple', 'Movistar', NULL, '1153000007', 'Movistar'),
('356789012345690', 'iPhone 15 Pro Max', 'Apple', 'Personal', NULL, '1133000007', 'Personal'),
('356789012345691', 'iPhone 15 Pro Max', 'Apple', 'Claro', NULL, '1161000007', 'Claro'),
('356789012345692', 'iPhone 13', 'Apple', 'Movistar', NULL, '1153000008', 'Movistar'),
('356789012345693', 'iPhone 13', 'Apple', 'Personal', NULL, '1133000008', 'Personal'),
('356789012345694', 'iPhone 13', 'Apple', 'Claro', NULL, '1161000008', 'Claro'),
('356789012345695', 'iPhone SE', 'Apple', 'Movistar', NULL, '1153000009', 'Movistar'),

 -- Samsung (30 teléfonos)
('356789012345696', 'Galaxy S23', 'Samsung', 'Movistar', NULL, '1153000010', 'Movistar'),
('356789012345697', 'Galaxy S23', 'Samsung', 'Personal', NULL, '1133000009', 'Personal'),
('356789012345698', 'Galaxy S23', 'Samsung', 'Claro', NULL, '1161000009', 'Claro'),
('356789012345699', 'Galaxy S23 Plus', 'Samsung', 'Movistar', NULL, '1153000011', 'Movistar'),
('356789012345700', 'Galaxy S23 Plus', 'Samsung', 'Personal', NULL, '1133000010', 'Personal'),
('356789012345701', 'Galaxy S23 Plus', 'Samsung', 'Claro', NULL, '1161000010', 'Claro'),
('356789012345702', 'Galaxy S23 Ultra', 'Samsung', 'Movistar', NULL, '1153000012', 'Movistar'),
('356789012345703', 'Galaxy S23 Ultra', 'Samsung', 'Personal', NULL, '1133000011', 'Personal'),
('356789012345704', 'Galaxy S23 Ultra', 'Samsung', 'Claro', NULL, '1161000011', 'Claro'),
('356789012345705', 'Galaxy S24', 'Samsung', 'Movistar', NULL, '1153000013', 'Movistar'),
('356789012345706', 'Galaxy S24', 'Samsung', 'Personal', NULL, '1133000012', 'Personal'),
('356789012345707', 'Galaxy S24', 'Samsung', 'Claro', NULL, '1161000012', 'Claro'),
('356789012345708', 'Galaxy S24 Plus', 'Samsung', 'Movistar', NULL, '1153000014', 'Movistar'),
('356789012345709', 'Galaxy S24 Plus', 'Samsung', 'Personal', NULL, '1133000013', 'Personal'),
('356789012345710', 'Galaxy S24 Plus', 'Samsung', 'Claro', NULL, '1161000013', 'Claro'),
('356789012345711', 'Galaxy S24 Ultra', 'Samsung', 'Movistar', NULL, '1153000015', 'Movistar'),
('356789012345712', 'Galaxy S24 Ultra', 'Samsung', 'Personal', NULL, '1133000014', 'Personal'),
('356789012345713', 'Galaxy S24 Ultra', 'Samsung', 'Claro', NULL, '1161000014', 'Claro'),
('356789012345714', 'Galaxy Z Fold 5', 'Samsung', 'Movistar', NULL, '1153000016', 'Movistar'),
('356789012345715', 'Galaxy Z Fold 5', 'Samsung', 'Personal', NULL, '1133000015', 'Personal'),
('356789012345716', 'Galaxy Z Fold 5', 'Samsung', 'Claro', NULL, '1161000015', 'Claro'),
('356789012345717', 'Galaxy Z Flip 5', 'Samsung', 'Movistar', NULL, '1153000017', 'Movistar'),
('356789012345718', 'Galaxy Z Flip 5', 'Samsung', 'Personal', NULL, '1133000016', 'Personal'),
('356789012345719', 'Galaxy Z Flip 5', 'Samsung', 'Claro', NULL, '1161000016', 'Claro'),
('356789012345720', 'Galaxy A54', 'Samsung', 'Movistar', NULL, '1153000018', 'Movistar'),
('356789012345721', 'Galaxy A54', 'Samsung', 'Personal', NULL, '1133000017', 'Personal'),
('356789012345722', 'Galaxy A54', 'Samsung', 'Claro', NULL, '1161000017', 'Claro'),
('356789012345723', 'Galaxy A34', 'Samsung', 'Movistar', NULL, '1153000019', 'Movistar'),
('356789012345724', 'Galaxy A34', 'Samsung', 'Personal', NULL, '1133000018', 'Personal'),
('356789012345725', 'Galaxy A34', 'Samsung', 'Claro', NULL, '1161000018', 'Claro'),

 -- Motorola (15 teléfonos)
('356789012345726', 'Moto G84', 'Motorola', 'Movistar', NULL, '1153000020', 'Movistar'),
('356789012345727', 'Moto G84', 'Motorola', 'Personal', NULL, '1133000019', 'Personal'),
('356789012345728', 'Moto G84', 'Motorola', 'Claro', NULL, '1161000019', 'Claro'),
('356789012345729', 'Moto G Power 5G', 'Motorola', 'Movistar', NULL, '1153000021', 'Movistar'),
('356789012345730', 'Moto G Power 5G', 'Motorola', 'Personal', NULL, '1133000020', 'Personal'),
('356789012345731', 'Moto G Power 5G', 'Motorola', 'Claro', NULL, '1161000020', 'Claro'),
('356789012345732', 'Moto Edge 40', 'Motorola', 'Movistar', NULL, '1153000022', 'Movistar'),
('356789012345733', 'Moto Edge 40', 'Motorola', 'Personal', NULL, '1133000021', 'Personal'),
('356789012345734', 'Moto Edge 40', 'Motorola', 'Claro', NULL, '1161000021', 'Claro'),
('356789012345735', 'Moto Edge 40 Pro', 'Motorola', 'Movistar', NULL, '1153000023', 'Movistar'),
('356789012345736', 'Moto Edge 40 Pro', 'Motorola', 'Personal', NULL, '1133000022', 'Personal'),
('356789012345737', 'Moto Edge 40 Pro', 'Motorola', 'Claro', NULL, '1161000022', 'Claro'),
('356789012345738', 'Moto G73', 'Motorola', 'Movistar', NULL, '1153000024', 'Movistar'),
('356789012345739', 'Moto G73', 'Motorola', 'Personal', NULL, '1133000023', 'Personal'),
('356789012345740', 'Moto G73', 'Motorola', 'Claro', NULL, '1161000023', 'Claro'),

 -- Google Pixel (10 teléfonos)
('356789012345741', 'Pixel 7', 'Google', 'Movistar', NULL, '1153000025', 'Movistar'),
('356789012345742', 'Pixel 7', 'Google', 'Personal', NULL, '1133000024', 'Personal'),
('356789012345743', 'Pixel 7', 'Google', 'Claro', NULL, '1161000024', 'Claro'),
('356789012345744', 'Pixel 7 Pro', 'Google', 'Movistar', NULL, '1153000026', 'Movistar'),
('356789012345745', 'Pixel 7 Pro', 'Google', 'Personal', NULL, '1133000025', 'Personal'),
('356789012345746', 'Pixel 7 Pro', 'Google', 'Claro', NULL, '1161000025', 'Claro'),
('356789012345747', 'Pixel 8', 'Google', 'Movistar', NULL, '1153000027', 'Movistar'),
('356789012345748', 'Pixel 8', 'Google', 'Personal', NULL, '1133000026', 'Personal'),
('356789012345749', 'Pixel 8', 'Google', 'Claro', NULL, '1161000026', 'Claro'),
('356789012345750', 'Pixel 8 Pro', 'Google', 'Movistar', NULL, '1153000028', 'Movistar'),

 -- Xiaomi (10 teléfonos)
('356789012345751', 'Xiaomi 13', 'Xiaomi', 'Personal', NULL, '1153000029', 'Movistar'),
('356789012345752', 'Xiaomi 13', 'Xiaomi', 'Claro', NULL, '1161000027', 'Claro'),
('356789012345753', 'Xiaomi 13 Pro', 'Xiaomi', 'Movistar', NULL, '1153000030', 'Movistar'),
('356789012345754', 'Xiaomi 13 Pro', 'Xiaomi', 'Personal', NULL, '1133000027', 'Personal'),
('356789012345755', 'Xiaomi 13 Pro', 'Xiaomi', 'Claro', NULL, '1133000028', 'Personal'),
('356789012345756', 'Redmi Note 12', 'Xiaomi', 'Movistar', NULL, '1153000031', 'Movistar'),
('356789012345757', 'Redmi Note 12', 'Xiaomi', 'Personal', NULL, '1161000028', 'Claro'),
('356789012345758', 'Redmi Note 12', 'Xiaomi', 'Claro', NULL, '1153000032', 'Movistar'),
('356789012345759', 'Xiaomi 13T', 'Xiaomi', 'Movistar', NULL, '1133000029', 'Personal'),
('356789012345760', 'Xiaomi 13T', 'Xiaomi', 'Personal', NULL, '1133000030', 'Personal'),

 -- Sony (5 teléfonos)
('356789012345761', 'Xperia 1 V', 'Sony', 'Movistar', NULL, '1153000033', 'Movistar'),
('356789012345762', 'Xperia 1 V', 'Sony', 'Personal', NULL, '1133000031', 'Personal'),
('356789012345763', 'Xperia 1 V', 'Sony', 'Claro', NULL, '1161000029', 'Claro'),
('356789012345764', 'Xperia 5 V', 'Sony', 'Movistar', NULL, '1161000030', 'Claro'),
('356789012345765', 'Xperia 5 V', 'Sony', 'Personal', NULL, '1153000034', 'Movistar'),

 -- OnePlus (5 teléfonos)
('356789012345766', 'OnePlus 12', 'OnePlus', 'Movistar', NULL, '1153000035', 'Movistar'),
('356789012345767', 'OnePlus 12', 'OnePlus', 'Personal', NULL, '1133000032', 'Personal'),
('356789012345768', 'OnePlus 12', 'OnePlus', 'Claro', NULL, '1161000031', 'Claro'),
('356789012345769', 'OnePlus 11', 'OnePlus', 'Movistar', NULL, '1161000032', 'Claro'),
('356789012345770', 'OnePlus 11', 'OnePlus', 'Personal', NULL, '1153000036', 'Movistar');

-- ============================================
-- 4. SUSCRIPCIONES (TABLA PIVOT) - 100 asignaciones
-- ============================================
INSERT INTO subscriptions (user_id, stock_id) VALUES
-- Admin (ID: 1) - 5 teléfonos
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),

-- Ana Martínez (ID: 8) - 5 teléfonos
(8, 6),
(8, 7),
(8, 8),
(8, 9),
(8, 10),

-- Carlos Ruiz (ID: 3) - 4 teléfonos
(3, 11),
(3, 12),
(3, 13),
(3, 14),

-- Marta Fernández (ID: 4) - 4 teléfonos
(4, 15),
(4, 16),
(4, 17),
(4, 18),

-- Javier Moreno (ID: 5) - 4 teléfonos
(5, 19),
(5, 20),
(5, 21),
(5, 22),

-- John Doe (ID: 2) - 5 teléfonos
(2, 23),
(2, 24),
(2, 25),
(2, 26),
(2, 27),

-- Mario García (ID: 6) - 4 teléfonos
(6, 28),
(6, 29),
(6, 30),
(6, 31),

-- Pedro López (ID: 7) - 4 teléfonos
(7, 32),
(7, 33),
(7, 34),
(7, 35),

-- Jane Smith (ID: 9) - 5 teléfonos
(9, 36),
(9, 37),
(9, 38),
(9, 39),
(9, 40),

-- Lucía Fernández (ID: 10) - 4 teléfonos
(10, 41),
(10, 42),
(10, 43),
(10, 44),

-- María Sánchez (ID: 11) - 4 teléfonos
(11, 45),
(11, 46),
(11, 47),
(11, 48),

-- José Luis (ID: 12) - 3 teléfonos
(12, 49),
(12, 50),
(12, 51),

-- Carmen Martín (ID: 13) - 3 teléfonos
(13, 52),
(13, 53),
(13, 54),

-- David García (ID: 14) - 3 teléfonos
(14, 55),
(14, 56),
(14, 57),

-- Sandra Mora (ID: 15) - 3 teléfonos
(15, 58),
(15, 59),
(15, 60),

-- Roberto Vega (ID: 16) - 3 teléfonos
(16, 61),
(16, 62),
(16, 63),

-- Teresa Romo (ID: 17) - 3 teléfonos
(17, 64),
(17, 65),
(17, 66),

-- Jorge Navarro (ID: 18) - 3 teléfonos
(18, 67),
(18, 68),
(18, 69),

-- Elena Ortiz (ID: 19) - 3 teléfonos
(19, 70),
(19, 71),
(19, 72),

-- Francisco Moya (ID: 20) - 3 teléfonos
(20, 73),
(20, 74),
(20, 75),

-- Ángela Vargas (ID: 21) - 2 teléfonos
(21, 76),
(21, 77),

-- Antonio Jiménez (ID: 22) - 2 teléfonos
(22, 78),
(22, 79),

-- Silvia Guerra (ID: 23) - 2 teléfonos
(23, 80),
(23, 81),

-- Test User (ID: 24) - 3 teléfonos
(24, 82),
(24, 83),
(24, 84),

-- Carlos Rodríguez (ID: 25) - 2 teléfonos
(25, 85),
(25, 86),

-- José González (ID: 26) - 2 teléfonos
(26, 87),
(26, 88),

-- Gloria Peña (ID: 27) - 2 teléfonos
(27, 89),
(27, 90),

-- Héctor Rey (ID: 28) - 2 teléfonos
(28, 91),
(28, 92),

-- Irene Soto (ID: 29) - 2 teléfonos
(29, 93),
(29, 94),

-- Karla Méndez (ID: 30) - 2 teléfonos
(30, 95),
(30, 96),

-- Luis Espinoza (ID: 31) - 2 teléfonos
(31, 97),
(31, 98),

-- Noelia Arias (ID: 32) - 2 teléfonos
(32, 99),
(32, 100);

-- ============================================
-- 5. LOGS DE AUDITORÍA (200+ registros)
-- ============================================
INSERT INTO logs (username, action, method, ip) VALUES 
-- Logs de admin (ID: 1)
('admin', 'login', 'POST', '127.0.0.1'),
('admin', 'get_users', 'GET', '127.0.0.1'),
('admin', 'create_user', 'POST', '127.0.0.1'),
('admin', 'update_user', 'PUT', '127.0.0.1'),
('admin', 'delete_user', 'DELETE', '127.0.0.1'),
('admin', 'get_stock', 'GET', '127.0.0.1'),
('admin', 'create_stock', 'POST', '127.0.0.1'),
('admin', 'update_stock', 'PUT', '127.0.0.1'),
('admin', 'delete_stock', 'DELETE', '127.0.0.1'),
('admin', 'get_subscriptions', 'GET', '127.0.0.1'),
('admin', 'create_subscription', 'POST', '127.0.0.1'),
('admin', 'update_subscription', 'PUT', '127.0.0.1'),
('admin', 'delete_subscription', 'DELETE', '127.0.0.1'),
('admin', 'get_logs', 'GET', '127.0.0.1'),
('admin', 'logout', 'POST', '127.0.0.1'),

-- Ana Martínez (ID: 8)
('ana_martinez', 'login', 'POST', '192.168.1.10'),
('ana_martinez', 'get_users', 'GET', '192.168.1.10'),
('ana_martinez', 'create_user', 'POST', '192.168.1.10'),
('ana_martinez', 'get_stock', 'GET', '192.168.1.10'),
('ana_martinez', 'update_stock', 'PUT', '192.168.1.10'),
('ana_martinez', 'logout', 'POST', '192.168.1.10'),

-- John Doe (ID: 2)
('john_doe', 'login', 'POST', '192.168.1.100'),
('john_doe', 'get_stock', 'GET', '192.168.1.100'),
('john_doe', 'get_subscriptions', 'GET', '192.168.1.100'),
('john_doe', 'create_subscription', 'POST', '192.168.1.100'),
('john_doe', 'update_subscription', 'PUT', '192.168.1.100'),
('john_doe', 'get_users', 'GET', '192.168.1.100'),
('john_doe', 'logout', 'POST', '192.168.1.100'),

-- Jane Smith (ID: 9)
('jane_smith', 'login', 'POST', '10.0.0.1'),
('jane_smith', 'get_stock', 'GET', '10.0.0.1'),
('jane_smith', 'create_subscription', 'POST', '10.0.0.1'),
('jane_smith', 'update_subscription', 'PUT', '10.0.0.1'),
('jane_smith', 'logout', 'POST', '10.0.0.1'),

-- Mario García (ID: 6)
('mario_garcia', 'login', 'POST', '192.168.1.101'),
('mario_garcia', 'get_stock', 'GET', '192.168.1.101'),
('mario_garcia', 'get_subscriptions', 'GET', '192.168.1.101'),
('mario_garcia', 'update_subscription', 'PUT', '192.168.1.101'),
('mario_garcia', 'logout', 'POST', '192.168.1.101'),

-- Pedro López (ID: 7)
('pedro_lopez', 'login', 'POST', '192.168.1.102'),
('pedro_lopez', 'get_stock', 'GET', '192.168.1.102'),
('pedro_lopez', 'create_subscription', 'POST', '192.168.1.102'),
('pedro_lopez', 'logout', 'POST', '192.168.1.102'),

-- Lucía Fernández (ID: 10)
('lucia_fernandez', 'login', 'POST', '10.0.0.2'),
('lucia_fernandez', 'get_stock', 'GET', '10.0.0.2'),
('lucia_fernandez', 'get_subscriptions', 'GET', '10.0.0.2'),
('lucia_fernandez', 'logout', 'POST', '10.0.0.2'),

-- María Sánchez (ID: 11)
('maria_sanchez', 'login', 'POST', '192.168.1.103'),
('maria_sanchez', 'get_stock', 'GET', '192.168.1.103'),
('maria_sanchez', 'update_subscription', 'PUT', '192.168.1.103'),
('maria_sanchez', 'logout', 'POST', '192.168.1.103'),

-- José Luis (ID: 12)
('jose_luis', 'login', 'POST', '10.0.0.3'),
('jose_luis', 'get_stock', 'GET', '10.0.0.3'),
('jose_luis', 'get_subscriptions', 'GET', '10.0.0.3'),
('jose_luis', 'logout', 'POST', '10.0.0.3'),

-- Carlos Ruiz (ID: 3)
('carlos_ruiz', 'login', 'POST', '192.168.1.104'),
('carlos_ruiz', 'get_users', 'GET', '192.168.1.104'),
('carlos_ruiz', 'get_stock', 'GET', '192.168.1.104'),
('carlos_ruiz', 'create_user', 'POST', '192.168.1.104'),
('carlos_ruiz', 'logout', 'POST', '192.168.1.104'),

-- Marta Fernández (ID: 4)
('marta_fernandez', 'login', 'POST', '10.0.0.4'),
('marta_fernandez', 'get_stock', 'GET', '10.0.0.4'),
('marta_fernandez', 'get_subscriptions', 'GET', '10.0.0.4'),
('marta_fernandez', 'logout', 'POST', '10.0.0.4'),

-- Javier Moreno (ID: 5)
('javier_moreno', 'login', 'POST', '192.168.1.105'),
('javier_moreno', 'get_users', 'GET', '192.168.1.105'),
('javier_moreno', 'update_user', 'PUT', '192.168.1.105'),
('javier_moreno', 'logout', 'POST', '192.168.1.105'),

-- Carmen Martín (ID: 13)
('carmen_martin', 'login', 'POST', '10.0.0.5'),
('carmen_martin', 'get_stock', 'GET', '10.0.0.5'),
('carmen_martin', 'create_subscription', 'POST', '10.0.0.5'),
('carmen_martin', 'logout', 'POST', '10.0.0.5'),

-- David García (ID: 14)
('david_garcia', 'login', 'POST', '192.168.1.106'),
('david_garcia', 'get_stock', 'GET', '192.168.1.106'),
('david_garcia', 'update_subscription', 'PUT', '192.168.1.106'),
('david_garcia', 'logout', 'POST', '192.168.1.106'),

-- Sandra Mora (ID: 15)
('sandra_mora', 'login', 'POST', '10.0.0.6'),
('sandra_mora', 'get_subscriptions', 'GET', '10.0.0.6'),
('sandra_mora', 'logout', 'POST', '10.0.0.6'),

-- Roberto Vega (ID: 16)
('roberto_vega', 'login', 'POST', '192.168.1.107'),
('roberto_vega', 'get_stock', 'GET', '192.168.1.107'),
('roberto_vega', 'logout', 'POST', '192.168.1.107'),

-- Test User (ID: 24)
('test_user', 'login', 'POST', '10.0.0.7'),
('test_user', 'get_stock', 'GET', '10.0.0.7'),
('test_user', 'get_subscriptions', 'GET', '10.0.0.7'),
('test_user', 'logout', 'POST', '10.0.0.7'),

-- Carlos Rodríguez (ID: 25)
('carlos_rodriguez', 'login', 'POST', '192.168.1.108'),
('carlos_rodriguez', 'get_stock', 'GET', '192.168.1.108'),
('carlos_rodriguez', 'logout', 'POST', '192.168.1.108'),

-- José González (ID: 26)
('jose_gonzalez', 'login', 'POST', '10.0.0.8'),
('jose_gonzalez', 'get_subscriptions', 'GET', '10.0.0.8'),
('jose_gonzalez', 'logout', 'POST', '10.0.0.8'),

-- Fernando Díaz (ID: 44)
('fernando_diaz', 'login', 'POST', '192.168.1.109'),
('fernando_diaz', 'get_stock', 'GET', '192.168.1.109'),
('fernando_diaz', 'create_subscription', 'POST', '192.168.1.109'),
('fernando_diaz', 'logout', 'POST', '192.168.1.109'),

-- Laura Gómez (ID: 45)
('laura_gomez', 'login', 'POST', '10.0.0.9'),
('laura_gomez', 'get_stock', 'GET', '10.0.0.9'),
('laura_gomez', 'logout', 'POST', '10.0.0.9'),

-- Ricardo Santos (ID: 46)
('ricardo_santos', 'login', 'POST', '192.168.1.110'),
('ricardo_santos', 'get_subscriptions', 'GET', '192.168.1.110'),
('ricardo_santos', 'update_subscription', 'PUT', '192.168.1.110'),
('ricardo_santos', 'logout', 'POST', '192.168.1.110'),

-- Múltiples accesos de admin (más logs)
('admin', 'login', 'POST', '192.168.1.200'),
('admin', 'get_users', 'GET', '192.168.1.200'),
('admin', 'get_stock', 'GET', '192.168.1.200'),
('admin', 'get_subscriptions', 'GET', '192.168.1.200'),
('admin', 'create_user', 'POST', '192.168.1.200'),
('admin', 'create_stock', 'POST', '192.168.1.200'),
('admin', 'create_subscription', 'POST', '192.168.1.200'),
('admin', 'update_user', 'PUT', '192.168.1.200'),
('admin', 'update_stock', 'PUT', '192.168.1.200'),
('admin', 'update_subscription', 'PUT', '192.168.1.200'),
('admin', 'delete_user', 'DELETE', '192.168.1.200'),
('admin', 'get_logs', 'GET', '192.168.1.200'),
('admin', 'logout', 'POST', '192.168.1.200'),

-- John Doe accesos repetidos
('john_doe', 'login', 'POST', '192.168.1.101'),
('john_doe', 'get_stock', 'GET', '192.168.1.101'),
('john_doe', 'get_subscriptions', 'GET', '192.168.1.101'),
('john_doe', 'logout', 'POST', '192.168.1.101'),
('john_doe', 'login', 'POST', '192.168.1.102'),
('john_doe', 'get_stock', 'GET', '192.168.1.102'),
('john_doe', 'logout', 'POST', '192.168.1.102'),

-- Jane Smith accesos repetidos
('jane_smith', 'login', 'POST', '10.0.0.10'),
('jane_smith', 'get_stock', 'GET', '10.0.0.10'),
('jane_smith', 'create_subscription', 'POST', '10.0.0.10'),
('jane_smith', 'logout', 'POST', '10.0.0.10'),
('jane_smith', 'login', 'POST', '10.0.0.11'),
('jane_smith', 'get_subscriptions', 'GET', '10.0.0.11'),
('jane_smith', 'logout', 'POST', '10.0.0.11'),

-- Ana Martínez accesos repetidos
('ana_martinez', 'login', 'POST', '192.168.1.11'),
('ana_martinez', 'get_users', 'GET', '192.168.1.11'),
('ana_martinez', 'update_user', 'PUT', '192.168.1.11'),
('ana_martinez', 'logout', 'POST', '192.168.1.11'),
('ana_martinez', 'login', 'POST', '192.168.1.12'),
('ana_martinez', 'get_stock', 'GET', '192.168.1.12'),
('ana_martinez', 'logout', 'POST', '192.168.1.12'),

-- Mario García accesos repetidos
('mario_garcia', 'login', 'POST', '192.168.1.200'),
('mario_garcia', 'get_stock', 'GET', '192.168.1.200'),
('mario_garcia', 'get_subscriptions', 'GET', '192.168.1.200'),
('mario_garcia', 'logout', 'POST', '192.168.1.200'),
('mario_garcia', 'login', 'POST', '192.168.1.201'),
('mario_garcia', 'update_subscription', 'PUT', '192.168.1.201'),
('mario_garcia', 'logout', 'POST', '192.168.1.201'),

-- Carlos Ruiz accesos repetidos
('carlos_ruiz', 'login', 'POST', '192.168.1.300'),
('carlos_ruiz', 'get_users', 'GET', '192.168.1.300'),
('carlos_ruiz', 'create_user', 'POST', '192.168.1.300'),
('carlos_ruiz', 'logout', 'POST', '192.168.1.300'),
('carlos_ruiz', 'login', 'POST', '192.168.1.301'),
('carlos_ruiz', 'get_stock', 'GET', '192.168.1.301'),
('carlos_ruiz', 'logout', 'POST', '192.168.1.301'),

-- Más logs variados
('test_user', 'login', 'POST', '10.0.0.100'),
('test_user', 'get_stock', 'GET', '10.0.0.100'),
('test_user', 'logout', 'POST', '10.0.0.100'),
('carlos_rodriguez', 'login', 'POST', '192.168.1.400'),
('carlos_rodriguez', 'get_subscriptions', 'GET', '192.168.1.400'),
('carlos_rodriguez', 'logout', 'POST', '192.168.1.400'),
('jose_gonzalez', 'login', 'POST', '10.0.0.101'),
('jose_gonzalez', 'get_stock', 'GET', '10.0.0.101'),
('jose_gonzalez', 'logout', 'POST', '10.0.0.101'),
('lucia_fernandez', 'login', 'POST', '10.0.0.102'),
('lucia_fernandez', 'get_subscriptions', 'GET', '10.0.0.102'),
('lucia_fernandez', 'update_subscription', 'PUT', '10.0.0.102'),
('lucia_fernandez', 'logout', 'POST', '10.0.0.102'),
('maria_sanchez', 'login', 'POST', '192.168.1.500'),
('maria_sanchez', 'get_stock', 'GET', '192.168.1.500'),
('maria_sanchez', 'logout', 'POST', '192.168.1.500'),
('pedro_lopez', 'login', 'POST', '192.168.1.501'),
('pedro_lopez', 'create_subscription', 'POST', '192.168.1.501'),
('pedro_lopez', 'logout', 'POST', '192.168.1.501');