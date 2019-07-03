({
    jsLoaded: function(component, event, helper) {
        console.log("jsLoaded called");
         var globalId = component.getGlobalId();

        var markersLayer = new L.LayerGroup();
        var markersLayerList = [];
        markersLayerList.push(markersLayer);

        var map = component.get("v.map");

        if (map !== undefined || map !== null) {
            map = L.map(document.getElementById(globalId + '_map'), { zoomControl: true, boxZoom: true, trackResize: true, doubleClickZoom: true })
                .setView([parseFloat(component.get("v.mapCenterLat")), parseFloat(component.get("v.mapCenterLng"))], component.get("v.mapZoomLevel"));
        }

        console.log('setting tile layer...');
        map.attributionControl.setPrefix('');
        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri'
            }).addTo(map);
        markersLayer.addTo(map);

        navigator.geolocation.getCurrentPosition(function(location) {
            console.log(location.coords.latitude);
            console.log(location.coords.longitude);
            console.log(location.coords.accuracy);

            component.set("v.origLat", location.coords.latitude);
            component.set("v.origLng", location.coords.longitude);

            var target = component.find("locateDiv");
            $A.util.removeClass(target, 'hide');

            if (component.get("v.autoCenter")) {
                map.setView([location.coords.latitude, location.coords.longitude], component.get("v.mapZoomLevel"));
            }
        });


        ///////////////////////////////////////////
        // create cross to keep at center of map //
        ///////////////////////////////////////////
        if (component.get("v.showCrosshair")) {
            var crosshairIcon = L.icon({
                iconUrl: $A.get('$Resource.mapCrosshair3'),
                iconSize: [50, 50] // size of the icon
            });
            console.log('setting crosshair center=' + map.getCenter());
            var crosshair = new L.marker(map.getCenter(), {
                icon: crosshairIcon,
                clickable: false
            });
            crosshair.addTo(map);
        }

        map.on('move', function(e) {
            if (component.get("v.showCrosshair")) crosshair.setLatLng(map.getCenter());
            component.set("v.currLat", map.getCenter().lat);
            component.set("v.currLng", map.getCenter().lng);
        });
        /*
        var kmlLayer = new L.KML("https://raw.githubusercontent.com/thedges/Test1/master/City_Council_Districts.kml", {async: true});
                                                              
         kmlLayer.on("loaded", function(e) { 
            map2.fitBounds(e.target.getBounds());
         });
                                                
         map2.addLayer(kmlLayer);
         */
        component.set("v.map", map);
        component.set("v.markersLayerList", markersLayerList);
        helper.setRuntimeEnv(component);
        console.log("jsLoaded ended");

        $A.get("e.c:PSObjectMapInitCompleteEvent").fire();
    },
    handleMapRefresh: function(component, event) {
        console.log("heard map refesh!");
        var recs = component.get("v.recList");
        var markersLayerList = component.get("v.markersLayerList");
        var mapLatField = component.get("v.mapLatField");
        var mapLngField = component.get("v.mapLngField");
        var mapIconField = component.get("v.mapIconField");
        var mapMarkerField = component.get("v.mapMarkerField");
        var rtEnv = component.get("v.runtimeEnv");
        if (mapLatField != null && mapLatField.length && mapLngField != null && mapLngField.length > 0) {
            var markersLayer = markersLayerList[0];
            markersLayer.clearLayers();
            var locationCoor = [];
            console.log('length=' + recs.length);
            console.log('rtEnv.baseURL=' + rtEnv.baseURL);
            
            for (var i = 0; i < recs.length; i++) {
                var cs = recs[i];
                console.log('cs=' + JSON.stringify(cs));
                if (cs[mapMarkerField].includes('@ID@')) {
                    var url = '';
                    if (rtEnv.env == 'lightning') {
                        url = rtEnv.baseURL + cs['Id'] + '/view';
                    } else {
                        url = rtEnv.baseURL + 'detail/' + cs['Id'];
                    }
                    cs[mapMarkerField] = cs[mapMarkerField].replace("@ID@", url);
                }
                
                if (cs[mapLatField] !== undefined && cs[mapLngField] !== undefined) {
                    console.log(cs[mapLatField] + ' ' + cs[mapLngField]);
                    var latLng = [cs[mapLatField], cs[mapLngField]];
                    locationCoor[i] = latLng;
                    var popup = L.popup()
                        .setLatLng(latLng)
                        .setContent(cs[mapMarkerField]);

                    console.log('Icon__c=' + cs[mapIconField]);

                    var myIcon = L.icon({ iconUrl: cs[mapIconField].replace('/sfsites/c', ''), iconSize: [32, 32] });
                    var marker = L.marker(latLng, { icon: myIcon });
                    marker.bindPopup(popup);
                    markersLayer.addLayer(marker);
                }
                
            }
            var map = component.get("v.map");

            if (locationCoor.length > 0) {
                var bounds = new L.latLngBounds(locationCoor);
                console.log("bounds=" + JSON.stringify(bounds));

                if (bounds != undefined || bounds != null) {
                    if (component.get("v.fitBounds")) map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }
    },
    centerOnLocation: function(component, event, helper) {
        console.log('centerOnLocation called...');
        var self = this;

        var map = component.get("v.map");
        var lat = component.get("v.origLat");
        var lng = component.get("v.origLng");
        map.setView([lat, lng]);
    }
})