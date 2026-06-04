<?php
/**
 * Login API - Admin authentication
 */

// Suppress errors to ensure clean JSON
error_reporting(0);
ini_set('display_errors', 0);

session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../db.php';

try {
    $pdo = get_pdo();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username dan password wajib diisi']);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username dan password tidak boleh kosong']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, username, password, name, email, role FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['name'] = $user['name'] ?? $user['username'];
        $_SESSION['role'] = $user['role'] ?? 'admin';
        try { $pdo->prepare("UPDATE users SET last_login=NOW() WHERE id=?")->execute([$user['id']]); } catch(Exception $e){}
        echo json_encode(['success' => true, 'message' => 'Login berhasil', 'user' => ['id'=>$user['id'],'username'=>$user['username'],'name'=>$user['name']??'Admin','role'=>$user['role']??'admin']]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Username atau password salah']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
