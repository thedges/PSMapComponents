({
    jsLoaded: function(component, event, helper) {
        console.log("jsLoaded called");
        var markersLayer = new L.LayerGroup();
        var markersLayerList = [];
        markersLayerList.push(markersLayer);
        var map = L.map('map', { zoomControl: true, boxZoom: true, trackResize: true, doubleClickZoom: true })
            .setView([parseFloat(component.get("v.mapCenterLat")), parseFloat(component.get("v.mapCenterLng"))], component.get("v.mapZoomLevel"));
        map.attributionControl.setPrefix('');
        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri'
            }).addTo(map);
        markersLayer.addTo(map);
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
        console.warn("jsLoaded ended");
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
            var bounds = new L.latLngBounds(locationCoor);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
})