-- =====================================================
-- SBS Admin Panel v2 - Database Migration
-- =====================================================
USE `sanggar_bunda_sari`;

-- Expand students table
ALTER TABLE `students`
  ADD COLUMN IF NOT EXISTS `nama_anak` VARCHAR(100) AFTER `name`,
  ADD COLUMN IF NOT EXISTS `tempat_lahir` VARCHAR(100) AFTER `nama_anak`,
  ADD COLUMN IF NOT EXISTS `tanggal_lahir` DATE AFTER `tempat_lahir`,
  ADD COLUMN IF NOT EXISTS `nama_ayah` VARCHAR(100) AFTER `tanggal_lahir`,
  ADD COLUMN IF NOT EXISTS `nama_ibu` VARCHAR(100) AFTER `nama_ayah`,
  ADD COLUMN IF NOT EXISTS `pekerjaan_ayah` VARCHAR(100) AFTER `nama_ibu`,
  ADD COLUMN IF NOT EXISTS `pekerjaan_ibu` VARCHAR(100) AFTER `pekerjaan_ayah`,
  ADD COLUMN IF NOT EXISTS `kota` VARCHAR(100) AFTER `address`,
  ADD COLUMN IF NOT EXISTS `kode_pos` VARCHAR(10) AFTER `kota`,
  ADD COLUMN IF NOT EXISTS `foto` VARCHAR(200) AFTER `kode_pos`,
  ADD COLUMN IF NOT EXISTS `status` ENUM('aktif','tidak_aktif','pending') DEFAULT 'aktif' AFTER `foto`;

-- Expand users table
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) AFTER `username`,
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(100) AFTER `name`,
  ADD COLUMN IF NOT EXISTS `role` ENUM('superadmin','admin','bendahara','pengajar') DEFAULT 'admin' AFTER `email`,
  ADD COLUMN IF NOT EXISTS `foto` VARCHAR(200) AFTER `role`,
  ADD COLUMN IF NOT EXISTS `last_login` TIMESTAMP NULL AFTER `foto`,
  ADD COLUMN IF NOT EXISTS `status` ENUM('aktif','tidak_aktif') DEFAULT 'aktif' AFTER `last_login`;

-- Update default admin user
UPDATE `users` SET `name`='Super Admin', `email`='admin@sbs.id', `role`='superadmin' WHERE `username`='admin';

-- Expand registrations table
ALTER TABLE `registrations`
  ADD COLUMN IF NOT EXISTS `status` ENUM('pending','disetujui','aktif','ditolak','berhenti') DEFAULT 'aktif' AFTER `class_id`,
  ADD COLUMN IF NOT EXISTS `catatan` TEXT AFTER `status`,
  ADD COLUMN IF NOT EXISTS `approved_by` INT UNSIGNED AFTER `catatan`,
  ADD COLUMN IF NOT EXISTS `approved_at` TIMESTAMP NULL AFTER `approved_by`;

-- Tagihan (billing)
CREATE TABLE IF NOT EXISTS `tagihan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` INT UNSIGNED NOT NULL,
  `class_id` INT UNSIGNED NOT NULL,
  `periode` VARCHAR(7) NOT NULL COMMENT '2024-05',
  `nominal` DECIMAL(12,2) NOT NULL,
  `tgl_jatuh_tempo` DATE,
  `status` ENUM('belum_bayar','lunas','cicilan','gagal') DEFAULT 'belum_bayar',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_siswa` (`siswa_id`),
  KEY `idx_periode` (`periode`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`siswa_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pembayaran (payments)
CREATE TABLE IF NOT EXISTS `pembayaran` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tagihan_id` INT UNSIGNED NOT NULL,
  `nominal` DECIMAL(12,2) NOT NULL,
  `metode` ENUM('cash','transfer_bca','transfer_bri','transfer_mandiri','qris','gopay','shopee','midtrans') DEFAULT 'cash',
  `order_id` VARCHAR(100),
  `transaction_id` VARCHAR(100),
  `bukti_bayar` VARCHAR(200),
  `tgl_bayar` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending','success','failed','expire') DEFAULT 'success',
  `catatan` TEXT,
  `dicatat_oleh` INT UNSIGNED,
  PRIMARY KEY (`id`),
  KEY `idx_tagihan` (`tagihan_id`),
  FOREIGN KEY (`tagihan_id`) REFERENCES `tagihan`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Banner
CREATE TABLE IF NOT EXISTS `cms_banner` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(255),
  `subjudul` TEXT,
  `teks_cta` VARCHAR(100),
  `link_cta` VARCHAR(255),
  `foto` VARCHAR(200),
  `urutan` INT DEFAULT 1,
  `status` ENUM('aktif','draft') DEFAULT 'aktif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Pengumuman
CREATE TABLE IF NOT EXISTS `cms_pengumuman` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(255) NOT NULL,
  `kategori` ENUM('Libur','Kegiatan','Info Biaya','Umum') DEFAULT 'Umum',
  `isi` TEXT,
  `gambar` VARCHAR(200),
  `tanggal_mulai` DATE,
  `tanggal_berakhir` DATE,
  `pin` TINYINT(1) DEFAULT 0,
  `status` ENUM('publish','draft') DEFAULT 'publish',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Album
CREATE TABLE IF NOT EXISTS `cms_album` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT,
  `cover_foto` VARCHAR(200),
  `tgl_kegiatan` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Galeri
CREATE TABLE IF NOT EXISTS `cms_galeri` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `album_id` INT UNSIGNED,
  `foto` VARCHAR(200) NOT NULL,
  `keterangan` TEXT,
  `tgl_kegiatan` DATE,
  `tag_program` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`album_id`) REFERENCES `cms_album`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Testimoni
CREATE TABLE IF NOT EXISTS `cms_testimoni` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_ortu` VARCHAR(100),
  `nama_anak` VARCHAR(100),
  `program` VARCHAR(100),
  `foto` VARCHAR(200),
  `rating` TINYINT DEFAULT 5,
  `isi` TEXT,
  `urutan` INT DEFAULT 1,
  `status` ENUM('tampil','sembunyikan') DEFAULT 'tampil',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Lokasi
CREATE TABLE IF NOT EXISTS `cms_lokasi` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_cabang` VARCHAR(100),
  `alamat` TEXT,
  `kota` VARCHAR(100),
  `provinsi` VARCHAR(100),
  `kode_pos` VARCHAR(10),
  `maps_link` TEXT,
  `maps_embed` TEXT,
  `lat` DECIMAL(10,8),
  `lng` DECIMAL(11,8),
  `jam_senin_jumat` VARCHAR(50),
  `jam_sabtu` VARCHAR(50),
  `jam_minggu` VARCHAR(50),
  `telepon` VARCHAR(20),
  `whatsapp` VARCHAR(20),
  `email` VARCHAR(100),
  `instagram` VARCHAR(100),
  `facebook` VARCHAR(100),
  `tiktok` VARCHAR(100),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Apriori results cache
CREATE TABLE IF NOT EXISTS `apriori_results` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `run_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `min_support` DECIMAL(4,2),
  `min_confidence` DECIMAL(4,2),
  `min_lift` DECIMAL(4,2),
  `total_transactions` INT,
  `total_rules` INT,
  `frequent_sets` LONGTEXT,
  `rules` LONGTEXT,
  `run_by` INT UNSIGNED,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit log
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED,
  `user_name` VARCHAR(100),
  `aksi` VARCHAR(100),
  `detail` TEXT,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CMS Settings
CREATE TABLE IF NOT EXISTS `cms_settings` (
  `key_name` VARCHAR(100) NOT NULL,
  `value` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `cms_settings` (`key_name`,`value`) VALUES
('sanggar_nama','Sanggar Bunda Sari'),
('sanggar_tagline','Kembangkan Bakat Si Kecil'),
('sanggar_logo',''),
('midtrans_server_key',''),
('midtrans_client_key',''),
('midtrans_mode','sandbox'),
('wa_api_key',''),
('spp_tanggal_jatuh_tempo','10');

-- Sample CMS Testimoni
INSERT IGNORE INTO `cms_testimoni` (`nama_ortu`,`nama_anak`,`program`,`rating`,`isi`,`urutan`,`status`) VALUES
('Ibu Rina','Anisa','Calistung',5,'Anak saya jadi lebih percaya diri dan rajin belajar sejak bergabung di sini.',1,'tampil'),
('Pak Budi','Rafi','Matematika',5,'Nilai matematika meningkat drastis! Gurunya sabar dan metodenya sangat efektif.',2,'tampil'),
('Ibu Lili','Zahra','Melukis',5,'Kelas melukisnya seru banget, setiap minggu anak saya sudah tidak sabar ke sanggar.',3,'tampil');

SELECT 'Migration v2 selesai!' AS message;
