var statesLong = new Array (
					'Alabama',
					'Alaska',
					'Arizona',
					'Arkansas',
					'California',
					'Colorado',
					'Connecticut',
					'Delaware',
					'Dist. of Columbia',
					'Florida',
					'Georgia',
					'Hawaii',
					'Idaho',
					'Illinois',
					'Indiana',
					'Iowa',
					'Kansas',
					'Kentucky',
					'Louisana',
					'Maine',
					'Maryland',
					'Massachusetts',
					'Michigan',
					'Minnesota',
					'Mississippi',
					'Missouri',
					'Montana',
					'Nebraska',
					'Nevada',
					'New Hampshire',
					'New Jersey',
					'New Mexico',
					'New York',
					'North Carolina',
					'North Dakota',
					'Ohio',
					'Oklahoma',
					'Oregon',
					'Pennsylvania',
					'Puerto Rico',
					'Rhode Island',
					'South Carolina',
					'South Dakota',
					'Tennessee',
					'Texas',
					'Utah',
					'Vermont',
					'Virgin Islands',
					'Virginia',
					'Washington',
					'West Virginia',
					'Wisconsin',
					'Wyoming');
					
var states = new Array (
					'al',
					'ak',
					'az',
					'ar',
					'ca',
					'co',
					'ct',
					'de',
					'dc',
					'fl',
					'ga',
					'hi',
					'id',
					'il',
					'in',
					'ia',
					'ks',
					'ky',
					'la',
					'me',
					'md',
					'ma',
					'mi',
					'mn',
					'ms',
					'mo',
					'mt',
					'ne',
					'nv',
					'nh',
					'nj',
					'nm',
					'ny',
					'nc',
					'nd',
					'oh',
					'ok',
					'or',
					'pa',
					'pr',
					'ri',
					'sc',
					'sd',
					'tn',
					'tx',
					'ut',
					'vt',
					'vi',
					'va',
					'wa',
					'wv',
					'wi',
					'wy');

var lastUpdateTime = 0;
var timerId;

if (window.widget) {
	widget.onshow = onshow;
	widget.onhide = onhide;
}

function onshow () {
	var now = new Date();
	if (document.getElementById('stationId').value) {
		
		if (now.getTime() > lastUpdateTime + getUpdateInterval()) {
			loadDischargeImage();
		
		} else {
			var nextUpdateInterval = lastUpdateTime + getUpdateInterval() - now.getTime();
			setLoadTimerForInterval(nextUpdateInterval);
 		}
	}
}

function onhide () {
	clearLoadTimer();
}

function init() {
	printStateList();
	printUpdateOptions();
	var doneButton = document.getElementById("done");
    createGenericButton(doneButton, "Done", showFront);
}

function setLoadTimer() {
	setLoadTimerForInterval(getUpdateInterval());
}

function setLoadTimerForInterval ( interval) {
	clearLoadTimer();
	timerId = setInterval("loadDischargeImage();", interval);
	
	var nextUpdate = new Date();
	var now = new Date();
	nextUpdate.setTime(now.getTime() + interval);
	document.getElementById('nextUpdate').innerHTML = "Next Update: " + nextUpdate.toString();
}

function clearLoadTimer() {
	if (timerId != null) {
		clearInterval(timerId);
		timerId = null;
	}	
}

function resetTimerIfExists () {
	if (timerId != null) {
		setLoadTimer();
	}
}

function getUpdateInterval() {
	if (document.getElementById('updateInterval').value) {
		var intervalNumber = new Number(document.getElementById('updateInterval').value);
		return intervalNumber.valueOf();
	} else
		return 1 * 60 * 60 * 1000; // num hours * 60(min) * 60(sec) * 1000(millisec)
}

function loadDischargeImage() {
	var now = new Date();
	lastUpdateTime = now.getTime();
	document.getElementById('lastUpdate').innerHTML = "Last Update: " + now.toString();
	
	setLoadTimer();
	
	document.getElementById('stationPageLink').style.visibility = "hidden";
	document.getElementById('levelsgraph').src = "images/loading_front.png";
	document.getElementById('levelsgraphThumb').src = "images/loading.png";
	loadImage("00060");
}

function loadGageHeightImage() {
	loadImage("00065");
}

function openPage() {
	var state = document.getElementById('stateCode').value;
	if (document.getElementById('stationId').value != null
		&& document.getElementById('stationId').value != "")
	{
		var stationId = document.getElementById('stationId').value;
		
		// set the "onclick" of the image to go to the station page
		var stationPageUrl = "http://waterdata.usgs.gov/" + state + "/nwis/uv/?site_no=" + stationId + "&PARAmeter_cd=00060,00065";
		if (window.widget) {
			widget.openURL(stationPageUrl);
		} else {
			window.open(stationPageUrl, 'StationPage');
		}
	}
}

function loadImage(parameterCode) {
	var state = document.getElementById('stateCode').value;
	if (document.getElementById('stationId').value != null) {
		var stationId = document.getElementById('stationId').value;
		
		
		// Fist need to load the "presentation graph" page in order for that
		// to trigger the server creating (and caching) the image, since
		// we can't query for the image directly. We can then scrape the
		// image url from the resulting page.
		var req = new XMLHttpRequest();
		var url = "http://waterdata.usgs.gov/" + state;
		url += "/nwis/uv/?PARAmeter_cd=" + parameterCode + "&format=img&site_no=";
		url += stationId;
		url += "&set_logscale_y=1&begin_date=";
		var start = new Date();
		start.subtractDays(7);
				
		url += start.getFullYear();
		if (start.getMonth() < 9)
			url += "0" + (start.getMonth() + 1);
		else
			url += (start.getMonth() + 1);
		if (start.getDate() < 10)
			url += "0" + start.getDate();
		else
			url += start.getDate();
				
		req.onreadystatechange = function () {								
			// only if req shows "loaded"
			if (req.readyState == 4) {
				// only if we get a good load should we continue.
				if (req.status == 200) {
					placeImage(state, req.responseText);
				} else {
					alert("There was a problem retrieving the XML data:\n" +
						req.statusText);
				}
			}
		}
				
		req.open("GET", url, true);
		req.send(null);
	}
}

function placeImage(state, htmlSource) {
	var regx = new RegExp("<img src=['\"](/nwisweb/data/img/[^'\"]+)['\"]", "i");
	var text = new String (htmlSource);
	var matches = text.match(regx);
	
	// clear the cache of any old versions:
	for (var i=0; i < document.images.length; i++) {
		document.images[i] = null;
	}
	
	if (matches) {
		document.getElementById('stationPageLink').style.visibility = "visible";
		document.getElementById('levelsgraph').src = "http://waterdata.usgs.gov/" + matches[1];
		document.getElementById('levelsgraphThumb').src = "http://waterdata.usgs.gov/" + matches[1];
	} else
		loadGageHeightImage();
}

function printStateList () {
	var html = "<select id='stateCode' onchange='getStationList();'>\n";
	html += "\t<option value=''>Select State...</option>\n";
	for (var i = 0; i < states.length; i++) {
		html += "\t<option value='" + states[i] + "'>" + statesLong[i] + "</option>\n";
	}
	html += "</select>\n";
	document.getElementById('stateList').innerHTML = html;
}

function printUpdateOptions () {
	var html = "<select id='updateInterval' onchange='resetTimerIfExists();'>\n";
// 	html += "\t<option value='" + (60 * 1000) + "'>1 min</option>\n";
// 	html += "\t<option value='" + (2 * 60 * 1000) + "'>2 min</option>\n";
	html += "\t<option value='" + (30 * 60 * 1000) + "'>30 min</option>\n";
	for (var i = 1; i < 12; i++) {
		html += "\t<option value='" + (i * 60 * 60 * 1000) + "'>" + i;
		html += " hour";
		if (i > 1)
			html += "s";
		html += "</option>\n";
	}
	html += "</select>\n";
	document.getElementById('updateIntervalList').innerHTML = html;
}

function getStationList() {
	var state = document.getElementById('stateCode').value;
	
	var html = "<select id='stationId'>\n";
	html += "\t<option value=''>Loading Station list...</option>\n";
	html += "</select>\n";
	document.getElementById('stationList').innerHTML = html;
	
	var url = "http://waterdata.usgs.gov/" + state + "/nwis/current?";
	url += "index_pmcode_STATION_NM=1";
	url += "&index_pmcode_DATETIME=2";
	url += "&index_pmcode_00065=3";
	url += "&index_pmcode_00060=4";
	url += "&index_pmcode_MEAN=";
	url += "&index_pmcode_MEDIAN=";
	url += "&index_pmcode_00010=";
	url += "&index_pmcode_00011=";
	url += "&index_pmcode_00020=";
	url += "&index_pmcode_00021=";
	url += "&index_pmcode_00095=";
	url += "&index_pmcode_00400=";
	url += "&index_pmcode_70969=";
	url += "&index_pmcode_00045=";
	
	url += "&column_name=station_nm";
	url += "&column_name=site_no";
// 	url += "&column_name=basin_cd";
	
	url += "&sort_key=station_nm";
	url += "&sort_key_2=station_nm";
// 	url += "&group_key=basin_cd";
// 	url += "&html_table_group_key=basin_cd";

	url += "&format=sitefile_output";
	url += "&sitefile_output_format=xml";
	url += "&rdb_compression=file";
	url += "&list_of_search_criteria=realtime_parameter_selection";
	
	var req = new XMLHttpRequest();
		
	req.onreadystatechange = function () {
		// only if req shows "loaded"
		if (req.readyState == 4) {
			// only if we get a good load should we continue.
			if (req.status == 200) {
				populateSiteList(req.responseXML, state);
			} else {
				alert("There was a problem retrieving the XML data:\n" +
					req.statusText);
			}
		}
	}
	
	req.open("GET", url, true);
	req.send(null);
}

function populateSiteList(xmlDocument, state) {
	// Create an array of names and and associative array of ids, so we can sort
	// the names.	
	var stationElements = xmlDocument.documentElement.getElementsByTagName("site");
	var names = new Array(stationElements.length);
	var ids = new Array(stationElements.length);
	
	for (var i = 0; i < stationElements.length; i++) {
		var numberElements = stationElements[i].getElementsByTagName("site_no");
		var nameElements = stationElements[i].getElementsByTagName("station_nm");
		
		if (numberElements[0] && nameElements[0]) {
			var id = numberElements[0].firstChild.nodeValue;
			var name = new String(nameElements[0].firstChild.nodeValue);
			// Most names are all uppercase, lets just finish off the rest.
			name = name.toUpperCase();
			
			names[i] = name.valueOf();
			ids[name.valueOf()] = id;
		}
	}
	var sortedNames = names.sort();
	
	// Write our select element
	var html = "<select id='stationId' onchange=\"loadDischargeImage();\">\n";
	html += "\t<option value=''>Select Station...</option>\n";
	for (var i = 0; i < sortedNames.length; i++) {
			html += "\t<option value='" + ids[sortedNames[i]] + "'>" + sortedNames[i] + "</option>\n";
	}
	html += "</select>\n";
	document.getElementById('stationList').innerHTML = html;
}

Date.prototype.subtractDays = function (num) {
	// milliseconds since 1/1/1970
	// current milliseconds - num days * hr * mn * sc * milsc
	this.setTime(this.getTime() - (num * 24 * 60 * 60 * 1000));
}

function enterflip(event) {
	document.getElementById('fliprollie').style.visibility = "visible";
}

function exitflip(event) {
	document.getElementById('fliprollie').style.visibility = "hidden";
}

function showBack(event) {
	var front = document.getElementById("front");
    var back = document.getElementById("back");
    
	if (window.widget)
		widget.prepareForTransition("ToBack");
		
	front.style.display = "none";
	back.style.display = "block";
	document.body.style.backgroundImage = "url(images/Back.png)";
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);
}

function showFront(event) {
	var front = document.getElementById("front");
    var back = document.getElementById("back");
    
	if (window.widget)
		widget.prepareForTransition("ToFront");
		
	front.style.display = "block";
	back.style.display = "none";
	document.body.style.backgroundImage = "url(Default.png)";
	
	if (window.widget)
		setTimeout ('widget.performTransition();', 0);
}