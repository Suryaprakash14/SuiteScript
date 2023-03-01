/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record'],

function(record)  {

	 /**
     * Version 2.1
     * Date    15 SEP 2022
     * Author  Suryaprakash Ragavan
     *
     * Script Description : On selection of customer show an alert message "Customer is not valid" when user selects the
     * 						customer where "Is Valid Customer" checkbox is selected and unselect the customer from the
     * 						dropdown.
     **/
function pageInit(scriptContext){
  alert('Hey there');
}

    function fieldChanged(scriptContext) {
try{
		const objRecord = scriptContext.currentRecord;
		const fieldId = scriptContext.fieldId;
 		if(fieldId == 'entity'){
			const cusName = objRecord.getValue({fieldId : 'entity'});

   			const cus = record.load({
   					type: record.Type.CUSTOMER,
    				id: cusName,
    				isDynamic: true,});

 			const isValid = cus.getValue({fieldId : 'custentityisvalidcus'});
   			if(isValid == true){alert('Is Valid Customer');}
   			else{alert('Customer is not valid');
        		objRecord.setValue({
          			fieldId : 'entity',
    				value : '',
          			ignoreFieldChange: true	});
       			}
    	}
      }
catch(ex){
log.debug({title : "Exception", details : ex});
}
}

    return {
     pageInit: pageInit,
     fieldChanged: fieldChanged
    };

});