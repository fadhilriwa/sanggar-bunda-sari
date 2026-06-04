<?php
/**
 * Test Database Connection
 * Akses file ini melalui browser untuk memeriksa koneksi database
 * Contoh: http://127.0.0.1:8000/php/test_connection.php
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Koneksi Database</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 10px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #28a745;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #dc3545;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #17a2b8;
        }
        pre {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .step h3 {
            margin-top: 0;
            color: #6366f1;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Test Koneksi Database</h1>
        
        <?php
        require_once __DIR__ . '/config.php';
        $cfg = require __DIR__ . '/config.php';
        
        echo '<div class="info">';
        echo '<strong>Konfigurasi Database:</strong><br>';
        echo 'Host: ' . htmlspecialchars($cfg['host']) . '<br>';
        echo 'Database: ' . htmlspecialchars($cfg['db']) . '<br>';
        echo 'User: ' . htmlspecialchars($cfg['user']) . '<br>';
        echo 'Password: ' . (empty($cfg['pass']) ? '<em>kosong</em>' : '***') . '<br>';
        echo '</div>';
        
        // Test 1: Check if MySQL extension is loaded
        echo '<div class="step">';
        echo '<h3>1. Cek Ekstensi MySQL</h3>';
        if (extension_loaded('pdo_mysql')) {
            echo '<div class="success">✓ Ekstensi PDO MySQL tersedia</div>';
        } else {
            echo '<div class="error">✗ Ekstensi PDO MySQL tidak tersedia. Pastikan PHP sudah diinstall dengan ekstensi MySQL.</div>';
        }
        echo '</div>';
        
        // Test 2: Try to connect
        echo '<div class="step">';
        echo '<h3>2. Test Koneksi Database</h3>';
        try {
            require_once __DIR__ . '/db.php';
            $pdo = get_pdo();
            echo '<div class="success">✓ Koneksi database berhasil!</div>';
            
            // Test 3: Check if database exists and has tables
            echo '<div class="step">';
            echo '<h3>3. Cek Tabel Database</h3>';
            
            $tables = ['students', 'classes', 'registrations'];
            $allTablesExist = true;
            
            foreach ($tables as $table) {
                try {
                    $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                    if ($stmt->rowCount() > 0) {
                        $countStmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
                        $count = $countStmt->fetch()['count'];
                        echo '<div class="success">✓ Tabel <strong>' . $table . '</strong> ada (' . $count . ' baris)</div>';
                    } else {
                        echo '<div class="error">✗ Tabel <strong>' . $table . '</strong> tidak ditemukan</div>';
                        $allTablesExist = false;
                    }
                } catch (PDOException $e) {
                    echo '<div class="error">✗ Error memeriksa tabel ' . $table . ': ' . htmlspecialchars($e->getMessage()) . '</div>';
                    $allTablesExist = false;
                }
            }
            
            if ($allTablesExist) {
                echo '<div class="success" style="margin-top: 15px;"><strong>✓ Semua tabel tersedia!</strong></div>';
            } else {
                echo '<div class="error" style="margin-top: 15px;">';
                echo '<strong>✗ Beberapa tabel tidak ditemukan.</strong><br>';
                echo 'Silakan import file <code>database/schema.sql</code> ke database Anda melalui phpMyAdmin.';
                echo '</div>';
            }
            echo '</div>';
            
        } catch (PDOException $e) {
            echo '<div class="error">';
            echo '<strong>✗ Koneksi database gagal!</strong><br>';
            echo 'Error: ' . htmlspecialchars($e->getMessage()) . '<br><br>';
            
            // Provide helpful suggestions
            if (strpos($e->getMessage(), 'Unknown database') !== false) {
                echo '<strong>Solusi:</strong><br>';
                echo '1. Buka phpMyAdmin (http://localhost/phpmyadmin)<br>';
                echo '2. Buat database baru dengan nama: <code>' . htmlspecialchars($cfg['db']) . '</code><br>';
                echo '3. Import file <code>database/schema.sql</code> ke database tersebut<br>';
            } elseif (strpos($e->getMessage(), 'Access denied') !== false) {
                echo '<strong>Solusi:</strong><br>';
                echo '1. Periksa username dan password di file <code>php/config.php</code><br>';
                echo '2. Pastikan username dan password MySQL benar<br>';
                echo '3. Default XAMPP: username = <code>root</code>, password = <code>kosong</code><br>';
            } elseif (strpos($e->getMessage(), 'Connection refused') !== false || strpos($e->getMessage(), 'No connection') !== false) {
                echo '<strong>Solusi:</strong><br>';
                echo '1. Pastikan XAMPP MySQL sudah diaktifkan<br>';
                echo '2. Cek di XAMPP Control Panel apakah MySQL berstatus "Running"<br>';
                echo '3. Jika belum, klik "Start" pada MySQL<br>';
            }
            echo '</div>';
        } catch (Exception $e) {
            echo '<div class="error">';
            echo '<strong>✗ Error:</strong> ' . htmlspecialchars($e->getMessage());
            echo '</div>';
        }
        echo '</div>';
        
        // Test 4: Instructions
        echo '<div class="step">';
        echo '<h3>4. Langkah-langkah Setup</h3>';
        echo '<ol>';
        echo '<li>Pastikan XAMPP sudah terinstall dan MySQL berjalan</li>';
        echo '<li>Buka phpMyAdmin: <a href="http://localhost/phpmyadmin" target="_blank">http://localhost/phpmyadmin</a></li>';
        echo '<li>Buat database baru dengan nama: <code>' . htmlspecialchars($cfg['db']) . '</code></li>';
        echo '<li>Import file <code>database/schema.sql</code> ke database tersebut</li>';
        echo '<li>Periksa file <code>php/config.php</code> apakah username dan password sudah benar</li>';
        echo '<li>Refresh halaman ini untuk memeriksa kembali</li>';
        echo '</ol>';
        echo '</div>';
        ?>
        
        <div class="info">
            <strong>Catatan:</strong> Setelah semua test berhasil, pastikan server PHP berjalan dengan perintah:<br>
            <pre>php -S 127.0.0.1:8000 -t .</pre>
        </div>
    </div>
</body>
</html>

