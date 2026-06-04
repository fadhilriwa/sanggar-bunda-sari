<?php
// =====================================================
// API: Cek Status Pembayaran
// File: php/api/midtrans_check_status.php
// Method: GET ?order_id=xxx  atau  GET ?registration_no=xxx
// =====================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../midtrans_config.php';
require_once __DIR__ . '/../db.php';

function sendError(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $msg]);
    exit;
}

// -------------------------------------------------------
// Ambil parameter pencarian
// -------------------------------------------------------
$orderId        = $_GET['order_id']        ?? null;
$registrationNo = $_GET['registration_no'] ?? null;

if (!$orderId && !$registrationNo) {
    sendError('Parameter order_id atau registration_no diperlukan.');
}

// -------------------------------------------------------
// Query ke database lokal
// -------------------------------------------------------
try {
    $pdo = get_pdo();

    if ($orderId) {
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE midtrans_order_id = ? LIMIT 1");
        $stmt->execute([$orderId]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE registration_no = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$registrationNo]);
    }

    $payment = $stmt->fetch();

    if (!$payment) {
        // Jika tidak ditemukan di DB, coba query langsung ke Midtrans API
        if ($orderId) {
            $midtransStatus = queryMidtransStatus($orderId);
            if ($midtransStatus) {
                echo json_encode(['success' => true, 'source' => 'midtrans_api', 'data' => $midtransStatus]);
                exit;
            }
        }
        sendError('Data pembayaran tidak ditemukan.', 404);
    }

    // Jika status masih pending, coba refresh dari Midtrans
    if ($payment['status'] === 'pending' && !empty($payment['midtrans_order_id'])) {
        $midtransStatus = queryMidtransStatus($payment['midtrans_order_id']);
        if ($midtransStatus && isset($midtransStatus['transaction_status'])) {
            // Sinkronkan status ke DB (opsional, biarkan notifikasi yang update)
            $payment['midtrans_live_status'] = $midtransStatus['transaction_status'];
        }
    }

    // Hapus data sensitif sebelum dikirim ke frontend
    unset($payment['midtrans_response'], $payment['snap_token']);

    echo json_encode([
        'success' => true,
        'source'  => 'database',
        'data'    => $payment
    ]);

} catch (Exception $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}

// -------------------------------------------------------
// Helper: Query status transaksi ke Midtrans API
// -------------------------------------------------------
function queryMidtransStatus(string $orderId): ?array {
    $baseUrl = MIDTRANS_IS_PRODUCTION
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com';

    $url = $baseUrl . '/v2/' . urlencode($orderId) . '/status';
    $auth = 'Basic ' . base64_encode(MIDTRANS_SERVER_KEY . ':');

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Accept: application/json',
            'Authorization: ' . $auth,
        ],
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        return json_decode($response, true);
    }
    return null;
}
