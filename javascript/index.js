/**
 * Global Variables
 * @type {[array]} arrayofCoord {[An array holding the input files as coord objects]}
 * @type {[coord]} currentcoord {[Holds the current location]}
 */
 var dropzone = document.getElementById('dropzone');
var arrayofCoord = [];// An array holding the input files coordinates as 'coord' objects
var currentCoord = new coord();

/**
 * Read the dropped files and stores the values into arrayofCoord
 * @param  {[files]} files [The file to be read]
 * @return {[none]}       [no return]
 */
 function getFiles(files){
 	var i, fileData = [];
	//Loop through the all the files and store in an array
	for(i = 0 ; i < files.length ; i ++){
		fileData.push(files[i]);

		//New File Reader
		var reader = new FileReader();
		reader.readAsText(files[i]);

		//Triggered once file has been loaded by the fileReader
		reader.addEventListener("load", function () {
			//Entire File
			//console.log(this.result);
			var coordPairs = [];

			//By Lines
			var lines = this.result.split('\n');
			for(var line = 0; line < lines.length-1; line++){
				console.log(lines[line]);
				coordPairs.push(lines[line]);
			}
			toCoordinates(coordPairs);

		}, false);
	}
}
/**
 * Initialize the Map and Geocode Operations
 */
 function initMap(){
 	var map = new google.maps.Map(document.getElementById('map'), {
 		center: {lat:0, lng:0},
 		zoom: 13
 	});
 	var infoWindow = new google.maps.InfoWindow({map: map});
 	var geocoder = new google.maps.Geocoder();

 	document.getElementById('submit').addEventListener('click', function() {
 		geocodeAddress(geocoder, map);
 	});

 	if(navigator.geolocation){
 		navigator.geolocation.getCurrentPosition(getLocationSuccess,getLocationFailure);
 	}

 	function getLocationSuccess(position){
 		var pos = {
 			lat : position.coords.latitude,
 			lng : position.coords.longitude
 		};
 		console.log("The current lat " + pos.lat + " the current long " +pos.lng);
		currentCoord.lat = pos.lat;//Update the current coordinate latitude
		currentCoord.lng = pos.lng;//Update the current coordinate longitude 
		infoWindow.setPosition(pos);
		infoWindow.setContent("Location Found");
		map.setCenter(pos);
	}
//Callback fn is unsuccessful
function getLocationFailure(error){
	switch(error.code){
		case 0 : 
		document.getElementById("demo").innerHTML = error.message;
		break;
		case 1 : 
		document.getElementById("demo").innerHTML = error.message;
		break;
		case 2 :
		document.getElementById("demo").innerHTML = error.message;
		break;
	}
}
}
/**
 * Once the page loads, find the current user location
 * @return {[type]} [description]
 */
 window.onload = function(){
 	initMap();
 }
/**
 * Constructor for coord object
 * @param  {[int]} lat [latitude property]
 * @param  {[int]} lng [longitube property]
 * @return {[none]}     [no return]
 */
 function coord(lat,lng){	
 	this.lat = lat || 0;
 	this.lng = lng || 0;
 }
/**
 * Event Listener that get the current users location
 */
 document.getElementById("getLocationBtn").addEventListener("click",initMap);

//Convert an array of functions to an array of coord objects
//Return an aarray of coord objects
function toCoordinates(aryCoordPairs){
	//var arrayofCoord = [], i; 
	var i;
	for(i=0; i<aryCoordPairs.length; i++){
		var temp = aryCoordPairs[i].split(',');
		var nCoords = new coord(temp[0],temp[1]);
		arrayofCoord.push(nCoords);
		console.log()
	}

	return arrayofCoord;
}

/**
 * Create a webworker to calculate the haversine formula
 * @return {[type]}               [description]
 */
 document.getElementById("calcHaversineBtn").addEventListener("click",function(){
 	calcHaversine(arrayofCoord,currentCoord);
 });

/**
 * Function that creates a web worker to calculate the Haversine of current location and location(s) in file
 * @current : The current coordinates
 * @list : The list of coordinates 
 */
 function calcHaversine(list, current){
 	var ww = new Worker('javascript/webworker.js');
 	var listSize = list.length, j;
 	ww.addEventListener('message',handleWorkerMsg);
 	ww.addEventListener('error',handleWorkerErr);

 	var haversine = {
 		lat1 : null,
 		lat2 : null,
 		lng1 : null,
 		lng2 : null 
 	};

	//Loop through the list
	for(j = 0; j < listSize; j++){
		haversine.lat2 = list[j].lat;
		haversine.lat1 = current.lat;
		haversine.lng2 = list[j].lng;
		haversine.lng1 = current.lng;
		ww.postMessage(haversine);
	}

	function handleWorkerMsg(event){
		console.log("Message recieved the distnace is " + event.data.listlat +" , " + event.data.listlng);
		console.log("Message recieved the distnace is " + event.data.currlat +" , " + event.data.currlng);

		var geocoder = new google.maps.Geocoder;
		var geocoderList = new google.maps.Geocoder;
		var address; 
		var distance = event.data.dist;

		var latlingList = {
			lat : parseFloat(event.data.listlat),
			lng : parseFloat(event.data.listlng)
		};
		
		geocoder.geocode({'location' : latlingList}, function(results, status){
			if(status === 'OK'){
				if(results[0]){
					console.log("The list address " + results[0].formatted_address);
					address = results[0].formatted_address;
					console.log("Var says " + address);

					console.log("Var2 says " + address);
					var par = document.createElement("p");
					par.className = "results_txt";
					var txt = document.createTextNode("The distance from your current location to " + address + " is " + Math.round(distance) +"km");
					par.appendChild(txt);

					document.getElementById("result_container").appendChild(par);
				}
			}
		});

	}	
	function handleWorkerErr(){
		console.warn("Error in Web worker " +event.message);
	}
}

/**
 * function reverseGeocode
 */
 function reverseGeocodeAddress(geocode,latling){

 }

/**
* Sends a request to retrieve the geolocation entered by the user
*/
function geocodeAddress(geocoder, resultsMap) {
	var address = document.getElementById('address').value;
	geocoder.geocode({'address': address}, function(results, status) {
		if (status === 'OK') {
			resultsMap.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: resultsMap,
				position: results[0].geometry.location
			});
			currentCoord.lat = results[0].geometry.location.lat();
			currentCoord.lng = results[0].geometry.location.lng();
			//console.log(results[0].formatted_address);
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}
//Whenever you DnD an object into the drop zone
dropzone.ondrop = function(e){
	e.preventDefault();
	this.className = 'dropzone';
	getFiles(e.dataTransfer.files);
}
//Whenever an object is placed into the dropzone
dropzone.ondragover = function(){
	this.className = 'dropzone dragover';
	return false;
};
//Whenever you are dragging an object 
dropzone.ondragleave = function(){
	this.className = 'dropzone';
	return false;
};

