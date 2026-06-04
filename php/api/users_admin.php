<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }
$cfg = require __DIR__ . "/../config.php";
try {
    $pdo = new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}", $cfg["user"], $cfg["pass"], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) { echo json_encode(["error"=>$e->getMessage()]); exit; }
$method = $_SERVER["REQUEST_METHOD"];
if ($method === "GET") {
    $rows = $pdo->query("SELECT id,username,name,email,role,foto,last_login,status FROM users ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
} elseif ($method === "POST") {
    $d = json_decode(file_get_contents("php://input"), true);
    if (empty($d["username"])||empty($d["password"])) { echo json_encode(["success"=>false,"message"=>"Username dan password wajib"]); exit; }
    $hash = password_hash($d["password"], PASSWORD_DEFAULT);
    $st = $pdo->prepare("INSERT INTO users (username,password,name,email,role,status) VALUES (?,?,?,?,?,?)");
    $st->execute([$d["username"],$hash,$d["name"]??"",$d["email"]??"",$d["role"]??"admin",$d["status"]??"aktif"]);
    echo json_encode(["success"=>true,"id"=>$pdo->lastInsertId()]);
} elseif ($method === "DELETE") {
    $d = json_decode(file_get_contents("php://input"), true);
    $pdo->prepare("DELETE FROM users WHERE id=?")->execute([$d["id"]]);
    echo json_encode(["success"=>true]);
}
