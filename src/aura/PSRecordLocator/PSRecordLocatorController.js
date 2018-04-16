({
  jsLoaded: function(component, event, helper) {
    console.log("jsLoaded called");

    //////////////////////////////////////
    // set default map lat/lng location //
    //////////////////////////////////////
    component.set("v.latitude", component.get("v.mapCenterLat"));
    component.set("v.longitude", component.get("v.mapCenterLng"));

    //////////////////////////////////////
    // get the current lat/lng location //
    //////////////////////////////////////
    navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
      component.set("v.origLat", location.coords.latitude);
      component.set("v.origLng", location.coords.longitude);

      var target = component.find("locateDiv");
      $A.util.removeClass(target, 'hide');
    }));

    //////////////////////////////////////////////
    // load the current record lat/lng location //
    //////////////////////////////////////////////
    helper.loadRecordLocation(component);
  },
  saveLocation: function(component, event, helper) {
    console.log('saveLocation called...');


    ////////////////////////////////////////////////////
    // create a parameter list to send to Apex method //
    ////////////////////////////////////////////////////
    var map = {};

    map['recordId'] = component.get('v.recordId');
    map['latitude'] = component.get('v.latitude');
    map['longitude'] = component.get('v.longitude');
    map['fullAddress'] = component.get('v.fullAddress');
    map['street'] = component.get('v.street');
    map['city'] = component.get('v.city');
    map['state'] = component.get('v.state');
    map['postal'] = component.get('v.postal');

    map['mapLatField'] = component.get('v.mapLatField');
    map['mapLngField'] = component.get('v.mapLngField');
    map['addrField'] = component.get('v.addrField');
    map['addrStreetField'] = component.get('v.addrStreetField');
    map['addrCityField'] = component.get('v.addrCityField');
    map['addrStateField'] = component.get('v.addrStateField');
    map['addrPostalField'] = component.get('v.addrPostalField');

    console.log('paramMap=' + JSON.stringify(map));

    //////////////////////////////////////////////
    // setup call to the Apex controller method //
    //////////////////////////////////////////////
    var action = component.get("c.saveRecordLocation");
    action.setParams({
      "params": JSON.stringify(map)
    });

    //////////////////////////////////////////////////
    // setup the callback function for the response //
    //////////////////////////////////////////////////
    action.setCallback(self, function(a) {
      console.log(a.getReturnValue());
      var resp = JSON.parse(a.getReturnValue());

      if (resp.status === 'SUCCESS') {
        component.set('v.fullAddress', 'Location saved!');
        var target = component.find("addressDiv");
        $A.util.addClass(target, 'hide');
        $A.get('e.force:refreshView').fire();
      } else {
        component.set('v.fullAddress', resp.msg);
      }
    });
    
    //////////////////////////////////
    // execute the Apex method call //
    //////////////////////////////////
    $A.enqueueAction(action);

  },
  centerOnLocation: function(component, event, helper) {
    console.log('centerOnLocation called...');
    var self = this;

    var map = component.get("v.map");
    var lat = component.get("v.origLat");
    var lng = component.get("v.origLng");
    map.setView([lat, lng], 14);

    helper.reverseGeocodeEsri(component, lat, lng);
  },
  destroyCmp : function (component, event, helper) {
        console.log('destroyCmp invoked...');
        component.destroy();
    }
})