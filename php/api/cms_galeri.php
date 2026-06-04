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
$UPLOAD_DIR = __DIR__ . "/../../uploads/galeri/";
$UPLOAD_URL = "/WEB/Website-Sanggar-Bunda-Sari/uploads/galeri/";
if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0755, true);

if ($method === "GET") {
    $type = $_GET["type"] ?? "galeri";

    if ($type === "albums") {
        $rows = $pdo->query("SELECT a.*, COUNT(g.id) as jumlah_foto FROM cms_album a LEFT JOIN cms_galeri g ON g.album_id=a.id GROUP BY a.id ORDER BY a.tgl_kegiatan DESC")->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows); exit;
    }

    $album_id = $_GET["album_id"] ?? "";
    $sql = "SELECT g.*, a.nama as album_nama FROM cms_galeri g LEFT JOIN cms_album a ON g.album_id=a.id WHERE 1=1";
    $params = [];
    if ($album_id) { $sql .= " AND g.album_id=?"; $params[] = $album_id; }
    $sql .= " ORDER BY g.tgl_kegiatan DESC, g.id DESC LIMIT 100";
    $stmt = $pdo->prepare($sql); $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // Prefix URL
    foreach ($rows as &$r) {
        if ($r['foto'] && !str_starts_with($r['foto'], 'http') && !str_starts_with($r['foto'], '/')) {
            $r['foto_url'] = $UPLOAD_URL . $r['foto'];
        } else {
            $r['foto_url'] = $r['foto'];
        }
    }
    echo json_encode($rows); exit;
}

if ($method === "POST") {
    // Handle file upload for galeri foto
    if (isset($_FILES["foto"]) && $_FILES["foto"]["error"] === 0) {
        $file = $_FILES["foto"];
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
        $allowed = ["jpg","jpeg","png","gif","webp"];
        if (!in_array($ext, $allowed)) {
            echo json_encode(["success" => false, "message" => "Format file tidak didukung. Gunakan JPG, PNG, atau GIF."]); exit;
        }
        if ($file["size"] > 5 * 1024 * 1024) {
            echo json_encode(["success" => false, "message" => "Ukuran file maksimal 5MB."]); exit;
        }
        $filename = "galeri_" . time() . "_" . uniqid() . "." . $ext;
        if (move_uploaded_file($file["tmp_name"], $UPLOAD_DIR . $filename)) {
            $album_id = $_POST["album_id"] ?? null;
            $keterangan = $_POST["keterangan"] ?? "";
            $tgl = $_POST["tgl_kegiatan"] ?? date("Y-m-d");
            $tag = $_POST["tag_program"] ?? "";
            $stmt = $pdo->prepare("INSERT INTO cms_galeri (album_id,foto,keterangan,tgl_kegiatan,tag_program) VALUES(?,?,?,?,?)");
            $stmt->execute([$album_id ?: null, $filename, $keterangan, $tgl, $tag]);
            echo json_encode(["success" => true, "id" => $pdo->lastInsertId(), "foto" => $filename, "foto_url" => $UPLOAD_URL . $filename]);
        } else {
            echo json_encode(["success" => false, "message" => "Gagal upload file. Periksa permission folder uploads/galeri/"]);
        }
        exit;
    }

    // Create album
    $d = json_decode(file_get_contents("php://input"), true);
    if (isset($d["action"]) && $d["action"] === "create_album") {
        $stmt = $pdo->prepare("INSERT INTO cms_album(nama,deskripsi,tgl_kegiatan) VALUES(?,?,?)");
        $stmt->execute([$d["nama"], $d["deskripsi"] ?? "", $d["tgl_kegiatan"] ?? date("Y-m-d")]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
        exit;
    }

    echo json_encode(["success" => false, "message" => "Invalid request"]);
}

if ($method === "PUT") {
    $d = json_decode(file_get_contents("php://input"), true);
    if ($d["type"] === "album") {
        $stmt = $pdo->prepare("UPDATE cms_album SET nama=?,deskripsi=?,tgl_kegiatan=? WHERE id=?");
        $stmt->execute([$d["nama"], $d["deskripsi"] ?? "", $d["tgl_kegiatan"] ?? date("Y-m-d"), $d["id"]]);
    } else {
        $stmt = $pdo->prepare("UPDATE cms_galeri SET keterangan=?,tgl_kegiatan=?,tag_program=?,album_id=? WHERE id=?");
        $stmt->execute([$d["keterangan"] ?? "", $d["tgl_kegiatan"] ?? date("Y-m-d"), $d["tag_program"] ?? "", $d["album_id"] ?: null, $d["id"]]);
    }
    echo json_encode(["success" => true]);
}

if ($method === "DELETE") {
    $d = json_decode(file_get_contents("php://input"), true);
    if (($d["type"] ?? "") === "album") {
        // Delete all photos in album first
        $fotos = $pdo->prepare("SELECT foto FROM cms_galeri WHERE album_id=?");
        $fotos->execute([$d["id"]]);
        foreach ($fotos->fetchAll() as $f) { @unlink($UPLOAD_DIR . $f["foto"]); }
        $pdo->prepare("DELETE FROM cms_galeri WHERE album_id=?")->execute([$d["id"]]);
        $pdo->prepare("DELETE FROM cms_album WHERE id=?")->execute([$d["id"]]);
    } else {
        $row = $pdo->prepare("SELECT foto FROM cms_galeri WHERE id=?");
        $row->execute([$d["id"]]);
        $f = $row->fetch();
        if ($f) @unlink($UPLOAD_DIR . $f["foto"]);
        $pdo->prepare("DELETE FROM cms_galeri WHERE id=?")->execute([$d["id"]]);
    }
    echo json_encode(["success" => true]);
}
