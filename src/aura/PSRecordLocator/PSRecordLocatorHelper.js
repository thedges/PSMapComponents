({
  loadRecordLocation: function(component) {
    var self = this;
    console.log('loadRecordLocation invoked...');

    self.createMap(component);
      
    var paramMap = {};

    paramMap['recordId'] = component.get('v.recordId');
    paramMap['mapLatField'] = component.get('v.mapLatField');
    paramMap['mapLngField'] = component.get('v.mapLngField');     

    var action = component.get("c.getCurrLocation");
    action.setParams({
      "params": JSON.stringify(paramMap)
    });

    action.setCallback(self, function(a) {
      console.log(a.getReturnValue());
      var resp = JSON.parse(a.getReturnValue());

      var map = component.get('v.map');
      if (resp.status === 'ERROR') {
        console.log('getCurrentPosition');
        var options = {
           enableHighAccuracy: false,
           timeout: 5000,
           maximumAge: Infinity
        };
        navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
          component.set("v.latitude", location.coords.latitude);
          component.set("v.longitude", location.coords.longitude);
          component.set("v.mapZoomLevel", 14);

          //self.createMap(component);
          try
          {
          map.setView([parseFloat(component.get("v.latitude")), parseFloat(component.get("v.longitude"))], component.get("v.mapZoomLevel"));
          self.reverseGeocodeEsri(component, location.coords.latitude, location.coords.longitude);
          }
          catch (err)
          {
              // do nothing
          }
        }), 
        function(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            //self.createMap(component);
        });
      } else {
        console.log('data=' + resp.data);
        component.set("v.latitude", resp.data.latitude);
        component.set("v.longitude", resp.data.longitude);
        component.set("v.mapZoomLevel", 14);

        //self.createMap(component);
        try
        {
          map.setView([parseFloat(component.get("v.latitude")), parseFloat(component.get("v.longitude"))], component.get("v.mapZoomLevel"));

          var markersLayerList = component.get("v.markersLayerList");
          var markersLayer = markersLayerList[0];

          var crosshairIcon = L.icon({
            //iconUrl: '/resource/mapCrosshair',
            iconUrl: $A.get('$Resource.mapCrosshair4'),
            iconSize: [200, 200] // size of the icon
          });
          console.log('setting crosshair center=' + map.getCenter());
          var crosshair = new L.marker([parseFloat(component.get("v.latitude")), parseFloat(component.get("v.longitude"))], {
            icon: crosshairIcon,
            clickable: false
          });
console.log('setting record location');
          markersLayer.addLayer(crosshair);

        }
        catch (err)
        {
            // do nothing
        }
      }

    });

    // Enqueue the action
    $A.enqueueAction(action);
  },
  reverseGeocodeEsri: function(component, lat, lng) {
    console.log('reverseGeocodeEsri invoked...');
    var action = component.get("c.reverseGeocodeEsri");
    if (action)
    {
    action.setParams({
      "lat": lat,
      "lng": lng
    });

    action.setCallback(self, function(a) {
      console.log('resp=' + a.getReturnValue());

      var resp = JSON.parse(a.getReturnValue());

      if (resp.hasOwnProperty('error')) {
        component.set('v.fullAddress', resp.error.details[0]);
      } else {
        //component.set('v.fullAddress', resp.address.Match_addr);
        var fullAddr = '';
        if (resp.address.Address != null) fullAddr += resp.address.Address;
        if (resp.address.City != null) fullAddr += ', ' + resp.address.City;
        if (resp.address.Region != null) fullAddr += ', ' + resp.address.Region;
        if (resp.address.Postal != null) fullAddr += ' ' + resp.address.Postal;
        
        component.set('v.fullAddress', fullAddr);
          
        component.set('v.street', resp.address.Address);
        component.set('v.city', resp.address.City);
        component.set('v.state', resp.address.Region);
        component.set('v.postal', resp.address.Postal);

        var target = component.find("addressDiv");
        $A.util.removeClass(target, 'hide');
      }

    });

    $A.enqueueAction(action);
    //    s$A.clientService.runActions([action], this, function() {});
  }
  },
  createMap: function(component) {
    var self = this;
    var globalId = component.getGlobalId();

    console.log("create map...");
    console.log("globalId=" + globalId);
     
    var markersLayer = new L.LayerGroup();
    var markersLayerList = [];
    markersLayerList.push(markersLayer);

    ////////////////
    // create map //
    ////////////////
    var map = L.map(document.getElementById(globalId + '_map'), {
      zoomControl: true,
      boxZoom: true,
      trackResize: true,
      doubleClickZoom: true
    });

    map.attributionControl.setPrefix('');
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: ''
      }).addTo(map);
      markersLayer.addTo(map);

    ///////////////////////////////////////////////////////////////////////////////
    // center map on record location or if doesn't exist, users current position //
    ///////////////////////////////////////////////////////////////////////////////
    map.setView([parseFloat(component.get("v.latitude")), parseFloat(component.get("v.longitude"))], component.get("v.mapZoomLevel"));


    ///////////////////////////////////////////
    // create cross to keep at center of map //
    ///////////////////////////////////////////
    var crosshairIcon = L.icon({
      //iconUrl: '/resource/mapCrosshair',
      iconUrl: $A.get('$Resource.mapCrosshair'),
      iconSize: [200, 200] // size of the icon
    });
    console.log('setting crosshair center=' + map.getCenter());
    var crosshair = new L.marker(map.getCenter(), {
      icon: crosshairIcon,
      clickable: false
    });
    crosshair.addTo(map);

    map.on('move', function(e) {
      crosshair.setLatLng(map.getCenter());
    });

    //////////////////////////////////////////////////////////////////
    // when map is moved, do reverse address lookup and show on map //
    //////////////////////////////////////////////////////////////////
    map.on('moveend', function(e) {
      console.log('moveend=' + map.getCenter());
      var coords = map.getCenter();
      component.set('v.latitude', coords.lat);
      component.set('v.longitude', coords.lng);

      console.log('calling reverseGeocodeEsri');
      self.reverseGeocodeEsri(component, coords.lat, coords.lng);
    });

    component.set("v.map", map);
    component.set("v.markersLayerList", markersLayerList);
    console.log("map created...");

  }
})