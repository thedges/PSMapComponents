({
  doInit: function(component, event, helper) {
    console.log("PSAccessTrackerController::doInit called");

    navigator.geolocation.getCurrentPosition(function(location) {
      component.set("v.latitude", location.coords.latitude);
      component.set("v.longitude", location.coords.longitude);

      console.log('addressField=' + component.get("v.addressField"));

      if (component.get("v.addressField") != null && component.get("v.addressField").length > 0)
      {
      	helper.reverseGeocodeEsri(component, location.coords.latitude, location.coords.longitude)
      }
      else
      {
        helper.storeAccessLocation(component);
      }
    });
  }
})