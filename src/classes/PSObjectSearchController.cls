global class PSObjectSearchController {

    public PSObjectSearchController() {
    }

    @AuraEnabled
    public static List<SObject> query(String queryStr) {
        System.debug('query invoked...');

        return Database.query(queryStr);
    }

    @AuraEnabled
    public static String prepFilterFields(String objtype, String filterFields) {
        return(PSMetaUtils.getMetaFieldDesc2(objtype, filterFields));
    }

    @AuraEnabled
    public static String prepTableFields(String objtype, String tableFields) {
        return(PSMetaUtils.getMetaFieldDesc2(objtype, tableFields));
    }
    
    @AuraEnabled
    public static String getRuntimeContext() {
        Map<String, String> contextMap = new Map<String, String>();
        
        contextMap.put('userId', UserInfo.getUserId());
        contextMap.put('userType', UserInfo.getUserType());
        contextMap.put('userFirstName', UserInfo.getFirstName());
        contextMap.put('userLastName', UserInfo.getLastName());
        contextMap.put('userName', UserInfo.getUserName());
        contextMap.put('orgName', UserInfo.getOrganizationName());
        
        return(JSON.serialize(contextMap));
    }

}