/**
 * This is the main Javascript file that contains initialization functions.
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
 * Widget Open (instantiate) / Close (destroy) functions
 *********************************************************/

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
	
	// Retrieve any stored preferences
	if (window.widget) {
		var updateInterval = widget.preferenceForKey(createkey("update_interval"));
		if (updateInterval && updateInterval.length > 0)
			document.getElementById('updateInterval').value = updateInterval;
			
		var state = widget.preferenceForKey(createkey("state"));
		if (state && state.length == 2) {
			document.getElementById("stateCode").value = state;
			getStationList();
			
			var station = widget.preferenceForKey(createkey("station"));
			if (station && station.length > 0)
				initializeStation(station);
		}
	} 
	// Otherwise, set some nice defaults
	else {
// 		document.getElementById('updateInterval').value = 3 * 60 * 60 * 1000;
// 		document.getElementById("stateCode").value = "vt";
// 		getStationList();
// 		initializeStation("04288000");
	}
	
	var doneButton = document.getElementById("done");
    createGenericButton(doneButton, "Done", showFront);
    
    if (window.widget) {
		widget.onshow = onshow;
		widget.onhide = onhide;
		widget.onremove = removalHandler;
	}
}

/**
 * Remove our preferences for this widget
 * 
 * @param event
 * @return void
 * @access public
 * @since 10/18/05
 */
function removalHandler (event) {
	if (window.widget) {
		widget.setPreferenceForKey(null, createkey("update_interval"));
		widget.setPreferenceForKey(null, createkey("state"));
		widget.setPreferenceForKey(null, createkey("station"));
	}
}



/**
 * Set the initial value of the station.
 * 
 * @param string stationId
 * @return void
 * @access public
 * @since 10/18/05
 */
function initializeStation (station) {
	var stationList = document.getElementById("stationId").options;
	if (stationList.length > 1) {
		var stationIndex = findInCollection(station, stationList);
		if (stationIndex !== false) {
			document.getElementById("stationId").selectedIndex = stationIndex;
			selectStation();
			return;
		}
	}
	
	window.setTimeout("initializeStation('" + station + "');", 100);
}


/**
 * Create a key that will only apply to this widget instance.
 * 
 * @param string key
 * @return string
 * @access public
 * @since 10/19/05
 */
function createkey(key) {
	return widget.identifier + "-" + key;
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
 * Preferences showing functions
 *********************************************************/

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



/*********************************************************
 * Additional functions
 *********************************************************/

/**
 * Set the date's internal representation to be num days less.
 * 
 * @param integer num The number of days to subtract
 * @return void
 * @access public
 * @since 10/9/05
 */
Date.prototype.subtractDays = function (num) {
	// milliseconds since 1/1/1970
	// current milliseconds - num days * hr * mn * sc * milsc
	this.setTime(this.getTime() - (num * 24 * 60 * 60 * 1000));
}

/**
 * Answer the first key that the value was found at, or false
 * 
 * @param mixed value
 * @return mixed integer or false
 * @access public
 * @since 10/18/05
 */
Array.prototype.search = function (value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == value)
			return i;
	}
	
	return false;
}

/**
 * Answer the first key that the value was found at, or false
 * 
 * @param mixed value
 * @param HTMLCollection collection
 * @return mixed integer or false
 * @access public
 * @since 10/18/05
 */
function findInCollection (value, collection) {
	for (var i = 0; i < collection.length; i++) {
		if (collection[i].value == value)
			return i;
	}
	
	return false;
}