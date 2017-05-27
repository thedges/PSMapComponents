({
  initSearchParams: function(component) {
    var self = this; // safe reference
    var initAction = component.get("c.initSearchParams");
    initAction.setCallback(self, function(a) {
      component.set("v.searchParams", a.getReturnValue());
    });
    // Enqueue the action
    $A.enqueueAction(initAction);
  },
  initFilterParams: function(component) {
    console.log('initFilterParams begin...');
    var self = this; // safe reference
    var filterFields = component.get("v.filterFields");
    var sobject = component.get("v.sobject");
    
    var action = component.get("c.prepFilterFields");
    action.setParams({
      "objtype": sobject,
      "filterFields": filterFields
    });
    action.setCallback(self, function(a) {
      console.log('initFilterparams complete!');
      console.log('retList=' + a.getReturnValue());
      component.set("v.filterFieldComps", JSON.parse(a.getReturnValue()));
    });
    // Enqueue the action
    $A.enqueueAction(action);
  },
  initTableParams: function(component) {
    console.log('initTableParams begin...');
    
    var self = this; // safe reference
    var tableFields = component.get("v.tableFields");
    var sobject = component.get("v.sobject");

    var action = component.get("c.prepTableFields");
    action.setParams({
      "objtype": sobject,
      "tableFields": tableFields
    });
    action.setCallback(self, function(a) {
      //console.log('initFilterparams complete!');
      //console.log('retList=' + a.getReturnValue());
      component.set("v.tableFieldComps", JSON.parse(a.getReturnValue()));
    });
    // Enqueue the action
    $A.enqueueAction(action);

  },
  executeFilter: function(component) {
    console.log('helper executeFilter started...');
    var action = component.get("c.query");
    action.setParams({
      "queryStr": component.get("v.soql")
    });
    console.log(JSON.stringify(action.getParams()));
    //Set up the callback
    var self = this;
    action.setCallback(this, function(a) {
      console.log('query callback!');
      console.log(JSON.stringify(a.getReturnValue()));
      component.set("v.recList", a.getReturnValue());
      var recs = a.getReturnValue();
      if (recs == null || recs.length <= 0) {
        // fire a toast message to popup on screen for Success
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
          "title": "Warning!",
          "message": "Search returned zero results.",
          "duration": 2000,
          "type": "warning"
        });
        toastEvent.fire();
      } else {
        console.log('sending PSRefreshMapEvent');
        $A.get("e.c:PSRefreshDataTableEvent").fire();
        $A.get("e.c:PSRefreshMapEvent").fire();

        console.log('SENT!');

        try {
          var tableFields = component.get("v.tableFields");
        } catch (err) {
          console.log(err.message);
        }
        console.log('tableFields=' + tableFields);
        if (tableFields != null && tableFields.length > 0) {
          console.log('sending PSRefreshDataTableEvent');
          $A.get("e.c:PSRefreshDataTableEvent").fire();
        }
      }
    });
    $A.enqueueAction(action);
  },
  createSOQL: function(component) {
    console.log('createSOQL called...');
    
    
    var sobject = component.get("v.sobject");
    var tableFields = component.get("v.tableFields");
    var mapLatField = component.get("v.mapLatField");
    var mapLngField = component.get("v.mapLngField");
    var mapIconField = component.get("v.mapIconField");
    var mapMarkerField = component.get("v.mapMarkerField");
    var extraWhereClause = component.get("v.extraWhereClause");
    var filterFieldComps = component.get("v.filterFieldComps");
    var mapOnly = component.get("v.mapOnly");
    var soql = new String();

    ////////////////////////////////////
    // create list of fields to query //
    ////////////////////////////////////
    console.log('setting up fields to query...');
    console.log('tableFields=' + tableFields);

    var fieldSet = new Set();
    fieldSet.add("id");
    if (tableFields != null && tableFields.length > 0) {
      var arr = tableFields.split(',');
      for (var i = 0; i < arr.length; i++) {
        fieldSet.add(arr[i].trim().toLowerCase());
      }
    }
    if (mapLatField != null && mapLatField.length > 0) fieldSet.add(mapLatField.trim().toLowerCase());
    if (mapLngField != null && mapLngField.length > 0) fieldSet.add(mapLngField.trim().toLowerCase());
    if (mapIconField != null && mapIconField.length > 0) fieldSet.add(mapIconField.trim().toLowerCase());
    if (mapMarkerField != null && mapMarkerField.length > 0) fieldSet.add(mapMarkerField.trim().toLowerCase());

    /////////////////
    // create SOQL //
    /////////////////
    console.log('building SOQL...');
    soql = "SELECT " + Array.from(fieldSet).join(', ') + "\n";
    soql += "FROM " + sobject + "\n";
    var soqlWhere = '';
    
    //console.log('filterFieldComps=' + JSON.stringify(filterFieldComps));
    if (filterFieldComps.length > 0) {
      ////////////////////////
      // build where clause //
      ////////////////////////
      for (var i = 0; i < filterFieldComps.length; i++) {
        var cls = "";
        if (filterFieldComps[i].value !== null && filterFieldComps[i].value != "") {
          if (filterFieldComps[i].ftype == 'picklist') {
            console.log('found picklist');
            cls = filterFieldComps[i].name + " = '" + filterFieldComps[i].value + "'";
          } else if (filterFieldComps[i].ftype == 'string') {
            console.log('found string');
            if (filterFieldComps[i].value.includes('%') || filterFieldComps[i].value.includes('%')) {
              cls = filterFieldComps[i].name + " LIKE '" + filterFieldComps[i].value + "'";
            } else {
              cls = filterFieldComps[i].name + " = '" + filterFieldComps[i].value + "'";
            }
          } else if (filterFieldComps[i].ftype == 'multipicklist') {
            cls = filterFieldComps[i].name + " IN (" + filterFieldComps[i].value + ")";
          } else if (filterFieldComps[i].ftype == 'double') {
            if (filterFieldComps[i].value.indexOf('-') != -1)
            {
              var indx = filterFieldComps[i].value.indexOf('-');
              cls = filterFieldComps[i].name + " >= " + filterFieldComps[i].value.substring(0,indx) + " AND " + 
                    filterFieldComps[i].name + " <= " + filterFieldComps[i].value.substring(indx+1);
            }
            else if (filterFieldComps[i].value.indexOf('>=') == 0)
            {
              cls = filterFieldComps[i].name + " >= " + filterFieldComps[i].value.substring(2).trim();
            }
            else if (filterFieldComps[i].value.indexOf('<=') == 0)
            {
              cls = filterFieldComps[i].name + " <= " + filterFieldComps[i].value.substring(2).trim();
            }
            else if (filterFieldComps[i].value.indexOf('>') == 0)
            {
              cls = filterFieldComps[i].name + " > " + filterFieldComps[i].value.substring(1).trim();
            }
            else if (filterFieldComps[i].value.indexOf('<') == 0)
            {
              cls = filterFieldComps[i].name + " < " + filterFieldComps[i].value.substring(1).trim();
            }
            else
            {
              cls = filterFieldComps[i].name + " = " + filterFieldComps[i].value;
            }
          }

          if (cls != "") {
            if (soqlWhere == "") {
              soqlWhere += "WHERE " + cls;
            } else {
              soqlWhere += "\nAND " + cls;
            }
          }
        }
      }

    }
    

    console.log('mapOnly=' + mapOnly);
    if (mapOnly === 'true' && mapLatField != null && mapLatField.length && mapLngField != null && mapLngField.length > 0) {
      var cls = mapLatField + " != null AND " + mapLngField + " != null";
      if (soqlWhere == "") {
        soqlWhere += "WHERE " + cls;
      } else {
        soqlWhere += "\nAND " + cls;
      }
    }

    if (extraWhereClause != null && extraWhereClause.length > 0) {
      if (soqlWhere == "") {
        soqlWhere += "WHERE " + extraWhereClause;
      } else {
        soqlWhere += "\nAND " + extraWhereClause;
      }
    }

    if (soqlWhere != "") soql += soqlWhere;

    console.log("SOQL=" + soql);
    component.set("v.soql", soql);

  },
  setRuntimeEnv: function(component) {
    console.log('href=' + location.href);

    var env = "unknown";
    var baseURL = "";
    var pathArray = location.href.split('/');

    if (location.href.includes('one.app')) {
      env = "lightning";
      baseURL = pathArray[0] + '//' + pathArray[2] + '/one/one.app?source=aloha#/sObject/';
    } else if (location.href.includes('/s/')) {
      env = "community";
      baseURL = pathArray[0] + '//' + pathArray[2] + '/' + pathArray[3] + '/s/';
    }

    var envRT = {
      'env': env,
      'baseURL': baseURL
    };
    console.log(JSON.stringify(envRT));

    component.set("v.runtimeEnv", envRT);
  }
})