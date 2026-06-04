<?php
/**
 * Fix JavaScript API Paths Script
 * Updates resolveApiBase function to work with relative paths
 */

$templatesDir = __DIR__ . '/templates';
$htmlFiles = glob($templatesDir . '/*.html');

echo "=== Fixing JavaScript API Paths ===\n\n";

$oldResolveApiBase = "const candidates = [
                'http://127.0.0.1:8000',
                `\${location.origin}/sistem-pendaftaran-siswa`
            ];";

$newResolveApiBase = "// Try relative path first, then absolute paths
            const candidates = [
                '../',
                `\${location.origin}/sistem-pendaftaran-siswa`
            ];";

$count = 0;
foreach ($htmlFiles as $file) {
    $filename = basename($file);
    $content = file_get_contents($file);
    
    if (strpos($content, 'http://127.0.0.1:8000') !== false) {
        // Replace the old pattern with new relative path
        $content = str_replace("'http://127.0.0.1:8000'", "'..'", $content);
        file_put_contents($file, $content);
        echo "✓ Fixed API path in: $filename\n";
        $count++;
    } else {
        echo "- Already fixed or no match: $filename\n";
    }
}

echo "\n=== Done! Fixed $count files ===\n";
