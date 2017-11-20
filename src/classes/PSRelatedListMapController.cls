public class PSRelatedListMapController {
    
    @AuraEnabled
    public static List<SObject> getRelatedRecords(String params) {
        System.debug('getRelatedRecords invoked...');
        Map<String, String> paramMap = (Map<String, String>)JSON.deserialize(params,   Map<String, String>.class);
        
        //////////////////////////////////////
        // get the ID of the current record //
        //////////////////////////////////////
        String queryStr = 'SELECT Id,' + paramMap.get('mapLatField') + ',' + paramMap.get('mapLngField') + ',' + paramMap.get('mapIconField') + 
            ',' + paramMap.get('mapMarkerField') + '\nFROM ' + paramMap.get('childObject') + '\nWHERE ' + paramMap.get('parentField') + 
            '=\'' + paramMap.get('recordId') +'\'';
        
        System.debug('queryStr=' + queryStr);
        
        return Database.query(queryStr);
    }
}