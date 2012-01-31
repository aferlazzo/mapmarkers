<?php

include ("class_lib.php");

/* markerserver.php: server component to edit the markers displayed on the project map */

		$json = json_decode(stripslashes($_GET['data']), true);


		error_log("markerserver.php received ".count($json)." elements");
		$request="";
		$pname="";
		$lat="";
		$lng="";
		$numb="";


		for ($n=0; $n < count($json); $n++) {
			$Line = each($json);
			error_log("Key: $Line[key] Value: $Line[value]");

			if ($Line[key] === 'request')
				$request = $Line[value];

			if ($Line[key] === 'pname')
				$pname = $Line[value];

			if ($Line[key] === 'lat')
				$lat = $Line[value];

			if ($Line[key] === 'lng')
				$lng = $Line[value];

			if ($Line[key] === 'numb')
				$numb = $Line[value];
		}

		error_log("request: $request pname: $pname numb: $numb");
		error_log("lat: $lat lng: $lng");


		switch ($request){
			case 'list':
				$markers = new markers();
				if($markers->listFile() == true){
					$c = count($markers->ret);
					error_log("list request(): count of records read is " . $c);
					$c--;
					for ($i = 0; $i < $c; $i++){
						$xxx = $markers->ret[$i] . '|';
						print("$xxx");
					}
					print($markers->ret[$c]);
				}
				else
					error_log("markerserver.php error attempting to list file.");
				break;

			case 'add':
				$markers = new markers();
				//die("next add: $pname, $lat, $lng, $type");
				if ($markers->addMarker($pname, $lat, $lng, $numb) == true)
					print("ok");
				else
					print("add fail");

				print($ans);
				break;

			case 'change':
				$markers = new markers();
				if($markers->changeFile($pname, $lat, $lng) == true)
					print("ok");
				else
					print("change fail");
				break;

			case 'delete':
				$markers = new markers();
				$ans = $markers->deleteMarker($numb);
				print($ans);
				break;

			default:

?>
<!doctype html>
<html lang='en'>
	<head>
	<title>marker server</title>
		<script>
			function makeChoice(){
				var	myJsonObject = {
						request: String,
						pname: String,
						lat: Number,
						lng: Number,
						numb: Number};
		
				if(document.forms[0].request.value == 'Add'){
					myJsonObject.request	= 'add';
					myJsonObject.pname		= 'Baltimore Test Project';
					myJsonObject.lat		= 39.2903848;
					myJsonObject.lng		= -76.61218930000001;
					myJsonObject.numb		= 2;
				}
				if(document.forms[0].request.value == 'Change'){
					myJsonObject.request	= 'change';
					myJsonObject.pname		= 'Changed Projectname';
					myJsonObject.lat		= 40.7143528;
					myJsonObject.lng		= -74.0059731;
				}
				if(document.forms[0].request.value == 'Delete'){
					myJsonObject.request	= 'delete';
					myJsonObject.numb		= 1;
				}
				if(document.forms[0].request.value == 'List'){
					myJsonObject.request	= 'list';
				}
				
				document.forms[0].data.value = JSON.stringify(myJsonObject);
				document.forms[0].submit();
			}
		</script>
	</head>
	<body>
		<h1>Marker Server Tester</h1>	
		<form action='#' method='get'>
			<input type='hidden' name='data'>
			<select name='request' id='request' onchange='makeChoice()'>
				<option selected value=''>Select One</option>
				<option>Add</option>
				<option>Change</option>
				<option>Delete</option>
				<option>List</option>
			</select>
		</form>
	</body>
</html>
<?php
		} 		// end od switch
?>
