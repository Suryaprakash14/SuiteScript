/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url','N/currentRecord'],

function(url,currentRecord) {


    function pageInit(scriptContext) {
    	alert("Please, select the Invoice for Payment");
    }

  function filter (){
    try{
         var currentRec = currentRecord.get();

   var subsidiary = currentRec.getValue({fieldId: 'custpage_textfield'});
    var customers  = currentRec.getValue({fieldId: 'custpage_textfield1'});
    alert("customers",customers);
    var fromDate= currentRec.getValue({fieldId: 'custpage_textfield2'});
    var toDate = currentRec.getValue({fieldId: 'custpage_textfield3'});


    var resolveUrl=   url.resolveScript({
    			scriptId:'customscript1857',
    			deploymentId:'customdeploy1',
    			params:{"subsidiary":subsidiary,
                        "customers":customers,
                        "fromDate":fromDate,
                        "toDate":toDate
                       }
    		});
    window.open(resolveUrl,"_self");
    }
    catch(e){
      log.debug({title:"Error Statement",details:e});
      alert(e);
    }

  }

  function saveRecord (){
    try{
          var currentRec = currentRecord.get();
    var lineCount = currentRec.getLineCount({ sublistId: "sublist" });
    var flag = 'F';

    for( var i=0; i<lineCount; i++){
      var checkBox =   currentRec.getSublistValue({sublistId: "sublist",fieldId:"sublist0",line: i});

      if(checkBox == true) {flag = 'T'; break; }
    }

    if(flag == 'F'){
      alert("Please select a Invoice ");
      return false;
    }

    return true;
    }
    catch(ex){
      log.debug({title:"Error Statement",details:ex});
      alert(ex);
    }
  }


    return {
        pageInit: pageInit,
       saveRecord : saveRecord,
      filter:filter
    };

});