<?php
/**
 * Comprehensive API Tester
 * Tests all API endpoints and reports detailed errors
 */

echo "=== API DIAGNOSTICS ===\n\n";

// Test 1: Database Connection
echo "1. Testing Database Connection...\n";
try {
    require_once __DIR__ . '/db.php';
    $pdo = get_pdo();
    echo "✓ Database connection: OK\n\n";
} catch (Exception $e) {
    echo "✗ Database connection: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 2: Check Tables
echo "2. Checking Tables...\n";
$tables = ['students', 'classes', 'registrations', 'users'];
foreach ($tables as $table) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
        $row = $stmt->fetch();
        echo "✓ Table '$table': {$row['count']} rows\n";
    } catch (Exception $e) {
        echo "✗ Table '$table': ERROR - " . $e->getMessage() . "\n";
    }
}
echo "\n";

// Test 3: Test students.php
echo "3. Testing students.php GET...\n";
ob_start();
$_SERVER['REQUEST_METHOD'] = 'GET';
try {
    include __DIR__ . '/api/students.php';
    $output = ob_get_clean();
    $decoded = json_decode($output, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✓ students.php: Valid JSON returned (" . count($decoded) . " students)\n";
    } else {
        echo "✗ students.php: Invalid JSON\n";
        echo "Output: " . substr($output, 0, 200) . "\n";
    }
} catch (Exception $e) {
    ob_end_clean();
    echo "✗ students.php: EXCEPTION - " . $e->getMessage() . "\n";
}
echo "\n";

// Test 4: Test classes.php
echo "4. Testing classes.php GET...\n";
ob_start();
$_SERVER['REQUEST_METHOD'] = 'GET';
try {
    include __DIR__ . '/api/classes.php';
    $output = ob_get_clean();
    $decoded = json_decode($output, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✓ classes.php: Valid JSON returned (" . count($decoded) . " classes)\n";
    } else {
        echo "✗ classes.php: Invalid JSON\n";
        echo "Output: " . substr($output, 0, 200) . "\n";
    }
} catch (Exception $e) {
    ob_end_clean();
    echo "✗ classes.php: EXCEPTION - " . $e->getMessage() . "\n";
}
echo "\n";

// Test 5: Test registrations.php
echo "5. Testing registrations.php GET...\n";
ob_start();
$_SERVER['REQUEST_METHOD'] = 'GET';
try {
    include __DIR__ . '/api/registrations.php';
    $output = ob_get_clean();
    $decoded = json_decode($output, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✓ registrations.php: Valid JSON returned (" . count($decoded) . " registrations)\n";
    } else {
        echo "✗ registrations.php: Invalid JSON\n";
        echo "Output: " . substr($output, 0, 200) . "\n";
    }
} catch (Exception $e) {
    ob_end_clean();
    echo "✗ registrations.php: EXCEPTION - " . $e->getMessage() . "\n";
}
echo "\n";

echo "=== DIAGNOSTIC COMPLETE ===\n";
