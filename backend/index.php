<?php
header('Access-Control-Allow-Origin: *');

header(
    'Access-Control-Allow-Headers: ' .
    'Authorization, Content-Type, Accept, Origin, X-Requested-With, Access-Control-Request-Method'
);

header('Access-Control-Allow-Methods: POST, GET, PATCH, DELETE');
header('Allow: GET, POST, PATCH, DELETE');

date_default_timezone_set('America/Argentina/Buenos_Aires');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {    
   return 0;    
}  

spl_autoload_register(
    function ($class_name) {
        $path = __DIR__.'/'.str_replace('\\', '/', $class_name) . '.php';
        if (file_exists($path)) {
            include $path;
        }
    }
);

use \Firebase\JWT\JWT;
require_once 'config_jwt.php';



// ----------------- ROUTER ------------------
$method = strtolower($_SERVER['REQUEST_METHOD']);
$actionStr = trim((string) ($_GET['action'] ?? ''), '/');
$action = $actionStr === '' ? [] : explode('/', $actionStr);
$resource = strtolower($action[0] ?? '');

$authRoutes = [
    'post:login' => 'postLogin',
    'get:checkstatus' => 'getCheckStatus',
];

$routeKey = $method . ':' . $resource;
$nameFoo = $authRoutes[$routeKey] ?? ($method . ucfirst($resource));

$params = array_slice($action, 1);

if (!isset($authRoutes[$routeKey]) && $method === 'post' && count($params) === 1 && strtolower($params[0]) === 'photo') {

    $nameFoo = $method . ucfirst($resource) . 'Photo';
    $params = [];

} elseif (!isset($authRoutes[$routeKey]) && $method === 'delete' && count($params) === 2 && is_numeric($params[0]) && strtolower($params[1]) === 'photo') {
    
    $nameFoo = $method . ucfirst($resource) . 'Photo';
    $params = [(int) $params[0]];

} elseif (!isset($authRoutes[$routeKey]) && $method === 'get' && $resource === 'stock' && count($params) === 2 && strtolower($params[0]) === 'line') {
    $nameFoo = 'getStockByLine';
    $params = [$params[1]];

} elseif (!isset($authRoutes[$routeKey]) && count($params) > 0 && ($method === 'get' || $method === 'patch')) {
    
    if (is_numeric($params[0])) {

        $nameFoo .= 'ById';

    } else {

        $nameFoo .= 'ByName';

    }

}

if (function_exists($nameFoo)) {

    call_user_func_array($nameFoo, $params);

} else {

    outputJson(['success' => false, 'error' => ['code' => 'ENDPOINT_NOT_FOUND', 'message' => 'Endpoint not found']], 404);
}
// ----------------- FUNCIONES DE SOPORTE ------------------


function outputJson($data = null, int $code = 200): never
{

    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}


function saveUploadedImage($file, $uploadDir)
{

    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['success' => false, 'code' => 'PHOTO_REQUIRED', 'message' => 'A photo is required'];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {

        error_log('Image upload error: ' . $file['error']);
        return ['success' => false, 'code' => 'FILE_UPLOAD_ERROR', 'message' => 'The photo could not be uploaded'];

    }

    $tmpName = $file['tmp_name'];

    if (!is_uploaded_file($tmpName)) {

        return ['success' => false, 'code' => 'INVALID_UPLOAD', 'message' => 'Invalid uploaded file'];

    }


    $maxFileSize = 5 * 1024 * 1024; // 5 MB

    if ($file['size'] > $maxFileSize) {

        return ['success' => false, 'code' => 'FILE_TOO_LARGE', 'message' => 'The photo exceeds the maximum allowed size'];

    }


    $mimeType = mime_content_type($tmpName);

    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($allowedTypes[$mimeType])) {

        return ['success' => false, 'code' => 'INVALID_IMAGE_TYPE', 'message' => 'The uploaded file is not a supported image type'];

    }


    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {

            error_log('Could not create upload directory: ' . $uploadDir);
            return ['success' => false, 'code' => 'FILE_STORAGE_ERROR', 'message' => 'Could not prepare image storage'];

        }
    }


    $extension = $allowedTypes[$mimeType];
    $fileName = bin2hex(random_bytes(16)) . '.' . $extension;
    $destination = $uploadDir . $fileName;


    if (!move_uploaded_file($tmpName, $destination)) {

        error_log('Could not move uploaded image to: ' . $destination);
        return ['success' => false, 'code' => 'FILE_STORAGE_ERROR', 'message' => 'The photo could not be saved'];
    }

    return ['success' => true, 'fileName' => $fileName, 'path' => $destination];
}


function deleteImageFile(?string $fileName, string $uploadDir): void
{
    if (!$fileName) {
        return;
    }

    $filePath = $uploadDir . basename($fileName);

    if (is_file($filePath)) {
        if (!unlink($filePath)) {
            error_log("Could not delete image: {$filePath}");
        }
    }
}


function getUsersUploadDir()
{
    return __DIR__ . '/uploads/users/';
}

function getStockUploadDir()
{
    return __DIR__ . '/uploads/stock/';
}

function findUserConflict(SQLite3 $db, ?string $username, ?string $email, ?int $excludeUserId = null): ?array {
    $checks = [
        'username' => [
            'value' => $username, 'code' => 'USERNAME_ALREADY_EXISTS', 'message' => 'A user with that username already exists.'],
        'email' => [
            'value' => $email, 'code' => 'EMAIL_ALREADY_EXISTS', 'message' => 'A user with that email already exists.']
    ];

    foreach ($checks as $field => $check) {
        if ($check['value'] === null) {
            continue;
        }

        $sql = "SELECT id FROM users WHERE $field = :value";

        if ($excludeUserId !== null) {
            $sql .= ' AND id != :excludeUserId';
        }

        $sql .= ' LIMIT 1';

        $stmt = $db->prepare($sql);
        $stmt->bindValue(':value', $check['value'], SQLITE3_TEXT);

        if ($excludeUserId !== null) {
            $stmt->bindValue(':excludeUserId', $excludeUserId, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not verify existing user.');
        }

        if ($result->fetchArray(SQLITE3_ASSOC)) {
            return [
                'code' => $check['code'],
                'message' => $check['message'],
            ];
        }
    }

    return null;
}

function findStockConflict(SQLite3 $db, ?string $imei, ?int $line, ?int $excludeStockId = null): ?array {
    $checks = [
        'imei' => [
            'value' => $imei,
            'type' => SQLITE3_TEXT,
            'code' => 'IMEI_ALREADY_EXISTS',
            'message' => 'A stock item with that IMEI already exists.'
        ],
        'line' => [
            'value' => $line,
            'type' => SQLITE3_INTEGER,
            'code' => 'LINE_ALREADY_EXISTS',
            'message' => 'A stock item with that line already exists.'
        ]];

    foreach ($checks as $field => $check) {
        if ($check['value'] === null) {
            continue;
        }

        $sql = "SELECT id FROM stock WHERE $field = :value";

        if ($excludeStockId !== null) {
            $sql .= ' AND id != :excludeStockId';
        }

        $sql .= ' LIMIT 1';

        $stmt = $db->prepare($sql);

        if (!$stmt) {
            throw new Exception('Could not prepare stock conflict query.');
        }

        $stmt->bindValue(':value', $check['value'], $check['type']);

        if ($excludeStockId !== null) {
            $stmt->bindValue(':excludeStockId', $excludeStockId, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not verify stock conflicts.');
        }

        if ($result->fetchArray(SQLITE3_ASSOC)) {
            return ['code' => $check['code'], 'message' => $check['message']];
        }
    }

    return null;
}




// ----------------- Establecer Base de datos ------------------

function initDB() {
    return new SQLite3('data.db');
}

function postReset() {

    $db = initDB();
    $sqlFile = __DIR__ . '/dump.sql';
    
    if (!file_exists($sqlFile)) {
        outputJson(['error' => "dump.sql not found!"], 500);
    }

    $sql = file_get_contents($sqlFile);

    if ($sql === false) {
        outputJson(['error' => "failed to read file!"], 500);
    }

    if (!$db->exec($sql)) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR','message' => 'Internal server error']], 500);
    }

    
    outputJson(['status' => 'DB Reset']);

}

// ----------------- Autenticacion y Autorizacion ------------------

function authenticate($email, $password)
{
    $db = initDB();

    $sql = 'SELECT id, username, password, role FROM users WHERE email = :email';

    $stmt = $db->prepare($sql);

    if (!$stmt) {
        error_log($db->lastErrorMsg());

        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $stmt->bindValue(':email', $email, SQLITE3_TEXT);

    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());

        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        return false;
    }

    return [
        'id'       => (int) $user['id'],
        'username' => $user['username'],
        'role'     => (int) $user['role']
    ];
}


function postLogin()
{
 
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid JSON body']], 400);
    }

    if (!array_key_exists('email', $data) || !array_key_exists('password', $data)) {
        outputJson([
            'success' => false,
            'error' => ['code' => 'MISSING_CREDENTIALS', 'message' => 'Email and password are required']], 400);
    }

    if (!is_string($data['email']) || !is_string($data['password'])) {
        outputJson([
            'success' => false,
            'error' => ['code' => 'INVALID_CREDENTIALS', 'message' => 'Invalid credentials format']], 400);
    }


    $email = trim($data['email']);
    $password = $data['password'];


    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        outputJson(['success' => false, 'error' => ['code' => 'INVALID_EMAIL', 'message' => 'Invalid email']], 400);
    }


    $logged = authenticate($email, $password);

    if ($logged === false) {
        outputJson(['success' => false, 'error' => ['code' => 'INVALID_CREDENTIALS', 'message' => 'Invalid email or password']], 401);
    }

    $now = time();

    $payload = [
        'iss'  => 'inventario-api',
        'aud'  => 'inventario-angular',
        'iat'  => $now,
        'exp'  => $now + JWT_EXP,
        'uid'  => $logged['id'],
        'name' => $logged['username'],
        'role' => $logged['role']
    ];

    $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);

    outputJson(['success' => true, 'jwt' => $jwt], 200);
}

function requireLogin()
{
    try {

        $headers = getallheaders();

        $authorization = $headers['Authorization'] ?? null;

        if (!$authorization) {
            throw new Exception('Authorization header missing');
        }
        //control con expresion regular del formato del Bearer + Token
        if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) {
            throw new Exception('Invalid Authorization header');
        }

        $jwt = trim($matches[1]);

        if ($jwt === '') {
            throw new Exception('Empty token');
        }

        $decoded = JWT::decode($jwt, JWT_KEY, [JWT_ALG]);

        if (!isset($decoded->uid) || !isset($decoded->exp) || !isset($decoded->role)) {
            throw new Exception('Invalid token claims');
        }

        if (!is_numeric($decoded->uid) || (int) $decoded->uid <= 0) {
            throw new Exception('Invalid user ID in token');
        }


        if (!is_numeric($decoded->role) || !in_array((int) $decoded->role, [1, 2, 3], true)) {
            throw new Exception('Invalid user role in token');
        }

        return $decoded;

    } catch (Exception $e) {
        error_log('Authentication error: ' . $e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'UNAUTHORIZED', 'message' => 'Authentication required']], 401);
    }
}


function requireRole(array $allowedRoles)
{
    $payload = requireLogin();

    if (empty($allowedRoles)) {
        outputJson(['success' => false, 'error' => ['code' => 'FORBIDDEN', 'message' => 'Access denied']], 403);
    }

    $userRole = (int) $payload->role;

    if (!in_array($userRole, $allowedRoles, true)) {
        outputJson([
            'success' => false,
            'error' => ['code' => 'FORBIDDEN', 'message' => 'You do not have permission to perform this action']], 403);
    }


    return $payload;
}


function getCheckStatus()
{
    $payload = requireLogin();
    $db = initDB();
    $stmt = $db->prepare('SELECT id, username, email, role, user_image, created_at FROM users WHERE id = :id');

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $stmt->bindValue(':id', (int) $payload->uid, SQLITE3_INTEGER);

    $result = $stmt->execute();

    if (!$result) {

        error_log($db->lastErrorMsg());
        outputJson([
            'success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {

        outputJson(['success' => false, 'error' => ['code' => 'UNAUTHORIZED', 'message' => 'User no longer exists']], 401);
    }

    $user['id'] = (int) $user['id'];
    $user['role'] = (int) $user['role'];

    outputJson(['success' => true, 'data' => ['user' => $user, 'jwt-payload' => $payload]], 200); //sacar el paylaod en prod
}


// ----------------- Auditar (solo Admin)------------------

function getLogs() {

    requireRole([1]);

    $db = initDB();
    $result = $db->query('SELECT * FROM logs');

    if(!result){
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($fila['id'], 'integer');
        $ret[] = $fila;
    }
    outputJson(['success' => true,'data' => $ret]);
}

function getLogsByName($name){

    requireRole([1]); 
    $bd=initDB();
    $sql = "SELECT * FROM logs WHERE username LIKE :name";
    $stmt = $bd->prepare($sql);

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $stmt->bindValue(':name', "%$name%", SQLITE3_TEXT);
    
    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $users = [];

    // 2. Loop through all rows returned by the query
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($row['id'], 'integer');
        $users[] = $row;
    }

    if (!$users) {
        outputJson(['success' => false, 'error' => ['code' => 'NOT_FOUND', 'message' => 'User not found']], 404);
    }


    outputJson(['success' => true,'data' => $users]);

}

function getUsersFull() {

    //requireRole([1]);

    $bd = initDB();
    $result = $bd->query('SELECT id, username, email, password ,role, user_image, created_at FROM users');

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }


    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($fila['id'], 'integer');
        $ret[] = $fila;
    }
    outputJson(['success' => true,'data' => $ret]);
}



// ----------------- Api ------------------

function getUsers() {

    //requireRole([1]);

	$bd = initDB();
	$result = $bd->query('SELECT id, username, email, role, user_image, created_at FROM users');

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }


	$ret = [];
	while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
		settype($fila['id'], 'integer');
		$ret[] = $fila;
	}
	outputJson(['success' => true,'data' => $ret]);
}


function getUsersById($id)
{
    //requireRole([1,2,3]); 
    $bd=initDB();
    $sql = "SELECT id, username, email, role, user_image, created_at FROM users WHERE id =:id";
    $stmt = $bd->prepare($sql);

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    
    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        outputJson(['success' => false, 'error' => ['code' => 'NOT_FOUND', 'message' => 'User not found']], 404);
    }


    outputJson(['success' => true,'data' => $user]);
}


function getUsersByName($name)
{
    //requireRole([1]); 
    $bd=initDB();
    $stmt = $bd->prepare("SELECT id, username, email, role, user_image, created_at FROM users WHERE username LIKE :name");

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $stmt->bindValue(':name', "%$name%", SQLITE3_TEXT);
    
    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $ret = [];

    
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($row['id'], 'integer');
        $ret[] = $row;
    }

    if (!$ret) {
        outputError(404);
    }


    outputJson(['success' => true,'data' => $ret]);
}

function postUsers()
{
    //requireRole([1]);
    $db = initDB();
    $data = $_POST;

    if (!is_array($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid request']], 400);

    }

    $requiredFields = ['username','email','password','role'];

    foreach ($requiredFields as $field) {

        if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {

            outputJson([
                'success' => false,
                'error' => ['code' => 'MISSING_REQUIRED_FIELD', 'message' => "Missing required field: $field"]], 400);

        }
    }

    $stringFields = ['username', 'email', 'password'];

    foreach ($stringFields as $field) {
        if (!is_string($data[$field])) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_FIELD', 'message' => "Invalid value for field: $field"]], 400);

        }

        $data[$field] = trim($data[$field]);
        if ($data[$field] === '') {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_FIELD', 'message' => "Invalid value for field: $field"]], 400);

        }
    }


    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_EMAIL', 'message' => 'Invalid email']], 400);

    }

    if (filter_var($data['role'], FILTER_VALIDATE_INT) === false) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_ROLE', 'message' => 'Invalid role']], 400);

    }

    $role = (int) $data['role'];

    //TODO in email: MaxLength validator, Regex pattern validator(^[a-zA-Z0-9.@_%+-]+$)
    //TODO in password: MinLenght MaxLength validator, Regex pattern validator (^[a-zA-Z0-9.@_%+-]+$)
    
    $upload = null;

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE) {
        $upload = saveUploadedImage($_FILES['photo'], getUsersUploadDir());

        if (!$upload['success']) {
            outputJson([
                'success' => false,
                'error' => ['code' => $upload['code'], 'message' => $upload['message']]], 400);
        }
    }

    $userImage = $upload['fileName'] ?? null;

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {
        if ($userImage !== null) {

            deleteImageFile($userImage, getUsersUploadDir());
        }
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    $conflict = findUserConflict($db, $data['username'], $data['email']);

    if ($conflict !== null) {
        $db->exec('ROLLBACK');
        if ($userImage !== null) {
            deleteImageFile($userImage, getUsersUploadDir());
        }
        outputJson(['success' => false, 'error' => $conflict,], 409);
    }

    try {

        $stmt = $db->prepare('INSERT INTO users (username, email, password, role, user_image) VALUES (:username, :email, :password, :role, :user_image)');

        if (!$stmt) {
            throw new Exception('Could not prepare user insert');
        }

        $stmt->bindValue(':username', $data['username'], SQLITE3_TEXT);

        $stmt->bindValue(':email', $data['email'], SQLITE3_TEXT);
        $stmt->bindValue(':password', password_hash($data['password'], PASSWORD_DEFAULT), SQLITE3_TEXT);
        $stmt->bindValue(':role', $role, SQLITE3_INTEGER);
        $stmt->bindValue(':user_image', $userImage, $userImage === null ? SQLITE3_NULL : SQLITE3_TEXT);

        $result = $stmt->execute(); //@$stmt para que deje de tirar el error de php

        if (!$result) {
            throw new Exception('Could not create user: ' . $db->lastErrorMsg());
        }

        $id = $db->lastInsertRowID();

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit user creation');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');

        if ($userImage !== null) {

            deleteImageFile($userImage, getUsersUploadDir());

        }

        error_log($e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not create user']], 500);

    }

    outputJson(['success' => true, 'data' => ['id' => (int) $id]], 201);

}

function deleteUsers()
{
    //requireRole([1]);
    $db = initDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid JSON body']], 400);
    }

    $idArray = $data['idArray'] ?? [];

    if (!is_array($idArray) || empty($idArray)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Missing required values']], 400);
    }

    foreach ($idArray as $id) {

        if (!filter_var($id, FILTER_VALIDATE_INT) || (int) $id <= 0) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_USER_ID', 'message' => 'Invalid user ID']], 400);
        }
    }

    $idArray = array_map('intval', $idArray);
    $idArray = array_values(array_unique($idArray));
    $ids = implode(',', array_fill(0, count($idArray), '?'));

    

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    try {


        $stmt = $db->prepare("SELECT id, user_image FROM users WHERE id IN ($ids)");

        if (!$stmt) {
            throw new Exception('Could not prepare users verification query');
        }

        foreach ($idArray as $index => $id) {

            $stmt->bindValue($index + 1, $id, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not retrieve users');
        }

        $retIds = [];
        $retImgs = [];

        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {

            $retIds[] = (int) $row['id'];

            if (!empty($row['user_image'])) {
                $retImgs[] = $row['user_image'];
            }
        }

        
        if (count($retIds) !== count($idArray)) {

            $missingIds = array_diff($idArray, $retIds);
            throw new Exception('The following user IDs do not exist: ' . implode(', ', $missingIds));
        }

    
        $stmt = $db->prepare("DELETE FROM users WHERE id IN ($ids)");

        if (!$stmt) {
            throw new Exception('Could not prepare users deletion');
        }

        foreach ($idArray as $index => $id) {
            $stmt->bindValue($index + 1, $id, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not delete users');
        }

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit users deletion');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        error_log($e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not delete users']], 500);
    }


    if (!empty($retImgs)) {
        foreach ($retImgs as $image) {
            deleteImageFile($image, getUsersUploadDir());
        }
    }

    outputJson(['success' => true, 'data' => ['deleted_count' => count($idArray), 'ids' => $idArray]], 200);
}

function deleteUsersPhoto($id)
{
    //requireRole([1,2,3]);

    $db = initDB();
    if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_USER_ID', 'message' => 'Invalid user ID']], 400);
    }
    $stmt = $db->prepare('SELECT user_image FROM users WHERE id = :id');

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not prepare user query']], 500);
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not retrieve user']], 500);
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        outputJson(['success' => false, 'error' => ['code' => 'USER_NOT_FOUND', 'message' => 'User not found']], 404);
    }

    $oldImage = $user['user_image'];

    if (empty($oldImage)) {
        outputJson(['success' => false, 'error' => ['code' => 'PHOTO_NOT_FOUND', 'message' => 'User does not have a photo']], 404);
    }

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    try {

        $stmt = $db->prepare('UPDATE users SET user_image = NULL WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare user image update');
        }

        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not remove user image');
        }

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit user image deletion');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        error_log($e->getMessage());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not delete user photo']], 500);
    }

    
    deleteImageFile($oldImage, getUsersUploadDir());
    outputJson(['success' => true, 'data' => ['id' => (int) $id, 'deleted' => ['user_image']]], 200);
}


function patchUsersById($id)
{
    //requireRole([1,2,3]);
    $db = initDB();

    //Input checks
    if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_USER_ID', 'message' => 'Invalid user ID']], 400);

    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid JSON body']], 400);

    }

    if (empty($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'NO_FIELDS_TO_UPDATE', 'message' => 'No fields were provided for update']], 400);

    }

    //Columns checks

    $allowedFields = ['username', 'email', 'password', 'role'];

    foreach ($data as $field => $value) {

        if (!in_array($field, $allowedFields, true)) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_FIELD', 'message' => "Field '$field' cannot be modified"]], 400);

        }
    }

    //Values checks

    if (array_key_exists('username', $data)) {

        if (!is_string($data['username']) || trim($data['username']) === '')
        {
            outputJson(['success' => false, 'error' => ['code' => 'INVALID_USERNAME', 'message' => 'Invalid username']], 400);
        }

        $data['username'] = trim($data['username']);
    }


    if (array_key_exists('email', $data)) {

        if (!is_string($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL))
        {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_EMAIL', 'message' => 'Invalid email address']], 400);

        }

        $data['email'] = trim($data['email']);

    }

    if (array_key_exists('password', $data))
    {

        if (!is_string($data['password']) ||strlen($data['password']) < 8)
        {
            outputJson(['success' => false, 'error' => ['code' => 'INVALID_PASSWORD', 'message' => 'Password must contain at least 8 characters']], 400);
        }
    }

    if (array_key_exists('role', $data)) {
        if (!is_int($data['role']) || !in_array($data['role'], [1, 2, 3], true)) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_ROLE', 'message' => 'Invalid user role']], 400);

        }
    }

    //DB check. If true transacction beigins
    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);

    }

    //Query Begins

    try {

        $stmt = $db->prepare('SELECT username, email, password, role FROM users WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare verification query');
        }

        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not retrieve user');
        }

        $currentUser = $result->fetchArray(SQLITE3_ASSOC);

        if (!$currentUser) {

            $db->exec('ROLLBACK');
            outputJson(['success' => false, 'error' => ['code' => 'USER_NOT_FOUND', 'message' => 'User not found']], 404);

        }

        $conflict = findUserConflict($db, $data['username'] ?? null, $data['email'] ?? null, (int) $id);

        if ($conflict !== null) {
            $db->exec('ROLLBACK');
            outputJson(['success' => false,'error' => $conflict], 409);
        }

        $updates = [];
        $params = [];
        $updatedFields = [];

        //Columns and values to update verification

        foreach ($allowedFields as $field) {

            if (!array_key_exists($field, $data)) {
                continue;
            }

            $newValue = $data[$field]; //The value recibed from petition at the corresponding key->value pair
            $currentValue = $currentUser[$field]; //The value recibed from query from correponding column

            if ($field === 'password') {
                if (!password_verify($newValue, $currentValue)) {

                    $updates[] = 'password = :password';
                    $params['password'] = password_hash($newValue, PASSWORD_DEFAULT);
                    $updatedFields[] = 'password';

                }

                continue;
            }

            if ($field === 'role') {

                $newValue = (int) $newValue;
                $currentValue = (int) $currentValue;

            }

            
            if ($newValue !== $currentValue) {

                $updates[] = "$field = :$field";
                $params[$field] = $newValue;
                $updatedFields[] = $field;

            }
        }


        if (empty($updatedFields)) {

            $db->exec('COMMIT');
            outputJson(['success' => true, 'data' => ['id' => (int) $id,'updated' => []]], 200);

        }

        
        $sql = 'UPDATE users SET '. implode(', ', $updates). ' WHERE id = :id';

        $stmt = $db->prepare($sql);

        if (!$stmt) {
            throw new Exception('Could not prepare user update');
        }

        foreach ($params as $field => $value) {

            if ($field === 'role') {

                $stmt->bindValue(":$field", $value, SQLITE3_INTEGER);

            } else {

                $stmt->bindValue(":$field", $value, SQLITE3_TEXT);
            }

        }

        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not update user');
        }


        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit transaction');
        }

        
        outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => $updatedFields]], 200);

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        error_log($e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not update user']], 500);
    }
}


function postUsersPhoto()
{   

    //requireRole([1,2,3]);

    $db = initDB();
    $id = $_POST['id'] ?? null;

    if ($id===null || filter_var($id, FILTER_VALIDATE_INT)===false || (int) $id <= 0) {
        outputJson(['success' => false, 'error' => ['code' => 'INVALID_USER_ID', 'message' => 'Invalid user ID']], 400);
    }

    $stmt = $db->prepare('SELECT user_image FROM users WHERE id = :id');

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not prepare user image query']], 500);
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not retrieve user']], 500);
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        outputJson(['success' => false,'error' => ['code' => 'USER_NOT_FOUND', 'message' => 'User not found']], 404);
    }

    $oldImage = $user['user_image'];

    
    $upload = saveUploadedImage($_FILES['photo'] ?? null, getUsersUploadDir());
    
    

    if (!$upload['success']) {
        outputJson(['success' => false, 'error' => ['code' => $upload['code'], 'message' => $upload['message']]], 400);
    }

    $newFileName = $upload['fileName'];

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        deleteImageFile($newFileName, getUsersUploadDir());
        error_log($db->lastErrorMsg());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    try {

        $stmt = $db->prepare('UPDATE users SET user_image = :user_image WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare user image update');
        }

        $stmt->bindValue(':user_image', $newFileName, SQLITE3_TEXT);
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not update user image');
        }

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit user image update');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        deleteImageFile($newFileName, getUsersUploadDir());
        error_log($e->getMessage());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not update user photo']], 500);
    }

    if (!empty($oldImage)) {
        deleteImageFile($oldImage, getUsersUploadDir());
    }

    outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => ['user_image'], 'image' => $newFileName]], 200);

}

function getStock() {

    //requireRole([1,2]);

    $db = initDB();
    $result = $db->query('SELECT * FROM stock');
    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not retrive stock']], 500);
    }
    $ret = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($row['id'], 'integer');
        $ret[] = $row;
    }
    outputJson(['success' => true,'data' => $ret]);
}


function getStockById($id)
{
    //requireRole([1,2]);
    $db = initDB();

    if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_STOCK_ID', 'message' => 'Invalid stock ID']], 400);

    }

    $stmt = $db->prepare('SELECT id, imei, model, brand, ph_provider, phone_image, line, line_provider FROM stock WHERE id = :id');

    if (!$stmt) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not prepare stock query']], 500);

    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

    $result = $stmt->execute();

    if (!$result) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not retrieve stock']], 500);

    }

    $ret = $result->fetchArray(SQLITE3_ASSOC);

    if (!$ret) {

        outputJson(['success' => false, 'error' => ['code' => 'STOCK_NOT_FOUND', 'message' => 'Stock item not found']], 404);

    }

    outputJson(['success' => true, 'data' => $ret], 200);
}

function getStockByLine($line)
{
    // requireRole([1, 2]);

    if (!is_string($line) || $line === '' || !ctype_digit($line)) {
        outputJson(['success' => false, 'error' => ['code' => 'INVALID_LINE', 'message' => 'Line must contain only numbers']], 400);
    }

    
    $db = initDB();

    $stmt = $db->prepare(
        'SELECT id, imei, model, brand, ph_provider, phone_image, line, line_provider FROM stock WHERE line LIKE :line');

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not prepare stock search']], 500);
    }

       $stmt->bindValue(':line', '%' . $line . '%', SQLITE3_TEXT);

    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not retrieve stock']], 500);
    }

    $stock = [];

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $row['id'] = (int) $row['id'];
        $row['line'] = (int) $row['line'];
        $stock[] = $row;
    }

    outputJson(['success' => true, 'data' => $stock], 200);
}

function postStock()
{
    //requireRole([1,2]);

    $db = initDB();

    // -----------------------------
    // Request
    // -----------------------------

    $data = $_POST;

    if (!is_array($data)) {

        outputJson([
            'success' => false,
            'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid request']], 400);

    }

    // -----------------------------
    // Required fields
    // -----------------------------

    $requiredFields = ['imei', 'model', 'brand', 'ph_provider', 'line', 'line_provider'];

    foreach ($requiredFields as $field) {

        if (!array_key_exists($field, $data) || $data[$field] === null || $data[$field] === '') {

            outputJson([
                'success' => false,
                'error' => ['code' => 'MISSING_REQUIRED_FIELD', 'message' => "Missing required field: $field"]], 400);

        }
    }

    // -----------------------------
    // String validation
    // -----------------------------

    $stringFields = ['imei', 'model', 'brand', 'ph_provider', 'line_provider'];

    foreach ($stringFields as $field) {

        if (!is_string($data[$field])) {

            outputJson([
                'success' => false,
                'error' => ['code' => 'INVALID_FIELD', 'message' => "Invalid value for field: $field"]], 400);

        }

        $data[$field] = trim($data[$field]);

        if ($data[$field] === '') {

            outputJson([
                'success' => false,
                'error' => ['code' => 'INVALID_FIELD', 'message' => "Invalid value for field: $field"]], 400);

        }
    }

    if (filter_var($data['line'], FILTER_VALIDATE_INT) === false) {

        outputJson([
            'success' => false,
            'error' => ['code' => 'INVALID_LINE', 'message' => 'Invalid line']], 400);

    }

    $line = (int) $data['line'];

  
    $upload = null;
    

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE)
    {

        $upload = saveUploadedImage($_FILES['photo'], getStockUploadDir());

        if (!$upload['success']) {
            outputJson(['success' => false, 'error' => ['code' => $upload['code'], 'message' => $upload['message']]], 400);
        }
    }

    $phoneImage = $upload['fileName'] ?? null;

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        if ($phoneImage !== null) {
            deleteImageFile($phoneImage, getStockUploadDir());

        }

        error_log($db->lastErrorMsg());

        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);

    }

    try {


        $conflict = findStockConflict($db, $data['imei'], $line);

        if ($conflict !== null) {
            $db->exec('ROLLBACK');
            if ($phoneImage !== null) {
                deleteImageFile($phoneImage, getStockUploadDir());
            }
            outputJson(['success' => false, 'error' => $conflict], 409);
        }


        $stmt = $db->prepare('INSERT INTO stock (imei, model, brand, ph_provider, phone_image, line, line_provider) VALUES (:imei, :model, :brand, :ph_provider, :phone_image, :line, :line_provider)');

        if (!$stmt) {
            throw new Exception('Could not prepare stock insert');
        }

        $stmt->bindValue(':imei', $data['imei'], SQLITE3_TEXT);
        $stmt->bindValue(':model', $data['model'], SQLITE3_TEXT);
        $stmt->bindValue(':brand', $data['brand'], SQLITE3_TEXT);
        $stmt->bindValue(':ph_provider', $data['ph_provider'], SQLITE3_TEXT);
        $stmt->bindValue(':phone_image', $phoneImage, $phoneImage === null ? SQLITE3_NULL : SQLITE3_TEXT);
        $stmt->bindValue(':line', $line, SQLITE3_INTEGER);
        $stmt->bindValue(':line_provider', $data['line_provider'], SQLITE3_TEXT);

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not create stock item: ' . $db->lastErrorMsg());
        }

        $id = $db->lastInsertRowID();

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit stock creation');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        if ($phoneImage !== null) {

            deleteImageFile($phoneImage,getStockUploadDir());
        }

        error_log($e->getMessage());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not create stock item']], 500);

    }

    outputJson(['success' => true, 'data' => ['id' => (int) $id]], 201);
}


function patchStockById($id)
{
    //requireRole([1,2]);
    $db = initDB();

    // -----------------------------
    // 1. Validar ID
    // -----------------------------

    if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_STOCK_ID', 'message' => 'Invalid stock ID']], 400);

    }

    // -----------------------------
    // 2. JSON
    // -----------------------------

    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid JSON body']], 400);
    }

    $allowedFields = [
        'imei',
        'model',
        'brand',
        'ph_provider',
        'line',
        'line_provider'
    ];


    foreach ($data as $field => $value) {

        if (!in_array($field, $allowedFields, true)) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_FIELD', 'message' => "Field '$field' cannot be modified"]], 400);
        }
    }

    if (empty($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'NO_FIELDS_TO_UPDATE', 'message' => 'No fields were provided for update']], 400);

    }


    foreach (['imei','model', 'brand', 'ph_provider', 'line_provider'] as $field) {

        if (array_key_exists($field, $data)) {

            if (!is_string($data[$field])) {

                outputJson(['success' => false, 'error' => ['code' => 'INVALID_FIELD', 'message' => "Invalid value for field: $field"]], 400);

            }

            $data[$field] = trim($data[$field]);

            if ($data[$field] === '') {

                outputJson(['success' => false, 'error' => ['code' => 'INVALID_FIELD', 'message' => "Invalid value for field: $field"]], 400);

            }
        }
    }

    if (array_key_exists('line', $data)) {
        if (!is_int($data['line'])) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_LINE','message' => 'Invalid line']], 400);
        }
    }


    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    try {

        $stmt = $db->prepare('SELECT * FROM stock WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare stock verification query');
        }

        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not retrieve stock item');
        }

        $currentStock = $result->fetchArray(SQLITE3_ASSOC);

        if (!$currentStock) {

            $db->exec('ROLLBACK');
            outputJson(['success' => false, 'error' => ['code' => 'STOCK_NOT_FOUND', 'message' => 'Stock item not found']], 404);
        }

        $conflict = findStockConflict($db, array_key_exists('imei', $data) ? $data['imei'] : null, array_key_exists('line', $data) ? (int) $data['line'] : null, (int) $id);

        if ($conflict !== null) {
            $db->exec('ROLLBACK');
            outputJson(['success' => false, 'error' => $conflict], 409);
        }

        $updates = [];
        $params = [];
        $updatedFields = [];

        foreach ($allowedFields as $field) {

            if (!array_key_exists($field, $data)) {
                continue;
            }

            $newValue = $data[$field];
            $currentValue = $currentStock[$field];

            if ($field === 'line') {

                $newValue = (int) $newValue;
                $currentValue = (int) $currentValue;
            }

            if ($newValue !== $currentValue) {

                $updates[] = "$field = :$field";
                $params[$field] = $newValue;
                $updatedFields[] = $field;

            }
        }

        if (empty($updatedFields)) {

            $db->exec('COMMIT');
            outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => []]], 200);
        }

        $sql ='UPDATE stock SET ' . implode(', ', $updates) . ' WHERE id = :id';

        $stmt = $db->prepare($sql);

        if (!$stmt) {

            throw new Exception('Could not prepare stock update');

        }

        foreach ($params as $field => $value) {

            $type = $field === 'line'? SQLITE3_INTEGER : SQLITE3_TEXT;
            $stmt->bindValue( ":$field", $value, $type);

        }

        $stmt->bindValue( ':id', $id, SQLITE3_INTEGER);

        $result = $stmt->execute();

        if (!$result) {

            throw new Exception('Could not update stock item');
        }

        if (!$db->exec('COMMIT')) {

            throw new Exception('Could not commit stock update');

        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        error_log($e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not update stock item']], 500);

    }

    outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => $updatedFields]], 200);
}


function postStockPhoto()
{
    //requireRole([1,2]);

    $db = initDB();

    $id = $_POST['id'] ?? null;

    if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0 || $id ===null) {
        outputJson([
            'success' => false,
            'error' => ['code' => 'INVALID_STOCK_ID', 'message' => 'Invalid stock ID']], 400);
    }

    $stmt = $db->prepare('SELECT phone_image FROM stock WHERE id = :id');

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not prepare stock image query']], 500);
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not retrieve stock item']], 500);
    }

    $stock = $result->fetchArray(SQLITE3_ASSOC);

    if (!$stock) {
        outputJson(['success' => false, 'error' => ['code' => 'STOCK_NOT_FOUND', 'message' => 'Stock item not found']], 404);
    }

    $oldImage = $stock['phone_image'];

    $upload = saveUploadedImage($_FILES['photo'] ?? null, getStockUploadDir());

    if (!$upload['success']) {
        outputJson(['success' => false,'error' => ['code' => $upload['code'], 'message' => $upload['message']]], 400);
    }

    $newFileName = $upload['fileName'];

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        deleteImageFile($newFileName, getStockUploadDir());
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    try {

        $stmt = $db->prepare('UPDATE stock SET phone_image = :phone_image WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare stock image update');
        }

        $stmt->bindValue(':phone_image',$newFileName, SQLITE3_TEXT);
        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not update stock image');
        }

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit stock image update');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        deleteImageFile($newFileName, getStockUploadDir());
        error_log($e->getMessage());
        outputJson([
            'success' => false,
            'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not update stock photo']], 500);
    }

    
    // Commit exitoso

    if (!empty($oldImage)) {
        deleteImageFile($oldImage, getStockUploadDir());
    }

    outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => ['phone_image'], 'image' => $newFileName]], 200);
}


function deleteStock()
{
    //requireRole([1,2]);
    $db = initDB();
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Invalid JSON body']], 400);
    }

    $idArray = $data['idArray'] ?? [];

    if (!is_array($idArray) || empty($idArray)) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_REQUEST', 'message' => 'Missing required values']], 400);
    }


    foreach ($idArray as $id) {

        if (!filter_var($id, FILTER_VALIDATE_INT) || (int) $id <= 0) {

            outputJson(['success' => false, 'error' => ['code' => 'INVALID_STOCK_ID', 'message' => 'Invalid stock ID']], 400);
        }

    }

    $idArray = array_map('intval', $idArray);

    // Remove duplicated IDs
    $idArray = array_values(array_unique($idArray));

    $ids = implode(',', array_fill(0, count($idArray), '?'));

    // -----------------------------
    // Transaction
    // -----------------------------

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);

    }

    try {

        $stmt = $db->prepare("SELECT id, phone_image FROM stock WHERE id IN ($ids)");

        if (!$stmt) {
            throw new Exception('Could not prepare stock verification query');
        }

        foreach ($idArray as $index => $id) {

            $stmt->bindValue($index + 1, $id, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not retrieve stock items');
        }

        $retIds = [];
        $retImgs = [];

        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {

            $retIds[] = (int) $row['id'];

            if (!empty($row['phone_image'])) {
                $retImgs[] = $row['phone_image'];
            }
        }


        if (count($retIds) !== count($idArray)) {

            $missingIds = array_diff($idArray, $retIds);
            throw new Exception('The following stock IDs do not exist: ' . implode(', ', $missingIds));

        }

        
        $stmt = $db->prepare("DELETE FROM stock WHERE id IN ($ids)");

        if (!$stmt) {
            throw new Exception('Could not prepare stock deletion');
        }

        foreach ($idArray as $index => $id) {

            $stmt->bindValue($index + 1, $id, SQLITE3_INTEGER);
        }

        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not delete stock items');
        }

        
        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit stock deletion');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        error_log($e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not delete stock items']], 500);
    }

    
    if (!empty($retImgs)) {
        foreach ($retImgs as $image) {
            deleteImageFile($image, getStockUploadDir());
        }
    }

    outputJson(['success' => true, 'data' => ['deleted_count' => count($idArray), 'ids' => $idArray]], 200);

}

function deleteStockPhoto($id)
{
    //requireRole([1,2]);
    $db = initDB();

    if (!filter_var($id, FILTER_VALIDATE_INT) || $id <= 0) {

        outputJson(['success' => false, 'error' => ['code' => 'INVALID_STOCK_ID', 'message' => 'Invalid stock ID']], 400);
    }

    if (!$db->exec('BEGIN IMMEDIATE TRANSACTION')) {

        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not start transaction']], 500);
    }

    try {

        $stmt = $db->prepare('SELECT phone_image FROM stock WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare stock image query');

        }

        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
        $result = $stmt->execute();

        if (!$result) {
            throw new Exception('Could not retrieve stock image');
        }

        $stock = $result->fetchArray(SQLITE3_ASSOC);

        if (!$stock) {

            $db->exec('ROLLBACK');
            outputJson(['success' => false, 'error' => ['code' => 'STOCK_NOT_FOUND', 'message' => 'Stock item not found']], 404);
        }

        if (empty($stock['phone_image'])) {

            $db->exec('COMMIT');
            outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => []]], 200);
        }

        $stmt = $db->prepare('UPDATE stock SET phone_image = NULL WHERE id = :id');

        if (!$stmt) {
            throw new Exception('Could not prepare stock image deletion');
        }

        $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

        if (!$stmt->execute()) {
            throw new Exception('Could not remove stock image');
        }

        if (!$db->exec('COMMIT')) {
            throw new Exception('Could not commit stock image deletion');
        }

    } catch (Exception $e) {

        $db->exec('ROLLBACK');
        error_log($e->getMessage());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not delete stock photo']], 500);
    }


    deleteImageFile($stock['phone_image'], getStockUploadDir());
    outputJson(['success' => true, 'data' => ['id' => (int) $id, 'updated' => ['phone_image']]], 200);

}



function getSubscriptions() {

    requireRole([1,2,3]);

    $bd = initDB();
    $result = $bd->query('SELECT s.id, u.username, u.email, u.user_image, st.model, st.brand, st.imei, st.provider, st.phone_image, l.line, l.provider
        FROM subscriptions s 
        INNER JOIN users u ON s.user_id=u.id
        INNER JOIN stock st ON s.stock_id=st.id');

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not get subscriptions']], 500);
    }

    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($fila['id'], 'integer');
        $ret[] = $fila;
    }

    outputJson(['success' => true,'data' => $ret]);

}

function getSubscriptionsById($id)
{
    requireRole([1,2,3]);

    $db = initDB();

    $sql = "
        SELECT s.id, u.username, u.email, u.user_image, st.model, st.brand, st.imei, st.provider, st.phone_image
        FROM subscriptions s
        INNER JOIN users u ON s.user_id = u.id
        INNER JOIN stock st ON s.stock_id = st.id
        WHERE s.id = :id";

    $stmt = $db->prepare($sql);

    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not prepare subscription get']], 500);
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not get subscription']], 500);
    }

    $ret = [];

    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($fila['id'], 'integer');
        $ret[] = $fila;
    }

    outputJson(['success' => true,'data' => $ret]);
    
}


?>
