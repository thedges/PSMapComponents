({
    doInit: function(component, event, helper) {
        //helper.getRelatedRecords(component);
    },
    handleMapInitComplete: function(component, event, helper) {
        console.log('handleMapInitComplete invoked...');
        helper.getRelatedRecords(component);
    },
    destroyCmp : function (component, event, helper) {
        console.log('destroyCmp invoked...');
        component.destroy();
    }
})