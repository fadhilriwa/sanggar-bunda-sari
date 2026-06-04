<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
session_start();
if (isset($_SESSION["user_id"])) {
    echo json_encode(["authenticated" => true, "user" => ["id" => $_SESSION["user_id"], "username" => $_SESSION["username"] ?? "admin", "name" => $_SESSION["name"] ?? $_SESSION["username"] ?? "Admin", "role" => $_SESSION["role"] ?? "admin"]]);
} else {
    echo json_encode(["authenticated" => false]);
}
