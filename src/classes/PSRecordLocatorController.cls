public class PSRecordLocatorController
{
  @AuraEnabled
  public static String reverseGeocodeEsri(Decimal lat, Decimal lng)
  {
    System.debug('reverseGeocodeEsri invoked...');

    return PSGeoUtils.reverseGeocodeEsri(lat, lng);
  }

  @AuraEnabled
  public static String saveRecordLocation(String params)
  {
    System.debug('saveRecordLocation invoked...');
    Map<String, String> paramMap = (Map<String, String>)JSON.deserialize(params,   Map<String, String>.class);

    PSResponse resp = new PSResponse();

    //////////////////////////////////////
    // get the ID of the current record //
    //////////////////////////////////////
    String recordId = paramMap.get('recordId');

    try
    {
      Id recId = Id.valueOf(recordId);

      ////////////////////////////////////
      // get metadata of current object //
      ////////////////////////////////////
      Schema.SObjectType objType = recId.getSObjectType();
      Schema.DescribeSObjectResult dr = objType.getDescribe();

      /////////////////////////////////////////////////////////
      // create a generic SObject to update values on record //
      /////////////////////////////////////////////////////////
      SObject sObj = Schema.getGlobalDescribe().get(dr.getName()).newSObject();
      sObj.put('Id', recId);

      if (paramMap.get('mapLatField') != '' && paramMap.get('latitude') != '')  sObj.put(paramMap.get('mapLatField'), Decimal.valueOf(paramMap.get('latitude')));
      if (paramMap.get('mapLngField') != '' && paramMap.get('longitude') != '')  sObj.put(paramMap.get('mapLngField'), Decimal.valueOf(paramMap.get('longitude')));
      if (paramMap.get('addrField') != '' && paramMap.get('fullAddress') != '')  sObj.put(paramMap.get('addrField'), paramMap.get('fullAddress'));
      if (paramMap.get('addrStreetField') != '' && paramMap.get('street') != '')  sObj.put(paramMap.get('addrStreetField'), paramMap.get('street'));
      if (paramMap.get('addrCityField') != '' && paramMap.get('city') != '')  sObj.put(paramMap.get('addrCityField'), paramMap.get('city'));
      if (paramMap.get('addrStateField') != '' && paramMap.get('state') != '')  sObj.put(paramMap.get('addrStateField'), paramMap.get('state'));
      if (paramMap.get('addrPostalField') != '' && paramMap.get('postal') != '')  sObj.put(paramMap.get('addrPostalField'), paramMap.get('postal'));

      System.debug(JSON.serialize(sobj));

      update sObj;
    }
    catch (exception e)
    {
      resp.status = PSResponse.ERROR;
      resp.msg = e.getMessage();
    }
      
    return  JSON.serialize(resp);
  }

  @AuraEnabled
  public static String getCurrLocation(String params)
  {
    System.debug('getCurrLocation invoked...');
    Map<String, String> paramMap = (Map<String, String>)JSON.deserialize(params,   Map<String, String>.class);

    PSResponse resp = new PSResponse();

    try
    {
      Id recId = Id.valueOf(paramMap.get('recordId'));
      Schema.SObjectType objType = recId.getSObjectType();
      Schema.DescribeSObjectResult dr = objType.getDescribe();

      String querystr = 'SELECT ' + paramMap.get('mapLatField') + ', ' + paramMap.get('mapLngField') + ' FROM ' + dr.getName() + ' WHERE Id=\'' +  paramMap.get('recordId') + '\'';

      SObject obj = Database.query(queryStr);

      if (obj.get(paramMap.get('mapLatField')) != null && obj.get(paramMap.get('mapLngField')) != null)
      {
        Map<String, Object> dataMap = new Map<String, Object>();
        dataMap.put('latitude', obj.get(paramMap.get('mapLatField')));
        dataMap.put('longitude', obj.get(paramMap.get('mapLngField')));

        resp.data = dataMap;
      }
      else
      {
        resp.status = PSResponse.ERROR;
        resp.msg = 'Record does not have lat/lng coordinates';
      }

    }
    catch (exception e)
    {
      resp.status = PSResponse.ERROR;
      resp.msg = e.getMessage();
    }


    return  JSON.serialize(resp);
  }
}