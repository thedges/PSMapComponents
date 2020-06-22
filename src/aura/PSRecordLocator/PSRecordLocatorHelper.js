({
  loadRecordLocation: function (component) {
    var self = this;
    console.log ('loadRecordLocation invoked...');

    self.createMap (component);
    console.log ('map created...');

    var paramMap = {};

    paramMap['recordId'] = component.get ('v.recordId');
    paramMap['mapLatField'] = component.get ('v.mapLatField');
    paramMap['mapLngField'] = component.get ('v.mapLngField');

    var action = component.get ('c.getCurrLocation');
    action.setParams ({
      params: JSON.stringify (paramMap),
    });

    action.setCallback (self, function (a) {
      console.log ('loadRecordLocation=' + a.getReturnValue ());
      var resp = JSON.parse (a.getReturnValue ());

      var map = component.get ('v.map');
      if (resp.status === 'ERROR') {
        console.log ('getCurrentPosition');
        var options = {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: Infinity,
        };

        if (component.get ('v.autoCenter')) {
          navigator.geolocation.getCurrentPosition (
            $A.getCallback (function (location) {
              component.set ('v.latitude', location.coords.latitude);
              component.set ('v.longitude', location.coords.longitude);
              component.set (
                'v.mapZoomLevel',
                component.get ('v.mapZoomLevel')
              );

              //self.createMap(component);
              try {
                map.setView (
                  [
                    parseFloat (component.get ('v.latitude')),
                    parseFloat (component.get ('v.longitude')),
                  ],
                  component.get ('v.mapZoomLevel')
                );
              } catch (err) {
                // do nothing
              }
            }),
            function (err) {
              console.warn (`ERROR(${err.code}): ${err.message}`);
            }
          );
        } else {
        }
      } else {
        console.log ('data=' + JSON.stringify (resp.data));
        component.set ('v.latitude', resp.data.latitude);
        component.set ('v.longitude', resp.data.longitude);
        component.set ('v.recLat', resp.data.latitude);
        component.set ('v.recLng', resp.data.longitude);

        try {
          console.log ('record zoom = ' + component.get ('v.mapZoomLevel'));
          map.setView (
            [
              parseFloat (component.get ('v.latitude')),
              parseFloat (component.get ('v.longitude')),
            ],
            component.get ('v.mapZoomLevel')
          );

          var recordLayer = component.get ('v.recordLayer');

          var recordMarker = new L.marker ([
            parseFloat (component.get ('v.latitude')),
            parseFloat (component.get ('v.longitude')),
          ]);
          component.set ('v.recordMarker', recordMarker);

          recordLayer.addLayer (recordMarker);
        } catch (err) {
          // do nothing
        }
      }
    });

    // Enqueue the action
    $A.enqueueAction (action);
  },
  reverseGeocodeEsriJS: function (component, lat, lng) {

    var self = this;
    console.log ('reverseGeocodeEsri invoked...');
    console.log ('mode=' + component.get ('v.mode'));

    var action = component.get ('c.reverseGeocodeEsri');
    if (action) {
      action.setParams ({
        lat: lat,
        lng: lng,
      });

      console.log('setting up action callback...');
      action.setCallback (self, function (a) {
        console.log ('resp=' + a.getReturnValue ());

        var resp = JSON.parse (a.getReturnValue ());

        if (resp.hasOwnProperty ('error')) {
          component.set ('v.fullAddress', resp.error.details[0]);
        } else {
          //component.set('v.fullAddress', resp.address.Match_addr);
          var fullAddr = '';

          if (resp.address.Address != null && resp.address.Address.length > 0) {
            if (resp.address.Address != null) fullAddr += resp.address.Address;
            if (resp.address.City != null) fullAddr += ', ' + resp.address.City;
            if (resp.address.Region != null)
              fullAddr += ', ' + resp.address.Region;
            if (resp.address.Postal != null)
              fullAddr += ' ' + resp.address.Postal;

            component.set ('v.fullAddress', fullAddr);

            component.set ('v.street', resp.address.Address);
            component.set ('v.city', resp.address.City);
            component.set ('v.state', resp.address.Region);
            component.set ('v.postal', resp.address.Postal);
          } else {
            component.set ('v.fullAddress', fullAddr);
          }
          

          self.setMode (component);
          console.log ('fullAddress=' + component.get ('v.fullAddress'));
          console.log ('mode=' + component.get ('v.mode'));
        }
      });

      console.log('enqueueAction action invoked...');
      $A.enqueueAction (action);
      //    s$A.clientService.runActions([action], this, function() {});
    }

  },
  createMap: function (component) {
    var self = this;
    var globalId = component.getGlobalId ();

    console.log ('create map...');
    console.log ('globalId=' + globalId);

    ////////////////
    // create map //
    ////////////////
    var map = L.map (document.getElementById (globalId + '_map'), {
      zoomControl: true,
      boxZoom: true,
      trackResize: true,
      doubleClickZoom: true,
    });

    map.attributionControl.setPrefix ('');
    L.tileLayer (
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '',
      }
    ).addTo (map);

    ///////////////////////////////////////////////////////////////////////////////
    // center map on record location or if doesn't exist, users current position //
    ///////////////////////////////////////////////////////////////////////////////
    console.log ('create map zoom = ' + component.get ('v.mapZoomLevel'));
    map.setView (
      [
        parseFloat (component.get ('v.latitude')),
        parseFloat (component.get ('v.longitude')),
      ],
      component.get ('v.mapZoomLevel')
    );

    //////////////////////////////
    // setup layers and markers //
    //////////////////////////////
    console.log ('adding layers and markers...');
    var recordLayer = new L.LayerGroup ();
    var crosshairLayer = new L.LayerGroup ();

    recordLayer.addTo (map);
    crosshairLayer.addTo (map);

    var crosshairIcon = L.icon ({
      //iconUrl: '/resource/mapCrosshair',
      iconUrl: $A.get('$Resource.PSMapComponents') + '/mapCrosshair.png',
      iconSize: [200, 200], // size of the icon
    });
    console.log ('setting crosshair center=' + map.getCenter ());
    var crosshairMarker = new L.marker (map.getCenter (), {
      icon: crosshairIcon,
      clickable: false,
    });

    map.on ('move', $A.getCallback (function (e) {
      var mode = component.get ('v.mode');
      if (mode === 'RECORD' || mode === 'CENTER') {
        component.set ('v.mode', 'TRACK');
        self.showCenterCrosshair (component);
      }
      crosshairMarker.setLatLng (map.getCenter ());
    }));
    component.set ('v.crosshairMarker', crosshairMarker);

    component.set ('v.crosshairLayer', crosshairLayer);
    component.set ('v.recordLayer', recordLayer);

    //////////////////////////////////////////////////////////////////
    // when map is moved, do reverse address lookup and show on map //
    //////////////////////////////////////////////////////////////////
    map.on ('moveend', $A.getCallback (function (e) {
      console.log ('moveend=' + map.getCenter ());

      var coords = map.getCenter ();
      component.set ('v.latitude', coords.lat);
      component.set ('v.longitude', coords.lng);

      console.log ('calling reverseGeocodeEsri');
      self.reverseGeocodeEsriJS (component, coords.lat, coords.lng);
    }));

    component.set ('v.map', map);
    console.log ('map created...');
  },
  showCenterCrosshair: function (component) {
    var crosshairLayer = component.get ('v.crosshairLayer');
    var crosshairMarker = component.get ('v.crosshairMarker');
    crosshairLayer.clearLayers ();
    crosshairLayer.addLayer (crosshairMarker);
  },
  hideCenterCrosshair: function (component) {
    var crosshairLayer = component.get ('v.crosshairLayer');
    crosshairLayer.clearLayers ();
  },
  setMode: function (component) {
    var mode = component.get ('v.mode');
    if (mode === 'INIT') {
      component.set ('v.mode', 'RECORD');
    }
  },
});