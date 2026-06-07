<?php
    $inData = getRequestInfo();
    
    $id = intval($inData["ID"] ?? 0);
    $UserID = intval($inData["UserID"] ?? 0);

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");    
    if( $conn->connect_error ) { 
        returnWithError( $conn->connect_error ); 
    }
    else
    {
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID = ? AND ID = ?");
        $stmt->bind_param("ii", $UserID, $id);
        if($stmt->execute())
        {
            if($stmt->affected_rows > 0) { returnWithInfo("Contact Deleted"); }
            else { returnWithError("No Records Found"); }
        }
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
    function returnWithInfo($msg) { 
        sendResultInfoAsJson('{"message":"' .$msg.'","error":""}'); 
    }
?>
