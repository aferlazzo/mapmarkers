$(document).ready(function() {
	$('#markerImage').toggle(function(){
		$('#markerList').removeClass('hideIt').animate({'height': ($('#markers').height() + 60)}, 'slow');
	}, function(){
		$('#markerList').animate({'height': 50}, 'slow');

		setTimeout(function(){$('#markerList').addClass('hideIt');}, 900);
	});

	$('#markerImage').focus(function() {
		$(this).blur();
	});


	var projectsMap = {
		geocoder : '',
		map : '',
		markerArray : []
	};


	var makeMarker = function(latlng, pname) {
		var marker = new google.maps.Marker({
			position : latlng,
			map : projectsMap.map,
			title : pname
		});
/*
		var qq = latlng.toString();
		var ll = qq.split(',');
		if (confirm('test: do you want to delete marker '+pname+' from map? latlng: ' + latlng + ' ' + ll[0] + ' ' + ll[1]))
			removeProjectFromMap(pname, ll[0], ll[1]);
*/
		return marker;
	};

	var removeProjectFromMap = function(pname, lat, lng) {
		for (var i = 0; i < projectsMap.markerArray.length; i++){
			console.log('lat in table['+i+']: '+projectsMap.markerArray[i].lat + ' lng in table['+i+']: '+projectsMap.markerArray[i].lng +
						'\nlat passed: '+ lat + ' lng passed: ' + lng);
			if ((projectsMap.markerArray[i].lat == lat) && (projectsMap.markerArray[i].lng == lng)){
				console.log('removeProjectFromMap() removed ' + projectsMap.markerArray[i].pname + ' from map');
				projectsMap.markerArray[i].marker.setMap(null);
				projectsMap.markerArray[i].pname = 'deleted';
				projectsMap.markerArray[i].lat = 'deleted';
				projectsMap.markerArray[i].lng = 'deleted';
				projectsMap.markerArray[i].marker = 'deleted';
				break;
			}
		}
	};

	var addInfoWindowListener = function(b, m) {
		var infowindow;
		infowindow = new google.maps.InfoWindow({
			content : b
		});
		google.maps.event.addListener(m, 'click', function() {
			infowindow.open(projectsMap.map, m);
		});
	};



	// for the city named in the box or received by reading file

	var putProjectOnMap = function(pname, lat, lng) {
		var jObj = new Object(), ll, mm, cc = 'unknown', aa = '123 Any Street', bubbleString;
		ll = new google.maps.LatLng(lat, lng);
		mm = makeMarker(ll, pname);
		bubbleString = '<p class="contentBubble">Project details for<br>the ' + pname + '<br>will open in a new page.</p>';

		addInfoWindowListener(bubbleString, mm);

		// save the marker in the table in case it must be deleted from the map
		jObj.lat = lat;
		jObj.lng = lng;
		jObj.marker =  mm;
		projectsMap.markerArray.push(jObj);
		console.log('Added ' + pname + ' to marker table');
	};

	var zoomTo = function(zoomLevel) {
		projectsMap.map.setZoom(zoomLevel);
	};

	var initialize = function() {
		projectsMap.geocoder = new google.maps.Geocoder();
		// center of the map (eyeballed)
		var cLatlng = new google.maps.LatLng(14, 0);
		var myOptions = {
			zoom : 2,
			minZoom : 1,
			panControl : false,
			zoomControl : true,
			ZoomControlStyle : google.maps.ZoomControlStyle.SMALL,
			center : cLatlng,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			mapTypeControl : false,
			streetViewControl : false
		};

		projectsMap.map = new google.maps.Map(document.getElementById("mapCanvas"), myOptions);

		markerObject.listItRequest();
	};

	String.prototype.toTitleCase = function() {
		return this.replace(/([\w&`'‘’"“.@:\/\{\(\[<>_]+-? *)/g, function(match, p1, index, title) {
			if(index > 0 && title.charAt( index - 2) !== ":" && match.search(/^(a(nd?|s|t)?|b(ut|y)|en|for|i[fn]|o[fnr]|t(he|o)|vs?\.?|via)[ \-]/i) > -1)
				return match.toLowerCase();
			if(title.substring(index - 1, index + 1).search(/['"_{(\[]/) > -1)
				return match.charAt(0) + match.charAt(1).toUpperCase() + match.substr(2);
			if(match.substr(1).search(/[A-Z]+|&|[\w]+[._][\w]+/) > -1 || title.substring(index - 1, index + 1).search(/[\])}]/) > -1)
				return match;
			return match.charAt(0).toUpperCase() + match.substr(1);
		});
	};
	// Event listener to get the coordinates of the city named in the input box

	var getLatlng = function(currentLineNumber) {
		var address;
		//console.log("getting latlng for .pname.eq(" + currentLineNumber + "): " + $('.pname').eq(currentLineNumber).val());
		$('.pname').eq(currentLineNumber).val($(".pname").eq(currentLineNumber).val().toTitleCase());
		address = $(".pname").eq(currentLineNumber).val();

		if(($(".lat").eq(currentLineNumber).val() != '') && ( typeof  $(".lat").eq(currentLineNumber).val() != 'undefined')) {		// change

			// must call ajax - change with new name

		} else {								// new insert
			$(".pname").eq(currentLineNumber)
			.attr('title', 'Edit this name by typing over it')
			.val($(".pname").eq(currentLineNumber).val().toTitleCase());
			address = $(".pname").eq(currentLineNumber).val();
			//console.log('in latlng() looking up address: |' + address + '|');
			if(address !== '') {
				//console.log('marker server is now looking up latlng for ' + address);
				projectsMap.geocoder.geocode({
					'address' : address
				}, function(results, status) {
					var latlng = [], xx, sendString, url = 'markerserver.php';
					if(status == google.maps.GeocoderStatus.OK) {
						xx = (results[0].geometry.location).toString();
						latlng = xx.replace(/\(|\)| /g, '');
						// replace ( or ) or space

						latlng = latlng.split(',');
						//console.log('in latlng returning location: ' +address + ' has lat: '+latlng[0]+' lng: '+latlng[1]);
						markerObject.addItRequest(address, latlng[0], latlng[1], currentLineNumber, currentLineNumber);
					} else {
						if(status == google.maps.GeocoderStatus.ZERO_RESULTS) {
							alert('The location |' + address + '| was not found. Please enter another location.');
						} else {
							alert("Geocode was not successful for the following reason: " + status);
						}
					}
					return false;
				});
			} else {
				alert('the location you entered was not found.\nPlease try specifying the address in a different way.');
				return false;
			}
		}
	};
	/*
	*
	* "deferreds" are now built-into $.ajax().
	* "deferreds" decouple logic dependent on the outcome of a task from the task itself.
	*
	* With an ajax request, the client sends it but doesn't just sit there as the next step waiting
	* to know what happened on the server side. No, it just goes about its business of dealing with
	* client tasks.
	*
	* But there's got to be a means for the server to signal the result of the ajax request it received.
	* This is a little more elegant than just getting a server response code and status message as
	* a result of making a XMLHttpRequest.
	*
	* With deferreds, multiple callbacks can be bound to a task’s outcome, and any of these callbacks
	* can be bound even after the task is complete. The task in question may be asynchronous, but not
	* necessarily.
	*
	*
	*
	* As of jQuery 1.5, all of jQuery's Ajax methods return a superset of the XMLHTTPRequest object.
	* This jQuery XHR object, or "jqXHR," returned by $.get() implements the Promise interface,
	* giving it all the properties, methods, and behavior of a Promise.
	* For convenience and consistency with the callback names used by $.ajax(), it provides .error(),
	* .success(), and .complete() methods. These methods take a function argument
	* that is called when the request terminates, and the function receives the same arguments as the
	* correspondingly-named $.ajax() callback.

	*The Promise interface in jQuery 1.5 also allows jQuery's Ajax methods, including $.get(), to
	* chain multiple .success(), .complete(), and .error() callbacks on a single request, and even to
	* assign these callbacks after the request may have completed. If the request is already complete,
	* the callback is fired immediately.
	*
	* We can use the JSON format by making requests via $.getJSON instead of $.get.
	*/
	var markerObject = {
		sendString : String,
		url : 'markerserver.php',
		reportLines : [{
			pname : String,
			lat : Number,
			lng : Number
		}],
		jsonObject : {
			request : String,
			number : Number,
			pname : String,
			lat : Number,
			lng : Number,
			marker: Object
		},

		commonAjaxCall : function(url, sendString) {
			var thatAjax = this;
			// Assign handlers immediately after making the request,
			// and remember the jqxhr object for this request

			$('h1.editor+p').html('Loading...');
			var trx, pattern, aaa, jqxhr = $.getJSON(url, sendString, function() {
			console.log("default ajax success handler.");
			})
			.success(function(serverReply) {
			console.log("ajax Promise's second success handler sent this:\n"+serverReply);
			})
			.error(function(serverReply) {
			//console.log("handler for 'error' sent: "+serverReply.statusText);
			})
			.complete(function(serverReply) {
				var completeElementNumber, nameOfProject, jObj;
				$('h1.editor+p').html('');
				//console.log("browser sent a '" +markerObject.jsonObject.request + "' request to the server. The handler for 'Ajax complete' sent back: "+serverReply.responseText);


				jObj = JSON.parse(thatAjax.sendString);
				//console.log('Ajax call complete. serverReply.responseText:' + serverReply.responseText +'\njObj.request: ' + jObj.request);


				switch (jObj.request)
				{
					case 'list':
						listMarkersReturn(serverReply.responseText);
						//console.log("successful list request resulted in a server reply of\n" +serverReply.responseText);
						break;

					//delete report line if deleting the record was successful

					case 'delete':
						console.log('server reply: ' + serverReply.responseText);

						if(serverReply.responseText.substring(0, 19) == 'ok. Deleted record ') {
							xxx = serverReply.responseText.substring(19);
							nnn = xxx.indexOf(',');
							deletedIndex = serverReply.responseText.substr(19, nnn);
							completeElementNumber = deletedIndex;
							nameOfProject = $('.pname').eq(deletedIndex).val();
							trx = "tr" + completeElementNumber;
							console.log('project name ' + nameOfProject + ' deletedIndex: ' + deletedIndex + ' report row id: ' + trx);

							if(deletedIndex >= 0) {
								console.log('record deleted from server. removing element ' + trx + ' from report');
								$('#markers tr').eq(completeElementNumber).remove();
								$('#markerList').removeClass('hideIt').css('height', $('#markers').height() + 60);
								console.log('deleting ' + jObj.pname + ' from map');
								removeProjectFromMap(jObj.pname, jObj.lat, jObj.lng);
							}
						}
						break;


					case 'add':
						//console.log('server reply logic...add sendString: '+ this.sendString);
						//"request":"add","pname":"Punta Gorda","lat":"26.9297836","lng":"-82.04536640000003","numb":"0"
						console.log('done step 1 of adding |' + jObj.pname + '|' + jObj.lat + '|' + jObj.lng + '|\ntime to putProjectOnMap and generate marker');
						putProjectOnMap(jObj.pname, jObj.lat, jObj.lng);
						break;

					case 'add marker':
						console.log('done step 2 of adding ' + jObj.pname);
						break;
				}

			});


			// Set another completion function for the request above
			jqxhr.complete(function() {
				//alert("ajax Promise's optional second complete sent this");
			});
		},



		// adding a marker is a 2-step process: first we add the marker to the server with an 'add' request,
		// during which, in putProjectOnMap(), we obtain the mapmarker information.In putProjectOnMap(), we
		// put mapmarker information along with the lat/lng into a table that is used if/when a marker is deleted.

		addItRequest : function(pname, lat, lng, tableEntry, numb) {
			var myJsonObject = {
				request : String,
				pname : String,
				lat : Number,
				lng : Number,
				numb : Number
			};

			myJsonObject.request = 'add';
			myJsonObject.pname = pname;
			myJsonObject.lat = lat;
			myJsonObject.lng = lng;
			myJsonObject.numb = numb.toString();

			this.sendString = JSON.stringify(myJsonObject);
			$('.lat').eq(tableEntry).val(lat);
			$('.lng').eq(tableEntry).val(lng);
			console.log('in addItRequest...add sendString: ' + this.sendString);
			this.commonAjaxCall(this.url, {
				data : this.sendString
			});
		},

		changeItRequest : function(pname, lat, lng) {
			//update reportLines array
			this.jsonObject.pname = pname;
			this.jsonObject.lat = lat;
			this.jsonObject.lng = lng;
			this.jsonObject.request = 'change';

			this.sendString = JSON.stringify(this.jsonObject);
			console.log('change sendString: ' + this.sendString);
			this.commonAjaxCall(this.url, {
				data : this.sendString
			});
		},



		listItRequest : function() {
			var thatList = this;
			//save top level of object for enclosed functions to use
			this.jsonObject.request = 'list';
			this.sendString = JSON.stringify(this.jsonObject);
			console.log('list sendString: ' + this.sendString);
			this.commonAjaxCall(this.url, {
				data : this.sendString
			});

			// handler for 'list' requests

			listMarkersReturn = function(markerData) {
				var i, generatedReport, mLine, myMarkerArray = markerData.split("|"), mcount = myMarkerArray.length,
				myJsonObject;

				if(markerData == 'ok'){
					myJsonObject = JSON.parse(thatList.sendString);
					alert('added: ' + myJsonObject.pname + '  ' + myJsonObject.lat + '  ' + myJsonObject.lng);
					return;
				}

				console.log('in listMarkersReturn(): data received from server was split into ' + mcount + ' marker array entries');

				generatedReport = "<table id='markersHead'>";
				generatedReport += "<tr><th class='add'></th><th class='del'></th>";
				generatedReport += "<th class='pn'>Project Name</th><th class='lt'>Latitude</th>";
				generatedReport += "<th class='lg'>Longitude</th></tr></table>";
				generatedReport += "<table id='markers'><tbody>";

				for( i = 0; i < mcount; i++) {
					//console.log('|'+myMarkerArray[i]+'|')
					mLine = JSON.parse(myMarkerArray[i]);
					//console.log('record '+i+': pname: ' + mLine.pname+ ' lat: ' + mLine.lat + ' lng: ' + mLine.lng);

					generatedReport += "<tr><td class='add'>";
					generatedReport += "<input class='markerBtn addBtn' type='image' src='images/plusButton.png' title='Add a new project'></td>";
					generatedReport += "<td class='del'>";
					generatedReport += "<input class='markerBtn delBtn' type='image' src='images/minusButton.png' title='Delete this project'></td>";
					generatedReport += "<td class='pn'><input type='text' class='pname' ";
					generatedReport += "title='Edit this name by typing over it' value='";
					generatedReport += mLine.pname + "'></td><td class='lt'>";
					generatedReport += "<input type='text' class='lat' tabindex='-9' value='";
					generatedReport += mLine.lat + "'>";
					generatedReport += "</td><td class='lg'>";
					generatedReport += "<input type='text' class='lng' tabindex='-9' value='";
					generatedReport += mLine.lng + "'></td></tr>";


					//console.log('this.listItRequest() from reading file |' + mLine.pname + '|' + mLine.lat + '|' + mLine.lng + '|');
					putProjectOnMap(mLine.pname, mLine.lat, mLine.lng);
				}

				generatedReport += "</tbody></table>";
				document.getElementById('markerList').innerHTML = generatedReport;


				// Any time a pname change/edit is done,
				// either for just an pname edit
				// or for a project add
				$('.pname').change(function() {
					var activeElement = $('.pname').index($(this)), nameOfProject = $('.pname').eq(activeElement).val(), lat, lng, lll;

					//console.log('changing name on project row ' + activeElement + ' project ' + nameOfProject);

					// if no lat value exists marker must be for an add request
					lll = $('.lat').eq(activeElement).val();
					if(( typeof lll == 'undefined') || (lll == '')) {
						console.log('creating new marker: ' + activeElement + ' pname ' + nameOfProject);
						getLatlng(activeElement);
					} else {			//it is really a change request
						lat = lll;
						lng = $('.lng').eq(activeElement).val();
						console.log('value of current lat/lng entry: [' + activeElement + ']: ' + lat + '/' + lng);
						console.log('a real change of pname: ' + nameOfProject);
						thatList.changeItRequest(nameOfProject, lat, lng);
						// important! look at how 'List' is defined before changing
					}
				});
				$('.delBtn').click(function() {
					var i = $(this).index('.delBtn');

					thatList.deleteItRequest(i);
					// important! look at how 'thatList	' is defined before changing
				});
				$('.addBtn').click(function() {
					var totalRows, newLast, oldLast, theButton, nameOfProject, tcount;
					//alert('add');
					theButton = $('.addBtn').index($(this));
					// save a reference to this button's DOM element
					nameOfProject = $('.pname').eq(theButton).val();
					//alert('add button '+theButton+' was clicked');
					totalRows = $('#markers tr').size();

					//console.log('total index:' + totalRows + ' insert before index:' + theButton);
					$('#trTemplate').clone(true, true)
					.insertBefore($('#markers tr').eq(theButton));
					//console.log(".animate({'height': 30}, 'slow', 'linear'");
					$('#markers #trTemplate').removeAttr('id');
					//console.log('cloned tr is now index ' + theButton);

					$('.pname').eq(theButton)
					.focus()
					.attr('title', 'Enter the address of the project to put the marker on the map');

					//console.log('cloned pname is now named ' + $('.pname').eq(theButton).val());

					$('#markerList').removeClass('hideIt').css({'height' : $('#markers').height() + 60});

					console.log('insert done');

				});
			}		// end of listMarkersReturn()
		}, 			// end of listItRequest










		// markers can only be deleted via the markereditor.htm script

		deleteItRequest : function(rowNumber) {
			var nameOnRow = $('.pname').eq(rowNumber).val();
			console.log('test: pname on row' + rowNumber + ' is project ' + nameOnRow);
			console.log('row ' + rowNumber + ' is project ' + nameOnRow);
;
			if ($('.lat').eq(rowNumber).val() == ''){		//marker not really added yet...
				$('#markers tr').eq(rowNumber).remove();
				$('#markerList').removeClass('hideIt').css({'height' : $('#markers').height() + 60});
			}else{
				if (confirm('Are you sure you want to delete ' + nameOnRow + ' marker number ' + rowNumber + '?')) {
					this.jsonObject.request = 'delete';
					this.jsonObject.numb = rowNumber;
					this.jsonObject.pname = $('.pname').eq(rowNumber).val();
					this.jsonObject.lat = $('.lat').eq(rowNumber).val();
					this.jsonObject.lng = $('.lng').eq(rowNumber).val();
					this.sendString = JSON.stringify(this.jsonObject);
					console.log('delete sendString: ' + this.sendString);
					this.commonAjaxCall(this.url, {
						data : this.sendString
					});
				}
			}
		}
	};
	// end markerObject

	initialize();
});
