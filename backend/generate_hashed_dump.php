<?php
$passwords = [
    'admin123' => null,
    'user123' => null,
    'demo123' => null,
    'test123' => null
];

foreach ($passwords as $plain => &$hash) {
    $hash = password_hash($plain, PASSWORD_DEFAULT);
    echo "{$plain} -> {$hash}\n";
}
?>