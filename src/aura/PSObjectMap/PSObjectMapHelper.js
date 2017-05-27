({
	setRuntimeEnv: function(component) {
        console.log('PSObjectMapController setRuntimeEnv entered....');
        
        var env = "unknown";
        var baseURL = "";
        var pathArray = location.href.split('/');
        
        if (location.href.includes('one.app'))
        {
           env = 'lightning';
           baseURL = pathArray[0] + '//' + pathArray[2] + '/one/one.app?source=aloha#/sObject/';
        }
        else if (location.href.includes('/s/'))
        {
           env = 'community';
           baseURL = pathArray[0] + '//' + pathArray[2] + '/' + pathArray[3] + '/s/';
        }

        var envRT = {'env': env, 'baseURL': baseURL};
        //console.log(JSON.stringify(envRT));

        component.set("v.runtimeEnv", envRT);
        console.log('PSRecordMapController setRuntimeEnv complete.');
    }
})