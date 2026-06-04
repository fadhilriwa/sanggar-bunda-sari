<?php
/**
 * Test Algoritma Apriori
 * File ini untuk testing dan demonstrasi algoritma Apriori
 * Akses: http://127.0.0.1:8000/php/test_apriori.php
 */

header('Content-Type: text/html; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/apriori.php';

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Algoritma Apriori</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 10px;
        }
        h2 {
            color: #6366f1;
            margin-top: 30px;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #28a745;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #dc3545;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #17a2b8;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border: 1px solid #dee2e6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        th {
            background: #6366f1;
            color: white;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-success {
            background: #28a745;
            color: white;
        }
        .badge-warning {
            background: #ffc107;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Test Algoritma Apriori</h1>
        
        <?php
        try {
            $pdo = get_pdo();
            echo '<div class="success">✓ Koneksi database berhasil!</div>';
            
            // Ambil data transaksi
            $sql = 'SELECT r.student_id, GROUP_CONCAT(r.class_id ORDER BY r.class_id) as class_ids,
                           GROUP_CONCAT(c.name ORDER BY r.class_id) as class_names
                    FROM registrations r
                    JOIN classes c ON c.id = r.class_id
                    WHERE r.status = "active"
                    GROUP BY r.student_id
                    HAVING COUNT(r.class_id) > 0';
            
            $stmt = $pdo->query($sql);
            $rows = $stmt->fetchAll();
            
            // Transform ke format transaksi
            $transactions = [];
            $classMap = [];
            
            foreach ($rows as $row) {
                $classIds = array_map('intval', explode(',', $row['class_ids']));
                $classNames = explode(',', $row['class_names']);
                
                if (count($classIds) > 0) {
                    $transactions[] = $classIds;
                    
                    // Build class map
                    foreach ($classIds as $idx => $id) {
                        if (!isset($classMap[$id])) {
                            $classMap[$id] = $classNames[$idx] ?? "Kelas $id";
                        }
                    }
                }
            }
            
            echo '<div class="info">';
            echo '<strong>Data Transaksi:</strong><br>';
            echo 'Total transaksi: <strong>' . count($transactions) . '</strong><br>';
            echo 'Total kelas unik: <strong>' . count($classMap) . '</strong>';
            echo '</div>';
            
            if (count($transactions) < 3) {
                echo '<div class="error">';
                echo '<strong>⚠ Data transaksi masih kurang!</strong><br>';
                echo 'Minimum 3 transaksi diperlukan untuk generate rekomendasi.<br>';
                echo 'Silakan daftarkan beberapa siswa dengan kelas yang berbeda terlebih dahulu.';
                echo '</div>';
            } else {
                // Test Apriori
                $minSupport = 0.2;
                $minConfidence = 0.4;
                
                echo '<h2>1. Konfigurasi Algoritma</h2>';
                echo '<div class="info">';
                echo 'Minimum Support: <strong>' . ($minSupport * 100) . '%</strong><br>';
                echo 'Minimum Confidence: <strong>' . ($minConfidence * 100) . '%</strong>';
                echo '</div>';
                
                // Generate frequent itemsets
                $apriori = new AprioriAlgorithm($transactions, $minSupport, $minConfidence);
                $frequentItemsets = $apriori->generateFrequentItemsets();
                
                echo '<h2>2. Frequent Itemsets</h2>';
                if (empty($frequentItemsets)) {
                    echo '<div class="error">Tidak ada frequent itemsets yang ditemukan. Coba turunkan minimum support.</div>';
                } else {
                    echo '<table>';
                    echo '<tr><th>Level</th><th>Itemset</th><th>Support</th><th>Count</th></tr>';
                    foreach ($frequentItemsets as $level => $itemsets) {
                        foreach ($itemsets as $itemset) {
                            $items = array_map(function($id) use ($classMap) {
                                return $classMap[$id] ?? "Kelas $id";
                            }, $itemset['items']);
                            echo '<tr>';
                            echo '<td><strong>L' . $level . '</strong></td>';
                            echo '<td>' . implode(', ', $items) . '</td>';
                            echo '<td>' . round($itemset['support'] * 100, 2) . '%</td>';
                            echo '<td>' . $itemset['count'] . '</td>';
                            echo '</tr>';
                        }
                    }
                    echo '</table>';
                }
                
                // Generate association rules
                $rules = $apriori->generateAssociationRules($frequentItemsets);
                
                echo '<h2>3. Association Rules</h2>';
                if (empty($rules)) {
                    echo '<div class="error">Tidak ada association rules yang ditemukan. Coba turunkan minimum confidence.</div>';
                } else {
                    echo '<p>Total rules: <strong>' . count($rules) . '</strong></p>';
                    echo '<table>';
                    echo '<tr><th>Antecedent (Jika)</th><th>Consequent (Maka)</th><th>Support</th><th>Confidence</th></tr>';
                    foreach (array_slice($rules, 0, 20) as $rule) {
                        $antecedent = array_map(function($id) use ($classMap) {
                            return $classMap[$id] ?? "Kelas $id";
                        }, $rule['antecedent']);
                        $consequent = array_map(function($id) use ($classMap) {
                            return $classMap[$id] ?? "Kelas $id";
                        }, $rule['consequent']);
                        echo '<tr>';
                        echo '<td>' . implode(', ', $antecedent) . '</td>';
                        echo '<td><strong>' . implode(', ', $consequent) . '</strong></td>';
                        echo '<td>' . round($rule['support'] * 100, 2) . '%</td>';
                        echo '<td><span class="badge badge-success">' . round($rule['confidence'] * 100, 2) . '%</span></td>';
                        echo '</tr>';
                    }
                    echo '</table>';
                    if (count($rules) > 20) {
                        echo '<p><em>Menampilkan 20 rules pertama dari ' . count($rules) . ' rules</em></p>';
                    }
                }
                
                // Test recommendations
                echo '<h2>4. Test Rekomendasi</h2>';
                echo '<div class="info">';
                echo '<strong>Contoh:</strong> Jika siswa memilih kelas tertentu, kelas apa yang direkomendasikan?<br>';
                echo 'Pilih kelas dari daftar di bawah untuk melihat rekomendasi:';
                echo '</div>';
                
                echo '<form method="GET" style="margin: 20px 0;">';
                echo '<label><strong>Pilih Kelas:</strong></label><br>';
                foreach ($classMap as $id => $name) {
                    echo '<label style="display: inline-block; margin: 5px 10px 5px 0;">';
                    echo '<input type="checkbox" name="selected[]" value="' . $id . '"> ';
                    echo $name;
                    echo '</label><br>';
                }
                echo '<br><button type="submit" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer;">Generate Rekomendasi</button>';
                echo '</form>';
                
                if (isset($_GET['selected']) && !empty($_GET['selected'])) {
                    $selected = array_map('intval', $_GET['selected']);
                    $recommendations = $apriori->getRecommendations($selected);
                    
                    echo '<h3>Rekomendasi untuk Kelas yang Dipilih:</h3>';
                    $selectedNames = array_map(function($id) use ($classMap) {
                        return $classMap[$id] ?? "Kelas $id";
                    }, $selected);
                    echo '<p><strong>Kelas yang dipilih:</strong> ' . implode(', ', $selectedNames) . '</p>';
                    
                    if (empty($recommendations)) {
                        echo '<div class="error">Tidak ada rekomendasi yang ditemukan untuk kombinasi kelas ini.</div>';
                    } else {
                        echo '<table>';
                        echo '<tr><th>Kelas Direkomendasikan</th><th>Confidence</th><th>Support</th></tr>';
                        foreach ($recommendations as $rec) {
                            $className = $classMap[$rec['class_id']] ?? "Kelas " . $rec['class_id'];
                            echo '<tr>';
                            echo '<td><strong>' . $className . '</strong></td>';
                            echo '<td><span class="badge badge-success">' . round($rec['confidence'] * 100, 2) . '%</span></td>';
                            echo '<td>' . round($rec['support'] * 100, 2) . '%</td>';
                            echo '</tr>';
                        }
                        echo '</table>';
                    }
                }
            }
            
            // Show raw transactions
            echo '<h2>5. Data Transaksi Raw</h2>';
            echo '<pre>';
            echo "Total transaksi: " . count($transactions) . "\n\n";
            foreach ($transactions as $idx => $transaction) {
                $names = array_map(function($id) use ($classMap) {
                    return $classMap[$id] ?? "Kelas $id";
                }, $transaction);
                echo "Transaksi " . ($idx + 1) . ": [" . implode(', ', $transaction) . "] => " . implode(', ', $names) . "\n";
            }
            echo '</pre>';
            
        } catch (Exception $e) {
            echo '<div class="error">';
            echo '<strong>✗ Error:</strong> ' . htmlspecialchars($e->getMessage());
            echo '</div>';
        }
        ?>
        
        <div class="info" style="margin-top: 30px;">
            <strong>📚 Penjelasan Algoritma Apriori:</strong>
            <ol>
                <li><strong>Frequent Itemsets:</strong> Kombinasi kelas yang sering dipilih bersama (support >= 20%)</li>
                <li><strong>Association Rules:</strong> Aturan "Jika A maka B" dengan confidence >= 40%</li>
                <li><strong>Rekomendasi:</strong> Berdasarkan kelas yang dipilih, sistem akan merekomendasikan kelas lain yang sering dipilih bersama</li>
            </ol>
        </div>
    </div>
</body>
</html>