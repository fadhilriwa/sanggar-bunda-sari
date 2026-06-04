<?php

function get_pdo(): PDO {
    $cfg = require __DIR__ . '/config.php';
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $cfg['host'], $cfg['db'], $cfg['charset']);
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    try {
        return new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
    } catch (PDOException $e) {
        // Provide more detailed error message
        $errorMsg = 'Database connection failed: ' . $e->getMessage();
        if (strpos($e->getMessage(), 'Unknown database') !== false) {
            $errorMsg .= ' - Database "' . $cfg['db'] . '" tidak ditemukan. Pastikan database sudah dibuat.';
        } elseif (strpos($e->getMessage(), 'Access denied') !== false) {
            $errorMsg .= ' - Username atau password salah.';
        } elseif (strpos($e->getMessage(), 'Connection refused') !== false) {
            $errorMsg .= ' - MySQL server tidak berjalan. Pastikan XAMPP MySQL sudah diaktifkan.';
        }
        throw new RuntimeException($errorMsg, 0, $e);
    }
}