({
    init: function(component, event, helper) {
        //console.log("init called");
    },
    jsLoaded: function(component, event, helper) {
        //console.log("jsLoaded called");
    },
    doInit: function(component, event, helper) {
        //console.log("doInit called");
        var autoCenter = component.get("v.autoCenter");
        var mapCenterLat = component.get("v.mapCenterLat");
        var mapCenterLng = component.get("v.mapCenterLng");

        component.set("v.currLat", mapCenterLat);
        component.set("v.currLng", mapCenterLng);

        if (autoCenter)
        {
            navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
                component.set("v.currLat", location.coords.latitude);
                component.set("v.currLng", location.coords.longitude);
              }));
        }


        /*
        navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
          component.set("v.currLat", location.coords.latitude);
          component.set("v.currLng", location.coords.longitude);
        }));
        */
        
        helper.initRadiusParams(component);
        helper.setRuntimeEnv(component);
        helper.setRuntimeContext(component);
        helper.initFilterParams(component);
        helper.initTableParams(component);
    },
    fireFilter : function(component, event, helper) {
        console.log('fireFilter started...');

        helper.createSOQL(component);
        helper.executeFilter(component);
    },
    searchCases : function(component, event, helper) {
        //console.log('Search pressed');
        var searchParams = component.get("v.searchParams");
        var filterFields = component.get("v.filterFieldComps");
        //console.log("searchParams: ", searchParams);
        //console.log("filterFields: ", filterFields);
   
        helper.getCaseList(component, searchParams);
    },
    updateFieldValue: function(component, event, helper){        
        //console.log('test=' + event.target.value);      
    }
})