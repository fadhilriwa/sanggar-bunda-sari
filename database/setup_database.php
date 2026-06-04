<?php
/**
 * Database Setup Script for Sanggar Bunda Sari
 * 
 * This script will:
 * 1. Create the database if it doesn't exist
 * 2. Create all required tables
 * 3. Seed default classes data
 * 4. Verify the setup
 */

// Load configuration
$config = require __DIR__ . '/../php/config.php';

// Connect to MySQL server (without selecting database)
$dsn = sprintf('mysql:host=%s;charset=%s', $config['host'], $config['charset']);
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

$output = [];
$hasError = false;

try {
    $output[] = "Connecting to MySQL server...";
    $pdo = new PDO($dsn, $config['user'], $config['pass'], $options);
    $output[] = "✓ Connected to MySQL server successfully!";
    
    // Create database
    $output[] = "\nCreating database '{$config['db']}'...";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['db']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $output[] = "✓ Database created/verified!";
    
    // Select the database
    $pdo->exec("USE `{$config['db']}`");
    
    // Read and execute schema.sql
    $output[] = "\nCreating tables...";
    $schemaPath = __DIR__ . '/schema.sql';
    
    if (!file_exists($schemaPath)) {
        throw new Exception("Schema file not found: $schemaPath");
    }
    
    $schema = file_get_contents($schemaPath);
    
    // Split by semicolon and execute each statement
    $statements = array_filter(
        array_map('trim', explode(';', $schema)),
        function($stmt) {
            return !empty($stmt) && 
                   !preg_match('/^--/', $stmt) && 
                   !preg_match('/^CREATE DATABASE/', $stmt) &&
                   !preg_match('/^USE /', $stmt);
        }
    );
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    $output[] = "✓ Tables created successfully!";
    
    // Check if classes table is empty and seed if needed
    $output[] = "\nChecking classes data...";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM classes");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        $output[] = "Seeding default classes...";
        
        $defaults = [
            ['Calistung', 'Dasar', 'Senin 15:00', 20, 150000.00],
            ['Matematika Kelas 1', 'Matematika', 'Selasa 15:00', 20, 200000.00],
            ['Matematika Kelas 2', 'Matematika', 'Rabu 15:00', 20, 200000.00],
            ['Matematika Kelas 3', 'Matematika', 'Kamis 15:00', 20, 200000.00],
            ['Matematika Kelas 4', 'Matematika', 'Jumat 15:00', 20, 200000.00],
            ['Matematika Kelas 5', 'Matematika', 'Sabtu 09:00', 20, 200000.00],
            ['Matematika Kelas 6', 'Matematika', 'Sabtu 11:00', 20, 200000.00],
            ['Bahasa Inggris Kelas 1', 'Bahasa Inggris', 'Senin 16:30', 20, 200000.00],
            ['Bahasa Inggris Kelas 2', 'Bahasa Inggris', 'Selasa 16:30', 20, 200000.00],
            ['Bahasa Inggris Kelas 3', 'Bahasa Inggris', 'Rabu 16:30', 20, 200000.00],
            ['Bahasa Inggris Kelas 4', 'Bahasa Inggris', 'Kamis 16:30', 20, 200000.00],
            ['Bahasa Inggris Kelas 5', 'Bahasa Inggris', 'Jumat 16:30', 20, 200000.00],
            ['Bahasa Inggris Kelas 6', 'Bahasa Inggris', 'Sabtu 13:00', 20, 200000.00],
            ['Melukis', 'Seni', 'Minggu 09:00', 15, 180000.00],
        ];
        
        $insertStmt = $pdo->prepare('INSERT INTO classes (name, category, schedule, capacity, price) VALUES (?, ?, ?, ?, ?)');
        
        foreach ($defaults as $class) {
            $insertStmt->execute($class);
        }
        
        $output[] = "✓ Seeded " . count($defaults) . " default classes!";
    } else {
        $output[] = "✓ Classes table already has $count classes.";
    }
    
    // Verify tables exist
    $output[] = "\n=== Verification ===";
    $tables = ['students', 'classes', 'registrations'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $countStmt->fetch()['count'];
            $output[] = "✓ Table '$table' exists with $count records";
        } else {
            $output[] = "✗ Table '$table' NOT found!";
            $hasError = true;
        }
    }
    
    if (!$hasError) {
        $output[] = "\n🎉 Database setup completed successfully!";
        $output[] = "\nNext steps:";
        $output[] = "1. Make sure XAMPP Apache is running";
        $output[] = "2. Open test_api.html to verify all API endpoints";
        $output[] = "3. Try registering a student from the frontend";
    }
    
} catch (PDOException $e) {
    $hasError = true;
    $output[] = "\n✗ ERROR: " . $e->getMessage();
    
    if (strpos($e->getMessage(), 'Access denied') !== false) {
        $output[] = "\nTroubleshooting:";
        $output[] = "- Check MySQL username and password in php/config.php";
        $output[] = "- Default XAMPP MySQL user is 'root' with empty password";
    } elseif (strpos($e->getMessage(), 'Connection refused') !== false) {
        $output[] = "\nTroubleshooting:";
        $output[] = "- Make sure XAMPP MySQL service is running";
        $output[] = "- Open XAMPP Control Panel and start MySQL";
    }
} catch (Exception $e) {
    $hasError = true;
    $output[] = "\n✗ ERROR: " . $e->getMessage();
}

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Setup - Sanggar Bunda Sari</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 2rem;
        }
        
        .output {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.8;
            white-space: pre-wrap;
            margin: 20px 0;
            border-left: 4px solid <?php echo $hasError ? '#dc3545' : '#28a745'; ?>;
        }
        
        .success {
            color: #28a745;
            font-weight: bold;
        }
        
        .error {
            color: #dc3545;
            font-weight: bold;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 20px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #5568d3;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗄️ Database Setup</h1>
        <p>Setting up database for Sanggar Bunda Sari...</p>
        
        <div class="output <?php echo $hasError ? 'error' : 'success'; ?>">
<?php echo htmlspecialchars(implode("\n", $output)); ?>
        </div>
        
        <div class="actions">
            <?php if (!$hasError): ?>
                <a href="../test_api.html" class="btn">Test API Endpoints</a>
                <a href="../templates/index.html" class="btn btn-secondary">Go to Homepage</a>
            <?php else: ?>
                <a href="setup_database.php" class="btn">Try Again</a>
                <a href="../BACKEND_SETUP.md" class="btn btn-secondary">View Documentation</a>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>
