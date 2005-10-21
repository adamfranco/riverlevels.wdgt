/**
 * This file contains functions for loading and displaying the USGS graph.
 * 
 * @copyright Copyright &copy; 2005, Adam Franco
 * @license http://www.gnu.org/copyleft/gpl.html GNU General Public License (GPL)
 *
 * @package waterwidgets.riverlevels
 * @url http://waterwidgets.sourceforge.net
 *
 * @version $Id$
 */ 
 
 
/*********************************************************
 * Globals
 *********************************************************/
var lastGraphLoaded;
var currentGraph;
var currentGraphGenerationHTML;
var DISCHARGE = '00060';
var GAGEHEIGHT = '00065';

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
	
	document.getElementById('about_front').style.display = "none";
	
	// Make sure that our refresh button is visible
	document.getElementById('front_refresh').style.visibility = "visible";
	document.getElementById('front_refresh').style.background = "url(../images/rot_refresh.gif) no-repeat top left";
	
	document.getElementById('stationPageLink').style.visibility = "hidden";
// 	if (!lastGraphLoaded || !lastGraphLoaded.complete)
// 		document.getElementById('levelsgraph').src = "images/loading_front.png";
	
	document.getElementById('levelsgraphThumb').src = "images/loading.png";
	loadGraphGenerationPage(DISCHARGE);
}

/**
 * Load the USGS page which triggers the graph generation.
 * This must be done first since the graphs cannot be queried directly.
 * 
 * @param string parameterCode The graph code to load, 00060 is discharge, 
 *								00065 is gage height.
 * @return void
 * @access public
 * @since 10/9/05
 */
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
					currentGraphGenerationHTML = req.responseText;
					if (!placeGraph(0) && parameterCode == DISCHARGE)
						loadGraphGenerationPage(GAGEHEIGHT);
				} else {
					// Show our error text.
					document.getElementById('loaderror_front').style.visibility = 'visible';
					document.getElementById('loaderror_back').style.visibility = 'visible';
					
					// If we successfully loaded an image previously, keep it around
					// since its old cached data is better than nothing.
					if (lastGraphLoaded) {
						document.getElementById('levelsgraph').src = lastGraphLoaded.src;
						document.getElementById('levelsgraphThumb').src = lastGraphLoaded.src;
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

/**
 * Search through the graph-generation page for the graph url. Place the 
 * graph url in our graph src element.
 * 
 * @param string htmlSource The HTML text of the graph-generation page.
 * @return void
 * @access public
 * @since 10/9/05
 */
function placeGraph(loadAttempt) {
	var regx = new RegExp("<img src=['\"](/nwisweb/data/img/[^'\"]+)['\"]", "i");
	var text = new String (currentGraphGenerationHTML);
	var matches = text.match(regx);
	
	if (matches) {
		// In order to get around the widget caching the image, we need a hash
		// to append to the url that does nothing, but makes the "browser" think
		// that this is a new image.
		if (loadAttempt == 0) {
			var now = new Date();
			var graphUrl = "http://waterdata.usgs.gov" + matches[1] + "?reloadstring=" + now.getTime();
			currentGraph = new Image();
			currentGraph.src = graphUrl;
		}
				
		if (currentGraph.complete) {
			document.getElementById('loaderror_front').style.visibility = 'hidden';
			document.getElementById('loaderror_back').style.visibility = 'hidden';
			
			document.getElementById('stationPageLink').style.visibility = "visible";
			document.getElementById('levelsgraph').src = currentGraph.src;
			document.getElementById('levelsgraphThumb').src = currentGraph.src;
			document.getElementById('front_refresh').style.background = "url(../images/refresh.png) no-repeat top left";
			
			lastGraphLoaded = new Image();
			lastGraphLoaded.src = currentGraph.src;
		} 
		
		else if (loadAttempt < 60) {
			var regx = new RegExp("/[^\\]*'/");
			var escapedHTML = text.replace(regx, "\'");
			var command = "placeGraph(" + (loadAttempt + 1) + ");";
			window.setTimeout(command, 1000);
		} 
		
		else {
			// Show our error text.
			document.getElementById('loaderror_front').style.visibility = 'visible';
			document.getElementById('loaderror_back').style.visibility = 'visible';
			
			// If we successfully loaded an image previously, keep it around
			// since its old cached data is better than nothing.
			if (lastGraphLoaded) {
				document.getElementById('levelsgraph').src = lastGraphLoaded.src;
				document.getElementById('levelsgraphThumb').src = lastGraphLoaded.src;
				document.getElementById('front_refresh').style.background = "url(../images/refresh.png) no-repeat top left";
			}
		}
		
		return true;
	} else
		return false;
}