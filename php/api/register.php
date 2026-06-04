<?php
/**
 * Register API
 * Handles linking students to classes (registrations table)
 */

// Suppress errors to ensure clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Load database connection
require_once __DIR__ . '/../db.php';

// Set JSON headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Ensure POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Get database connection
try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Decode input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

// Validate required fields - accept 'classes', 'class_ids', or 'kelas_ids'
$classField = isset($input['classes']) ? 'classes'
    : (isset($input['class_ids']) ? 'class_ids'
    : (isset($input['kelas_ids']) ? 'kelas_ids' : null));

if (!isset($input['student_id']) || !$classField) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Missing student_id or classes']);
    exit;
}

$studentId = (int)$input['student_id'];
$classIds = $input[$classField];

if (!is_array($classIds) || empty($classIds)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Classes must be a non-empty array']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Verify student exists
    $checkStudent = $pdo->prepare('SELECT id FROM students WHERE id = ?');
    $checkStudent->execute([$studentId]);
    if (!$checkStudent->fetch()) {
        throw new RuntimeException('Student not found');
    }

    // Prepare statements
    $checkClass = $pdo->prepare('SELECT id, capacity FROM classes WHERE id = ?');
    
    // Check if registration already exists to prevent duplicates
    $checkReg = $pdo->prepare('SELECT id FROM registrations WHERE student_id = ? AND class_id = ?');
    
    $insertReg = $pdo->prepare('INSERT INTO registrations (student_id, class_id) VALUES (?, ?)');

    foreach ($classIds as $cid) {
        $cid = (int)$cid;
        
        // Check class validity
        $checkClass->execute([$cid]);
        $classData = $checkClass->fetch();
        if (!$classData) {
            throw new RuntimeException("Class ID $cid not found");
        }
        
        // Check duplicate
        $checkReg->execute([$studentId, $cid]);
        if ($checkReg->fetch()) {
            // Already registered - skip or throw error? Let's skip safely
            continue;
        }

        // Insert
        $insertReg->execute([$studentId, $cid]);
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Registration successful']);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}