# Backend Setup Guide - Sanggar Bunda Sari

Complete guide for setting up and troubleshooting the backend API.

## 📋 Prerequisites

1. **XAMPP** installed (Apache + MySQL + PHP)
   - Download from: https://www.apachefriends.org/
   - Minimum PHP version: 7.4+
   - MySQL version: 5.7+ or MariaDB 10.3+

2. **Project Location**
   - Project must be in: `C:\xampp\htdocs\sistem-pendaftaran-siswa\`
   - Or adjust paths in `.htaccess` if using different location

## 🚀 Quick Start (5 Minutes)

### Step 1: Start XAMPP Services

1. Open **XAMPP Control Panel**
2. Click **Start** for:
   - ✅ Apache
   - ✅ MySQL

### Step 2: Setup Database

**Option A: Automatic (Recommended)**
1. Open browser and go to: `http://localhost/sistem-pendaftaran-siswa/database/setup_database.php`
2. Wait for the script to complete
3. You should see "🎉 Database setup completed successfully!"

**Option B: Manual**
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create database: `sanggar_bunda_sari`
3. Import `database/schema.sql`
4. The `classes` table will be auto-seeded on first API call

### Step 3: Verify Setup

1. Open: `http://localhost/sistem-pendaftaran-siswa/test_api.html`
2. Click **"Test All APIs"**
3. All endpoints should show ✓ green status

## 🔧 Configuration

### Database Credentials

Edit `php/config.php` if you have custom MySQL credentials:

```php
return [
    'host' => '127.0.0.1',
    'db' => 'sanggar_bunda_sari',
    'user' => 'root',          // Change if needed
    'pass' => 'your_password', // Change if needed
    'charset' => 'utf8mb4',
];
```

### Web Server Configuration

The `.htaccess` file handles:
- ✅ URL rewriting
- ✅ CORS headers
- ✅ PHP error display
- ✅ File caching
- ✅ Gzip compression

## 📡 API Endpoints

### 1. Classes API
**Endpoint:** `/php/api/classes.php`

| Method | Description | Request Body |
|--------|-------------|--------------|
| GET | Get all classes | - |
| POST | Create new class | `{name, category, schedule, capacity, price}` |
| PUT | Update class | `{id, name, category, schedule, capacity, price}` |
| DELETE | Delete class | `{id}` |

**Auto-Seeding:** If classes table is empty, 14 default classes are automatically created on first GET request.

### 2. Students API
**Endpoint:** `/php/api/students.php`

| Method | Description | Request Body |
|--------|-------------|--------------|
| GET | Get all students | - |
| POST | Create student | `{name, email, phone, address, gender, age, ...}` |
| PUT | Update student | `{id, name, email, phone, address, gender, age, ...}` |
| DELETE | Delete student | `{id}` |

### 3. Registrations API
**Endpoint:** `/php/api/registrations.php`

| Method | Description | Request Body |
|--------|-------------|--------------|
| GET | Get all active registrations | - |
| DELETE | Delete registration | `{id}` |

### 4. Register API
**Endpoint:** `/php/api/register.php`

| Method | Description | Request Body |
|--------|-------------|--------------|
| POST | Register student to classes | `{student_id, classes: [1,2,3]}` |

### 5. Recommendations API (Apriori Algorithm)
**Endpoint:** `/php/api/recommendations.php`

| Method | Description | Request Body |
|--------|-------------|--------------|
| POST | Get class recommendations | `{selected_classes: [1,2], min_support: 0.2, min_confidence: 0.4}` |

**Note:** Requires at least 3 transactions (registrations) to generate recommendations.

## 🐛 Troubleshooting

### ❌ Error: "Database connection failed"

**Cause:** MySQL not running or wrong credentials

**Solutions:**
1. Check XAMPP Control Panel - MySQL must be green/running
2. Verify credentials in `php/config.php`
3. Default XAMPP uses user `root` with **empty password**

### ❌ Error: "Unknown database 'sanggar_bunda_sari'"

**Cause:** Database not created yet

**Solution:**
Run: `http://localhost/sistem-pendaftaran-siswa/database/setup_database.php`

### ❌ Error: "404 Not Found"

**Cause:** Wrong project path or Apache not running

**Solutions:**
1. Verify project is in `C:\xampp\htdocs\sistem-pendaftaran-siswa\`
2. Check Apache is running in XAMPP Control Panel
3. Access via: `http://localhost/sistem-pendaftaran-siswa/`

### ❌ Error: "CORS policy blocked"

**Cause:** Missing or incorrect `.htaccess` configuration

**Solutions:**
1. Ensure `.htaccess` file exists in project root
2. Check Apache `mod_rewrite` and `mod_headers` are enabled
3. Edit `.htaccess` if needed

### ❌ Error: "Data transaksi masih kurang"

**Cause:** Apriori algorithm needs minimum 3 registrations

**Solution:**
Register at least 3 students with different class combinations first.

### ❌ Frontend shows "API tidak tersedia"

**Cause:** Backend API not responding

**Solutions:**
1. Run API tester: `test_api.html`
2. Check Apache is running
3. Verify database exists
4. Check browser console for detailed error

## 🧪 Testing APIs

### Using test_api.html (Recommended)
1. Open: `http://localhost/sistem-pendaftaran-siswa/test_api.html`
2. Click "Test All APIs"
3. View detailed responses

### Using Browser Console
```javascript
// Test GET request
fetch('http://localhost/sistem-pendaftaran-siswa/php/api/classes.php')
  .then(r => r.json())
  .then(console.log);

// Test POST request
fetch('http://localhost/sistem-pendaftaran-siswa/php/api/classes.php', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: 'Test Class',
    category: 'Test',
    schedule: 'Monday 10:00',
    capacity: 20,
    price: 100000
  })
}).then(r => r.json()).then(console.log);
```

### Using Postman/Insomnia
- Import the endpoints from this documentation
- Use `http://localhost/sistem-pendaftaran-siswa/php/api/` as base URL
- Set `Content-Type: application/json` for POST/PUT requests

## 📊 Database Schema

### students
- `id` (PK, Auto Increment)
- `name`, `email` (UNIQUE), `phone`, `address`
- `gender`, `age`
- `education_level`, `school_sd`, `school_smp`, `school_smp_address`
- `created_at` (Timestamp)

### classes
- `id` (PK, Auto Increment)
- `name`, `category`, `schedule`
- `capacity`, `price` (Decimal)

### registrations
- `id` (PK, Auto Increment)
- `student_id` (FK → students)
- `class_id` (FK → classes)
- `registration_date` (Timestamp)
- `status` (default: 'active')

## 🔐 Security Notes

- ⚠️ Current setup shows detailed error messages for debugging
- ⚠️ CORS is set to `*` (allow all origins)
- ⚠️ For **production**, you should:
  - Disable `display_errors` in `.htaccess`
  - Set specific CORS origins
  - Add authentication/authorization
  - Use HTTPS
  - Validate and sanitize all inputs

## 📞 Need Help?

1. Check `test_api.html` for real-time API status
2. Run `database/setup_database.php` to reset database
3. Review error messages in browser console (F12)
4. Check Apache error logs in XAMPP: `xampp/apache/logs/error.log`

## ✨ Next Steps

Once backend is working:
1. ✅ All APIs show green status in test_api.html
2. ✅ Open the homepage: `templates/index.html`
3. ✅ Try registering a student
4. ✅ View dashboard to see statistics
5. ✅ Test recommendation system with multiple registrations
