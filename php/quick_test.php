<?php
/**
 * Quick Test: Test API directly from command line
 */

echo "=== QUICK API TEST ===\n\n";

// Test 1: Database
echo "1. Database Connection...\n";
try {
    require_once __DIR__ . '/db.php';
    $pdo = get_pdo();
    echo "   ✓ Connected\n\n";
} catch (Exception $e) {
    echo "   ✗ FAILED: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Students API
echo "2. Students API (GET)...\n";
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
include __DIR__ . '/api/students.php';
$output = ob_get_clean();
$data = json_decode($output, true);
if ($data !== null) {
    echo "   ✓ Valid JSON (" . count($data) . " records)\n";
    echo "   Sample: " . (isset($data[0]['name']) ? $data[0]['name'] : 'N/A') . "\n\n";
} else {
    echo "   ✗ Invalid JSON\n";
    echo "   Output: " . substr($output, 0, 100) . "\n\n";
}

// Test 3: Classes API
echo "3. Classes API (GET)...\n";
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
include __DIR__ . '/api/classes.php';
$output = ob_get_clean();
$data = json_decode($output, true);
if ($data !== null) {
    echo "   ✓ Valid JSON (" . count($data) . " records)\n\n";
} else {
    echo "   ✗ Invalid JSON\n";
    echo "   Output: " . substr($output, 0, 100) . "\n\n";
}

// Test 4: Registrations API
echo "4. Registrations API (GET)...\n";
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
include __DIR__ . '/api/registrations.php';
$output = ob_get_clean();
$data = json_decode($output, true);
if ($data !== null) {
    echo "   ✓ Valid JSON (" . count($data) . " records)\n\n";
} else {
    echo "   ✗ Invalid JSON\n";
    echo "   Output: " . substr($output, 0, 100) . "\n\n";
}

echo "=== TEST COMPLETE ===\n";
echo "\nNext Steps:\n";
echo "1. Open browser: http://localhost/sistem-pendaftaran-siswa/test_api_connection.html\n";
echo "2. Check hasil test di browser\n";
