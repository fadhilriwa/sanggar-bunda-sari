<?php
/**
 * Implementasi Algoritma Apriori untuk Rekomendasi Kombinasi Kelas
 * 
 * Algoritma Apriori adalah algoritma association rule mining yang digunakan
 * untuk menemukan pola hubungan antar item dalam dataset transaksi.
 * 
 * Konsep:
 * 1. Frequent Itemsets: Kombinasi kelas yang sering dipilih bersama
 * 2. Support: Frekuensi kemunculan kombinasi / total transaksi
 * 3. Confidence: Probabilitas jika kelas A dipilih, kelas B juga dipilih
 * 4. Association Rules: Aturan rekomendasi (A => B)
 */

class AprioriAlgorithm {
    private $transactions = []; // Array transaksi (setiap transaksi = array class_ids)
    private $minSupport = 0.3;  // Minimum support (30%)
    private $minConfidence = 0.5; // Minimum confidence (50%)
    
    public function __construct($transactions, $minSupport = 0.3, $minConfidence = 0.5) {
        $this->transactions = $transactions;
        $this->minSupport = $minSupport;
        $this->minConfidence = $minConfidence;
    }
    
    /**
     * Step 1: Generate frequent 1-itemsets
     * Menghitung frekuensi setiap kelas dalam semua transaksi
     */
    private function generateFrequent1Itemsets() {
        $itemCounts = [];
        $totalTransactions = count($this->transactions);
        
        foreach ($this->transactions as $transaction) {
            foreach ($transaction as $item) {
                if (!isset($itemCounts[$item])) {
                    $itemCounts[$item] = 0;
                }
                $itemCounts[$item]++;
            }
        }
        
        $frequent1Itemsets = [];
        foreach ($itemCounts as $item => $count) {
            $support = $count / $totalTransactions;
            if ($support >= $this->minSupport) {
                $key = (string)$item;
                $frequent1Itemsets[$key] = [
                    'items' => [$item],
                    'support' => $support,
                    'count' => $count
                ];
            }
        }
        
        return $frequent1Itemsets;
    }
    
    /**
     * Step 2: Generate candidate k-itemsets dari (k-1)-itemsets
     */
    private function generateCandidates($frequentItemsets, $k) {
        $candidates = [];
        $itemsets = [];
        
        // Convert ke array of arrays
        foreach ($frequentItemsets as $key => $itemset) {
            $itemsets[] = $itemset['items'];
        }
        
        $n = count($itemsets);
        
        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                $itemset1 = $itemsets[$i];
                $itemset2 = $itemsets[$j];
                
                // Join itemsets jika (k-1) elemen pertama sama
                if ($k > 1) {
                    $prefix1 = array_slice($itemset1, 0, $k - 2);
                    $prefix2 = array_slice($itemset2, 0, $k - 2);
                    if ($prefix1 !== $prefix2) {
                        continue;
                    }
                }
                
                $merged = array_unique(array_merge($itemset1, $itemset2));
                sort($merged);
                
                if (count($merged) === $k) {
                    $key = implode(',', $merged);
                    if (!isset($candidates[$key])) {
                        $candidates[$key] = $merged;
                    }
                }
            }
        }
        
        return array_values($candidates);
    }
    
    /**
     * Step 3: Hitung support untuk candidate itemsets
     */
    private function calculateSupport($itemset) {
        $count = 0;
        foreach ($this->transactions as $transaction) {
            if ($this->isSubset($itemset, $transaction)) {
                $count++;
            }
        }
        return $count / count($this->transactions);
    }
    
    /**
     * Cek apakah itemset adalah subset dari transaction
     */
    private function isSubset($itemset, $transaction) {
        foreach ($itemset as $item) {
            if (!in_array($item, $transaction)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Step 4: Generate semua frequent itemsets
     */
    public function generateFrequentItemsets() {
        $frequentItemsets = [];
        $currentFrequent = $this->generateFrequent1Itemsets();
        $frequentItemsets[1] = $currentFrequent;
        
        $k = 2;
        while (!empty($currentFrequent)) {
            $candidates = $this->generateCandidates($currentFrequent, $k);
            $currentFrequent = [];
            
            foreach ($candidates as $candidate) {
                $support = $this->calculateSupport($candidate);
                if ($support >= $this->minSupport) {
                    $key = implode(',', $candidate);
                    $currentFrequent[$key] = [
                        'items' => $candidate,
                        'support' => $support,
                        'count' => (int)($support * count($this->transactions))
                    ];
                }
            }
            
            if (!empty($currentFrequent)) {
                $frequentItemsets[$k] = $currentFrequent;
            }
            $k++;
        }
        
        return $frequentItemsets;
    }
    
    /**
     * Step 5: Generate association rules dari frequent itemsets
     */
    public function generateAssociationRules($frequentItemsets) {
        $rules = [];
        
        foreach ($frequentItemsets as $level => $itemsets) {
            if ($level < 2) continue; // Butuh minimal 2 items untuk membuat rule
            
            foreach ($itemsets as $itemset) {
                $items = $itemset['items'];
                $supportXY = $itemset['support'];
                
                // Generate semua kombinasi antecedent dan consequent
                for ($i = 1; $i < count($items); $i++) {
                    $combinations = $this->getCombinations($items, $i);
                    
                    foreach ($combinations as $antecedent) {
                        $consequent = array_values(array_diff($items, $antecedent));
                        
                        if (empty($consequent)) continue;
                        
                        // Hitung support antecedent
                        $supportX = $this->calculateSupport($antecedent);
                        if ($supportX == 0) continue;
                        
                        // Hitung confidence
                        $confidence = $supportXY / $supportX;
                        
                        if ($confidence >= $this->minConfidence) {
                            $rules[] = [
                                'antecedent' => $antecedent,
                                'consequent' => $consequent,
                                'support' => $supportXY,
                                'confidence' => $confidence,
                                'lift' => $confidence / $this->calculateSupport($consequent)
                            ];
                        }
                    }
                }
            }
        }
        
        // Sort by confidence descending
        usort($rules, function($a, $b) {
            return $b['confidence'] <=> $a['confidence'];
        });
        
        return $rules;
    }
    
    /**
     * Generate kombinasi dari array
     */
    private function getCombinations($items, $r) {
        if ($r == 1) {
            return array_map(function($item) { return [$item]; }, $items);
        }
        
        $combinations = [];
        $n = count($items);
        
        for ($i = 0; $i < $n - $r + 1; $i++) {
            $head = $items[$i];
            $tail = array_slice($items, $i + 1);
            $subCombinations = $this->getCombinations($tail, $r - 1);
            
            foreach ($subCombinations as $sub) {
                $combinations[] = array_merge([$head], $sub);
            }
        }
        
        return $combinations;
    }
    
    /**
     * Generate rekomendasi berdasarkan kelas yang sudah dipilih
     */
    public function getRecommendations($selectedClasses) {
        if (empty($selectedClasses)) {
            return [];
        }
        
        $frequentItemsets = $this->generateFrequentItemsets();
        $rules = $this->generateAssociationRules($frequentItemsets);
        
        $recommendations = [];
        $selectedSet = array_map('intval', $selectedClasses);
        sort($selectedSet);
        
        foreach ($rules as $rule) {
            $antecedent = $rule['antecedent'];
            sort($antecedent);
            
            // Cek apakah selected classes match dengan antecedent
            if ($this->isSubset($antecedent, $selectedSet)) {
                foreach ($rule['consequent'] as $classId) {
                    if (!in_array($classId, $selectedSet)) {
                        if (!isset($recommendations[$classId])) {
                            $recommendations[$classId] = [
                                'class_id' => $classId,
                                'confidence' => $rule['confidence'],
                                'support' => $rule['support'],
                                'rule' => $rule
                            ];
                        } else {
                            // Ambil confidence tertinggi
                            if ($rule['confidence'] > $recommendations[$classId]['confidence']) {
                                $recommendations[$classId]['confidence'] = $rule['confidence'];
                                $recommendations[$classId]['rule'] = $rule;
                            }
                        }
                    }
                }
            }
        }
        
        // Sort by confidence descending
        usort($recommendations, function($a, $b) {
            return $b['confidence'] <=> $a['confidence'];
        });
        
        return $recommendations;
    }
}