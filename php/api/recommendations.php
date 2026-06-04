<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
$cfg = require __DIR__ . "/../config.php";
try {
    $pdo = new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}", $cfg["user"], $cfg["pass"], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) { echo json_encode([]); exit; }
$selectedClasses = isset($_GET["classes"]) ? array_map("intval", explode(",", $_GET["classes"])) : [];
if (empty($selectedClasses)) { echo json_encode([]); exit; }
require __DIR__ . "/../apriori.php";
// Build transactions from registrations
$rows = $pdo->query("SELECT student_id, class_id FROM registrations")->fetchAll(PDO::FETCH_ASSOC);
$txMap = [];
foreach ($rows as $r) { $txMap[$r["student_id"]][] = (int)$r["class_id"]; }
$transactions = array_values($txMap);
if (count($transactions) < 2) {
    // Fallback: return other classes not selected
    $others = $pdo->query("SELECT id,name,category FROM classes")->fetchAll(PDO::FETCH_ASSOC);
    $recs = [];
    foreach ($others as $c) {
        if (!in_array($c["id"], $selectedClasses)) {
            $recs[] = ["class_id"=>$c["id"],"class_name"=>$c["name"],"confidence"=>0.6,"support"=>0.4];
        }
    }
    echo json_encode($recs); exit;
}
$apriori = new AprioriAlgorithm($transactions, 0.1, 0.3);
$rawRecs = $apriori->getRecommendations($selectedClasses);
// Attach class names
$classMap = [];
foreach ($pdo->query("SELECT id,name,category FROM classes")->fetchAll(PDO::FETCH_ASSOC) as $c) { $classMap[$c["id"]] = $c; }
$result = [];
foreach ($rawRecs as $r) {
    $cid = $r["class_id"];
    $result[] = ["class_id"=>$cid,"class_name"=>$classMap[$cid]["name"]??("Kelas #".$cid),"category"=>$classMap[$cid]["category"]??"",'confidence'=>$r["confidence"],"support"=>$r["support"]];
}
echo json_encode($result);
