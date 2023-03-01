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
     * Script Description : On selection of item show an alert message Item is not valid" when user selects 
     * 						the it where "Is Valid Item"
     * 						checkbox is selected and unselect the item from the dropdown
     **/

    function fieldChanged(scriptContext) {
try{
		const objRecord = scriptContext.currentRecord;
		const sublistId = scriptContext.sublistId;
		const num = scriptContext.lineNum;
		const fieldId = scriptContext.fieldId;
 		if(sublistId == 'item' && fieldId == 'item'){
 			const objField = objRecord.getCurrentSublistValue({
    							sublistId : 'item',
    							fieldId : 'item'
  								//line : num
								});
			log.debug(objField);
			const item = record.load({
   					type: 'inventoryitem',
    				id: objField,
    				isDynamic: true});

			const isValid = item.getValue({fieldId : 'custitem24'});
   			if(isValid == true){alert('Is Valid Item');}
   			else{alert('Item is not valid');
				objRecord.removeCurrentSublistSubrecord({
    				sublistId: 'item',
    				fieldId: 'item'
					});
       			}
    	}
    }
catch(ex){
log.debug({title : "Exception", details : ex});
}
}

    return {
        fieldChanged: fieldChanged
    };

});
