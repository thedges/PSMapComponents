({
    jsLoaded: function (component, event, helper) {
      console.log ('jsLoaded called');
  
      //////////////////////////////////////
      // set default map lat/lng location //
      //////////////////////////////////////
      if (component.get ('v.latitude') == null && component.get ('v.longitude') == null)
      {
        component.set ('v.latitude', component.get ('v.mapCenterLat'));
        component.set ('v.longitude', component.get ('v.mapCenterLng'));
      }
  
      //////////////////////////////////////
      // get the current lat/lng location //
      //////////////////////////////////////
      navigator.geolocation.getCurrentPosition (
        $A.getCallback (function (location) {
          console.log ('getCurrentPosition...');
          component.set ('v.origLat', location.coords.latitude);
          component.set ('v.origLng', location.coords.longitude);
  
          var target = component.find ('locateDiv');
          $A.util.removeClass (target, 'hide');
        })
      );
  
      ///////////////////////////
      // load the set location //
      ///////////////////////////
      helper.loadMap(component);
    },
    saveLocation: function (component, event, helper) {
      console.log ('saveLocation called...');

      var lat =  component.get ('v.tmpLatitude');
      var lng =  component.get ('v.tmpLongitude');
      var fullAddress =  component.get ('v.tmpFullAddress');
      var latLng = [parseFloat (lat), parseFloat (lng)];

      component.set ('v.latitude', lat);
      component.set ('v.longitude', lng);
      component.set ('v.fullAddress', component.get ('v.tmpFullAddress'));
      component.set ('v.street', component.get ('v.tmpStreet'));
      component.set ('v.city', component.get ('v.tmpCity'));
      component.set ('v.state', component.get ('v.tmpState'));
      component.set ('v.postal', component.get ('v.tmpPostal'));

      console.log ('saveLocation lat=' + lat + ' lng=' + lng);

      var target = component.find ('addressDiv');
  
      //component.set ('v.recLat', component.get ('v.latitude'));
      //component.set ('v.recLng', component.get ('v.longitude'));

      var recordMarker = component.get ('v.recordMarker');
      if (recordMarker != null)
      {
        recordMarker.setLatLng (latLng);
        var popup = L.popup()
        .setLatLng(latLng)
        .setContent(fullAddress);
        recordMarker.bindPopup(popup);

        component.set ('v.mode', 'RECORD');
      }
      else
      {
        var recordMarker = new L.marker ([
          parseFloat (component.get ('v.tmpLatitude')),
          parseFloat (component.get ('v.tmpLongitude')),
        ]);
        var popup = L.popup()
        .setLatLng(latLng)
        .setContent(fullAddress);
        recordMarker.bindPopup(popup);
        component.set ('v.recordMarker', recordMarker);

        var recordLayer = component.get("v.recordLayer");
        recordLayer.addLayer (recordMarker);
        component.set ('v.mode', 'RECORD');
      }

      //component.set ('v.mode', 'INIT');
      helper.hideCenterCrosshair (component);

      //$A.get ('e.force:refreshView').fire ();
  
      ////////////////////////////////////////////////////
      // create a parameter list to send to Apex method //
      ////////////////////////////////////////////////////
      /*
      var map = {};
  
      map['recordId'] = component.get ('v.recordId');
      map['latitude'] = component.get ('v.latitude');
      map['longitude'] = component.get ('v.longitude');
      map['fullAddress'] = component.get ('v.fullAddress');
      map['street'] = component.get ('v.street');
      map['city'] = component.get ('v.city');
      map['state'] = component.get ('v.state');
      map['postal'] = component.get ('v.postal');
  
      map['mapLatField'] = component.get ('v.mapLatField');
      map['mapLngField'] = component.get ('v.mapLngField');
      map['addrField'] = component.get ('v.addrField');
      map['addrStreetField'] = component.get ('v.addrStreetField');
      map['addrCityField'] = component.get ('v.addrCityField');
      map['addrStateField'] = component.get ('v.addrStateField');
      map['addrPostalField'] = component.get ('v.addrPostalField');
  
      console.log ('paramMap=' + JSON.stringify (map));
  
      //////////////////////////////////////////////
      // setup call to the Apex controller method //
      //////////////////////////////////////////////
      var action = component.get ('c.saveRecordLocation');
      action.setParams ({
        params: JSON.stringify (map),
      });
  
      //////////////////////////////////////////////////
      // setup the callback function for the response //
      //////////////////////////////////////////////////
      action.setCallback (self, function (a) {
        console.log (a.getReturnValue ());
        var resp = JSON.parse (a.getReturnValue ());
  
        if (resp.status === 'SUCCESS') {
          component.set ('v.fullAddress', 'Location saved!');
          var target = component.find ('addressDiv');
  
          component.set ('v.recLat', component.get ('v.latitude'));
          component.set ('v.recLng', component.get ('v.longitude'));
  
          var recordMarker = component.get ('v.recordMarker');
          if (recordMarker != null)
          {
            recordMarker.setLatLng ([
              component.get ('v.latitude'),
              component.get ('v.longitude'),
            ]);
  
            component.set ('v.mode', 'RECORD');
          }
          else
          {
            var recordMarker = new L.marker ([
              parseFloat (component.get ('v.latitude')),
              parseFloat (component.get ('v.longitude')),
            ]);
            component.set ('v.recordMarker', recordMarker);
  
            var recordLayer = component.get("v.recordLayer");
            recordLayer.addLayer (recordMarker);
            component.set ('v.mode', 'RECORD');
          }
  
          //component.set ('v.mode', 'INIT');
          helper.hideCenterCrosshair (component);
  
          $A.get ('e.force:refreshView').fire ();
        } else {
          component.set ('v.fullAddress', resp.msg);
        }
      });
  
      //////////////////////////////////
      // execute the Apex method call //
      //////////////////////////////////
      $A.enqueueAction (action);
      */
    },
    centerOnLocation: function (component, event, helper) {
      console.log ('centerOnLocation called...');
      var self = this;
  
      var map = component.get ('v.map');
      var lat = component.get ('v.origLat');
      var lng = component.get ('v.origLng');
      map.setView ([lat, lng]);
  
      component.set ('v.mode', 'TRACK');
      helper.showCenterCrosshair (component);
    },
    centerOnSetLocation: function (component, event, helper) {
      console.log ('centerOnSetLocation called...');
      var self = this;
  
      var map = component.get ('v.map');
      var lat = component.get ('v.latitude');
      var lng = component.get ('v.longitude');
      console.log ('centerOnSetLocation lat=' + lat + ' lng=' + lng);
      map.setView ([lat, lng]);
  
      component.set ('v.mode', 'INIT');
      helper.hideCenterCrosshair (component);
    },
    destroyCmp: function (component, event, helper) {
      console.log ('destroyCmp invoked...');
      //component.destroy();
    },
  });