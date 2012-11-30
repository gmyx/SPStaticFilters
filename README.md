SPStaticFilters
===============

A jQuery based javascript library to create Static Filters for Sharepoint 2010

## Requirements ##
* jQuery (http://jquery.com)
* jquery.cookie (https://github.com/carhartl/jquery-cookie)

## Usage ##
Add the script to the list item you want static filters. It uses self-executing functions and therefore does not need to be called

## Version history ##
* 0.1: Initial Release.
* 0.2:
** Added Static sorting
** Fixed a silly error in the header comment by not terminating it properly.

## Future possibilities ##
A quick list of items that could be added in the future
* Static Sorting
* Create defaults to enable / disable features
** including default lenght of cookies, currently 10 years
* obfucation of cookies (currenlty stored in plain text)

## Tested conditions ##
The script was tested using the following scenario:
* IE8
* SharePoint 2010, default templates
* jQuery 1.8.2
* jquery.cookie 1.3
* implemented used a Custom Content Editor

### Example code to be used in a Custom Content Editor ###
Replace {your SP site} with the location of your SP site
Replace {JQueryLib} with the document library containing your js files
<script src="/{your SP site}/{JQueryLib}/jquery.min.js" type="text/javascript"></script>
<script src="/{your SP site}/{JQueryLib}/jquery.cookie.js" type="text/javascript"></script>
<script src="/{your SP site}/{JQueryLib}/jquery.SPStaticFilters.js" type="text/javascript"></script>
