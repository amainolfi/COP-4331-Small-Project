<?php

	$indata = getRequestInfo();
	$FirstName = "";
    $LastName = "";
    $Email = "";
    $Phone = "";
    $UserID = "";

    $FirstName = $indata["FirstName"];
    $LastName = $indata["LastName"];
    $Email = $indata["Email"];
    $Phone = $indata["Phone"];
    $UserID = $indata["UserID"];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Email, Phone, UserID) VALUES (?,?,?,?,?)");
        $stmt->bind_param("ssssi", $FirstName, $LastName, $Email, $Phone, $UserID);
        
        if($stmt->execute())
		{
			returnSuccess("Contact Created");
		}
		else
		{
			returnWithError($stmt->error);
		}

		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
    function returnSuccess($msg)
    {
        $php_msg = '{"message":"' . $msg . '"}';
        sendResultInfoAsJson($php_msg);
    }
?>