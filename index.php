<?php
$input = file_get_contents("php://input");
file_put_contents("log.txt", $input . "\n", FILE_APPEND);

// InfinityFree DB config
$host = "sql104.infinityfree.com";
$user = "if0_39425774";
$pass = "Makemeblack";
$dbname = "if0_39425774_store"; // Replace with your actual DB name

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    file_put_contents("log.txt", "DB connection failed\n", FILE_APPEND);
    http_response_code(500);
    exit;
}

$event = json_decode($input, true);

if ($event && $event['event'] == 'charge.success') {
    $ref = $event['data']['reference'];

    $order = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM orders WHERE payment_ref = '$ref'"));
    if ($order && $order['status'] != 'Paid') {
        mysqli_query($conn, "UPDATE orders SET status = 'Paid' WHERE payment_ref = '$ref'");
    }
}

http_response_code(200);
?>
