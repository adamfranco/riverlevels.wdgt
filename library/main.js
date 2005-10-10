/*********************************************************
 * Global constants
 *********************************************************/
var lastUpdateTime = 0;
var lastGraphLoaded;
var timerId;
var DISCHARGE = '00060';
var GAGEHEIGHT = '00065';

/**
 * Print our dynamic form elements, select lists and buttons.
 * As well, do any additional needed initialization steps.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function init() {
	printStateList();
	
	printUpdateOptions();
	
	var doneButton = document.getElementById("done");
    createGenericButton(doneButton, "Done", showFront);
    
    if (window.widget) {
		widget.onshow = onshow;
		widget.onhide = onhide;
	}
}


/*********************************************************
 * Dashboard Open/Close functions
 *********************************************************/

/**
 * This method is run every time dashboard is shown. Here we make sure that 
 * our graph is up to date if it has been a while since dashboard has been shown.
 * As well, set the next update time if we don't need to update yet.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function onshow () {
	var now = new Date();
	if (document.getElementById('stationId').value) {
		
		// If it is later than the last planned update, update the graph
		if (now.getTime() > lastUpdateTime + getUpdateInterval()) {
			loadGraph();
		
		} 
		// Otherwise, set a timer so that we can update at our needed time.
		else {
			var nextUpdateInterval = lastUpdateTime + getUpdateInterval() - now.getTime();
			setLoadTimerForInterval(nextUpdateInterval);
 		}
	}
}

/**
 * This method is run every time dashboard is closed. Here we make sure to
 * clear our reload timer so that we do not reload images while dashboard is
 * hidden.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function onhide () {
	clearLoadTimer();
}


/*********************************************************
 * Refresh timer functions
 *********************************************************/

/**
 * Sets a timer to refresh at the standard interval.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function setLoadTimer() {
	setLoadTimerForInterval(getUpdateInterval());
}

/**
 * Sets a timer to refresh at the specified interval
 * 
 * @param integer interval Milliseconds till desired refresh.
 * @return void
 * @access public
 * @since 10/9/05
 */
function setLoadTimerForInterval ( interval) {
	clearLoadTimer();
	timerId = setInterval("loadGraph();", interval);
	
	var nextUpdate = new Date();
	var now = new Date();
	nextUpdate.setTime(now.getTime() + interval);
	document.getElementById('nextUpdate').innerHTML = "Next Update: " + nextUpdate.toString();
}

/**
 * Clear the timer. We must do this when Dashbord closes so as to not run while
 * dashboard isn't shown.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function clearLoadTimer() {
	if (timerId != null) {
		clearInterval(timerId);
		timerId = null;
	}	
}

/**
 * Set the refresh timer to its standard time, but only if it already exists.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function resetTimerIfExists () {
	if (timerId != null) {
		setLoadTimer();
	}
}

/**
 * Answer the millisecond update interval specified by the user.
 * 
 * @return integer
 * @access public
 * @since 10/9/05
 */
function getUpdateInterval() {
	if (document.getElementById('updateInterval').value) {
		var intervalNumber = new Number(document.getElementById('updateInterval').value);
		return intervalNumber.valueOf();
	} else
		return 1 * 60 * 60 * 1000; // num hours * 60(min) * 60(sec) * 1000(millisec)
}


/*********************************************************
 * Graph display functions
 *********************************************************/

/**
 * Load/Refresh the graph. If availible a discharge graph (code 00060) is
 * displayed rather than a gauge-height graph (code 00065) as the discharge is 
 * generally a better indicator of river behavior.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function loadGraph() {
	var now = new Date();
	lastUpdateTime = now.getTime();
	document.getElementById('lastUpdate').innerHTML = "Last Update: " + now.toString();
	
	setLoadTimer();
	
	document.getElementById('stationPageLink').style.visibility = "hidden";
	document.getElementById('levelsgraph').src = "images/loading_front.png";
	document.getElementById('levelsgraphThumb').src = "images/loading.png";
	loadGraphGenerationPage(DISCHARGE);
}

function loadGraphGenerationPage(parameterCode) {
	var state = document.getElementById('stateCode').value;
	if (document.getElementById('stationId').value != null) {
		var stationId = document.getElementById('stationId').value;
		
		// Make sure that our refresh button is working if we have a stationId
		document.getElementById('refresh').disabled = false;
		
		
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
					// Hide our error text
					document.getElementById('loaderror_front').style.visibility = 'hidden';
					document.getElementById('loaderror_back').style.visibility = 'hidden';
					
					// place the graph.
					// If we can't place the graph, try a gageheight graph
					if (!placeImage(req.responseText) && parameterCode == DISCHARGE)
						loadGraphGenerationPage(GAGEHEIGHT);
				} else {
					// Show our error text.
					document.getElementById('loaderror_front').style.visibility = 'visible';
					document.getElementById('loaderror_back').style.visibility = 'visible';
					
					// If we successfully loaded an image previously, keep it around
					// since its old cached data is better than nothing.
					if (lastGraphLoaded) {
						document.getElementById('levelsgraph').src = lastGraphLoaded;
						document.getElementById('levelsgraphThumb').src = lastGraphLoaded;
					}
				}
			}
		}
				
		req.open("GET", url, true);
		req.send(null);
	} else {
		// Make sure that our refresh button is not working if we don't 
		// have a stationId
		document.getElementById('refresh').disabled = true;
	}
}

function placeImage(htmlSource) {
	var regx = new RegExp("<img src=['\"](/nwisweb/data/img/[^'\"]+)['\"]", "i");
	var text = new String (htmlSource);
	var matches = text.match(regx);
	
	if (matches) {
		// In order to get around the widget caching the image, we need a hash
		// to append to the url that does nothing, but makes the "browser" think
		// that this is a new image.
		var now = new Date();
		var graphUrl = "http://waterdata.usgs.gov" + matches[1] + "?reloadstring=" + now.getTime();
		lastGraphLoaded = graphUrl;
		document.getElementById('stationPageLink').style.visibility = "visible";
		document.getElementById('levelsgraph').src = graphUrl;
		document.getElementById('levelsgraphThumb').src = graphUrl;
		
		return true;
	} else
		return false;
}

/**
 * Open the USGS page for the current station.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
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
	var html = "<select id='stationId' onchange=\"selectStation();\">\n";
	html += "\t<option value=''>Select Station...</option>\n";
	for (var i = 0; i < sortedNames.length; i++) {
			html += "\t<option value='" + ids[sortedNames[i]] + "'>" + sortedNames[i] + "</option>\n";
	}
	html += "</select>\n";
	document.getElementById('stationList').innerHTML = html;
}

/**
 * Select the station
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function selectStation () {
	// unset the old graph's last-loaded images.
	lastGraphLoaded = null;
	
	// load the graph
	loadGraph();
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
	document.getElementById('fliprollie').style.visibility = "hidden";
	
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