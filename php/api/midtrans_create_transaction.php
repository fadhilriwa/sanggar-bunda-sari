<?php
// =====================================================
// API: Buat Transaksi Midtrans Snap
// File: php/api/midtrans_create_transaction.php
// Method: POST
// =====================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Load konfigurasi
require_once __DIR__ . '/../midtrans_config.php';
require_once __DIR__ . '/../db.php';

// -------------------------------------------------------
// Helper: kirim JSON error
// -------------------------------------------------------
function sendError(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

// -------------------------------------------------------
// 1. Baca & validasi payload dari frontend
// -------------------------------------------------------
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (!$body) {
    sendError('Request body tidak valid atau bukan JSON.');
}

$required = ['student_name', 'student_email', 'student_phone', 'registration_no', 'amount'];
foreach ($required as $field) {
    if (empty($body[$field])) {
        sendError("Field '$field' wajib diisi.");
    }
}

$studentName    = trim($body['student_name']);
$studentEmail   = trim($body['student_email']);
$studentPhone   = trim($body['student_phone']);
$registrationNo = trim($body['registration_no']);
$amount         = (int) $body['amount'];
$studentId      = isset($body['student_id']) ? (int)$body['student_id'] : null;
$classNames     = isset($body['class_names']) ? (array)$body['class_names'] : ['Biaya Pendaftaran Siswa Baru'];

// Validasi dasar
if (!filter_var($studentEmail, FILTER_VALIDATE_EMAIL)) {
    sendError('Format email tidak valid.');
}
if ($amount < 1000) {
    sendError('Jumlah pembayaran minimal Rp 1.000.');
}

// -------------------------------------------------------
// 2. Cek apakah sudah ada pembayaran pending/success
// -------------------------------------------------------
try {
    $pdo = get_pdo();

    $stmtCheck = $pdo->prepare(
        "SELECT id, status, snap_token FROM payments WHERE registration_no = ? LIMIT 1"
    );
    $stmtCheck->execute([$registrationNo]);
    $existing = $stmtCheck->fetch();

    if ($existing) {
        if ($existing['status'] === 'success') {
            sendError('Pembayaran untuk nomor pendaftaran ini sudah berhasil.', 409);
        }
        // Jika masih pending, kembalikan snap_token yang lama jika masih ada
        if ($existing['status'] === 'pending' && !empty($existing['snap_token'])) {
            echo json_encode([
                'success'         => true,
                'snap_token'      => $existing['snap_token'],
                'registration_no' => $registrationNo,
                'reused'          => true,
                'message'         => 'Menggunakan token pembayaran yang sudah ada.'
            ]);
            exit;
        }
    }
} catch (Exception $e) {
    sendError('Gagal memeriksa data pembayaran: ' . $e->getMessage(), 500);
}

// -------------------------------------------------------
// 3. Bangun payload untuk Midtrans Snap API
// -------------------------------------------------------
// Order ID harus unik — gabungkan registration_no + timestamp
$orderId = $registrationNo . '-' . time();

// Item detail: satu item per kelas yang dipilih
$itemDetails = [];
if (count($classNames) > 0) {
    $perClassAmount = (int) floor($amount / count($classNames));
    $remainder      = $amount - ($perClassAmount * count($classNames));

    foreach ($classNames as $i => $className) {
        $itemAmount = $perClassAmount + ($i === 0 ? $remainder : 0); // sisa di item pertama
        $itemDetails[] = [
            'id'       => 'CLASS-' . ($i + 1),
            'price'    => $itemAmount,
            'quantity' => 1,
            'name'     => substr($className, 0, 50), // max 50 karakter
        ];
    }
} else {
    $itemDetails[] = [
        'id'       => 'REG-FEE',
        'price'    => $amount,
        'quantity' => 1,
        'name'     => 'Biaya Pendaftaran Siswa Baru',
    ];
}

$payload = [
    'transaction_details' => [
        'order_id'     => $orderId,
        'gross_amount' => $amount,
    ],
    'item_details'     => $itemDetails,
    'customer_details' => [
        'first_name' => $studentName,
        'email'      => $studentEmail,
        'phone'      => $studentPhone,
    ],
    'callbacks' => [
        'finish' => MIDTRANS_FINISH_URL . '&order_id=' . urlencode($orderId),
    ],
];

// -------------------------------------------------------
// 4. Kirim request ke Midtrans Snap API
// -------------------------------------------------------
$authHeader = 'Basic ' . base64_encode(MIDTRANS_SERVER_KEY . ':');
$jsonPayload = json_encode($payload);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => MIDTRANS_BASE_URL,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $jsonPayload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: ' . $authHeader,
    ],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response   = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError  = curl_error($ch);
curl_close($ch);

if ($curlError) {
    sendError('Koneksi ke Midtrans gagal: ' . $curlError, 502);
}

$midtransData = json_decode($response, true);

if ($httpCode !== 201 || empty($midtransData['token'])) {
    $errMsg = isset($midtransData['error_messages'])
        ? implode(', ', $midtransData['error_messages'])
        : 'Gagal membuat transaksi Midtrans (HTTP ' . $httpCode . ')';
    sendError($errMsg, 502);
}

$snapToken  = $midtransData['token'];
$redirectUrl = $midtransData['redirect_url'] ?? null;

// -------------------------------------------------------
// 5. Simpan data pembayaran ke database
// -------------------------------------------------------
try {
    if ($existing) {
        // Update record yang sudah ada
        $stmtSave = $pdo->prepare(
            "UPDATE payments SET
                snap_token = ?,
                midtrans_order_id = ?,
                amount = ?,
                student_name = ?,
                student_email = ?,
                student_phone = ?,
                status = 'pending',
                updated_at = NOW()
             WHERE registration_no = ?"
        );
        $stmtSave->execute([
            $snapToken, $orderId, $amount,
            $studentName, $studentEmail, $studentPhone,
            $registrationNo
        ]);
    } else {
        // Insert record baru
        $stmtSave = $pdo->prepare(
            "INSERT INTO payments
                (registration_no, student_id, student_name, student_email, student_phone,
                 amount, snap_token, midtrans_order_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
        );
        $stmtSave->execute([
            $registrationNo, $studentId,
            $studentName, $studentEmail, $studentPhone,
            $amount, $snapToken, $orderId
        ]);
    }
} catch (Exception $e) {
    // Transaksi sudah dibuat di Midtrans — kembalikan token meski DB gagal
    error_log('[Midtrans] DB save error: ' . $e->getMessage());
}

// -------------------------------------------------------
// 6. Kembalikan snap token ke frontend
// -------------------------------------------------------
echo json_encode([
    'success'         => true,
    'snap_token'      => $snapToken,
    'redirect_url'    => $redirectUrl,
    'order_id'        => $orderId,
    'registration_no' => $registrationNo,
    'amount'          => $amount,
    'message'         => 'Transaksi berhasil dibuat.'
]);
