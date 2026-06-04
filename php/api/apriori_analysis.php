<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }
$cfg = require __DIR__ . "/../config.php";
try {
    $pdo = new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}", $cfg["user"], $cfg["pass"], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) { echo json_encode(["error"=>$e->getMessage()]); exit; }
require __DIR__ . "/../apriori.php";
$action = $_GET["action"] ?? "";
if ($action === "history") {
    try {
        $rows = $pdo->query("SELECT id,run_at,min_support,min_confidence,total_transactions,total_rules FROM apriori_results ORDER BY run_at DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["history"=>$rows]);
    } catch(Exception $e){ echo json_encode(["history"=>[]]); }
    exit;
}
// POST: run analysis
$d = json_decode(file_get_contents("php://input"), true) ?? [];
$minSup = floatval($d["min_support"] ?? 0.3);
$minConf = floatval($d["min_confidence"] ?? 0.5);
$minLift = floatval($d["min_lift"] ?? 1.0);
$rows = $pdo->query("SELECT student_id, class_id FROM registrations")->fetchAll(PDO::FETCH_ASSOC);
$txMap = [];
foreach ($rows as $r) { $txMap[$r["student_id"]][] = (int)$r["class_id"]; }
$transactions = array_values($txMap);
if (count($transactions) < 2) {
    echo json_encode(["error"=>"Data transaksi tidak cukup. Butuh minimal 2 siswa yang terdaftar di beberapa kelas.","rules"=>[],"frequent_itemsets"=>[],"total_transactions"=>count($transactions)]);
    exit;
}
$apriori = new AprioriAlgorithm($transactions, $minSup, $minConf);
$frequentSets = $apriori->generateFrequentItemsets();
$rules = $apriori->generateAssociationRules($frequentSets);
// Filter by lift
$rules = array_filter($rules, fn($r) => ($r["lift"] ?? 0) >= $minLift);
$rules = array_values($rules);
// Attach class names
$classMap = [];
foreach ($pdo->query("SELECT id,name FROM classes")->fetchAll(PDO::FETCH_ASSOC) as $c) { $classMap[$c["id"]] = $c["name"]; }
foreach ($rules as &$rule) {
    $rule["antecedent"] = array_map(fn($id) => $classMap[$id] ?? "Kelas #$id", $rule["antecedent"]);
    $rule["consequent"] = array_map(fn($id) => $classMap[$id] ?? "Kelas #$id", $rule["consequent"]);
}
unset($rule);
// Map frequent itemsets names
$mappedSets = [];
foreach ($frequentSets as $level => $items) {
    foreach ($items as $key => $item) {
        $namedItems = array_map(fn($id) => $classMap[$id] ?? "Kelas #$id", $item["items"]);
        $mappedSets[$level][] = ["items"=>$namedItems,"support"=>$item["support"],"count"=>$item["count"]];
    }
}
// Save to DB
try {
    $pdo->prepare("INSERT INTO apriori_results (min_support,min_confidence,min_lift,total_transactions,total_rules,frequent_sets,rules) VALUES (?,?,?,?,?,?,?)")
        ->execute([$minSup,$minConf,$minLift,count($transactions),count($rules),json_encode($mappedSets),json_encode($rules)]);
} catch(Exception $e){}
echo json_encode(["success"=>true,"total_transactions"=>count($transactions),"rules"=>$rules,"frequent_itemsets"=>$mappedSets,"total_rules"=>count($rules)]);
