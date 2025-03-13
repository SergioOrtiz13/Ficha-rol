<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'conexion.php';

$username = $_POST['username'];
$password = $_POST['password'];

$sql = "SELECT * FROM usuarios WHERE nombre='$username' AND contraseña='$password'";
$result = $conn->query($sql);

$response = [];

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if ($username === 'Sergio') {
        $response = ['success' => true, 'redirect' => 'dashboard.html'];
    } else {
        $response = ['success' => true, 'redirect' => 'ficha.html'];
    }
} else {
    $response = ['success' => false, 'message' => 'Usuario o contraseña incorrectos.'];
}

echo json_encode($response);

$conn->close();
?>