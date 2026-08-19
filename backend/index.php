<?php
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header('Access-Control-Allow-Methods: POST, GET, PATCH, DELETE');
header("Allow: GET, POST, PATCH, DELETE");

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
$actionStr = $_GET['action'] ?? '';
$action = explode('/', strtolower($actionStr));
$nameFoo = $method . ucfirst($action[0]);


$params = array_slice($action, 1);
if (count($params) > 0 && $method == 'get') {
    // If the parameter is strictly numbers, use ById. Otherwise, use ByName.
    if (is_numeric($params[0])) {
        $nameFoo = $nameFoo . 'ById';
    } else {
        $nameFoo = $nameFoo . 'ByName';
    }
}

if (function_exists($nameFoo)) {
    call_user_func_array ($nameFoo, $params);
} else {
    header(' ', true, 400);
}


// ----------------- FUNCIONES DE SOPORTE ------------------


function outputJson($data = null, int $code = 200): never
{

    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
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



// ----------------- Authenticacion y Autorizacion------------------

function authenticate($email, $password)
{
    
    $db=initDB();
    $sql = "SELECT id, username, password FROM users WHERE email = :email";
    $stmt = $db->prepare($sql);
    
    if (!$stmt) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }
    
    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }
    
    $ret = false;
    
    if ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        if (password_verify($password, $row['password'])) {
            $ret = [
                'id'       => $row['id'],
                'username' => $row['username'],
            ];
        }
    }
    
    return $ret;

}

function requireLogin()
{
    try {

        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            throw new Exception("Token requerido", 1);
        }
        list($jwt) = sscanf($headers['Authorization'], 'Bearer %s');
        $decoded = JWT::decode($jwt, JWT_KEY, [JWT_ALG]);

    } catch(Exception $e) {

        outputJson(['success' => false, 'error' => ['code' => 'UNAUTHORIZED', 'message' => 'Authentication required']], 401);

    }
    return $decoded;
}


function postLogin()
{
    $loginData = json_decode(file_get_contents("php://input"), true);
    $logged = authenticate($loginData['email'], $loginData['password']);

    if ($logged===false) {
        outputJson(['success' => false, 'error' => ['code' => 'UNAUTHORIZED', 'message' => 'Authentication required']], 401);
    }
    $payload = [
        'uid'       => $logged['id'],
        'name'    => $logged['username'],
        'exp'       => time() + JWT_EXP,
    ];
    $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
    outputJson(['success' => true,'data' => ['jwt' => $jwt]], 201);

}



function patchLogin()
{
    $payload = requireLogin();
    $payload->exp = time() + JWT_EXP;
    $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
    outputJson(['success' => true,'data' => ['jwt' => $jwt]], 200);
}



// ----------------- Auditar (solo Admin)------------------

function getLogs() {

    requireLogin();

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

    requireLogin(); 
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


// ----------------- Api ------------------

function getUsers() {

    //requireLogin();

	$bd = initDB();
	$result = $bd->query('SELECT * FROM users');

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
    //requireLogin(); 
    $bd=initDB();
    $sql = "SELECT * FROM users WHERE id =:id";
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
    //requireLogin(); 
    $bd=initDB();
    $stmt = $bd->prepare("SELECT * FROM users WHERE username LIKE :name");

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

function postUsers() {
    //requireLogin();

    $bd = initDB();

    $username = $_POST['username'] ?? null;
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;
    $role = isset($_POST['role']) ? (int) $_POST['role'] : null;

    if (!$username || !$email || !$password || !$role) {
        outputJson(['success' => false, 'error' => ['code' => 'UNPROCESSABLE_ENTITY', 'message' => 'Missing required values']], 400);
    }

    /** Validación de la imagen*/

    $userImage = null;

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] !== UPLOAD_ERR_NO_FILE){
        if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            outputJson(['success' => false,'error' => ['code' => 'FILE_UPLOAD_ERROR','message' => 'The photo could not be uploaded']], 400);
        }

        $tmpName = $_FILES['photo']['tmp_name'];

        $mimeType = mime_content_type($tmpName);

        $allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!in_array($mimeType, $allowedTypes, true)){

            outputJson(['success' => false,'error' => ['code' => 'INVALID_IMAGE_TYPE', 'message' => 'The uploaded file is not a supported image type']], 400);
            
        }

        /** Generamos nosotros el nombre. */

        $extension = match ($mimeType) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp'
        };

        $fileName = uniqid('user_', true) . '.' . $extension;

        $uploadDir = __DIR__ . '/uploads/users/';

        if (!is_dir($uploadDir)){
            mkdir($uploadDir, 0755, true);
        }

        $destination = $uploadDir . $fileName;

        if (!move_uploaded_file($tmpName, $destination)){
            outputJson(['success' => false,'error' => ['code' => 'FILE_STORAGE_ERROR', 'message' => 'The photo could not be saved']], 500);
        }

        $userImage = $fileName;
    }



    $stmt = $bd->prepare("INSERT INTO users (username, email, password, role, user_image) VALUES (:username, :email, :password, :role, :user_image)");

    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $stmt->bindValue(':password', password_hash($password, PASSWORD_DEFAULT), SQLITE3_TEXT); //Pass con hash
    $stmt->bindValue(':role', $role, SQLITE3_INTEGER);
    $stmt->bindValue(':user_image', $userImage, SQLITE3_TEXT);

    $result = $stmt->execute();

    if (!$result) {
        error_log($db->lastErrorMsg());
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Could not create user']], 500);
    }

    $id = $bd->lastInsertRowID();

    outputJson(['success' => true,'data' => ['id' => $id]], 201);
}

function deleteUsers() {
    
    //requireLogin();

    $bd = initDB();
    $data = json_decode(file_get_contents('php://input'),true);
    $idArray = $data['idArray'] ?? [];

    if (!is_array($idArray) || empty($idArray)) {
        outputJson(['success' => false,'error' => ['code' => 'INVALID_REQUEST','message' => 'Missing required values']], 400);
    }

    $idArray = array_map('intval', $idArray);
 
    $ids = implode(',',array_fill(0, count($idArray), '?'));

    try{
        
        $bd->exec('BEGIN TRANSACTION;');

    //Busca nombre de archivo para eliminar imagen en sistema de archivos

        $stmtSelect = $bd->prepare("SELECT id, user_image FROM users WHERE id IN ($ids)");
        foreach ($idArray as $index => $id) {
            $stmtSelect->bindValue($index + 1,$id,SQLITE3_INTEGER);
        }
        $resultSelect = $stmtSelect->execute();
        
        $retIds = [];
        $retImgs = [];

        while ($fila = $resultSelect->fetchArray(SQLITE3_ASSOC)) {
            settype($fila['id'], 'integer');
            $retIds[] = $fila['id'];
            if (!empty($fila['user_image'])) {
                $retImgs[] = $fila['user_image'];
            }
        }

        if (count($retIds) !== count($idArray)) {
            $idsFaltantes = array_diff($idArray, $retIds);
            throw new Exception('Transaction aborted. The following user IDs do not exist: ' . implode(', ', $idsFaltantes));
        }


    //Delete filas
        $stmtDelete = $bd->prepare("DELETE FROM users WHERE id IN ($ids)");
        foreach ($retIds as $index => $id) {
            $stmtDelete->bindValue($index + 1,$id,SQLITE3_INTEGER);
        }
        $resultDelete = $stmtDelete->execute();

        if (!$resultDelete) {
            throw new Exception('Could not delete users');
        }

        $bd->exec('COMMIT;');

        // 5. Safely delete physical images from the filesystem AFTER a successful commit
        foreach ($retImgs as $image) {
            $filePath = __DIR__ . '/uploads/users/' . $image; // Update with your actual path
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        outputJson(['success' => true, 'deleted_count' => count($idArray)]);


    }catch(exception $e){

        $bd->exec('ROLLBACK;');
        outputJson(['success' => false, 'error' => ['code' => 'UNPROCESSABLE_ENTITY', 'message' => e->getMessage()]], 422);

    }


}


function getLines() {

    //requireLogin();

    $bd = initDB();
    $result = $bd->query('SELECT * FROM lines');
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

function getStock() {

    //requireLogin();

    $bd = initDB();
    $result = $bd->query('SELECT * FROM stock');
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

function getSubscriptions() {

    //requireLogin();

    $bd = initDB();
    $result = $bd->query('SELECT s.id, u.username, u.email, u.user_image, st.model, st.brand, st.imei, st.provider, st.phone_image, l.line, l.provider
        FROM subscriptions s 
        INNER JOIN users u ON s.user_id=u.id
        INNER JOIN stock st ON s.stock_id=st.id');

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

function getSubscriptionsById($id)
{
    //requireLogin();

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
        outputJson(['success' => false, 'error' => ['code' => 'DATABASE_ERROR', 'message' => 'Internal server error']], 500);
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);

    $result = $stmt->execute();

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


?>
