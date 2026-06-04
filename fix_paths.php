<?php
/**
 * Fix HTML Paths Script
 * Converts absolute paths to relative paths for XAMPP compatibility
 */

$templatesDir = __DIR__ . '/templates';
$htmlFiles = glob($templatesDir . '/*.html');

echo "=== Fixing HTML Paths ===\n\n";

foreach ($htmlFiles as $file) {
    $filename = basename($file);
    $content = file_get_contents($file);
    $original = $content;
    
    // Fix CSS and JS paths: /static/ -> ../static/
    $content = str_replace('href="/static/', 'href="../static/', $content);
    $content = str_replace('src="/static/', 'src="../static/', $content);
    
    // Fix navigation links: /templates/ -> ./
    $content = str_replace('href="/templates/', 'href="./', $content);
    
    // Fix image paths that might use /static/
    $content = str_replace('url(/static/', 'url(../static/', $content);
    
    if ($content !== $original) {
        file_put_contents($file, $content);
        echo "✓ Fixed: $filename\n";
    } else {
        echo "- No changes: $filename\n";
    }
}

// Also fix the root test file
$rootTestFile = __DIR__ . '/test_api_connection.html';
if (file_exists($rootTestFile)) {
    $content = file_get_contents($rootTestFile);
    $content = str_replace('href="/static/', 'href="./static/', $content);
    $content = str_replace('src="/static/', 'src="./static/', $content);
    file_put_contents($rootTestFile, $content);
    echo "✓ Fixed: test_api_connection.html\n";
}

echo "\n=== Done! ===\n";
echo "Now access: http://localhost/sistem-pendaftaran-siswa/templates/dashboard.html\n";
