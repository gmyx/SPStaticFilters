/* static filters for a list page
*	Version 05, Apr 5th 2013, Guy Moreau
*/

/* genereal process: look at URL and note if: 
	a) filter list has changed / added / reduced
		-> save new list
	b) filter has been cleared
		-> save no filer
	c) filer is empty
		-> check cookie, reload with filters if nessesary
*/


'use strict';
var mPrefs_SPStaticFilters,
// jCanvasCards default property values
	SPStaticFilters_defaults = {
		text: "Stop Sorting",
		icon: scriptPath() + "/NOTSORTAZLang.png",
	};

function scriptPath() {
	var path = '';

	$("script").each(function () {
		if (this.src !== "") {
			if (this.src.match(/jquery\.SPStaticFilters.*\.js/)) {
				path = this.src.replace(/(.*)jquery\.SPStaticFilters.*\.js/, '$1');
			}
		}
	});

	return path;
};

function getFilterStringfromURL() {
	// find all FilterField{n} where n is a number
	// also find all SortField (should only have one)
	// important note, SP FilterFields index is Base 1, code adjusts for that fact
	var myRegexp = /(FilterField(\d)=.*?&FilterValue\d=.*?)(?:&|$)|(SortField=.*?&SortDir=.*?)(?:&|$)/ig,
		lString = window.location.href,
		match = myRegexp.exec(lString),
		lOut = [],
		lHasSort;

	//first result - save it
	if (match === null) { return null; }
	//determine if match is a filter or a sort
	//if sort, array item 1 and 2 are null
	if (match[2] === '') {
		//does have a sort - it's in the 3rd capture group
		lHasSort = match[3];
	} else {
		//save the URl fragment for this filter item, accounting for Base 1
		lOut[match[2] - 1] = match[1];
	}
	
	do {
		//nth result, just keep saving
		match = myRegexp.exec(lString);

		if (match !== null) {
			//test for empty capture group 2 - that will mean it's a sort
			if (match[2] === '') {
				//is a sort so wave that part
				lHasSort = match[3];
			} else {
				//save the URl fragment for this filter item, accounting for Base 1
				lOut[match[2] - 1] = match[1];
			}
		}
	} while (match !== null);

	if (lHasSort !== undefined) {
		//append sort to last item in list
		if (lOut.length === 0 && lOut[0] === undefined) {
			//put it in 0 - only item
			lOut[0] = lHasSort;
		} else {
			//add it to the last item
			lOut[lOut.length] = lHasSort;
		}
	}
	return lOut;
}

function saveFilterStrings() {
	var i, lData = getFilterStringfromURL(), lDataLentgh = lData.length;
	$.cookie('FieldCount', lDataLentgh, { expires: 3650 });

	for (i = 0; i < lDataLentgh; i += 1) {
		$.cookie('Filter' + i, lData[i], { expires: 3650 });
	}
}
	
(function () {
	var i, lsNewURL = "", lCookieCount = $.cookie('FieldCount'),
		lData = getFilterStringfromURL(),
		lOldURL = window.location.href;

	if (lCookieCount !== null) {
		if (lOldURL.indexOf("FilterClear=1") !== -1) {
			//check to see if sort is active - otherwise safe to delete
			if (lOldURL.indexOf("SortField=") !== -1) {
				saveFilterStrings();
			} else {
				//clear out cookies
				$.removeCookie('FieldCount');
			}
		} else if (lCookieCount >= 0 && lData !== null) {
			//save changes
			saveFilterStrings();
		} else if (lCookieCount > 0 && lData === null) {
			//update URL
			for (i = 0; i < lCookieCount; i += 1) {
				if (i > 0) {
					//add delimter between items
					lsNewURL += "&";
				}
				lsNewURL += $.cookie('Filter' + i);
			}

			//first char (? or &) will depend on if a ? exists or not
			if (lOldURL.indexOf("?") === -1) {
				//doesn't have parameters
				window.location.replace(lOldURL + "?" + lsNewURL);
			} else {
				//has non filter parameters, append to end
				window.location.replace(lOldURL + "&" + lsNewURL);
			}
		} else {
			//failsafe
			$.removeCookie('FieldCount');
		}
	} else if (lData !== null) {
		//save changes
		saveFilterStrings();
	}
}());

//sp hack to add stop sorting to menu
_spBodyOnLoadFunctionNames.push("spStaticFilters_doHack");


function spStaticFilters_doHack() {
	var aRep = addSortMenuItems; //this is the SP function that creates the sort menu on the fly

	addSortMenuItems = function(b, a) {
		var lMatchSPCode, lMatchURL,
			lSPCode = /SortField=(.*?)\\u0026/g,
			lURLCode = /SortField=(.*?)&/g,
			opts = $.extend({}, SPStaticFilters_defaults, mPrefs_SPStaticFilters);;

		aRep(b, a);

		//determine if current field is sorted
		lMatchSPCode= lSPCode.exec(b.innerHTML);
		lMatchURL = lURLCode.exec(window.location.href);

		if (lMatchURL === null) {
			CAMOptFilter(b, a, opts.text, "$spStaticFilters_doDeleteSort();", opts.icon, false, "stopSorting");
		} else {
			if (lMatchSPCode[1] === lMatchURL[1]) {
				CAMOptFilter(b, a, opts.text, "spStaticFilters_doDeleteSort();", opts.icon, true, "stopSorting");
			} else {
				CAMOptFilter(b, a, opts.text, "spStaticFilters_doDeleteSort();", opts.icon, false, "stopSorting");
			}
		}
	}
};

function spStaticFilters_doDeleteSort() {
	//reload page free of sorting, clearing it from cookie
	
	//step 1: determine if any filters exists, if yes keep them
	var lStrings = getFilterStringfromURL(), i, lsNewURL = "";

	if (lStrings.length === 1) {
		//only sort - kill cookie
		$.removeCookie('FieldCount');
		
		//reload without sort
		window.location.replace(window.location.href.replace(/(.*)\?.*/, '$1'));
	} else {
		//also has filter, delete last item and update
		for (i = 0; i < lStrings.length - 1; i += 1) {
			if (i > 0) {
				//add delimter between items
				lsNewURL += "&";
			}
			lsNewURL += $.cookie('Filter' + i);
		}

		//reload with the rebuilt URL
		window.location.replace(window.location.href.replace(/(.*)\?.*/, '$1') + "?" + lsNewURL);
	}
}