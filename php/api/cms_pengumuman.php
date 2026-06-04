<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }
$cfg = require __DIR__ . "/../config.php";
try {
    $pdo = new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}", $cfg["user"], $cfg["pass"], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) { echo json_encode([]); exit; }
$method = $_SERVER["REQUEST_METHOD"];
if ($method === "GET") {
    $rows = $pdo->query("SELECT * FROM cms_pengumuman ORDER BY pin DESC, created_at DESC")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} elseif ($method === "POST") {
    $d = json_decode(file_get_contents("php://input"), true);
    $st = $pdo->prepare("INSERT INTO cms_pengumuman (judul,kategori,isi,tanggal_mulai,tanggal_berakhir,pin,status) VALUES (?,?,?,?,?,?,?)");
    $st->execute([$d["judul"]??"",$d["kategori"]??"Umum",$d["isi"]??"",$d["tanggal_mulai"]??null,$d["tanggal_berakhir"]??null,$d["pin"]??0,$d["status"]??"publish"]);
    echo json_encode(["success"=>true,"id"=>$pdo->lastInsertId()]);
} elseif ($method === "DELETE") {
    $d = json_decode(file_get_contents("php://input"), true);
    $pdo->prepare("DELETE FROM cms_pengumuman WHERE id=?")->execute([$d["id"]]);
    echo json_encode(["success"=>true]);
}
