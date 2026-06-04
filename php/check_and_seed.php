<?php
header('Content-Type: text/plain');
$cfg = require __DIR__ . '/config.php';

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['db']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $tables = ['students', 'classes', 'registrations'];
    echo "Current Table Status:\n";
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "- {$table}: {$count} rows\n";
    }

    // Check if classes are empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM classes");
    if ($stmt->fetchColumn() == 0) {
        echo "\n[INFO] 'classes' table is empty. Seeding data...\n";
        
        $sql = file_get_contents(__DIR__ . '/../database/seed_classes.sql');
        if ($sql) {
            // Remove 'USE sanggar_bunda_sari;' lines if any, to avoid error if DB name differs in config
            $sql = preg_replace('/^USE.*;$/m', '', $sql);
            
            $pdo->exec($sql);
            echo "[SUCCESS] Seeded 'classes' table.\n";
        } else {
            echo "[ERROR] Could not read seed_classes.sql\n";
        }
    } else {
        echo "\n[INFO] 'classes' table already has data. Skipping seed.\n";
    }
    
    // Check if students/registrations are empty and suggest generating data
    $stmt = $pdo->query("SELECT COUNT(*) FROM students");
    if ($stmt->fetchColumn() == 0) {
        echo "\n[suggestion] You should run 'python generate_sample_data.py' to add students and registrations.\n";
    }

} catch (PDOException $e) {
    echo "[ERROR] Database error: " . $e->getMessage() . "\n";
}
