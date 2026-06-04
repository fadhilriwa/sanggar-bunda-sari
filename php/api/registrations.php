<?php
/**
 * Registrations API
 * Handles CRUD operations for registrations table
 */

// Suppress errors to ensure clean JSON output
error_reporting(0);
ini_set('display_errors', 0);

// Load database connection
require_once __DIR__ . '/../db.php';

// Set JSON headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
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

// GET: Retrieve all registrations with student and class details
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->query('
            SELECT 
                r.id,
                r.student_id,
                s.name AS student_name,
                r.class_id,
                c.name AS class_name,
                DATE(r.registration_date) AS registration_date
            FROM registrations r
            JOIN students s ON s.id = r.student_id
            JOIN classes c ON c.id = r.class_id
            ORDER BY r.id DESC
        ');
        
        $registrations = $stmt->fetchAll();
        echo json_encode($registrations);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// DELETE: Remove registration
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = isset($input['id']) ? (int)$input['id'] : (isset($_GET['id']) ? (int)$_GET['id'] : null);
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Registration ID required']);
        exit;
    }

    try {
        // Check if registration exists
        $checkStmt = $pdo->prepare('SELECT id FROM registrations WHERE id = ?');
        $checkStmt->execute([$id]);
        if (!$checkStmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Registration not found']);
            exit;
        }

        // Delete registration
        $deleteStmt = $pdo->prepare('DELETE FROM registrations WHERE id = ?');
        $deleteStmt->execute([$id]);

        echo json_encode(['success' => true, 'message' => 'Registration deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Method not allowed
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);