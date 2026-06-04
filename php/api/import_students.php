<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET,POST,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){http_response_code(204);exit;}

$cfg=require __DIR__."/../config.php";
try{$pdo=new PDO("mysql:host={$cfg["host"]};dbname={$cfg["db"]};charset={$cfg["charset"]}",$cfg["user"],$cfg["pass"],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);}
catch(Exception $e){header("Content-Type: application/json");echo json_encode(["success"=>false,"message"=>$e->getMessage()]);exit;}

// GET: Download template CSV
if($_SERVER["REQUEST_METHOD"]==="GET"){
  $action=$_GET["action"]??"";
  if($action==="template"){
    header("Content-Type: text/csv; charset=UTF-8");
    header("Content-Disposition: attachment; filename=Template_Import_Siswa_SBS.csv");
    $out=fopen("php://output","w");
    fprintf($out,chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($out,["Nama Lengkap*","Email*","No HP/WA*","Gender (Laki-laki/Perempuan)*","Usia*","Alamat*","Kota","Pendidikan (TK/SD/SMP/SMA)","Asal SD","Asal SMP","Nama Ayah","Nama Ibu","Pekerjaan Ayah","Pekerjaan Ibu","Tempat Lahir","Tanggal Lahir (YYYY-MM-DD)","Status (aktif/pending/tidak_aktif)","ID Cabang (1=Cibinong,2=Inkopad,3=Bojong,4=Cilebut)"],",");
    // sample rows
    fputcsv($out,["Budi Santoso","budi@gmail.com","08123456789","Laki-laki","8","Jl. Merdeka No.1, Jakarta","Bogor","SD","SDN 01 Bogor","","Ahmad Santoso","Siti Rahayu","PNS","Ibu Rumah Tangga","Bogor","2016-05-10","aktif","1"],",");
    fputcsv($out,["Sari Dewi","sari@gmail.com","08567891234","Perempuan","10","Jl. Kenanga No.5","Cibinong","SD","SDN 02 Cibinong","","Hadi Dewi","Rina Dewi","Swasta","Guru","Cibinong","2014-08-20","aktif","1"],",");
    fclose($out);exit;
  }
  header("Content-Type: application/json");
  echo json_encode(["message"=>"Gunakan POST untuk import, atau GET?action=template untuk download template"]);exit;
}

// POST: Parse & Import uploaded CSV
if($_SERVER["REQUEST_METHOD"]==="POST"){
  header("Content-Type: application/json");
  $preview=isset($_POST["preview"])&&$_POST["preview"]==="1";
  if(!isset($_FILES["file"])||$_FILES["file"]["error"]!==0){
    echo json_encode(["success"=>false,"message"=>"File tidak ditemukan. Pastikan file CSV dikirim."]);exit;
  }
  $file=$_FILES["file"]["tmp_name"];
  $rows=[];
  $errors=[];
  $handle=fopen($file,"r");
  if(!$handle){echo json_encode(["success"=>false,"message"=>"Gagal membaca file"]);exit;}
  // Skip header row
  $header=fgetcsv($handle,0,",");
  $lineNum=1;
  while(($row=fgetcsv($handle,0,","))!==false){
    $lineNum++;
    if(count($row)<5){$errors[]="Baris $lineNum: Data tidak lengkap (kurang dari 5 kolom)";continue;}
    $name=trim($row[0]??"");
    $email=trim($row[1]??"");
    $phone=trim($row[2]??"");
    $gender=trim($row[3]??"");
    $age=intval($row[4]??0);
    $address=trim($row[5]??"");
    $kota=trim($row[6]??"");
    $edu=trim($row[7]??"");
    $school_sd=trim($row[8]??"");
    $school_smp=trim($row[9]??"");
    $nama_ayah=trim($row[10]??"");
    $nama_ibu=trim($row[11]??"");
    $pekerjaan_ayah=trim($row[12]??"");
    $pekerjaan_ibu=trim($row[13]??"");
    $tempat_lahir=trim($row[14]??"");
    $tanggal_lahir=trim($row[15]??"");
    $status=trim($row[16]??"aktif");
    $cabang_id=intval($row[17]??1);
    if(empty($name)){$errors[]="Baris $lineNum: Nama tidak boleh kosong";continue;}
    if(empty($email)){$errors[]="Baris $lineNum: Email tidak boleh kosong";continue;}
    if(!filter_var($email,FILTER_VALIDATE_EMAIL)){$errors[]="Baris $lineNum: Format email tidak valid ($email)";continue;}
    if($age<1||$age>99){$errors[]="Baris $lineNum: Usia tidak valid ($age)";continue;}
    if(!in_array($gender,["Laki-laki","Perempuan"])){$errors[]="Baris $lineNum: Gender harus 'Laki-laki' atau 'Perempuan', ditemukan: '$gender'";continue;}
    $rows[]=compact("name","email","phone","gender","age","address","kota","edu","school_sd","school_smp","nama_ayah","nama_ibu","pekerjaan_ayah","pekerjaan_ibu","tempat_lahir","tanggal_lahir","status","cabang_id");
  }
  fclose($handle);
  if($preview){
    echo json_encode(["success"=>true,"preview"=>array_slice($rows,0,10),"total"=>count($rows),"errors"=>$errors,"error_count"=>count($errors)]);exit;
  }
  // Actually import
  $imported=0;$skipped=0;
  $stmt=$pdo->prepare("INSERT IGNORE INTO students(name,email,phone,gender,age,address,kota,education_level,school_sd,school_smp,nama_ayah,nama_ibu,pekerjaan_ayah,pekerjaan_ibu,tempat_lahir,tanggal_lahir,status,cabang_id)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
  foreach($rows as $r){
    try{
      $stmt->execute([$r["name"],$r["email"],$r["phone"],$r["gender"],$r["age"],$r["address"],$r["kota"],$r["edu"],$r["school_sd"],$r["school_smp"],$r["nama_ayah"],$r["nama_ibu"],$r["pekerjaan_ayah"],$r["pekerjaan_ibu"],$r["tempat_lahir"],$r["tanggal_lahir"],$r["status"],$r["cabang_id"]]);
      if($stmt->rowCount()>0)$imported++;else $skipped++;
    }catch(Exception $e){$errors[]="Gagal import baris (email: {$r["email"]}): ".$e->getMessage();$skipped++;}
  }
  echo json_encode(["success"=>true,"imported"=>$imported,"skipped"=>$skipped,"errors"=>$errors,"message"=>"Berhasil import $imported siswa, $skipped dilewati"]);
}
