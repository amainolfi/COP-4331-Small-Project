<?php
    $inData = getRequestInfo();
    
    $firstName = htmlspecialchars(trim($inData["firstName"] ?? ""), ENT_QUOTES, 'UTF-8');
    $lastName = htmlspecialchars(trim($inData["lastName"] ?? ""), ENT_QUOTES, 'UTF-8');
    $login = htmlspecialchars(trim($inData["login"] ?? ""), ENT_QUOTES, 'UTF-8');
    $password = trim($inData["password"] ?? "");

    if (empty($firstName) || empty($lastName) || empty($login) || empty($password)) {
        returnWithError("All fields are required.");
        exit();
    }

    // --- ENCRYPTION SAFETY ADDITION ---
    // Hashes the password securely using bcrypt. Resulting string is ~60 characters long.
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    // ----------------------------------

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");    
    if( $conn->connect_error ) { returnWithError( $conn->connect_error ); }
    else
    {
        // Check for duplicates
        $checkStmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $checkStmt->bind_param("s", $login);
        $checkStmt->execute();
        if($checkStmt->get_result()->fetch_assoc()) {
            returnWithError("Username is already taken.");
            $checkStmt->close();
            $conn->close();
            exit();
        }
        $checkStmt->close();

        // Insert new user - Notice we pass $hashedPassword instead of raw $password
        $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?,?,?,?)");
        $stmt->bind_param("ssss", $firstName, $lastName, $login, $hashedPassword);
        
        if($stmt->execute())
        {
            returnWithInfo($firstName, $lastName, $stmt->insert_id);
        }
        else { returnWithError($stmt->error); }

        $stmt->close();
        $conn->close();
    }
    
    function getRequestInfo() { return json_decode(file_get_contents('php://input'), true); }
    function sendResultInfoAsJson( $obj ) { header('Content-type: application/json'); echo $obj; }
    function returnWithError( $err ) { sendResultInfoAsJson('{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}'); }
    function returnWithInfo( $firstName, $lastName, $id ) { sendResultInfoAsJson('{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}'); }
?>