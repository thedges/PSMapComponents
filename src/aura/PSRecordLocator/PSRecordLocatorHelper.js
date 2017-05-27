({
  reverseGeocodeEsri: function(component, lat, lng) {
    console.log('reverseGeocodeEsri invoked...');
    var action = component.get("c.reverseGeocodeEsri");
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
        component.set('v.fullAddress', resp.address.Match_addr);
        component.set('v.street', resp.address.Address);
        component.set('v.city', resp.address.City);
        component.set('v.state', resp.address.Region);
        component.set('v.postal', resp.address.Postal);

        var target = component.find("addressDiv");
        $A.util.removeClass(target, 'hide');

      }

    });

    //$A.enqueueAction(action);
    $A.clientService.runActions([action], this, function() {});
  },
  createMap: function(component) {
    var self = this;

    console.log("create map...");
    ////////////////
    // create map //
    ////////////////
    var map = L.map(component.find('map').getElement(), {
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

    ///////////////////////////////////////////////////////////////////////////////
    // center map on record location or if doesn't exist, users current position //
    ///////////////////////////////////////////////////////////////////////////////
    map.setView([parseFloat(component.get("v.latitude")), parseFloat(component.get("v.longitude"))], component.get("v.mapZoomLevel"));

    component.set("v.map", map);
    console.log("map created...");

    ///////////////////////////////////////////
    // create cross to keep at center of map //
    ///////////////////////////////////////////
    var crosshairIcon = L.icon({
      iconUrl: '/resource/mapCrosshair',
      iconSize: [200, 200] // size of the icon
    });
    console.log('setting crosshair center=' + map.getCenter());
    crosshair = new L.marker(map.getCenter(), {
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

  },
  loadRecordLocation: function(component) {
    var self = this;
    console.log('loadRecordLocation invoked...');

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
        navigator.geolocation.getCurrentPosition(function(location) {
          component.set("v.latitude", location.coords.latitude);
          component.set("v.longitude", location.coords.longitude);
          component.set("v.mapZoomLevel", 14);

          self.createMap(component);
          self.reverseGeocodeEsri(component, location.coords.latitude, location.coords.longitude);
        });
      } else {
        console.log('data=' + resp.data);
        component.set("v.latitude", resp.data.latitude);
        component.set("v.longitude", resp.data.longitude);
        component.set("v.mapZoomLevel", 14);

        self.createMap(component);
      }

    });

    // Enqueue the action
    $A.enqueueAction(action);
  }
})