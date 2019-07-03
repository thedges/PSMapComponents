({
  CSL2Array: function(CSL) {
    try {
      var outputArray = CSL.split(",");
      _.forEach(outputArray, function(value, key) {
        outputArray[key] = _.trim(value);
      });
      return outputArray;
    } catch (err) {
      console.log("failed at building CSL array");
      console.log(err.message);
      //console.log("lodash is defined?: " + (false || _));
      //intended to handle the "CSL is null scenario"
      return [];
    }
  },
  setRuntimeEnv: function(component) {
    console.log('href=' + location.href);

    var env = "unknown";
    var baseURL = "";
    var pathArray = location.href.split('/');

    if (location.href.includes('one.app')) {
      env = 'lightning';
      baseURL = pathArray[0] + '//' + pathArray[2] + '/one/one.app?source=aloha#/sObject/';
    } else if (location.href.includes('/s/')) {
      env = 'community';
      baseURL = pathArray[0] + '//' + pathArray[2] + '/' + pathArray[3] + '/s/';
    }

    var envRT = {
      'env': env,
      'baseURL': baseURL
    };
    console.log(JSON.stringify(envRT));

    component.set("v.runtimeEnv", envRT);
  },
  initTableParams: function(component) {
    console.log('initTableParams begin...');
    var globalId = component.getGlobalId();
      
    var self = this; // safe reference
    var tableFields = component.get("v.tableFields");
    var sobject = component.get("v.sobject");

    var action = component.get("c.prepTableFields");
    action.setParams({
      "objtype": sobject,
      "tableFields": tableFields
    });
    action.setCallback(self,  $A.getCallback(function(a) {
      console.log('initTableParams complete!');
      console.log('response=' + a.getReturnValue());
      //console.log('retList=' + a.getReturnValue());
      component.set("v.tableFieldComps", JSON.parse(a.getReturnValue()));


      var tableFieldComps = component.get("v.tableFieldComps");
      var colsJSON = "[\n";
      for (var i = 0; i < tableFieldComps.length; i++) {
        if (i > 0) colsJSON += ",\n";
        colsJSON += '{"title": "' + tableFieldComps[i].label + '", "data": "' + tableFieldComps[i].name + '", "defaultContent": ""}';
      }
      colsJSON += "]";

      console.log('colsJSON=' + colsJSON);

      try {
        $(document).ready(function() {
            $(document.getElementById(globalId + '_recordTable')).DataTable({
            "searching": false,
            "pageLength": 15,
            "lengthChange": false,
            "stateSave": false,
            "columns": JSON.parse(colsJSON),
            "data": jQuery.parseJSON(JSON.stringify(component.get("v.recList")))
          });
        });
      } catch (err) {
        console.log(err.message);
      }
    }));
    // Enqueue the action
    $A.enqueueAction(action);
  }
})