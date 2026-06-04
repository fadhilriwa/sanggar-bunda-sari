<?php
// Mock $_POST input by setting php://input for the test (complicated)
// Instead, let's just include the logic or test the logic by querying DB directly
// Actually better, let's just make a script that POSTs to the local server if possible.
// Since we don't know if the server is running on a port we can access easily from here (it says localhost/sistem-pendaftaran-siswa), 
// let's try to simple curl if possible, or just unit test the db logic.

// Let's unit test the logic by trying to verify the password hash from DB.
require 'db.php';

echo "Testing Admin Credentials...\n";
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = 'admin'");
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "User 'admin' found.\n";
    if (password_verify('admin123', $user['password'])) {
        echo "Password 'admin123' is CORRECT.\n";
    } else {
        echo "Password 'admin123' is INCORRECT.\n";
    }
} else {
    echo "User 'admin' NOT found.\n";
}
?>
