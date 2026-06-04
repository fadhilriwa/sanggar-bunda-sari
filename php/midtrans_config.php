<?php
// =====================================================
// Konfigurasi Midtrans Sandbox
// =====================================================
// PENTING: Ganti dengan Server Key & Client Key Anda
// dari dashboard.sandbox.midtrans.com
// =====================================================

define('MIDTRANS_SERVER_KEY', 'SB-Mid-server-GANTI_DENGAN_SERVER_KEY_ANDA');
define('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-GANTI_DENGAN_CLIENT_KEY_ANDA');
define('MIDTRANS_IS_PRODUCTION', false); // false = Sandbox, true = Production

// URL API Midtrans (otomatis sesuai mode)
define('MIDTRANS_BASE_URL', MIDTRANS_IS_PRODUCTION
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'
);

// URL Notification (URL publik website Anda yang bisa diakses Midtrans)
// Untuk sandbox lokal, gunakan ngrok atau biarkan kosong dulu
define('MIDTRANS_NOTIFICATION_URL', 'http://localhost/Website-Sanggar-Bunda-Sari/php/api/midtrans_notification.php');

// URL redirect setelah pembayaran
define('MIDTRANS_FINISH_URL',  'http://localhost/Website-Sanggar-Bunda-Sari/templates/payment_status.html?status=success');
define('MIDTRANS_UNFINISH_URL','http://localhost/Website-Sanggar-Bunda-Sari/templates/payment_status.html?status=pending');
define('MIDTRANS_ERROR_URL',   'http://localhost/Website-Sanggar-Bunda-Sari/templates/payment_status.html?status=failed');

// Biaya pendaftaran default (Rupiah)
define('BIAYA_PENDAFTARAN', 150000);
