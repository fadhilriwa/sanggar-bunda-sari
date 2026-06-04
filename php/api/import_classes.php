<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){http_response_code(204);exit;}
$cfg=require __DIR__."/../config.php";
try{$pdo=new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}",$cfg["user"],$cfg["pass"],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);}
catch(Exception $e){header("Content-Type: application/json");echo json_encode(["success"=>false,"message"=>$e->getMessage()]);exit;}
if($_SERVER["REQUEST_METHOD"]==="GET"){
  $action=$_GET["action"]??"";
  if($action==="template"){
    header("Content-Type: text/csv; charset=UTF-8");
    header("Content-Disposition: attachment; filename=Template_Import_Kelas_SBS.csv");
    $out=fopen("php://output","w");
    fprintf($out,chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($out,["Nama Program*","Kategori* (Matematika/Bahasa Inggris/Calistung/Melukis/Seni)","Deskripsi","Biaya per Bulan*","Kapasitas","Jadwal (teks)","Hari (Senin/Selasa/Rabu/Kamis/Jumat/Sabtu/Minggu)","Jam Mulai (HH:MM)","Jam Selesai (HH:MM)","ID Cabang* (1=Cibinong,2=Inkopad,3=Bojong,4=Cilebut)","Pengajar"],",");
    fputcsv($out,["Matematika Kelas 1","Matematika","Belajar matematika dasar untuk kelas 1 SD","150000","15","Senin & Rabu 15:00-16:30","Senin,Rabu","15:00","16:30","1","Ibu Sari"],",");
    fputcsv($out,["Calistung Dasar","Calistung","Program membaca menulis dan berhitung","150000","12","Selasa & Kamis 14:00-15:30","Selasa,Kamis","14:00","15:30","1","Ibu Dewi"],",");
    fputcsv($out,["Melukis Kreatif","Melukis","Belajar melukis dan menggambar kreatif","175000","10","Sabtu 09:00-11:00","Sabtu","09:00","11:00","2","Pak Andi"],",");
    fclose($out);exit;
  }
  header("Content-Type: application/json");
  echo json_encode(["message"=>"GET?action=template untuk download template"]);exit;
}
if($_SERVER["REQUEST_METHOD"]==="POST"){
  header("Content-Type: application/json");
  $preview=isset($_POST["preview"])&&$_POST["preview"]==="1";
  if(!isset($_FILES["file"])||$_FILES["file"]["error"]!==0){echo json_encode(["success"=>false,"message"=>"File tidak ditemukan"]);exit;}
  $handle=fopen($_FILES["file"]["tmp_name"],"r");
  if(!$handle){echo json_encode(["success"=>false,"message"=>"Gagal membaca file"]);exit;}
  $header=fgetcsv($handle,0,",");
  $rows=[];$errors=[];$lineNum=1;
  while(($row=fgetcsv($handle,0,","))!==false){
    $lineNum++;
    if(count($row)<4){$errors[]="Baris $lineNum: Data tidak lengkap";continue;}
    $name=trim($row[0]??"");$category=trim($row[1]??"");$desc=trim($row[2]??"");
    $price=floatval(preg_replace("/[^0-9.]/","",$row[3]??"0"));
    $capacity=intval($row[4]??20);$schedule=trim($row[5]??"");
    $days=trim($row[6]??"");$time_start=trim($row[7]??"");$time_end=trim($row[8]??"");
    $cabang_id=intval($row[9]??1);$teacher=trim($row[10]??"");
    if(empty($name)){$errors[]="Baris $lineNum: Nama program kosong";continue;}
    if($price<=0){$errors[]="Baris $lineNum: Biaya harus lebih dari 0";continue;}
    $rows[]=compact("name","category","desc","price","capacity","schedule","days","time_start","time_end","cabang_id","teacher");
  }
  fclose($handle);
  if($preview){echo json_encode(["success"=>true,"preview"=>array_slice($rows,0,10),"total"=>count($rows),"errors"=>$errors]);exit;}
  $imported=0;$skipped=0;
  $stmt=$pdo->prepare("INSERT IGNORE INTO classes(name,category,description,price,capacity,schedule,day_of_week,time_start,time_end,cabang_id,teacher)VALUES(?,?,?,?,?,?,?,?,?,?,?)");
  foreach($rows as $r){
    try{
      $stmt->execute([$r["name"],$r["category"],$r["desc"],$r["price"],$r["capacity"],$r["schedule"],$r["days"],($r["time_start"]?:null),($r["time_end"]?:null),$r["cabang_id"],$r["teacher"]]);
      if($stmt->rowCount()>0)$imported++;else $skipped++;
    }catch(Exception $e){$errors[]="Error: ".$e->getMessage();$skipped++;}
  }
  echo json_encode(["success"=>true,"imported"=>$imported,"skipped"=>$skipped,"errors"=>$errors,"message"=>"Berhasil import $imported kelas"]);
}
