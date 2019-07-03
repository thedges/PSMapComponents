# PSMapComponents
THIS SOFTWARE IS COVERED BY [THIS DISCLAIMER](https://raw.githubusercontent.com/thedges/Disclaimer/master/disclaimer.txt).

This package includes variety of map/GIS related demo components:
* <b>PSObjectSearch</b> - component to search records on object and display in map and table
* <b>PSRelatedListMap</b> - component to plot on map location of child records based on parent record
* <b>PSRecordLocator</b> - component to plot on map current location of record; also can move map and set current location
* <b>PSAccessTracker</b> - invisible component to capture the latitude/longitude (and optionally, street address) of person accessing the record

<b>Dependency:</b> Install the [LightningStrike.io](https://github.com/thedges/Lightning-Strike) and [PSCommon](https://github.com/thedges/PSCommon) packages first

<a href="https://githubsfdeploy.herokuapp.com">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

## PSObjectSearch
The following is example of the component showing cases.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/PSObjectMap.png "Sample Image")

* Creates a lightning component with main purpose to show records on a map. It has 3 primary sections:
  - A configurable section for filtering the data
  - A map section for showing records on a map with pin popup
  - A table section that provides a sortable/paginated table of results
* This component can be dropped on any sobject
* If you don't want the map section to show, set the <b>SObject Field for Latitude</b> and <b>SObject Field for Longitude</b> values to blank.
* If you don't want the table section to show, set the <b>SObject Fields to Show in Table</b> value to blank.
* The component configuration fields are:
| Parameter | Description |
|-----------|-------------|
| <b>SObject To Map</b> | the API name of the sobject to filter data on |
| <b>Title of Map Section</b> | the title to use at the top of the component |
| <b>Filter Button Label</b> | the label for the search button |
| <b>SObject Fields to Filter On</b> | comma separated list of field API names to provide search/filter capabilites; currently only supports text and picklist fields |
| <b>SObject Fields to Show in Table</b> | comma separated list of field API names to show as columns in the table; if you leave this field blank then table will not show |
| <b>CSV list of radius values (miles)</b> | comma separated list of radius values in miles; put * next to value you want to be the default; if you don't want to search by radius, just set to blank value |
| <b>SObject Field for Latitide</b> | the field API name for the latitude value. |
| <b>SObject Field for Longitude</b> | the field API name for the longitude value |
| <b>Map Center Latitude</b> | the default latitude value for centering the map |
| <b>Map Center Latitude</b> | the default longitude value for centering the map |
| <b>Map Zoom Level</b> - the default map zoom level; default: 11  |
| <b>SObject Field for Map Icon</b> | the field API name for returning a URL to the icon image; use a formula field and generate a full URL to a static resource file image; look at the example MapIcon__c field on case object for example. An example formula for this field is like followng:
 ` `<br/>
 `
 LEFT($Api.Partner_Server_URL_260, FIND( '/services', $Api.Partner_Server_URL_260)) & 
CASE( Type, 
"Animal Control", "resource/CaseType/OneCityAnimalInactive.png", 
"Events", "resource/CaseType/OneCityEventsInactive.png", 
"General Inquiry", "resource/CaseType/OneCityGeneralInactive.png", 
"Licensing and Permitting", "resource/CaseType/OneCityPermitInactive.png", 
"Noise", "resource/CaseType/OneCityNoiseInactive.png", 
"Public Works", "resource/CaseType/OneCityPublicWorksInactive.png", 
"Street and Traffic", "resource/CaseType/OneCityStreetInactive.png", 
"resource/CaseType/OneCityNoTypeInactive.png")
 `
  This shows a formula field that returns a URL to a static resource file named "CaseType" that is a zip of image files. Based on the case type, a different image file URL will be returned. The first line of the formula generates the base of the URL and will generate correct URL if used internally or in a community. |
| <b>SObject Field For Marker HTML</b> | the field API name for returning an HTML string to be used in the map pin pop-up; the string can be any HTML formatted string; look at the example MarkerHTML__c field on case object for example (notice the use of the '@ID@' string that is used for href link. This will be replaced with correct URL link to record if used in community or LEX). An example for this formula field is shown in the Demo Tips section below. This shows a formula field that returns a text string with HTML markup. The HTML has header section with details for a case and then generates a table of <b>key: value</b> parameters |
| <b>Height of map in pixels</b> | the height of the map |
| <b>Only show records that have geolocation</b> | true/false value to determine if only records that have lat/lng values are shown or if all values matching the filter criteria are shown |
| <b>My Record Fields</b> | comma separated list of field API names that contain the current user id you want to filter on; used to filter for "My Records"; example string values would be "OwnerId" or "OwnerId,ContactId" |
| <b>Additional Where Clause</b> | static where clause statement to be added to query to filter records |

### Demo Tip

Reminder that the map pin display is controlled by a field on the object you are displaying records for. By default when you install this component, it installs a formula field on the Case object called "MarkerHTML__c". This field is configured to return a string that includes HTML markup. Using standard formula field functionality, you can include record field values in this formula field to include in the HTML displayed when you click on a map pin.

So one good example to extend this field is providing driving directions to the user to the choosen pin location. This is easily accomplished by added an HTML anchor tag (<a>) to the formula field string and build an HTML link to load Google directions in another window. 

```
  '<h3><a href=\"@ID@\">[' +  CaseNumber  + '] ' + Subject + '</a></h3>' +
                            '<table><tr><td valign="top" style="padding-right: 10px">' +
                            '</td><td>' +
                            '<br/><b>Type:</b> ' + TEXT(Type) + 
                            '<br/><b>Status:</b> ' + TEXT(Status) + 
                            '<br/><b>Priority:</b> ' + TEXT(Priority) +
                            '</td></tr></table>' +
'<br/><a href="https://www.google.com/maps/dir/?api=1&destination=' +  TEXT(Location__Latitude__s)  + ',' +  TEXT(Location__Longitude__s)  + '" target="_blank" style="text-decoration:none;color:#47b055;">Driving Directions</a>'
```
The main section of code to refer to is last part that starts with `<a href="https://www.google.com/maps/dir/?api=1&destination...` which build a Google Directions URL that includes directions to the latitude/longitude of the pin you select. When the pin is clicked on, it will show a window like the following example that has the "Driving Directions" link in green.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/map-driving-direction.png "Sample Image")

Once you click on the Driving Direction link, it launches a new window with driving directions to the pin location:

![alt text](https://github.com/thedges/PSMapComponents/blob/master/google-driving-direction.png "Sample Image")

## PSRecordLocator
Use this component to drop on record to show current location. You can move map to new location and component will do a reverse address lookup based on location of crosshair. Click on address at bottom of window to set the record lat/lng and address fields. The following is example of the map component on a record.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/geotest.png "Sample Image")

* Features of the component:
  - If lat/lng location already exists on record, it will center on that location
  - Move the map to new location and address will show in bottom of map. Click on address location and it will set fields on the record. Address will disappear once you have set it.
  - A "find me" icon will show in top-right of map. This icon shows once the component captures your current lat/lng location. Just click this to move to your current location.
* The component configuration fields are:
| Parameter | Description |
|-----------|-------------|
| <b>SObject Field For Latitude</b> | SObject field that stores the latitude value |
| <b>SObject Field For Longitude</b> | SObject field that stores the longitude value |
| <b>SObject Field For Full Address</b> | SObject field that stores full address in one value |
| <b>SObject Field For Street</b> | SObject field that stores the street |
| <b>SObject Field For City</b> | SObject field that stores the city |
| <b>SObject Field For State</b> | SObject field that stores the state |
| <b>SObject Field For Postal/Zipcode</b> | SObject field that stores postal/zip code |
| <b>Map Center Latitude</b> | Default latitude for center of map |
| <b>Map Center Longitude</b> | Default longitude for center of map |
| <b>Map Zoom Level</b> | Default map zoom level |
| <b>Height of map in pixels</b> | Height of map in pixels |
  
## PSRelatedListMap
Use this component on a "parent" object to map all child records of a specific object type. The following is example of this map component on a record showing list of child records in map in top-right side.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/relatedListMap.png "Sample Image")

* Features of the component:
  - Will load all child records for sobject configured and plot them on map.
  - Will create custom icon and pop-up text based on MapIconField and mapMarkerField configuration settings
  - A "find me" icon will show in top-right of map. This icon shows once the component captures your current lat/lng location. Just click this to move to your current location.
* The component configuration fields are:

| Parameter | Description |
|-----------|-------------|
| <b>SObject API Name of Child Object</b> | the API name of the child sobject to plot the related child records |
| <b>SObject Field For Parent Id</b> | the field API name of the parent master-detail/lookup field |
| <b>SObject Field for Latitide</b> | the field API name on child object for the latitude value. |
| <b>SObject Field for Longitude</b> | the field API name on child object for the longitude value |
| <b>Map Center Latitude</b> | the default latitude value for centering the map |
| <b>Map Center Latitude</b> | the default longitude value for centering the map |
| <b>SObject Field for Map Icon</b> | the field API name on child object for returning a URL to the icon image; use a formula field and generate a full URL to a static resource file image; look at the example MapIcon__c field on case object for example |
| <b>SObject Field For Marker HTML</b> | the field API name on child object for returning an HTML string to be used in the map pin pop-up; the string can be any HTML formatted string; look at the example MarkerHTML__c field on case object for example (notice the use of the '@ID@' string that is used for href link. This will be replaced with correct URL link to record if used in community or LEX) |
| <b>Map Zoom Level</b> | Default map zoom level |
| <b>Height of map in pixels</b> | Height of map in pixels |
  
## PSAccessTracker
The following is example of the component logging lat/lng and address to child object.

![alt text](https://github.com/thedges/PSMapComponents/blob/master/recordaccess.png "Sample Image")

* Features of the component:
  - Just drop the component on a record page and configure it's properties
  - When someone accesses the record, it will capture the current lat/lng of the user and store in the related child object. If address field exists, it will also perform reverse geocode and store the address.
* The component configuration fields are:

| Parameter | Description |
|-----------|-------------|
| <b>Child SObject API Name To Update</b> | The child SObject API name to add current geolocation to |
| <b>Child SObject Field API Name (Parent)</b> | The child SObject field API name to the parent object (lookup or master-detail field) | 
| <b>Child SObject Field API Name (Latitude)</b> | The child SObject field API name to store latitude | 
| <b>Child SObject Field API Name (Longitude)</b> | The child SObject field API name to store longitude | 
| <b>Child SObject Field API Name (Address)</b> | The child SObject field API name to store full address (optional: leave blank if you don't need address) | 
  

