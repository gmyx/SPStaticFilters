/* static filters for a list page
*	Version 0.2, Nov 30th 2012, Guy Moreau
*/

$(document).ready(function () {
	/*look at URL and note if: 
		a) filter list has changed / added / reduced
			-> save new list
		b) filter has been cleared
			-> save no filer
		c) filer is empty
			-> check cookie, reload with filters if nessesary
	*/

	function getFilterStringfromURL() {
		// find all FilterField{n} where n is a number
		// also find all SortField (should only have one)
		var myRegexp = /(FilterField(\d)=.*?&FilterValue\d=.*?)(?:&|$)|(SortField=.*&SortDir=.*?)(?:&|$)/ig,
			lString = window.location.href,
			match = myRegexp.exec(lString),
			lOut = [],
			lHasSort;

		//first result - save it
		if (match === null) { return null; }
		//determine if match is a filter or a sort
		//if sort, array item 1 and 2 are null
		if (match[2] === '') {
			lHasSort = match[3];
		} else {
			lOut[match[2] - 1] = match[1];
		}

		do {
			//nth result, just keep saving
			match = myRegexp.exec(lString);
			$("div#samply").after("log := " + match + "<br /><hr />");
			if (match !== null) {
				if (match[2] === '') {
					lHasSort = match[3];
				} else {
					lOut[match[2] - 1] = match[1];
				}
			}
		} while (match !== null);

		if (lHasSort !== null) {
			//append to last item in list
			lOut[lOut.length + 1] = lHasSort;
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
				//clear out cookies
				$.removeCookie('FieldCount');
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
});