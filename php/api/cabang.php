<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER["REQUEST_METHOD"]==="OPTIONS"){http_response_code(204);exit;}
$cfg=require __DIR__."/../config.php";
try{$pdo=new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}",$cfg["user"],$cfg["pass"],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);}
catch(Exception $e){echo json_encode(["error"=>$e->getMessage()]);exit;}
$method=$_SERVER["REQUEST_METHOD"];
if($method==="GET"){
  $rows=$pdo->query("SELECT * FROM cabang ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($rows);
}elseif($method==="POST"){
  $d=json_decode(file_get_contents("php://input"),true);
  $st=$pdo->prepare("INSERT INTO cabang(nama,kode,alamat,kota,telepon,whatsapp,maps_link,status)VALUES(?,?,?,?,?,?,?,?)");
  $st->execute([$d["nama"],$d["kode"]??"",$d["alamat"]??"",$d["kota"]??"",$d["telepon"]??"",$d["whatsapp"]??"",$d["maps_link"]??"",$d["status"]??"aktif"]);
  echo json_encode(["success"=>true,"id"=>$pdo->lastInsertId()]);
}elseif($method==="PUT"){
  $d=json_decode(file_get_contents("php://input"),true);
  $st=$pdo->prepare("UPDATE cabang SET nama=?,kode=?,alamat=?,kota=?,telepon=?,whatsapp=?,maps_link=?,status=? WHERE id=?");
  $st->execute([$d["nama"],$d["kode"]??"",$d["alamat"]??"",$d["kota"]??"",$d["telepon"]??"",$d["whatsapp"]??"",$d["maps_link"]??"",$d["status"]??"aktif",$d["id"]]);
  echo json_encode(["success"=>true]);
}elseif($method==="DELETE"){
  $d=json_decode(file_get_contents("php://input"),true);
  $pdo->prepare("DELETE FROM cabang WHERE id=?")->execute([$d["id"]]);
  echo json_encode(["success"=>true]);
}
