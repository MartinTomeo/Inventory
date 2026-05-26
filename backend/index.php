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


function outputJson($data, $code = 200)
{
    header('', true, $code);
    header('Content-type: application/json');
    print json_encode($data);
}

function outputError($code = 500)
{
    switch ($code) {
        case 400:
            header($_SERVER["SERVER_PROTOCOL"] . " 400 Bad request", true, 400);
            die;
        case 401:
            header($_SERVER["SERVER_PROTOCOL"] . " 401 Unauthorized", true, 401);
            die;
        case 404:
            header($_SERVER["SERVER_PROTOCOL"] . " 404 Not Found", true, 404);
            die;
        default:
            header($_SERVER["SERVER_PROTOCOL"] . " 500 Internal Server Error", true, 500);
            die;
            break;
    }
}

// ----------------- Establecer Base de datos ------------------

function initDB() {
    return new SQLite3('data.db');
}

function postReset() {

    $db = initDB();
    
    $sqlFile = __DIR__ . '/dump.sql';
    if (!file_exists($sqlFile)) {
        outputError(500);
    }

    $sql = file_get_contents($sqlFile);
    if ($sql === false) {
        outputError(500);
    }

    if (!$db->exec($sql)) {
        error_log($db->lastErrorMsg());
        outputError(500);
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
        outputError(500, "Error preparando la consulta: " . $db->lastErrorMsg());
    }
    
    $stmt->bindValue(':email', $email, SQLITE3_TEXT);
    $result = $stmt->execute();
    
    if (!$result) {
        outputError(500, "Falló la consulta: " . $db->lastErrorMsg());
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
        outputError(401);
    }
    return $decoded;
}


function postLogin()
{
    $loginData = json_decode(file_get_contents("php://input"), true);
    $logged = authenticate($loginData['email'], $loginData['password']);

    if ($logged===false) {
        outputError(401);
    }
    $payload = [
        'uid'       => $logged['id'],
        'name'    => $logged['username'],
        'exp'       => time() + JWT_EXP,
    ];
    $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
    outputJson(['jwt'=>$jwt]);
}



function patchLogin()
{
    $payload = requireLogin();
    $payload->exp = time() + JWT_EXP;
    $jwt = JWT::encode($payload, JWT_KEY, JWT_ALG);
    outputJson(['jwt'=>$jwt]);
}



// ----------------- Auditar (solo Admin)------------------

function getLogs() {

    requireLogin();

    $db = initDB();
    $result = $db->query('SELECT * FROM logs');
    $ret = [];
    while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($fila['id'], 'integer');
        $ret[] = $fila;
    }
    outputJson($ret);
}

function postLog($username, $action) {
    
    $stmt->prepare("INSERT INTO logs (username, action, method, ip) VALUES (:username, :action, :method, :ip)");
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $stmt->bindValue(':action', $action, SQLITE3_TEXT);
    $stmt->bindValue(':method', $_SERVER['REQUEST_METHOD'], SQLITE3_TEXT);
    $stmt->bindValue(':ip', $_SERVER['REMOTE_ADDR'], SQLITE3_TEXT);
    $stmt->execute();
}



// ----------------- Api ------------------

function getUsers() {

    //requireLogin();

	$bd = initDB();
	$result = $bd->query('SELECT * FROM users');
	$ret = [];
	while ($fila = $result->fetchArray(SQLITE3_ASSOC)) {
		settype($fila['id'], 'integer');
		$ret[] = $fila;
	}
	outputJson($ret);
}


function getUsersById($id)
{
    //requireLogin(); 
    $bd=initDB();
    $sql = "SELECT * FROM users WHERE id =:id";
    $stmt = $bd->prepare($sql);

    if (!$stmt) {
        outputError(500, "Error preparando la consulta: " . $bd->lastErrorMsg());
    }

    $stmt->bindValue(':id', $id, SQLITE3_INTEGER);
    
    $result = $stmt->execute();

    if (!$result) {
        outputError(500, "Falló la consulta: " . $bd->lastErrorMsg());
    }

    $user = $result->fetchArray(SQLITE3_ASSOC);

    if (!$user) {
        outputError(404);
    }


    outputJson($user);
}


function getUsersByName($name)
{
    //requireLogin(); 
    $bd=initDB();
    $sql = "SELECT * FROM users WHERE username LIKE :name";
    $stmt = $bd->prepare($sql);

    if (!$stmt) {
        outputError(500, "Error preparando la consulta: " . $bd->lastErrorMsg());
    }

    $stmt->bindValue(':name', "%$name%", SQLITE3_TEXT);
    
    $result = $stmt->execute();

    if (!$result) {
        outputError(500, "Falló la consulta: " . $bd->lastErrorMsg());
    }

    $users = [];

    // 2. Loop through all rows returned by the query
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        settype($row['id'], 'integer'); // Optional: ensures ID is an integer in JSON
        $users[] = $row;
    }

    if (!$users) {
        outputError(404);
    }


    outputJson($users);
}



?>
