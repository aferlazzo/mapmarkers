<?php

class markers{
	var $markerFile = 'markers.txt';
	var $fcount = 0;
	var $mapMarkers;
	var $buffer = '';
	var $ret = '';
	var $tempBuffer;
	var $jsonLines = array ();
/*
			each markerRecord {
				var $pname;
				var $lat;
				var $lng;
				}
				
*/

	/* The client requested a list of the marker file. Create a array of markers.
	 * Each marker will have 3 values: a name, a latitude, and a longitude.
	 * The marker file is a flat file of strings. We access each string with the
	 * fgets command which reads until it hits a new line character, which is included 
	 * in the returned value.
	 */

	private function fillBuffer() {
		//print("fillBuffer<br>");
		$this->ret='';
		$this->ret=array();
		$this->mapMarkers = @fopen ("$this->markerFile","r") or die ("Error: Can't open markers.txt.\n");

		while (($this->buffer = fgets($this->mapMarkers)) !== false) {
			//print("read record: $this->buffer<br>");

			$this->ret[] = preg_replace("'\n'", "", $this->buffer);		/* remove new line characters */

			//print("added json encoded record $j to \$ret table<br>");
		}
		if (!feof($this->mapMarkers)) {
			return("Error: unexpected fgets() fail\n");
		}
		fclose ($this->mapMarkers);
		
		//print("<pre>array filled:<br>");
		//var_dump($this->ret);
		//print("</pre><br>\n");
		return(true);
	}
	
	
	private function writeBuffer($buf) {
		$this->mapMarkers = fopen ("$this->markerFile","w") or die ("Error: Can't open markers.txt for writing. Check file permissions.\n");

		$n = count($buf);
		for ($i = 0; $i < $n; $i++){
			//print("<h1>line length: " . strlen($buf[$i]) . "</h1>");
			if(strlen($buf[$i]) > 0){
				$result = fwrite($this->mapMarkers, $buf[$i]."\n");
				if($result === false)
					return(false);
			}
		}

		fclose ($this->mapMarkers);
		return(true);
  	}




	public function listFile() {
		//print("listFile<br>");
		if($this->fillBuffer() == true)
			return(true);
		else
			return(false);
	}



	public function addMarker($pname, $lat, $lng, $numb) {
		$this->fillBuffer();

		$mcount = count($this->ret);

		// copy markers from point in file the new marker will be inserted
		for($k = 0, $i = $numb; $i < $mcount; $k++, $i++){
			$tempArray[$k] = $this->ret[$i];
		}

		$tcount = count($tempArray);

		$this->ret[$numb] = "{\"pname\":\"$pname\",\"lat\":\"$lat\",\"lng\":\"$lng\"}";
		// shift markers down 1 location in file
		for($i = $numb + 1, $k = 0; $k < $tcount; $i++, $k++){
			$this->ret[$i] = $tempArray[$k];
		}

		$mcount = count($this->ret);
		error_log("Resulting marker file with $mcount markers");
		
		for($i = 0; $i < $mcount; $i++){
			error_log("\$this->ret[$i]: " . $this->ret[$i]);
		}
		
		if($this->writeBuffer($this->ret) == true)
			return(true);
		else
			return(false);	
	}



	public function changeFile($pname, $lat, $lng) {
		//print("changeFile: $pname $numb<br>");
		$this->fillBuffer();
		$rcount = count($this->ret);
		//print("fillBuffer has $rcount records<br>\n");
		for($i= 0; i < $rcount; $i++){
			$xxx = $this->ret[$i];
			$obj = json_decode($xxx);
			if($obj->lat == $lat AND $obj->lng == $lng){
				$obj->pname = $pname;
				$this->ret[$i] = json_encode($obj);
				//print("marker $i lat: ". $obj->lat . "lng: " . $obj->lng . "<br>\n");

				return($this->writeBuffer($this->ret));
			}
		}
		return(false);
	}



	public function deleteMarker($numb){
		$this->fillBuffer();
		$markerCount = count($this->ret);
		if($numb < 0 OR $numb >= $markerCount)
			return("delete response: |$numb| is out of range");
		//die("delete request is for $numb, count is $markerCount");

		$xxx = $this->ret[$numb];
		$obj = json_decode($xxx);
		$deletedName = $obj->pname;

		if ($numb > 0){
			$part1 = array_slice($this->ret, 0, $numb);
			//print("PART1<pre>");  var_dump($part1); print("</pre>");
		}
		$part2 = array_slice($this->ret, $numb + 1);
		//print("PART2<pre>");  var_dump($part2); print("</pre>");
		if ($numb > 0)
			$this->ret = array_merge ($part1, $part2);
		else
			$this->ret = $part2;

		if ($this->writeBuffer($this->ret) == true)
			return("ok. Deleted record $numb, pname $deletedName");
		else
			return(false);
	}
} // end of class markers

/* for UNIT testing only 
	$markers = new markers();

	$markers->deleteMarker(0);
	print("<h1>deleted marker 0</h1><pre>");
	var_dump($markers->ret);
	print("</pre>");
// */
?>