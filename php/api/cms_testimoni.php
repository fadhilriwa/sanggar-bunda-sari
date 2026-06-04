<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
error_reporting(0); ini_set('display_errors', 0);
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(204); exit; }

$cfg = require __DIR__ . "/../config.php";
try {
    $pdo = new PDO("mysql:host={$cfg['host']};dbname={$cfg['db']};charset={$cfg['charset']}", $cfg['user'], $cfg['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]); exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$UPLOAD_DIR = __DIR__ . "/../../uploads/testimoni/";
$UPLOAD_URL = "/WEB/Website-Sanggar-Bunda-Sari/uploads/testimoni/";
if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0755, true);

if ($method === "GET") {
    $status = $_GET["status"] ?? "";
    $sql = "SELECT * FROM cms_testimoni WHERE 1=1";
    $params = [];
    if ($status) { $sql .= " AND status=?"; $params[] = $status; }
    $sql .= " ORDER BY urutan ASC, id ASC";
    $stmt = $pdo->prepare($sql); $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$r) {
        if ($r['foto'] && !str_starts_with($r['foto'], 'http') && !str_starts_with($r['foto'], '/')) {
            $r['foto_url'] = $UPLOAD_URL . $r['foto'];
        } else {
            $r['foto_url'] = $r['foto'] ?: "";
        }
    }
    echo json_encode($rows); exit;
}

if ($method === "POST") {
    if (isset($_FILES["foto"]) && $_FILES["foto"]["error"] === 0) {
        $file = $_FILES["foto"];
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        $allowed = ["jpg","jpeg","png","gif","webp"];
        if (!in_array($ext, $allowed)) { echo json_encode(["success"=>false,"message"=>"Format tidak didukung"]); exit; }
        $filename = "testimoni_" . time() . "_" . uniqid() . "." . $ext;
        if (!move_uploaded_file($file["tmp_name"], $UPLOAD_DIR . $filename)) {
            echo json_encode(["success"=>false,"message"=>"Gagal upload foto"]); exit;
        }
        echo json_encode(["success"=>true,"foto"=>$filename,"foto_url"=>$UPLOAD_URL.$filename]); exit;
    }

    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("INSERT INTO cms_testimoni(nama_ortu,nama_anak,program,foto,rating,isi,urutan,status) VALUES(?,?,?,?,?,?,?,?)");
    $stmt->execute([$d["nama_ortu"]??"",$d["nama_anak"]??"",$d["program"]??"",$d["foto"]??"",$d["rating"]??5,$d["isi"]??"",$d["urutan"]??1,$d["status"]??"tampil"]);
    echo json_encode(["success"=>true,"id"=>$pdo->lastInsertId()]);
}

if ($method === "PUT") {
    $d = json_decode(file_get_contents("php://input"), true);
    $stmt = $pdo->prepare("UPDATE cms_testimoni SET nama_ortu=?,nama_anak=?,program=?,foto=?,rating=?,isi=?,urutan=?,status=? WHERE id=?");
    $stmt->execute([$d["nama_ortu"]??"",$d["nama_anak"]??"",$d["program"]??"",$d["foto"]??"",$d["rating"]??5,$d["isi"]??"",$d["urutan"]??1,$d["status"]??"tampil",$d["id"]]);
    echo json_encode(["success"=>true]);
}

if ($method === "DELETE") {
    $d = json_decode(file_get_contents("php://input"), true);
    $row = $pdo->prepare("SELECT foto FROM cms_testimoni WHERE id=?");
    $row->execute([$d["id"]]); $f = $row->fetch();
    if ($f && $f["foto"]) @unlink($UPLOAD_DIR . $f["foto"]);
    $pdo->prepare("DELETE FROM cms_testimoni WHERE id=?")->execute([$d["id"]]);
    echo json_encode(["success"=>true]);
}
