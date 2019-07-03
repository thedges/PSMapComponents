({
    handleDataTableRefresh: function(component, event) {
        /* globals $ */
        console.log("PSDataTable::handleDataTableRefresh called!");
        var objtype = component.get("v.sobject");
        var rtEnv = component.get("v.runtimeEnv");
        var recs = component.get("v.recList");
        var globalId = component.getGlobalId();

        //////////////////////////////
        // prep data before display //
        //////////////////////////////
        for (var i=0; i<recs.length; i++)
        {
           var objRec = recs[i];
           console.log(JSON.stringify(objRec));

            if (objtype === 'Case' && objRec.hasOwnProperty('CaseNumber'))
            {
               //colsJSON += ", 'render': function(data,type,row){return '<a href=\"/" + data.Id + "\">" + data.CaseNumber + "</a>'}";
               if (rtEnv.env === 'community')
               {
                 objRec.CaseNumber = '<a href="' + rtEnv.baseURL + 'detail/' + objRec.Id + '">' + objRec.CaseNumber + '</a>';
               }
               else
               {
                 objRec.CaseNumber = '<a href="' + rtEnv.baseURL + objRec.Id + '/view">' + objRec.CaseNumber + '</a>';
               }
            }
            else if (objRec.hasOwnProperty('Name'))
            {
              if (!objRec.Name.startsWith('<'))
              {
               if (rtEnv.env === 'community')
               {
                 objRec.Name = '<a href="' + rtEnv.baseURL + 'detail/' + objRec.Id + '">' + objRec.Name + '</a>';
               }
               else
               {
                 objRec.Name = '<a href="' + rtEnv.baseURL + objRec.Id + '/view">' + objRec.Name + '</a>';
               }
              }
            }
            
        }

        try {
            $(document.getElementById(globalId + '_recordTable')).DataTable().clear().rows.add(jQuery.parseJSON(JSON.stringify(recs))).draw();
        } catch (err) {
            console.log(err.message);
        }
    },
    doInit: function(component, event, helper) {
        console.log("PSDataTable::doInit called");
        helper.setRuntimeEnv(component);
    },
    jsLoaded: function(component, event, helper) {
        console.log("PSDataTable::jsLoaded called");
         var globalId = component.getGlobalId();


/*
        var fldArr = helper.CSL2Array(component.get("v.tableFields"));


        var colsJSON = "[\n";
        for (var i = 0; i < fldArr.length; i++) {
          if (i > 0) colsJSON += ",\n";
          colsJSON += '{"title": "' + fldArr[i].replace('__c', '').('_', '') + '", "data": "' + fldArr[i] + '", "defaultContent": ""}';
        }
        colsJSON += "]";
        */


        var tableFieldComps = component.get("v.tableFieldComps");
        var colsJSON = "[\n";
        for (var i = 0; i < tableFieldComps.length; i++) {
            if (i > 0) colsJSON += ",\n";
            colsJSON += '{"title": "' + tableFieldComps[i].label + '", "data": "' + tableFieldComps[i].name + '", "defaultContent": ""}';
        }
        colsJSON += "]";



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
        }
        catch(err) {
          console.log(err.message);
        }

       
        console.log('5');
        
    }
})