# Database Setup - Sanggar Bunda Sari

## 📋 Cara Import Database

### Metode 1: Via phpMyAdmin (Paling Mudah)

1. **Buka phpMyAdmin**
   - Start XAMPP Apache & MySQL
   - Buka browser: `http://localhost/phpmyadmin`

2. **Import SQL File**
   - Klik tab **"Import"** di menu atas
   - Klik **"Choose File"**
   - Pilih file: `database/schema.sql`
   - Scroll ke bawah, klik **"Go"** atau **"Import"**

3. **Selesai!**
   - Database `sanggar_bunda_sari` sudah terbuat
   - Semua tabel dan data sample sudah terisi

### Metode 2: Via Command Line (Advanced)

```bash
# Masuk ke direktori XAMPP MySQL
cd C:\xampp\mysql\bin

# Import database
mysql -u root -p < "D:\Xampp\htdocs\sistem-pendaftaran-siswa\database\schema.sql"
```

## 🗂️ Struktur Database

### Tables:

1. **`students`** - Data siswa
   - id, name, email, phone, address, gender, age
   - education_level, school_sd, school_smp, school_smp_address
   - created_at, updated_at

2. **`classes`** - Data kelas/program
   - id, name, category, schedule, capacity, price
   - description, created_at, updated_at

3. **`registrations`** - Data registrasi siswa ke kelas
   - id, student_id, class_id, registration_date
   - Foreign keys ke students dan classes

4. **`users`** - Data admin
   - id, username, password (hashed), role
   - created_at, updated_at

### Default User:
- **Username:** `admin`
- **Password:** `admin123`

## 🔍 Views & Stored Procedures

### View: `v_registrations_detail`
Menampilkan detail registrasi dengan join ke students dan classes.

```sql
SELECT * FROM v_registrations_detail;
```

### Stored Procedure: `sp_register_student_to_class`
Mendaftarkan siswa ke kelas dengan validasi kapasitas.

```sql
CALL sp_register_student_to_class(1, 1);
```

## ✅ Verifikasi Database

Setelah import, cek apakah berhasil:

```sql
USE sanggar_bunda_sari;

-- Cek semua tabel
SHOW TABLES;

-- Cek jumlah data
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM classes;
SELECT COUNT(*) FROM users;
```

## 🔧 Konfigurasi PHP

Pastikan kredensial di `php/config.php` sesuai:

```php
return [
    'host' => '127.0.0.1',
    'db' => 'sanggar_bunda_sari',
    'user' => 'root',
    'pass' => '', // Kosongkan jika tidak ada password
    'charset' => 'utf8mb4',
];
```

## 🚀 Testing

1. Start XAMPP Apache & MySQL
2. Akses: `http://localhost/sistem-pendaftaran-siswa/templates/index.html`
3. Login admin: `http://localhost/sistem-pendaftaran-siswa/templates/admin.html`
   - Username: `admin`
   - Password: `admin123`

## 📝 Catatan Penting

- **Backup Database:** Selalu backup sebelum melakukan perubahan besar
- **Password User:** Password `admin123` sudah di-hash dengan bcrypt
- **Sample Data:** Data siswa dan registrasi sample bisa dihapus jika tidak diperlukan
- **Foreign Keys:** Menggunakan CASCADE, jadi hapus student/class akan hapus registrasi terkait
