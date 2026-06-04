-- =====================================================
-- Migration: Tambah Tabel Payments untuk Midtrans
-- Jalankan file ini di phpMyAdmin atau MySQL CLI
-- =====================================================

USE `sanggar_bunda_sari`;

-- =====================================================
-- Tabel: payments
-- Menyimpan data transaksi pembayaran Midtrans
-- =====================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id`               INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `registration_no`  VARCHAR(50)      NOT NULL COMMENT 'Nomor pendaftaran unik (ORDER ID ke Midtrans)',
  `student_id`       INT(11) UNSIGNED DEFAULT NULL COMMENT 'FK ke tabel students',
  `student_name`     VARCHAR(255)     NOT NULL,
  `student_email`    VARCHAR(255)     NOT NULL,
  `student_phone`    VARCHAR(20)      NOT NULL,
  `amount`           DECIMAL(12,0)    NOT NULL COMMENT 'Total biaya dalam Rupiah',
  `snap_token`       TEXT             DEFAULT NULL COMMENT 'Token dari Midtrans Snap API',
  `midtrans_order_id` VARCHAR(100)    NOT NULL COMMENT 'Order ID yang dikirim ke Midtrans',
  `payment_type`     VARCHAR(50)      DEFAULT NULL COMMENT 'Metode pembayaran (gopay, bank_transfer, dll)',
  `transaction_id`   VARCHAR(100)     DEFAULT NULL COMMENT 'ID transaksi dari Midtrans',
  `status`           ENUM('pending','success','failed','expired','challenge') NOT NULL DEFAULT 'pending',
  `midtrans_response` JSON           DEFAULT NULL COMMENT 'Raw response dari Midtrans notification',
  `paid_at`          DATETIME         DEFAULT NULL COMMENT 'Waktu pembayaran berhasil',
  `created_at`       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration_no` (`registration_no`),
  UNIQUE KEY `unique_midtrans_order_id` (`midtrans_order_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_payments_student`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data transaksi pembayaran via Midtrans';

-- Tampilkan konfirmasi
SELECT 'Tabel payments berhasil dibuat!' AS status;
SELECT COUNT(*) AS total_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sanggar_bunda_sari'
  AND TABLE_NAME = 'payments';
