<?php

	$indata = getRequestInfo();
	$id = 0;
	$Search = "";
	$UserID = "";

	$Search ="%".$indata["Search"]."%";
	$UserID = $indata["UserID"];

	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
	if($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID = ?");
		$stmt->bind_param("ssi", $Search, $Search, $UserID);
		$stmt->execute();
		$result = $stmt->get_result();

		$contacts = [];
		while($row = $result->fetch_assoc())
		{
			$contact = ["id" => $row['ID'],"firstName" => $row['FirstName'],"lastName" => $row['LastName']];
			array_push($contacts, $contact);
		}
		returnWithInfo($contacts);


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
	
	function returnWithInfo($contacts)
	{
		$retValue = json_encode(["results" => $contacts, "error" => ""]);
		sendResultInfoAsJson( $retValue );
	}
?>