<?php
// =====================================================
// API: Midtrans Payment Notification / Webhook Handler
// File: php/api/midtrans_notification.php
// Method: POST (dipanggil otomatis oleh Midtrans)
// =====================================================
//
// ⚠️  URL ini harus bisa diakses publik oleh Midtrans!
//     Untuk development lokal, gunakan ngrok:
//     ngrok http 80
//     Lalu set URL ngrok di dashboard Midtrans > Settings > Payment Notification
//
// =====================================================

// Nonaktifkan output error ke response (catat ke log saja)
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../midtrans_config.php';
require_once __DIR__ . '/../db.php';

// Log helper
function writeLog(string $msg): void {
    $logFile = __DIR__ . '/../../logs/midtrans_' . date('Y-m-d') . '.log';
    @mkdir(dirname($logFile), 0755, true);
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

// -------------------------------------------------------
// 1. Baca payload notifikasi dari Midtrans
// -------------------------------------------------------
$raw  = file_get_contents('php://input');
$notif = json_decode($raw, true);

writeLog('NOTIF RECEIVED: ' . $raw);

if (!$notif || empty($notif['order_id'])) {
    writeLog('ERROR: Payload kosong atau tidak valid.');
    http_response_code(400);
    echo json_encode(['message' => 'Invalid payload']);
    exit;
}

$orderId           = $notif['order_id'];
$statusCode        = $notif['status_code'] ?? '';
$grossAmount       = $notif['gross_amount'] ?? '0';
$signatureKeyInput = $notif['signature_key'] ?? '';
$transactionStatus = $notif['transaction_status'] ?? '';
$fraudStatus       = $notif['fraud_status'] ?? '';
$paymentType       = $notif['payment_type'] ?? '';
$transactionId     = $notif['transaction_id'] ?? '';
$transactionTime   = $notif['transaction_time'] ?? null;

// -------------------------------------------------------
// 2. Verifikasi Signature Key (keamanan)
// Rumus: SHA512( order_id + status_code + gross_amount + server_key )
// -------------------------------------------------------
$expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . MIDTRANS_SERVER_KEY);

if (!hash_equals($expectedSignature, $signatureKeyInput)) {
    writeLog('ERROR: Signature tidak cocok untuk order_id=' . $orderId);
    http_response_code(403);
    echo json_encode(['message' => 'Invalid signature']);
    exit;
}

writeLog('Signature OK untuk order_id=' . $orderId . ', status=' . $transactionStatus . ', fraud=' . $fraudStatus);

// -------------------------------------------------------
// 3. Tentukan status pembayaran internal
// -------------------------------------------------------
// Referensi: https://docs.midtrans.com/reference/transaction-status
$paymentStatus = 'pending'; // default

if ($transactionStatus === 'capture') {
    $paymentStatus = ($fraudStatus === 'accept') ? 'success' : 'challenge';
} elseif ($transactionStatus === 'settlement') {
    $paymentStatus = 'success';
} elseif (in_array($transactionStatus, ['cancel', 'deny', 'failure'])) {
    $paymentStatus = 'failed';
} elseif ($transactionStatus === 'expire') {
    $paymentStatus = 'expired';
} elseif ($transactionStatus === 'pending') {
    $paymentStatus = 'pending';
}

// Tentukan waktu bayar
$paidAt = null;
if ($paymentStatus === 'success' && $transactionTime) {
    $paidAt = date('Y-m-d H:i:s', strtotime($transactionTime));
}

// -------------------------------------------------------
// 4. Update database
// -------------------------------------------------------
try {
    $pdo = get_pdo();

    $stmt = $pdo->prepare(
        "UPDATE payments SET
            status = ?,
            payment_type = ?,
            transaction_id = ?,
            midtrans_response = ?,
            paid_at = ?,
            updated_at = NOW()
         WHERE midtrans_order_id = ?"
    );
    $affected = $stmt->execute([
        $paymentStatus,
        $paymentType,
        $transactionId,
        json_encode($notif),
        $paidAt,
        $orderId
    ]);

    if ($stmt->rowCount() === 0) {
        writeLog('WARNING: Tidak ada baris ter-update untuk order_id=' . $orderId . ' — mungkin belum ada di DB.');
    } else {
        writeLog("DB UPDATE OK: order_id=$orderId status=$paymentStatus payment_type=$paymentType");
    }

    // -------------------------------------------------------
    // 5. (Opsional) Kirim email konfirmasi jika sukses
    // -------------------------------------------------------
    if ($paymentStatus === 'success') {
        // Ambil data siswa dari DB untuk email
        $stmtGet = $pdo->prepare("SELECT * FROM payments WHERE midtrans_order_id = ? LIMIT 1");
        $stmtGet->execute([$orderId]);
        $paymentData = $stmtGet->fetch();

        if ($paymentData) {
            writeLog("Pembayaran SUKSES: {$paymentData['student_name']} ({$paymentData['student_email']}) "
                . "Rp " . number_format($paymentData['amount'], 0, ',', '.'));
            // TODO: Panggil fungsi send_email($paymentData) di sini jika diperlukan
        }
    }

} catch (Exception $e) {
    writeLog('DB ERROR: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Database error']);
    exit;
}

// -------------------------------------------------------
// 6. Respon OK ke Midtrans
// -------------------------------------------------------
http_response_code(200);
echo json_encode([
    'message'    => 'Notification processed',
    'order_id'   => $orderId,
    'new_status' => $paymentStatus
]);
