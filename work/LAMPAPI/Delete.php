<?php

	$inData = getRequestInfo();
	
	$id = 0;
    $UserID = "";
	$UserID = $inData["UserID"];
    $id = $inData["ID"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE UserID = ? AND ID = ?");
        $stmt->bind_param("ii", $UserID, $id);
        if($stmt -> execute())
        {
            if($stmt->affected_rows > 0)
            {
                returnWithInfo("Contact Deleted");
            }
            else
            {
                returnWithError("No Records Found");
            }
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
	
	function returnWithInfo($msg)
	{
		$retValue = '{"message":"' .$msg.'","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
