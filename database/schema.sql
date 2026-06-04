-- =====================================================
-- Database Schema for Sanggar Bunda Sari
-- Sistem Pendaftaran Siswa
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS `sanggar_bunda_sari` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `sanggar_bunda_sari`;

-- =====================================================
-- 1. Table: students
-- Menyimpan data siswa
-- =====================================================
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Nama lengkap siswa',
  `email` VARCHAR(255) NOT NULL COMMENT 'Email siswa',
  `phone` VARCHAR(20) NOT NULL COMMENT 'Nomor telepon/WhatsApp',
  `address` TEXT NOT NULL COMMENT 'Alamat lengkap',
  `gender` ENUM('Laki-laki', 'Perempuan') NOT NULL COMMENT 'Jenis kelamin',
  `age` INT(3) UNSIGNED NOT NULL COMMENT 'Usia siswa',
  `education_level` VARCHAR(50) DEFAULT NULL COMMENT 'Tingkat pendidikan (SD/SMP/SMA)',
  `school_sd` VARCHAR(255) DEFAULT NULL COMMENT 'Nama sekolah SD',
  `school_smp` VARCHAR(255) DEFAULT NULL COMMENT 'Nama sekolah SMP',
  `school_smp_address` TEXT DEFAULT NULL COMMENT 'Alamat sekolah SMP',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_name` (`name`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Data siswa yang terdaftar';

-- =====================================================
-- 2. Table: classes
-- Menyimpan data kelas/program
-- =====================================================
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL COMMENT 'Nama kelas',
  `category` VARCHAR(100) NOT NULL COMMENT 'Kategori (Dasar/Matematika/Bahasa Inggris/Seni)',
  `schedule` VARCHAR(100) NOT NULL COMMENT 'Jadwal kelas (e.g., Senin 15:00)',
  `capacity` INT(11) UNSIGNED NOT NULL DEFAULT 20 COMMENT 'Kapasitas maksimal siswa',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Harga kelas dalam Rupiah',
  `description` TEXT DEFAULT NULL COMMENT 'Deskripsi kelas',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Daftar kelas dan program';

-- =====================================================
-- 3. Table: registrations
-- Menyimpan data registrasi siswa ke kelas
-- =====================================================
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` INT(11) UNSIGNED NOT NULL COMMENT 'Foreign key ke students',
  `class_id` INT(11) UNSIGNED NOT NULL COMMENT 'Foreign key ke classes',
  `registration_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Tanggal registrasi',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student_class` (`student_id`, `class_id`),
  KEY `fk_student` (`student_id`),
  KEY `fk_class` (`class_id`),
  KEY `idx_registration_date` (`registration_date`),
  CONSTRAINT `fk_registrations_student` 
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_registrations_class` 
    FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data registrasi siswa ke kelas';

-- =====================================================
-- 4. Table: users
-- Menyimpan data admin untuk login
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT 'Username untuk login',
  `password` VARCHAR(255) NOT NULL COMMENT 'Password (hashed dengan bcrypt)',
  `role` ENUM('admin', 'staff') NOT NULL DEFAULT 'admin' COMMENT 'Role user',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data user untuk login admin panel';

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default admin user
-- Username: admin
-- Password: admin123 (hashed dengan password_hash)
INSERT INTO `users` (`username`, `password`, `role`) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`);

-- Insert default classes
INSERT INTO `classes` (`name`, `category`, `schedule`, `capacity`, `price`, `description`) VALUES
('Calistung', 'Dasar', 'Senin 15:00', 20, 150000.00, 'Belajar membaca, menulis, dan berhitung untuk anak usia 3-6 tahun'),
('Matematika Kelas 1', 'Matematika', 'Selasa 15:00', 20, 200000.00, 'Matematika tingkat SD kelas 1'),
('Matematika Kelas 2', 'Matematika', 'Rabu 15:00', 20, 200000.00, 'Matematika tingkat SD kelas 2'),
('Matematika Kelas 3', 'Matematika', 'Kamis 15:00', 20, 200000.00, 'Matematika tingkat SD kelas 3'),
('Matematika Kelas 4', 'Matematika', 'Jumat 15:00', 20, 200000.00, 'Matematika tingkat SD kelas 4'),
('Matematika Kelas 5', 'Matematika', 'Sabtu 09:00', 20, 200000.00, 'Matematika tingkat SD kelas 5'),
('Matematika Kelas 6', 'Matematika', 'Sabtu 11:00', 20, 200000.00, 'Matematika tingkat SD kelas 6'),
('Bahasa Inggris Kelas 1', 'Bahasa Inggris', 'Senin 16:30', 20, 200000.00, 'English for Kids tingkat 1'),
('Bahasa Inggris Kelas 2', 'Bahasa Inggris', 'Selasa 16:30', 20, 200000.00, 'English for Kids tingkat 2'),
('Bahasa Inggris Kelas 3', 'Bahasa Inggris', 'Rabu 16:30', 20, 200000.00, 'English for Kids tingkat 3'),
('Bahasa Inggris Kelas 4', 'Bahasa Inggris', 'Kamis 16:30', 20, 200000.00, 'English for Kids tingkat 4'),
('Bahasa Inggris Kelas 5', 'Bahasa Inggris', 'Jumat 16:30', 20, 200000.00, 'English for Kids tingkat 5'),
('Bahasa Inggris Kelas 6', 'Bahasa Inggris', 'Sabtu 13:00', 20, 200000.00, 'English for Kids tingkat 6'),
('Melukis', 'Seni', 'Minggu 09:00', 15, 180000.00, 'Kelas melukis dan seni rupa untuk anak'),
('Tari Tradisional', 'Seni', 'Minggu 11:00', 15, 180000.00, 'Belajar tari tradisional Indonesia')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert sample students (optional - hapus jika tidak perlu)
INSERT INTO `students` (`name`, `email`, `phone`, `address`, `gender`, `age`, `education_level`, `school_sd`) VALUES
('Budi Santoso', 'budi@example.com', '08123456789', 'Jl. Merdeka No. 10, Jakarta', 'Laki-laki', 8, 'SD', 'SDN 01 Jakarta'),
('Siti Nurhaliza', 'siti@example.com', '08234567890', 'Jl. Sudirman No. 25, Bogor', 'Perempuan', 10, 'SD', 'SDN 05 Bogor'),
('Ahmad Rizki', 'ahmad@example.com', '08345678901', 'Jl. Gatot Subroto No. 7, Depok', 'Laki-laki', 12, 'SMP', 'SMPN 02 Depok')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Insert sample registrations (optional)
INSERT INTO `registrations` (`student_id`, `class_id`) 
SELECT s.id, c.id 
FROM `students` s, `classes` c 
WHERE s.email = 'budi@example.com' AND c.name = 'Matematika Kelas 2'
ON DUPLICATE KEY UPDATE `student_id` = VALUES(`student_id`);

INSERT INTO `registrations` (`student_id`, `class_id`) 
SELECT s.id, c.id 
FROM `students` s, `classes` c 
WHERE s.email = 'siti@example.com' AND c.name = 'Bahasa Inggris Kelas 4'
ON DUPLICATE KEY UPDATE `student_id` = VALUES(`student_id`);

-- =====================================================
-- VIEWS (Optional - untuk kemudahan query)
-- =====================================================

CREATE OR REPLACE VIEW `v_registrations_detail` AS
SELECT 
    r.id AS registration_id,
    r.registration_date,
    s.id AS student_id,
    s.name AS student_name,
    s.email AS student_email,
    s.phone AS student_phone,
    c.id AS class_id,
    c.name AS class_name,
    c.category AS class_category,
    c.schedule AS class_schedule,
    c.price AS class_price
FROM registrations r
JOIN students s ON r.student_id = s.id
JOIN classes c ON r.class_id = c.id
ORDER BY r.registration_date DESC;

-- =====================================================
-- STORED PROCEDURES (Optional - untuk operasi umum)
-- =====================================================

DELIMITER $$

CREATE PROCEDURE `sp_register_student_to_class`(
    IN p_student_id INT,
    IN p_class_id INT
)
BEGIN
    DECLARE v_capacity INT;
    DECLARE v_current_count INT;
    
    -- Check class capacity
    SELECT capacity INTO v_capacity FROM classes WHERE id = p_class_id;
    SELECT COUNT(*) INTO v_current_count FROM registrations WHERE class_id = p_class_id;
    
    IF v_current_count >= v_capacity THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Kelas sudah penuh';
    ELSE
        INSERT INTO registrations (student_id, class_id) 
        VALUES (p_student_id, p_class_id);
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Show success message
SELECT 'Database created successfully!' AS message;
