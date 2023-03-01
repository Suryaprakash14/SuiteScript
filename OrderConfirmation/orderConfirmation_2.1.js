/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/task',"N/ui/serverWidget",'N/log','N/record'],

function(task,serverWidget,log,record)  {

    function beforeLoad(scriptContext) {
      const val = scriptContext.type;

      const total = scriptContext.newRecord.getValue({fieldId:'total'});
      const date = scriptContext.newRecord.getValue({fieldId:'trandate'});
      log.debug('Date',String(date));
      log.debug('Total',total);
	  const detail = {'id1': String(date), 'id2': total};

      if(val == 'view'){
        scriptContext.form.clientScriptFileId = 21006;
        scriptContext.form.addButton({
        		id:'custpage_confirm',
        		label:'Order Confirmation',
        		functionName:"showPassedValueFunc('"+total+","+date+"')",
      			});
      }
    }

    return {
        beforeLoad: beforeLoad
    };

});
