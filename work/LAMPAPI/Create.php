<?php
    $indata = getRequestInfo();

    $FirstName = htmlspecialchars(trim($indata["FirstName"] ?? ""), ENT_QUOTES, 'UTF-8');
    $LastName = htmlspecialchars(trim($indata["LastName"] ?? ""), ENT_QUOTES, 'UTF-8');
    $Email = filter_var(trim($indata["Email"] ?? ""), FILTER_SANITIZE_EMAIL);
    $UserID = intval($indata["UserID"] ?? 0);
    $Phone = preg_replace('/[^0-9]/', '', $indata["Phone"] ?? "");

    if (strlen($Phone) !== 10) {
        returnWithError("Invalid phone registration length. Must be exactly 10 digits.");
        exit();
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");    
    if( $conn->connect_error ) { 
        returnWithError( $conn->connect_error ); 
    }
    else
    {
        $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Email, Phone, UserID) VALUES (?,?,?,?,?)");
        $stmt->bind_param("ssssi", $FirstName, $LastName, $Email, $Phone, $UserID);
        
        if($stmt->execute()) { returnSuccess("Contact Created"); }
        else { returnWithError($stmt->error); }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() { 
        return json_decode(file_get_contents('php://input'), true);
    }
    function sendResultInfoAsJson( $obj ) { 
        header('Content-type: application/json'); echo $obj; 
    }
    function returnWithError( $err ) { 
        sendResultInfoAsJson('{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}'); 
    }
    function returnSuccess($msg) { 
        sendResultInfoAsJson('{"message":"' . $msg . '"}'); 
    }
?>
