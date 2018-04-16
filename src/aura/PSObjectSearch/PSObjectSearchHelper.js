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
    initRadiusParams: function(component) {
        console.log('initRadiusParams begin...');
        var radiusCSV = component.get("v.radiusCSV");
        var optionArr = radiusCSV.split(",");
        var radiusOptionList = [];
        for (var i = 0; i < optionArr.length; i++) {
            var option = optionArr[i];
            if (option.startsWith("*")) {
                option = option.substring(1);
                radiusOptionList.push(option);
                component.set('v.radius', option);
            } else {
                radiusOptionList.push(option);
            }
        }
        console.log(JSON.stringify(radiusOptionList));
        if (radiusOptionList.length > 0) {
            component.set('v.radiusOptionList', radiusOptionList);
        }
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
    parseMultiSelectList: function(val) {
        var optionArr = val.split(";");
        var retStr = null;
        for (var i = 0; i < optionArr.length; i++) {
            var option = optionArr[i];
            if (option != null && option.length > 0) {
                if (retStr == null) {
                    retStr = "'" + option + "'";
                } else {
                    retStr += ",'" + option + "'";
                }
            }
        }
        return retStr;
    },
    getOptionValue: function(field) {
        var val = field.value;
        for (var i = 0; i < field.options.length; i++) {
            var fldOption = field.options[i];
            if (fldOption.label == field.value) {
                val = fldOption.value;
            }
        }
        return val;
    },
    createSOQL: function(component) {
        console.log('createSOQL called...');
        var self = this;
        var sobject = component.get("v.sobject");
        var tableFields = component.get("v.tableFields");
        var mapLatField = component.get("v.mapLatField");
        var mapLngField = component.get("v.mapLngField");
        var mapIconField = component.get("v.mapIconField");
        var mapMarkerField = component.get("v.mapMarkerField");
        var myRecordFields = component.get("v.myRecordFields");
        var context = component.get("v.context");
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
                if (filterFieldComps[i].value !== null && filterFieldComps[i].value != "" && filterFieldComps[i].value != "--None--") {
                    if (filterFieldComps[i].ftype == 'picklist') {
                        console.log('found picklist');
                        //cls = filterFieldComps[i].name + " = '" + filterFieldComps[i].value + "'";
                        if (filterFieldComps[i].wildcard == true) {
                            cls = filterFieldComps[i].name + " LIKE '%" + this.getOptionValue(filterFieldComps[i]) + "%'";
                        } else {
                            cls = filterFieldComps[i].name + " = '" + this.getOptionValue(filterFieldComps[i]) + "'";
                        }
                    } else if (filterFieldComps[i].ftype == 'string') {
                        console.log('found string');
                        if (filterFieldComps[i].value.includes('%') || filterFieldComps[i].value.includes('%')) {
                            cls = filterFieldComps[i].name + " LIKE '" + filterFieldComps[i].value + "'";
                        } else {
                            cls = filterFieldComps[i].name + " = '" + filterFieldComps[i].value + "'";
                        }
                    } else if (filterFieldComps[i].ftype == 'multipicklist') {
                        cls = filterFieldComps[i].name + " IN (" + self.parseMultiSelectList(filterFieldComps[i].value) + ")";
                    } else if (filterFieldComps[i].ftype == 'double') {
                        if (filterFieldComps[i].value.indexOf('-') != -1) {
                            var indx = filterFieldComps[i].value.indexOf('-');
                            cls = filterFieldComps[i].name + " >= " + filterFieldComps[i].value.substring(0, indx) + " AND " +
                                filterFieldComps[i].name + " <= " + filterFieldComps[i].value.substring(indx + 1);
                        } else if (filterFieldComps[i].value.indexOf('>=') == 0) {
                            cls = filterFieldComps[i].name + " >= " + filterFieldComps[i].value.substring(2).trim();
                        } else if (filterFieldComps[i].value.indexOf('<=') == 0) {
                            cls = filterFieldComps[i].name + " <= " + filterFieldComps[i].value.substring(2).trim();
                        } else if (filterFieldComps[i].value.indexOf('>') == 0) {
                            cls = filterFieldComps[i].name + " > " + filterFieldComps[i].value.substring(1).trim();
                        } else if (filterFieldComps[i].value.indexOf('<') == 0) {
                            cls = filterFieldComps[i].name + " < " + filterFieldComps[i].value.substring(1).trim();
                        } else {
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
        var cls;
        console.log('mapOnly=' + mapOnly);
        if (mapOnly === 'true' && mapLatField != null && mapLatField.length && mapLngField != null && mapLngField.length > 0) {
            cls = mapLatField + " != null AND " + mapLngField + " != null";
            if (soqlWhere == "") {
                soqlWhere += "WHERE " + cls;
            } else {
                soqlWhere += "\nAND " + cls;
            }
        }
        var radius = component.get('v.radius');
        if (radius != null && radius.length > 0) {
            if (component.get('v.radiusCSV') != null && component.get('v.radiusCSV').length > 0) {
                var gpsField = "Location__c";
                if (mapLatField != null) {
                    gpsField = mapLatField.substring(0, mapLatField.length - 13) + "__c";
                }
                cls = "DISTANCE(" + gpsField + ", GEOLOCATION(" + component.get('v.currLat') + "," + component.get('v.currLng') + "), 'mi') < " + component.get('v.radius');
                if (soqlWhere == "") {
                    soqlWhere += "WHERE " + cls;
                } else {
                    soqlWhere += "\nAND " + cls;
                }
            }
        }
        if (myRecordFields != null && myRecordFields.length > 0 && 
            context.userType != null && context.userType != 'Guest' && 
            context.userId != null && context.userId.length > 0) 
        {
            var fieldArr = myRecordFields.split(',');
            var tmpStr = "";
            console.log('fieldArr.length=' + fieldArr.length);
            
            if (fieldArr.length == 1)
            {
               tmpStr += fieldArr[0].trim().toLowerCase() + "='" + context.userId + "'";
            }
            else
            {
              for (var i = 0; i < fieldArr.length; i++) 
              {
                if (tmpStr == "") 
                {
                    tmpStr += "(" + fieldArr[i].trim().toLowerCase() + "='" + context.userId + "'";
                } 
                else
                {
                    tmpStr += "\nOR " + fieldArr[i].trim().toLowerCase() + "='" + context.userId + "'";
                }
              }
              if (tmpStr.length > 0) tmpStr += ")";
            }

            if (soqlWhere == "") 
            {
                soqlWhere += "WHERE " + tmpStr;
            } 
            else 
            {
                soqlWhere += "\nAND " + tmpStr;
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
    },
    setRuntimeContext: function(component) {
        console.log('helper getRuntimeContext started...');
        var action = component.get("c.getRuntimeContext");
        console.log(JSON.stringify(action.getParams()));
        
        //Set up the callback
        var self = this;
        action.setCallback(this, function(a) {
            console.log('query callback!');
            console.log(a.getReturnValue());
            component.set("v.context", JSON.parse(a.getReturnValue()));
        });
        $A.enqueueAction(action);
    }
})