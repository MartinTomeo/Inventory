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

-- Permision Types
-- 1 admin -- full permision
-- 2 aduit -- full permision except users
-- 3 editor -- suscribe, stock.


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


-- ============================================
-- EXPANSIÓN MASIVA DE INSERTS DE EJEMPLO
-- ============================================

-- ============================================
-- 1. USUARIOS (50 usuarios)
-- ============================================
-- ============================================
-- 1. USUARIOS (50 usuarios con 3 niveles de permiso)
-- ============================================
INSERT INTO users (username, email, password, role, user_image) VALUES
-- Administradores (role 1) - full permision
('admin', 'admin@example.com', '$2y$10$Gf9SXYpcTOsZEPlrIscPyugax5/CFmYXohRek9ZA2Txo5kufFvM6S', 1, 'admin_avatar.png'),
('ana_martinez', 'ana@example.com', '$2y$10$XxYyZz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJ', 1, 'ana_admin.png'),
('carlos_ruiz', 'carlos.ruiz@example.com', '$2y$10$YyZz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJK', 1, 'carlos_admin.png'),
('marta_fernandez', 'marta@example.com', '$2y$10$Zz0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL', 1, 'marta_admin.png'),
('javier_moreno', 'javier@example.com', '$2y$10$0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM', 1, 'javier_admin.png'),

-- Nivel 2 (role 2) - full permision except users (audit)
('john_doe', 'john@example.com', '$2y$10$GaVcjDQiMS9HWd6CS9XvceQrA6JSq2mzm/P23miScRCvieEfVoYoW', 2, 'john_profile.png'),
('mario_garcia', 'mario@example.com', '$2y$10$123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN', 2, 'mario_photo.png'),
('pedro_lopez', 'pedro@example.com', '$2y$10$23456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNO', 2, 'pedro_avatar.png'),
('isabel_ramirez', 'isabel@example.com', '$2y$10$3456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP', 2, 'isabel_avatar.png'),
('fernando_diaz', 'fernando@example.com', '$2y$10$456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ', 2, 'fernando_profile.png'),
('laura_gomez', 'laura@example.com', '$2y$10$56789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQR', 2, 'laura_image.png'),
('ricardo_santos', 'ricardo@example.com', '$2y$10$6789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRS', 2, 'ricardo_photo.png'),
('patricia_reyes', 'patricia@example.com', '$2y$10$789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRST', 2, 'patricia_avatar.png'),
('andres_herrera', 'andres@example.com', '$2y$10$89abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTU', 2, 'andres_image.png'),
('monica_castro', 'monica@example.com', '$2y$10$9abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV', 2, 'monica_profile.png'),

-- Nivel 3 (role 3) - suscribe, stock (editor)
('jane_smith', 'jane@example.com', '$2y$10$uwArcm2Xe96LOOQNPllgNOg71MnmoGNxhsk6dRJz7FFbHYyYZOEdC', 3, 'jane_avatar.png'),
('lucia_fernandez', 'lucia@example.com', '$2y$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX', 3, 'lucia_pic.png'),
('maria_sanchez', 'maria@example.com', '$2y$10$bcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY', 3, 'maria_profile.png'),
('jose_luis', 'joseluis@example.com', '$2y$10$cdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 3, 'joseluis_photo.png'),
('carmen_martin', 'carmen@example.com', '$2y$10$defghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZA', 3, 'carmen_avatar.png'),
('david_garcia', 'david@example.com', '$2y$10$efghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZAB', 3, 'david_image.png'),
('sandra_mora', 'sandra@example.com', '$2y$10$fghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABC', 3, 'sandra_profile.png'),
('roberto_vega', 'roberto@example.com', '$2y$10$ghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCD', 3, 'roberto_photo.png'),
('teresa_romo', 'teresa@example.com', '$2y$10$hijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDE', 3, 'teresa_avatar.png'),
('jorge_navarro', 'jorge@example.com', '$2y$10$ijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEF', 3, 'jorge_image.png'),
('elena_ortiz', 'elena@example.com', '$2y$10$jklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFG', 3, 'elena_profile.png'),
('francisco_moya', 'francisco@example.com', '$2y$10$klmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGH', 3, 'francisco_photo.png'),
('angela_vargas', 'angela@example.com', '$2y$10$lmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHI', 3, 'angela_avatar.png'),
('antonio_jimenez', 'antonio@example.com', '$2y$10$mnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJ', 3, 'antonio_image.png'),
('silvia_guerra', 'silvia@example.com', '$2y$10$nopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJK', 3, 'silvia_profile.png'),
('test_user', 'test@example.com', '$2y$10$bVNePQ7d7EZObLsi2VkIgeOSJfh94llUgnSMY6X/rM7SuE6oJTI1O', 3, 'test_image.png'),
('carlos_rodriguez', 'carlos@example.com', '$2y$10$opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKL', 3, 'profile.png'),
('jose_gonzalez', 'jose@example.com', '$2y$10$pqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLM', 3, 'profile.png'),
('gloria_pena', 'gloria@example.com', '$2y$10$qrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMN', 3, 'profile.png'),
('hector_rey', 'hector@example.com', '$2y$10$rstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO', 3, 'profile.png'),
('irene_soto', 'irene@example.com', '$2y$10$stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOP', 3, 'profile.png'),
('karla_mendez', 'karla@example.com', '$2y$10$tuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQ', 3, 'profile.png'),
('luis_espinoza', 'luis@example.com', '$2y$10$uvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQR', 3, 'profile.png'),
('noelia_arias', 'noelia@example.com', '$2y$10$vwxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRS', 3, 'profile.png'),
('oscar_cordero', 'oscar@example.com', '$2y$10$wxyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRST', 3, 'profile.png'),
('paula_fuentes', 'paula@example.com', '$2y$10$xyzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTU', 3, 'profile.png'),
('raquel_campos', 'raquel@example.com', '$2y$10$yzABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUV', 3, 'profile.png'),
('sergio_molina', 'sergio@example.com', '$2y$10$zABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVW', 3, 'profile.png'),
('tania_oviedo', 'tania@example.com', '$2y$10$ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWX', 3, 'profile.png'),
('ulises_salazar', 'ulises@example.com', '$2y$10$BCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXY', 3, 'profile.png'),
('valeria_rios', 'valeria@example.com', '$2y$10$CDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ', 3, 'profile.png'),
('walter_cruz', 'walter@example.com', '$2y$10$DEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZA', 3, 'profile.png'),
('ximena_mora', 'ximena@example.com', '$2y$10$EFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZAB', 3, 'profile.png'),
('yolanda_meza', 'yolanda@example.com', '$2y$10$FGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABC', 3, 'profile.png'),
('zoe_fernandez', 'zoe@example.com', '$2y$10$GHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCD', 3, 'profile.png');

-- ============================================
-- 2. LÍNEAS TELEFÓNICAS (50 líneas)
-- ============================================
INSERT INTO lines (line, provider) VALUES
-- Movistar (16 líneas)
(1150010001, 'Movistar'),
(1150010002, 'Movistar'),
(1150010003, 'Movistar'),
(1150010004, 'Movistar'),
(1150010005, 'Movistar'),
(1160010006, 'Movistar'),
(1160010007, 'Movistar'),
(1160010008, 'Movistar'),
(1170010009, 'Movistar'),
(1170010010, 'Movistar'),
(1180010011, 'Movistar'),
(1180010012, 'Movistar'),
(1190010013, 'Movistar'),
(1190010014, 'Movistar'),
(1200010015, 'Movistar'),
(1200010016, 'Movistar'),

-- Personal (17 líneas)
(1150020001, 'Personal'),
(1150020002, 'Personal'),
(1150020003, 'Personal'),
(1150020004, 'Personal'),
(1160020005, 'Personal'),
(1160020006, 'Personal'),
(1160020007, 'Personal'),
(1170020008, 'Personal'),
(1170020009, 'Personal'),
(1180020010, 'Personal'),
(1180020011, 'Personal'),
(1190020012, 'Personal'),
(1190020013, 'Personal'),
(1200020014, 'Personal'),
(1200020015, 'Personal'),
(1210020016, 'Personal'),
(1210020017, 'Personal'),

-- Claro (17 líneas)
(1150030001, 'Claro'),
(1150030002, 'Claro'),
(1150030003, 'Claro'),
(1160030004, 'Claro'),
(1160030005, 'Claro'),
(1160030006, 'Claro'),
(1170030007, 'Claro'),
(1170030008, 'Claro'),
(1180030009, 'Claro'),
(1180030010, 'Claro'),
(1190030011, 'Claro'),
(1190030012, 'Claro'),
(1200030013, 'Claro'),
(1200030014, 'Claro'),
(1210030015, 'Claro'),
(1210030016, 'Claro'),
(1220030017, 'Claro');

-- ============================================
-- 3. STOCK (100 teléfonos)
-- ============================================
INSERT INTO stock (imei, model, brand, provider, phone_image) VALUES
-- Apple (25 teléfonos)
('356789012345671', 'iPhone 14', 'Apple', 'Movistar', 'iphone14_1.jpg'),
('356789012345672', 'iPhone 14', 'Apple', 'Personal', 'iphone14_2.jpg'),
('356789012345673', 'iPhone 14', 'Apple', 'Claro', 'iphone14_3.jpg'),
('356789012345674', 'iPhone 14 Pro', 'Apple', 'Movistar', 'iphone14pro_1.jpg'),
('356789012345675', 'iPhone 14 Pro', 'Apple', 'Personal', 'iphone14pro_2.jpg'),
('356789012345676', 'iPhone 14 Pro', 'Apple', 'Claro', 'iphone14pro_3.jpg'),
('356789012345677', 'iPhone 14 Pro Max', 'Apple', 'Movistar', 'iphone14promax_1.jpg'),
('356789012345678', 'iPhone 14 Pro Max', 'Apple', 'Personal', 'iphone14promax_2.jpg'),
('356789012345679', 'iPhone 14 Pro Max', 'Apple', 'Claro', 'iphone14promax_3.jpg'),
('356789012345680', 'iPhone 15', 'Apple', 'Movistar', 'iphone15_1.jpg'),
('356789012345681', 'iPhone 15', 'Apple', 'Personal', 'iphone15_2.jpg'),
('356789012345682', 'iPhone 15', 'Apple', 'Claro', 'iphone15_3.jpg'),
('356789012345683', 'iPhone 15 Plus', 'Apple', 'Movistar', 'iphone15plus_1.jpg'),
('356789012345684', 'iPhone 15 Plus', 'Apple', 'Personal', 'iphone15plus_2.jpg'),
('356789012345685', 'iPhone 15 Plus', 'Apple', 'Claro', 'iphone15plus_3.jpg'),
('356789012345686', 'iPhone 15 Pro', 'Apple', 'Movistar', 'iphone15pro_1.jpg'),
('356789012345687', 'iPhone 15 Pro', 'Apple', 'Personal', 'iphone15pro_2.jpg'),
('356789012345688', 'iPhone 15 Pro', 'Apple', 'Claro', 'iphone15pro_3.jpg'),
('356789012345689', 'iPhone 15 Pro Max', 'Apple', 'Movistar', 'iphone15promax_1.jpg'),
('356789012345690', 'iPhone 15 Pro Max', 'Apple', 'Personal', 'iphone15promax_2.jpg'),
('356789012345691', 'iPhone 15 Pro Max', 'Apple', 'Claro', 'iphone15promax_3.jpg'),
('356789012345692', 'iPhone 13', 'Apple', 'Movistar', 'iphone13_1.jpg'),
('356789012345693', 'iPhone 13', 'Apple', 'Personal', 'iphone13_2.jpg'),
('356789012345694', 'iPhone 13', 'Apple', 'Claro', 'iphone13_3.jpg'),
('356789012345695', 'iPhone SE', 'Apple', 'Movistar', 'iphone_se_1.jpg'),

-- Samsung (30 teléfonos)
('356789012345696', 'Galaxy S23', 'Samsung', 'Movistar', 's23_1.jpg'),
('356789012345697', 'Galaxy S23', 'Samsung', 'Personal', 's23_2.jpg'),
('356789012345698', 'Galaxy S23', 'Samsung', 'Claro', 's23_3.jpg'),
('356789012345699', 'Galaxy S23 Plus', 'Samsung', 'Movistar', 's23plus_1.jpg'),
('356789012345700', 'Galaxy S23 Plus', 'Samsung', 'Personal', 's23plus_2.jpg'),
('356789012345701', 'Galaxy S23 Plus', 'Samsung', 'Claro', 's23plus_3.jpg'),
('356789012345702', 'Galaxy S23 Ultra', 'Samsung', 'Movistar', 's23ultra_1.jpg'),
('356789012345703', 'Galaxy S23 Ultra', 'Samsung', 'Personal', 's23ultra_2.jpg'),
('356789012345704', 'Galaxy S23 Ultra', 'Samsung', 'Claro', 's23ultra_3.jpg'),
('356789012345705', 'Galaxy S24', 'Samsung', 'Movistar', 's24_1.jpg'),
('356789012345706', 'Galaxy S24', 'Samsung', 'Personal', 's24_2.jpg'),
('356789012345707', 'Galaxy S24', 'Samsung', 'Claro', 's24_3.jpg'),
('356789012345708', 'Galaxy S24 Plus', 'Samsung', 'Movistar', 's24plus_1.jpg'),
('356789012345709', 'Galaxy S24 Plus', 'Samsung', 'Personal', 's24plus_2.jpg'),
('356789012345710', 'Galaxy S24 Plus', 'Samsung', 'Claro', 's24plus_3.jpg'),
('356789012345711', 'Galaxy S24 Ultra', 'Samsung', 'Movistar', 's24ultra_1.jpg'),
('356789012345712', 'Galaxy S24 Ultra', 'Samsung', 'Personal', 's24ultra_2.jpg'),
('356789012345713', 'Galaxy S24 Ultra', 'Samsung', 'Claro', 's24ultra_3.jpg'),
('356789012345714', 'Galaxy Z Fold 5', 'Samsung', 'Movistar', 'fold5_1.jpg'),
('356789012345715', 'Galaxy Z Fold 5', 'Samsung', 'Personal', 'fold5_2.jpg'),
('356789012345716', 'Galaxy Z Fold 5', 'Samsung', 'Claro', 'fold5_3.jpg'),
('356789012345717', 'Galaxy Z Flip 5', 'Samsung', 'Movistar', 'flip5_1.jpg'),
('356789012345718', 'Galaxy Z Flip 5', 'Samsung', 'Personal', 'flip5_2.jpg'),
('356789012345719', 'Galaxy Z Flip 5', 'Samsung', 'Claro', 'flip5_3.jpg'),
('356789012345720', 'Galaxy A54', 'Samsung', 'Movistar', 'a54_1.jpg'),
('356789012345721', 'Galaxy A54', 'Samsung', 'Personal', 'a54_2.jpg'),
('356789012345722', 'Galaxy A54', 'Samsung', 'Claro', 'a54_3.jpg'),
('356789012345723', 'Galaxy A34', 'Samsung', 'Movistar', 'a34_1.jpg'),
('356789012345724', 'Galaxy A34', 'Samsung', 'Personal', 'a34_2.jpg'),
('356789012345725', 'Galaxy A34', 'Samsung', 'Claro', 'a34_3.jpg'),

-- Motorola (15 teléfonos)
('356789012345726', 'Moto G84', 'Motorola', 'Movistar', 'g84_1.jpg'),
('356789012345727', 'Moto G84', 'Motorola', 'Personal', 'g84_2.jpg'),
('356789012345728', 'Moto G84', 'Motorola', 'Claro', 'g84_3.jpg'),
('356789012345729', 'Moto G Power 5G', 'Motorola', 'Movistar', 'gpower_1.jpg'),
('356789012345730', 'Moto G Power 5G', 'Motorola', 'Personal', 'gpower_2.jpg'),
('356789012345731', 'Moto G Power 5G', 'Motorola', 'Claro', 'gpower_3.jpg'),
('356789012345732', 'Moto Edge 40', 'Motorola', 'Movistar', 'edge40_1.jpg'),
('356789012345733', 'Moto Edge 40', 'Motorola', 'Personal', 'edge40_2.jpg'),
('356789012345734', 'Moto Edge 40', 'Motorola', 'Claro', 'edge40_3.jpg'),
('356789012345735', 'Moto Edge 40 Pro', 'Motorola', 'Movistar', 'edge40pro_1.jpg'),
('356789012345736', 'Moto Edge 40 Pro', 'Motorola', 'Personal', 'edge40pro_2.jpg'),
('356789012345737', 'Moto Edge 40 Pro', 'Motorola', 'Claro', 'edge40pro_3.jpg'),
('356789012345738', 'Moto G73', 'Motorola', 'Movistar', 'g73_1.jpg'),
('356789012345739', 'Moto G73', 'Motorola', 'Personal', 'g73_2.jpg'),
('356789012345740', 'Moto G73', 'Motorola', 'Claro', 'g73_3.jpg'),

-- Google Pixel (10 teléfonos)
('356789012345741', 'Pixel 7', 'Google', 'Movistar', 'pixel7_1.jpg'),
('356789012345742', 'Pixel 7', 'Google', 'Personal', 'pixel7_2.jpg'),
('356789012345743', 'Pixel 7', 'Google', 'Claro', 'pixel7_3.jpg'),
('356789012345744', 'Pixel 7 Pro', 'Google', 'Movistar', 'pixel7pro_1.jpg'),
('356789012345745', 'Pixel 7 Pro', 'Google', 'Personal', 'pixel7pro_2.jpg'),
('356789012345746', 'Pixel 7 Pro', 'Google', 'Claro', 'pixel7pro_3.jpg'),
('356789012345747', 'Pixel 8', 'Google', 'Movistar', 'pixel8_1.jpg'),
('356789012345748', 'Pixel 8', 'Google', 'Personal', 'pixel8_2.jpg'),
('356789012345749', 'Pixel 8', 'Google', 'Claro', 'pixel8_3.jpg'),
('356789012345750', 'Pixel 8 Pro', 'Google', 'Movistar', 'pixel8pro_1.jpg'),

-- Xiaomi (10 teléfonos)
('356789012345751', 'Xiaomi 13', 'Xiaomi', 'Personal', 'xiaomi13_1.jpg'),
('356789012345752', 'Xiaomi 13', 'Xiaomi', 'Claro', 'xiaomi13_2.jpg'),
('356789012345753', 'Xiaomi 13 Pro', 'Xiaomi', 'Movistar', 'xiaomi13pro_1.jpg'),
('356789012345754', 'Xiaomi 13 Pro', 'Xiaomi', 'Personal', 'xiaomi13pro_2.jpg'),
('356789012345755', 'Xiaomi 13 Pro', 'Xiaomi', 'Claro', 'xiaomi13pro_3.jpg'),
('356789012345756', 'Redmi Note 12', 'Xiaomi', 'Movistar', 'redmi12_1.jpg'),
('356789012345757', 'Redmi Note 12', 'Xiaomi', 'Personal', 'redmi12_2.jpg'),
('356789012345758', 'Redmi Note 12', 'Xiaomi', 'Claro', 'redmi12_3.jpg'),
('356789012345759', 'Xiaomi 13T', 'Xiaomi', 'Movistar', 'xiaomi13t_1.jpg'),
('356789012345760', 'Xiaomi 13T', 'Xiaomi', 'Personal', 'xiaomi13t_2.jpg'),

-- Sony (5 teléfonos)
('356789012345761', 'Xperia 1 V', 'Sony', 'Movistar', 'xperia1_1.jpg'),
('356789012345762', 'Xperia 1 V', 'Sony', 'Personal', 'xperia1_2.jpg'),
('356789012345763', 'Xperia 1 V', 'Sony', 'Claro', 'xperia1_3.jpg'),
('356789012345764', 'Xperia 5 V', 'Sony', 'Movistar', 'xperia5_1.jpg'),
('356789012345765', 'Xperia 5 V', 'Sony', 'Personal', 'xperia5_2.jpg'),

-- OnePlus (5 teléfonos)
('356789012345766', 'OnePlus 12', 'OnePlus', 'Movistar', 'oneplus12_1.jpg'),
('356789012345767', 'OnePlus 12', 'OnePlus', 'Personal', 'oneplus12_2.jpg'),
('356789012345768', 'OnePlus 12', 'OnePlus', 'Claro', 'oneplus12_3.jpg'),
('356789012345769', 'OnePlus 11', 'OnePlus', 'Movistar', 'oneplus11_1.jpg'),
('356789012345770', 'OnePlus 11', 'OnePlus', 'Personal', 'oneplus11_2.jpg');

-- ============================================
-- 4. SUSCRIPCIONES (TABLA PIVOT) - 100 asignaciones
-- ============================================
INSERT INTO subscriptions (user_id, line, imei) VALUES
-- Admin (ID: 1) - 5 teléfonos
(1, 1150010001, '356789012345671'),
(1, 1150020001, '356789012345696'),
(1, 1150030001, '356789012345726'),
(1, 1150010002, '356789012345674'),
(1, 1150020002, '356789012345699'),

-- Ana Martínez (ID: 8) - 5 teléfonos
(8, 1150030002, '356789012345727'),
(8, 1160010006, '356789012345677'),
(8, 1160020005, '356789012345700'),
(8, 1160030004, '356789012345728'),
(8, 1170010009, '356789012345680'),

-- Carlos Ruiz (ID: 3) - 4 teléfonos
(3, 1170020008, '356789012345703'),
(3, 1170030007, '356789012345729'),
(3, 1180010011, '356789012345682'),
(3, 1180020010, '356789012345705'),

-- Marta Fernández (ID: 4) - 4 teléfonos
(4, 1180030009, '356789012345730'),
(4, 1190010013, '356789012345683'),
(4, 1190020012, '356789012345706'),
(4, 1190030011, '356789012345731'),

-- Javier Moreno (ID: 5) - 4 teléfonos
(5, 1200010015, '356789012345689'),
(5, 1200020014, '356789012345711'),
(5, 1200030013, '356789012345732'),
(5, 1210020016, '356789012345714'),

-- John Doe (ID: 2) - 5 teléfonos
(2, 1150010003, '356789012345672'),
(2, 1150020003, '356789012345697'),
(2, 1160010007, '356789012345675'),
(2, 1160020006, '356789012345698'),
(2, 1160030005, '356789012345727'),

-- Mario García (ID: 6) - 4 teléfonos
(6, 1170010010, '356789012345679'),
(6, 1170020009, '356789012345702'),
(6, 1170030008, '356789012345729'),
(6, 1180010012, '356789012345681'),

-- Pedro López (ID: 7) - 4 teléfonos
(7, 1180020011, '356789012345704'),
(7, 1180030010, '356789012345730'),
(7, 1190010014, '356789012345684'),
(7, 1190020013, '356789012345707'),

-- Jane Smith (ID: 9) - 5 teléfonos
(9, 1190030012, '356789012345733'),
(9, 1200010016, '356789012345690'),
(9, 1200020015, '356789012345712'),
(9, 1200030014, '356789012345734'),
(9, 1210020017, '356789012345715'),

-- Lucía Fernández (ID: 10) - 4 teléfonos
(10, 1150010004, '356789012345673'),
(10, 1150020004, '356789012345698'),
(10, 1150030003, '356789012345728'),
(10, 1160010008, '356789012345676'),

-- María Sánchez (ID: 11) - 4 teléfonos
(11, 1160020007, '356789012345701'),
(11, 1160030006, '356789012345731'),
(11, 1170010011, '356789012345685'),
(11, 1170020010, '356789012345708'),

-- José Luis (ID: 12) - 3 teléfonos
(12, 1170030009, '356789012345732'),
(12, 1180010013, '356789012345686'),
(12, 1180020012, '356789012345709'),

-- Carmen Martín (ID: 13) - 3 teléfonos
(13, 1180030011, '356789012345733'),
(13, 1190010015, '356789012345687'),
(13, 1190020014, '356789012345710'),

-- David García (ID: 14) - 3 teléfonos
(14, 1190030013, '356789012345734'),
(14, 1200010017, '356789012345691'),
(14, 1200020016, '356789012345713'),

-- Sandra Mora (ID: 15) - 3 teléfonos
(15, 1200030015, '356789012345735'),
(15, 1210010018, '356789012345716'),
(15, 1210020019, '356789012345717'),

-- Roberto Vega (ID: 16) - 3 teléfonos
(16, 1150020005, '356789012345699'),
(16, 1150030004, '356789012345729'),
(16, 1160010009, '356789012345678'),

-- Teresa Romo (ID: 17) - 3 teléfonos
(17, 1160020008, '356789012345702'),
(17, 1160030007, '356789012345730'),
(17, 1170010012, '356789012345681'),

-- Jorge Navarro (ID: 18) - 3 teléfonos
(18, 1170020011, '356789012345704'),
(18, 1170030010, '356789012345731'),
(18, 1180010014, '356789012345683'),

-- Elena Ortiz (ID: 19) - 3 teléfonos
(19, 1180020013, '356789012345706'),
(19, 1180030012, '356789012345732'),
(19, 1190010016, '356789012345685'),

-- Francisco Moya (ID: 20) - 3 teléfonos
(20, 1190020015, '356789012345708'),
(20, 1190030014, '356789012345733'),
(20, 1200010018, '356789012345687'),

-- Ángela Vargas (ID: 21) - 2 teléfonos
(21, 1200020017, '356789012345710'),
(21, 1200030016, '356789012345734'),

-- Antonio Jiménez (ID: 22) - 2 teléfonos
(22, 1210010019, '356789012345715'),
(22, 1210020020, '356789012345716'),

-- Silvia Guerra (ID: 23) - 2 teléfonos
(23, 1150010005, '356789012345674'),
(23, 1150020006, '356789012345697'),

-- Test User (ID: 24) - 3 teléfonos
(24, 1150030005, '356789012345727'),
(24, 1160010010, '356789012345679'),
(24, 1160020009, '356789012345701'),

-- Carlos Rodríguez (ID: 25) - 2 teléfonos
(25, 1160030008, '356789012345728'),
(25, 1170010013, '356789012345682'),

-- José González (ID: 26) - 2 teléfonos
(26, 1170020012, '356789012345705'),
(26, 1170030011, '356789012345730'),

-- Gloria Peña (ID: 27) - 2 teléfonos
(27, 1180010015, '356789012345688'),
(27, 1180020014, '356789012345711'),

-- Héctor Rey (ID: 28) - 2 teléfonos
(28, 1180030013, '356789012345735'),
(28, 1190010017, '356789012345689'),

-- Irene Soto (ID: 29) - 2 teléfonos
(29, 1190020016, '356789012345712'),
(29, 1190030015, '356789012345736'),

-- Karla Méndez (ID: 30) - 2 teléfonos
(30, 1200010019, '356789012345690'),
(30, 1200020018, '356789012345713'),

-- Luis Espinoza (ID: 31) - 2 teléfonos
(31, 1200030017, '356789012345737'),
(31, 1210010020, '356789012345718'),

-- Noelia Arias (ID: 32) - 2 teléfonos
(32, 1210020021, '356789012345719'),
(32, 1150010006, '356789012345675'),

-- Oscar Cordero (ID: 33) - 1 teléfono
(33, 1150020007, '356789012345700'),

-- Paula Fuentes (ID: 34) - 1 teléfono
(34, 1150030006, '356789012345729'),

-- Raquel Campos (ID: 35) - 1 teléfono
(35, 1160010011, '356789012345678'),

-- Sergio Molina (ID: 36) - 1 teléfono
(36, 1160020010, '356789012345703'),

-- Tania Oviedo (ID: 37) - 1 teléfono
(37, 1160030009, '356789012345731'),

-- Ulises Salazar (ID: 38) - 1 teléfono
(38, 1170010014, '356789012345684'),

-- Valeria Ríos (ID: 39) - 1 teléfono
(39, 1170020013, '356789012345707'),

-- Walter Cruz (ID: 40) - 1 teléfono
(40, 1170030012, '356789012345732'),

-- Ximena Mora (ID: 41) - 1 teléfono
(41, 1180010016, '356789012345686'),

-- Yolanda Meza (ID: 42) - 1 teléfono
(42, 1180020015, '356789012345709'),

-- Zoe Fernández (ID: 43) - 1 teléfono
(43, 1180030014, '356789012345733'),

-- Fernando Díaz (ID: 44) - 2 teléfonos
(44, 1190010018, '356789012345691'),
(44, 1190020017, '356789012345714'),

-- Laura Gómez (ID: 45) - 2 teléfonos
(45, 1190030016, '356789012345737'),
(45, 1200010020, '356789012345692'),

-- Ricardo Santos (ID: 46) - 2 teléfonos
(46, 1200020019, '356789012345715'),
(46, 1200030018, '356789012345738'),

-- Patricia Reyes (ID: 47) - 2 teléfonos
(47, 1210010021, '356789012345716'),
(47, 1210020022, '356789012345739'),

-- Andrés Herrera (ID: 48) - 2 teléfonos
(48, 1150010007, '356789012345676'),
(48, 1150020008, '356789012345701'),

-- Mónica Castro (ID: 49) - 2 teléfonos
(49, 1150030007, '356789012345730'),
(49, 1160010012, '356789012345679'),

-- Test adicional (ID: 50) - 2 teléfonos
(50, 1160020011, '356789012345704'),
(50, 1160030010, '356789012345731');

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