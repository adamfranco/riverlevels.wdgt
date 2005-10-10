/**
 * This file contains timer-related functions.
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
var lastUpdateTime = 0;
var timerId;

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
