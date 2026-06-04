<?php
require_once __DIR__ . '/apriori.php';

// Test Data Matches documentation example
// Transaksi 1: [Calistung, Matematika Kelas 1] -> IDs: [1, 2]
// Transaksi 2: [Calistung, Bahasa Inggris Kelas 1] -> IDs: [1, 3]
// Transaksi 3: [Matematika Kelas 1, Bahasa Inggris Kelas 1] -> IDs: [2, 3]
// Transaksi 4: [Calistung, Matematika Kelas 1, Bahasa Inggris Kelas 1] -> IDs: [1, 2, 3]
// Transaksi 5: [Melukis, Calistung] -> IDs: [4, 1]

// Mapping:
// 1: Calistung
// 2: Matematika Kelas 1
// 3: Bahasa Inggris Kelas 1
// 4: Melukis

$transactions = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 2, 3],
    [4, 1]
];

$apriori = new AprioriAlgorithm($transactions, 0.2, 0.4);
$frequentItemsets = $apriori->generateFrequentItemsets();
$rules = $apriori->generateAssociationRules($frequentItemsets);

// Test Recommendation
// If student selects Calistung (1), should recommend Matematika (2) and B.Inggris (3)
$recommendations = $apriori->getRecommendations([1]); // Calistung

$output = [
    'frequent_itemsets_count' => count($frequentItemsets, COUNT_RECURSIVE) - count($frequentItemsets),
    'rules_count' => count($rules),
    'recommendations_for_1' => array_keys($recommendations),
    'recommendations_details' => array_map(function($r) {
        return [
            'class_id' => $r['class_id'],
            'confidence' => $r['confidence'],
            'rule_antecedent' => $r['rule']['antecedent']
        ];
    }, $recommendations)
];

echo json_encode($output, JSON_PRETTY_PRINT);
?>
