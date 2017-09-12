({
    getRelatedRecords: function(component) {
        var self = this;
        console.log('getRelatedRecords invoked...');
        
        var paramMap = {};
        
        paramMap['recordId'] = component.get('v.recordId');
        paramMap['childObject'] = component.get('v.childObject');
        paramMap['parentField'] = component.get('v.parentField');
        paramMap['mapLatField'] = component.get('v.mapLatField');
        paramMap['mapLngField'] = component.get('v.mapLngField');
        paramMap['mapIconField'] = component.get('v.mapIconField');
        paramMap['mapMarkerField'] = component.get('v.mapMarkerField');
        
        var action = component.get("c.getRelatedRecords");
        action.setParams({
            "params": JSON.stringify(paramMap)
        });
        
        //Set up the callback
        
        action.setCallback(this, function(a) {
            console.log('query callback!');
            console.log(JSON.stringify(a.getReturnValue()));
            component.set("v.recList", a.getReturnValue());
            var recs = a.getReturnValue();
            
                console.log('sending PSRefreshMapEvent');
                $A.get("e.c:PSRefreshMapEvent").fire();
                

        });
        $A.enqueueAction(action);
    }
})