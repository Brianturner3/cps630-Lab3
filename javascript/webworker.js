//Calculate the Haversine (distance between current loc. and doc. loc)
function calcHaversine(evt){
	var dLng = degToRad(evt.data.lng2 - evt.data.lng1); //Difference between the longitudes
	var dLat = degToRad(evt.data.lat2 - evt.data.lat1); //Difference between the latitudes
	var r = 6371; //radius of the earth
	var d; // distance we're trying to calculate
	var a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.sin(dLng/2)*Math.sin(dLng/2)*Math.cos(degToRad(evt.data.lat1))*Math.cos(degToRad(evt.data.lat2))
	var c = 2 * Math.sqrt(a);
	d = c * r;

	//If I have to reversegeocode the values within the text file thehn create an object that stores the initial 4 values 
	//lng1,ln2,lat1,lat2 and attach the d values as well
	//Ex. 
	var response = {
		currlng : evt.data.lng1,
		listlng : evt.data.lng2,
		currlat : evt.data.lat1,
		listlat : evt.data.lat2,
		dist : d
	}
	self.postMessage(response);
}

//Converts Degrees to Radians
function degToRad(deg){
	return deg * (Math.PI/180);
}

self.addEventListener("message",calcHaversine);