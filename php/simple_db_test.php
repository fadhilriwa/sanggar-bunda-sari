<?php
require_once __DIR__ . '/db.php';
$pdo = get_pdo();

$tables = ['registrations', 'classes', 'students'];
foreach ($tables as $table) {
    echo "--- Table: $table ---\n";
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM $table");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo implode(', ', $cols) . "\n";
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
