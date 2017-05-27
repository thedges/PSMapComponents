# PSMapComponents
This package includes variety of map/GIS related demo components:
* PSObjectSearch - 
* PSRecordLocator - 
* PSAccessTracker - 

<b>Dependency:</b> Install the [PSCommon](https://github.com/thedges/PSCommon) package first

## PSObjectSearch
The following is example of the component showing cases.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/PSObjectMap.png "Sample Image")

<b>WARNING:</b> This component uses both Leaflet (1.0.2) and JQuery DataTable (1.10.12) JavaScript libraries. Currently LockerService breaks the map component using the Leaflet library. Supposedly this will be fixed in the Summer '17 (208) release.

* Creates a lightning component with main purpose to show records on a map. It has 3 primary sections:
  - A configurable section for filtering the data
  - A map section for showing records on a map with pin popup
  - A table section that provides a sortable/paginated table of results
* This component can be dropped on any sobject
* If you don't want the map section to show, set the <b>SObject Field for Latitude</b> and <b>SObject Field for Longitude</b> values to blank.
* If you don't want the table section to show, set the <b>SObject Fields to Show in Table</b> value to blank.
* The component configuration fields are:
  - <b>SObject To Map</b> - the API name of the sobject to filter data on
  - <b>Title of Map Section</b> - the title to use at the top of the component
  - <b>Filter Button Label</b> - the label for the search button
  - <b>SObject Fields to Filter On</b> - comma separated list of field API names to provide search/filter capabilites; currently only supports text and picklist fields
  - <b>SObject Fields to Show in Table</b> - comma separated list of field API names to show as columns in the table; if you leave this field blank then table will not show
  - <b>SObject Field for Latitide</b> - the field API name for the latitude value.
  - <b>SObject Field for Longitude</b> - the field API name for the longitude value
  - <b>Map Center Latitude</b> - the default latitude value for centering the map
  - <b>Map Center Latitude</b> - the default longitude value for centering the map
  - <b>Map Zoom Level</b> - the default map zoom level; default: 11
  - <b>SObject Field for Map Icon</b> - the field API name for returning a URL to the icon image; use a formula field and generate a full URL to a static resource file image; look at the example MapIcon__c field on case object for example
  - <b>SObject Field For Marker HTML</b> - the field API name for returning an HTML string to be used in the map pin pop-up; the string can be any HTML formatted string; look at the example MarkerHTML__c field on case object for example (notice the use of the '@ID@' string that is used for href link. This will be replaced with correct URL link to record if used in community or LEX)
  - <b>Height of map in pixels</b> - the height of the map
  - <b>Only show records that have geolocation</b> - true/false value to determine if only records that have lat/lng values are shown or if all values matching the filter criteria are shown
  - <b>Additional Where Clause</b> - static where clause statement to be added to query to filter records

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>
