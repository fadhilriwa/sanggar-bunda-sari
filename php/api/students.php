<?php
/**
 * Students API
 * Handles CRUD operations for students table
 */

// Suppress errors to ensure clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Load database connection
require_once __DIR__ . '/../db.php';

// Set JSON headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get database connection
try {
    $pdo = get_pdo();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
    exit;
}

// GET: Retrieve all students
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query('
            SELECT id, name, email, phone, address, gender, age, 
                   education_level, school_sd, school_smp, school_smp_address, 
                   created_at 
            FROM students 
            ORDER BY id DESC
        ');
        $students = $stmt->fetchAll();
        echo json_encode($students);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// POST: Create new student
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
        exit;
    }

    // Validate required fields
    $required = ['name', 'email', 'phone', 'address', 'gender', 'age'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            exit;
        }
    }

    try {
        $stmt = $pdo->prepare('
            INSERT INTO students 
            (name, email, phone, address, gender, age, education_level, school_sd, school_smp, school_smp_address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        
        $stmt->execute([
            trim($input['name']),
            trim($input['email']),
            trim($input['phone']),
            trim($input['address']),
            $input['gender'],
            (int)$input['age'],
            $input['education_level'] ?? null,
            $input['school_sd'] ?? null,
            $input['school_smp'] ?? null,
            $input['school_smp_address'] ?? null
        ]);
        
        echo json_encode([
            'success' => true, 
            'id' => (int)$pdo->lastInsertId(),
            'message' => 'Student created successfully'
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// PUT: Update existing student
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON body or missing ID']);
        exit;
    }

    $id = (int)$input['id'];
    
    // Validate required fields
    $required = ['name', 'email', 'phone', 'address', 'gender', 'age'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || trim($input[$field]) === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => "Missing field: $field"]);
            exit;
        }
    }

    try {
        // Check if student exists
        $checkStmt = $pdo->prepare('SELECT id FROM students WHERE id = ?');
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Student not found']);
            exit;
        }

        // Update student
        $stmt = $pdo->prepare('
            UPDATE students 
            SET name = ?, email = ?, phone = ?, address = ?, gender = ?, age = ?, 
                education_level = ?, school_sd = ?, school_smp = ?, school_smp_address = ? 
            WHERE id = ?
        ');
        
        $stmt->execute([
            trim($input['name']),
            trim($input['email']),
            trim($input['phone']),
            trim($input['address']),
            $input['gender'],
            (int)$input['age'],
            $input['education_level'] ?? null,
            $input['school_sd'] ?? null,
            $input['school_smp'] ?? null,
            $input['school_smp_address'] ?? null,
            $id
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Student updated successfully']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// DELETE: Remove student
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Student ID required']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        
        // Check if student exists
        $checkStmt = $pdo->prepare('SELECT id FROM students WHERE id = ?');
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Student not found']);
            exit;
        }

        // Delete related registrations first (cascade)
        $deleteRegStmt = $pdo->prepare('DELETE FROM registrations WHERE student_id = ?');
        $deleteRegStmt->execute([$id]);

        // Delete student
        $deleteStmt = $pdo->prepare('DELETE FROM students WHERE id = ?');
        $deleteStmt->execute([$id]);

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Student deleted successfully']);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);