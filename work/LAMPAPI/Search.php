<?php
    $indata = getRequestInfo();
    
    $rawSearch = trim($indata["Search"] ?? "");
    $Search = "%" . $rawSearch . "%";
    $UserID = intval($indata["UserID"] ?? 0);

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if($conn->connect_error) { returnWithError($conn->connect_error); }
    else
    {
        $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Email, Phone, DateCreated FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ?) AND UserID = ?");
        $stmt->bind_param("ssi", $Search, $Search, $UserID);
        $stmt->execute();
        $result = $stmt->get_result();

        $contacts = [];
        while($row = $result->fetch_assoc())
        {
            $contacts[] = [
                "id" => $row['ID'],
                "firstName" => htmlspecialchars($row['FirstName'], ENT_QUOTES, 'UTF-8'),
                "lastName" => htmlspecialchars($row['LastName'], ENT_QUOTES, 'UTF-8'),
                "email" => htmlspecialchars($row['Email'], ENT_QUOTES, 'UTF-8'),
                "phone" => htmlspecialchars($row['Phone'], ENT_QUOTES, 'UTF-8'),
                "dateCreated" => $row['DateCreated']
            ];
        }
        returnWithInfo($contacts);

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() { return json_decode(file_get_contents('php://input'), true); }
    function sendResultInfoAsJson( $obj ) { header('Content-type: application/json'); echo $obj; }
    function returnWithError( $err ) { sendResultInfoAsJson('{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}'); }
    function returnWithInfo($contacts) { sendResultInfoAsJson(json_encode(["results" => $contacts, "error" => ""])); }
?>
