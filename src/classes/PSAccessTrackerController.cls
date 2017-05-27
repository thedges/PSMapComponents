public class PSAccessTrackerController
{
  @AuraEnabled
  public static String createAccessRecord(String params)
  {
    System.debug('createAccessRecordd...');
    Map<String, String> paramMap = (Map<String, String>)JSON.deserialize(params,   Map<String, String>.class);
    PSResponse resp = new PSResponse();

    try
    {
      Id recId = Id.valueOf(paramMap.get('recordId'));
      SObject sObj = Schema.getGlobalDescribe().get(paramMap.get('obj')).newSObject() ;

      sObj.put(paramMap.get('parentField'), recId);
      sObj.put(paramMap.get('latField'), Decimal.valueOf(paramMap.get('lat')));
      sObj.put(paramMap.get('lngField'), Decimal.valueOf(paramMap.get('lng')));

      if (paramMap.containsKey('addrField'))
      {
        sObj.put(paramMap.get('addrField'), paramMap.get('addr'));
      }

      System.debug(JSON.serializePretty(sObj));

      insert sObj;
    }
    catch (exception e)
    {
      resp.status = PSResponse.ERROR;
      resp.msg = e.getMessage();
    }


    return  JSON.serialize(resp);
  }

  @AuraEnabled
  public static String reverseGeocodeEsri(Decimal lat, Decimal lng)
  {
    System.debug('reverseGeocodeEsri invoked...');

    return PSGeoUtils.reverseGeocodeEsri(lat, lng);
  }
}