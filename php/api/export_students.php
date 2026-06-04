<?php
$cfg=require __DIR__."/../config.php";
try{$pdo=new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}",$cfg["user"],$cfg["pass"],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);}
catch(Exception $e){die("DB Error: ".$e->getMessage());}

$type=$_GET["type"]??"csv";
$cabang=$_GET["cabang_id"]??"";
$status=$_GET["status"]??"";

$sql="SELECT s.id,s.name,s.email,s.phone,s.gender,s.age,s.address,s.kota,s.education_level,s.school_sd,s.school_smp,s.nama_ayah,s.nama_ibu,s.pekerjaan_ayah,s.pekerjaan_ibu,s.tempat_lahir,s.tanggal_lahir,s.status,cb.nama as cabang,s.created_at FROM students s LEFT JOIN cabang cb ON s.cabang_id=cb.id WHERE 1=1";
$params=[];
if($cabang){$sql.=" AND s.cabang_id=?";$params[]=$cabang;}
if($status){$sql.=" AND s.status=?";$params[]=$status;}
$sql.=" ORDER BY s.name ASC";
$stmt=$pdo->prepare($sql);$stmt->execute($params);
$rows=$stmt->fetchAll(PDO::FETCH_ASSOC);

$filename="Data_Siswa_SBS_".date("Y-m-d");

if($type==="csv"){
  header("Content-Type: text/csv; charset=UTF-8");
  header("Content-Disposition: attachment; filename={$filename}.csv");
  $out=fopen("php://output","w");
  // BOM for Excel UTF-8
  fprintf($out,chr(0xEF).chr(0xBB).chr(0xBF));
  fputcsv($out,["No","Nama Lengkap","Email","No HP/WA","Gender","Usia","Alamat","Kota","Pendidikan","Asal SD","Asal SMP","Nama Ayah","Nama Ibu","Pekerjaan Ayah","Pekerjaan Ibu","Tempat Lahir","Tanggal Lahir","Status","Cabang","Tgl Daftar"],",");
  foreach($rows as $i=>$r){
    fputcsv($out,[$i+1,$r["name"],$r["email"],$r["phone"],$r["gender"],$r["age"],$r["address"],$r["kota"],$r["education_level"],$r["school_sd"],$r["school_smp"],$r["nama_ayah"],$r["nama_ibu"],$r["pekerjaan_ayah"],$r["pekerjaan_ibu"],$r["tempat_lahir"],$r["tanggal_lahir"],$r["status"],$r["cabang"],$r["created_at"]],",");
  }
  fclose($out);
  exit;
}

if($type==="pdf"||$type==="html"){
  header("Content-Type: text/html; charset=UTF-8");
  $cabangLabel=$cabang?"":"Semua Cabang";
  echo "<!DOCTYPE html><html><head><meta charset='UTF-8'>
  <title>Laporan Data Siswa - Sanggar Bunda Sari</title>
  <style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px}
  .header{text-align:center;border-bottom:2px solid #4A7C59;padding-bottom:12px;margin-bottom:16px}
  .header h1{font-size:18px;color:#4A7C59;margin:0}
  .header h2{font-size:13px;font-weight:normal;margin:4px 0}
  .meta{font-size:10px;color:#666;margin-bottom:12px;display:flex;justify-content:space-between}
  table{width:100%;border-collapse:collapse}
  th{background:#4A7C59;color:#fff;padding:6px 8px;text-align:left;font-size:10px}
  td{padding:5px 8px;border-bottom:1px solid #e8e8e8;font-size:10px}
  tr:nth-child(even){background:#f8faf9}
  .footer{margin-top:20px;text-align:right;font-size:9px;color:#999}
  @media print{.no-print{display:none}}</style>
  </head><body>
  <div class='header'>
    <h1>SANGGAR BUNDA SARI</h1>
    <h2>LAPORAN DATA SISWA ".htmlspecialchars($cabangLabel)."</h2>
  </div>
  <div class='meta'>
    <span>Total Siswa: ".count($rows)." siswa</span>
    <span>Dicetak: ".date("d F Y H:i")."</span>
  </div>
  <button class='no-print' onclick='window.print()' style='background:#4A7C59;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;margin-bottom:12px'>Cetak / Save PDF</button>
  <table>
  <thead><tr><th>No</th><th>Nama Lengkap</th><th>Email</th><th>No HP</th><th>Gender</th><th>Usia</th><th>Pendidikan</th><th>Status</th><th>Cabang</th><th>Tgl Daftar</th></tr></thead>
  <tbody>";
  foreach($rows as $i=>$r){
    $status_label=["aktif"=>"Aktif","tidak_aktif"=>"Tdk Aktif","pending"=>"Pending"][$r["status"]??"aktif"]??"Aktif";
    $status_color=["aktif"=>"#16a34a","tidak_aktif"=>"#dc2626","pending"=>"#ca8a04"][$r["status"]??"aktif"]??"#16a34a";
    echo "<tr>
      <td>".($i+1)."</td>
      <td><strong>".htmlspecialchars($r["name"])."</strong></td>
      <td>".htmlspecialchars($r["email"])."</td>
      <td>".htmlspecialchars($r["phone"])."</td>
      <td>".htmlspecialchars($r["gender"])."</td>
      <td>".$r["age"]."</td>
      <td>".htmlspecialchars($r["education_level"])."</td>
      <td style='color:{$status_color};font-weight:700'>{$status_label}</td>
      <td>".htmlspecialchars($r["cabang"]??"–")."</td>
      <td>".date("d/m/Y",strtotime($r["created_at"]))."</td>
    </tr>";
  }
  echo "</tbody></table><div class='footer'>© ".date("Y")." Sanggar Bunda Sari — Laporan ini digenerate otomatis</div></body></html>";
  exit;
}
// Default: JSON
header("Content-Type: application/json");
echo json_encode($rows);
