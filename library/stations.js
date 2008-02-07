/**
 * This file contains functions for loading and displaying Stations
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
 * Option printing functions
 *********************************************************/

/**
 * Print the select list of all of the states.
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function printStateList () {
	var html = "<select id='stateCode' onchange='getStationList();'>\n";
	html += "\t<option value=''>Select State...</option>\n";
	for (var i = 0; i < states.length; i++) {
		html += "\t<option value='" + states[i] + "'>" + statesLong[i] + "</option>\n";
	}
	html += "</select>\n";
	document.getElementById('stateList').innerHTML = html;
}

/**
 * Query the USGS site for the list of stations for the selected state
 * 
 * @return void
 * @access public
 * @since 10/9/05
 */
function getStationList() {
	var state = document.getElementById('stateCode').value;
	
	if (window.widget) {
		widget.setPreferenceForKey(state, createkey("state"));
	}
	
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
				populateSiteList(req.responseXML);
			} else {
				alert("There was a problem retrieving the XML data:\n" +
					req.statusText);
			}
		}
	}
	
	req.open("GET", url, true);
	req.send(null);
}

/**
 * Sort the stations alphabetically and print a select list of all of them.
 * 
 * @param DomDocument xmlDocument The XML station information
 * @return void
 * @access public
 * @since 10/9/05
 */
function populateSiteList(xmlDocument) {
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
	
	clearMissingGraphTypes();
	
	// load the graph
	loadGraph();
	
	if (window.widget) {
		widget.setPreferenceForKey(
			document.getElementById('stationId').value,
			createkey("station"));
	}
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
