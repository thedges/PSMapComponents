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

}