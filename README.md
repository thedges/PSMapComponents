# PSMapComponents
This package includes variety of map/GIS related demo components:
* <b>PSObjectSearch</b> - component to search records on object and display in map and table
* <b>PSRecordLocator</b> - component to plot on map current location of record; also can move map and set current location
* <b>PSAccessTracker</b> - invisible component to capture the latitude/longitude (and optionally, street address) of person accessing the record

<b>Dependency:</b> Install the [PSCommon](https://github.com/thedges/PSCommon) and [LightningStrike.io](https://github.com/thedges/Lightning-Strike) packages first

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

## PSRecordLocator
The following is example of the map component on a record.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/geotest.png "Sample Image")

<b>WARNING:</b> This component uses both Leaflet (1.0.2). Currently LockerService breaks the map component using the Leaflet library. Supposedly this will be fixed in the Summer '17 (208) release.

* Features of the component:
  - If lat/lng location already exists on record, it will center on that location
  - Move the map to new location and address will show in bottom of map. Click on address location and it will set fields on the record. Address will disappear once you have set it.
  - A "find me" icon will show in top-right of map. This icon shows once the component captures your current lat/lng location. Just click this to move to your current location.
* The component configuration fields are:
  - <b>SObject Field For Latitude</b> - SObject field that stores the latitude value
  - <b>SObject Field For Longitude</b> - SObject field that stores the longitude value
  - <b>SObject Field For Full Address</b> - SObject field that stores full address in one value
  - <b>SObject Field For Street</b> - SObject field that stores the street
  - <b>SObject Field For City</b> - SObject field that stores the city
  - <b>SObject Field For State</b> - SObject field that stores the state
  - <b>SObject Field For Postal/Zipcode</b> - SObject field that stores postal/zip code
  - <b>Map Center Latitude</b> - Default latitude for center of map
  - <b>Map Center Longitude</b> - Default longitude for center of map
  - <b>Map Zoom Level</b> - Default map zoom level
  - <b>Height of map in pixels</b> - Height of map in pixels
  
## PSAccessTracker
The following is example of the component logging lat/lng and address to child object.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/recordaccess.png "Sample Image")

* Features of the component:
  - Just drop the component on a record page and configure it's properties
  - When someone accesses the record, it will capture the current lat/lng of the user and store in the related child object. If address field exists, it will also perform reverse geocode and store the address.
* The component configuration fields are:
  - <b>Child SObject API Name To Update</b> - The child SObject API name to add current geolocation to
  - <b>Child SObject Field API Name (Parent)</b> - The child SObject field API name to the parent object (lookup or master-detail field)
  - <b>Child SObject Field API Name (Latitude)</b> - The child SObject field API name to store latitude 
  - <b>Child SObject Field API Name (Longitude)</b> - The child SObject field API name to store longitude 
  - <b>Child SObject Field API Name (Address)</b> - The child SObject field API name to store full address (optional: leave blank if you don't need address)
  
<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>
