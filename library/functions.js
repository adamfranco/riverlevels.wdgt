/**
 * This file is part of the Concerto Viewer.
 * http://sourceforge.net/projects/concerto/
 *
 * @since 8/22/05
 * @package viewer.js_library
 * 
 * @copyright Copyright &copy; 2005, Middlebury College
 * @license http://www.gnu.org/copyleft/gpl.html GNU General Public License (GPL)
 *
 * @version $Id$
 */ 

/**
 * Run our slideshow
 * 
 * @access public
 * @since 8/22/05
 */
function runSlideShow (slideshowXML) {
	slideShow = new SlideShow();
	slideShow.loadXMLDoc(slideshowXML);
}

/**
 * Answer the element of the document by id.
 * 
 * @param string id
 * @return object The html element
 * @access public
 * @since 8/25/05
 */
function getElementFromDocument(id) {
	// Gecko, KHTML, Opera, IE6+
	if (document.getElementById) {
		return document.getElementById(id);
	}
	// IE 4-5
	if (document.all) {
		return document.all[id];
	}			
}

/**
 * Answer an array only the unique elements of the input array
 * 
 * @param array inputArray
 * @return array
 * @access public
 * @since 8/24/05
 */
function arrayUnique ( inputArray ) {
	var uniqueArray = new Array();
	var i = 0;
	for (var j = 0; j < inputArray.length; j++) {
		if (!inArray(inputArray[j], uniqueArray)) {
			uniqueArray[i] = inputArray[j];
			i++;
		}
	}
	return uniqueArray;
}

/**
 * Answer true if the value passed is in the array
 * 
 * @param mixed value
 * @param array array
 * @return boolean
 * @access public
 * @since 8/24/05
 */
function inArray ( value, array ) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == value)
			return true;
	}
	
	return false;
}


/**
 * Answer the pixel height of the specified element if availible. 
 * 
 * @param string elementId
 * @return string
 * @access public
 * @since 8/25/05
 */
function getElementHeight (elementId) {
	var element = getElementFromDocument(elementId);
	if (element == null || element.style.height == null)
		alert("Unknown height for element, '" + elementId + "'");
	return pixelsToInteger(element.style.height);
}

/**
 * Answer the pixel width of the specified element if availible. 
 * 
 * @param string elementId
 * @return string
 * @access public
 * @since 8/25/05
 */
function getElementWidth (elementId) {
	var element = getElementFromDocument(elementId);
	if (element == null || element.style.width ==null)
		alert("Unknown width for element, '" + elementId + "'");
	return pixelsToInteger(element.style.width);
}


/**
 * Answer the integer that corresponds tho the given pixel value.
 * strip of the 'px' component of the string.
 * 
 * @param string pixelString
 * @return integer
 * @access public
 * @since 8/25/05
 */
function pixelsToInteger (pixelString) {
	var sizeRegEx = new RegExp("^([0-9\.]+)(px)?$", "i");
	var sizeString = new String (pixelString);
	var matches = sizeString.match(sizeRegEx);
	if (matches)
		return new Number(matches[1]);
	else
		alert ("Error: Invalid pixelString, " + pixelString);
}