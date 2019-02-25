({
  storeAccessLocation: function(component) {
    console.log("PSAccessTrackerController::storeAccessLocation called");
    var self = this;
    console.log('storeAccessLocation invoked...');

    var paramMap = {};

    paramMap['recordId'] = component.get('v.recordId');
    paramMap['obj'] = component.get('v.sobject');
    paramMap['parentField'] = component.get('v.parentField');
    paramMap['latField'] = component.get('v.latitudeField');
    paramMap['lngField'] = component.get('v.longitudeField');
    paramMap['lat'] = component.get('v.latitude');
    paramMap['lng'] = component.get('v.longitude');
    
    if (component.get('v.addressField') != null && component.get('v.addressField').length > 0 && 
        component.get('v.address') != null && component.get('v.address').length > 0)
    {
      paramMap['addrField'] = component.get('v.addressField');
      paramMap['addr'] = component.get('v.address');
    }

    var action = component.get("c.createAccessRecord");
    action.setParams({
      "params": JSON.stringify(paramMap)
    });

    action.setCallback(self, function(a) {
      console.log(a.getReturnValue());
      var resp = JSON.parse(a.getReturnValue());

      if (resp.status === 'ERROR') {
        console.log('throw error message');
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
          "title": "Warning!",
          "message": "Could not save current access location.",
          "duration": 2000,
          "type": "warning"
        });
        toastEvent.fire();
      } else {
        // do nothing
      }
    });

    // Enqueue the action
    $A.enqueueAction(action);
  },
  reverseGeocodeEsri: function(component, lat, lng) {
    console.log('PSAccessTrackerController::reverseGeocodeEsri invoked...');
    var self = this;
    var action = component.get("c.reverseGeocodeEsri");
    action.setParams({
      "lat": lat,
      "lng": lng
    });

    action.setCallback(self, function(a) {
      console.log('resp=' + a.getReturnValue());
      
      var resp = JSON.parse(a.getReturnValue());

      if (resp.hasOwnProperty('error')) {
        // do nothing
      } else {
        component.set('v.address', resp.address.Match_addr);
        self.storeAccessLocation(component);
      }
      
    });
    // Enqueue the action
    console.log('reverseGeocodeEsri enqueueAction...');
    
    $A.enqueueAction(action);
    //$A.clientService.runActions([action], this, function() {});
  }
})