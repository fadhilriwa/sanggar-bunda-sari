<?php
header('Content-Type: text/plain');
$cfg = require __DIR__ . '/config.php';

try {
    $dsn = "mysql:host={$cfg['host']};dbname={$cfg['db']};charset={$cfg['charset']}";
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get class IDs
    $stmt = $pdo->query("SELECT id, name FROM classes");
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($classes)) {
        die("Error: No classes found. Please seed classes first.\n");
    }

    echo "Found " . count($classes) . " classes.\n";
    echo "Seeding 20 students...\n";

    $names = [
        "Ahmad", "Budi", "Chandra", "Dewi", "Eka", "Fajar", "Gita", "Hana", "Indra", "Joko",
        "Kartika", "Lestari", "Mega", "Nina", "Oscar", "Putri", "Rina", "Sari", "Tono", "Wulan"
    ]; 
    $genders = ['Laki-laki', 'Perempuan'];

    $pdo->beginTransaction();

    for ($i = 0; $i < 20; $i++) {
        $name = $names[$i];
        $email = strtolower($name) . rand(100,999) . "@example.com";
        $phone = "0812345678" . sprintf("%02d", $i);
        $gender = $genders[$i % 2];
        $age = rand(6, 12);
        
        // Match schema: name, email, phone, address, gender, age
        $sql = "INSERT INTO students (name, email, phone, address, gender, age, education_level, school_sd) 
                VALUES (?, ?, ?, 'Jl. Contoh No. $i', ?, ?, 'SD', 'SDN 01 Jakarta')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $phone, $gender, $age]);
        $studentId = $pdo->lastInsertId();

        // Create 1-3 random registrations per student
        $numReg = rand(1, 3);
        $shuffledClasses = $classes;
        shuffle($shuffledClasses);
        
        for ($j = 0; $j < $numReg; $j++) {
            $cls = $shuffledClasses[$j];
            // Match schema: student_id, class_id, registration_date
            $sqlReg = "INSERT INTO registrations (student_id, class_id, registration_date) 
                       VALUES (?, ?, NOW() - INTERVAL FLOOR(RAND() * 30) DAY)";
            $stmtReg = $pdo->prepare($sqlReg);
            $stmtReg->execute([$studentId, $cls['id']]);
        }
        echo "Created Student: $name ($gender, $age th) with $numReg classes.\n";
    }

    $pdo->commit();
    echo "\n[SUCCESS] Added 20 students and their registrations.\n";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "[ERROR] " . $e->getMessage() . "\n";
}
