/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record'],  function(record)  {

	 /**
     * Version 2.1
     * Date    15 SEP 2022
     * Author  Suryaprakash Ragavan
     *
     * Script Description : On save of the purchase order show an alert message Vendor is not valid" when
     * 						"Is Valid Vendor" checkbox is selected and do not allow user to save the purchase order
     **/

    function saveRecord(scriptContext) {
try{
		const objRecord = scriptContext.currentRecord;
		const vendorName = objRecord.getValue({fieldId : 'entity'});

		const vendor = record.load({
   					type: record.Type.VENDOR,
    				id: vendorName,
    				isDynamic: true,});

		const isValid = vendor.getValue({fieldId : 'custentity36'});
   			if(isValid == true){alert('Is Valid Vendor'); return true;}
   			else{alert('Vendor is not valid');
				return false;
       			}

      }
catch(ex){
log.debug({title : "Exception", details : ex});
}
}

    return {
        saveRecord: saveRecord
    };

});