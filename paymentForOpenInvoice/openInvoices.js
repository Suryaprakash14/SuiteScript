/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/runtime','N/search','N/url','N/https','N/redirect','N/task','N/util'], (serverWidget,runtime,search,url,https,redirect,task,util) => {
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            let form = serverWidget.createForm({
                title: 'Open Invoice'
            });
            form.addSubmitButton({
                label: 'Make Payment'
            });
          form.addButton({
            id:'filterButton',
            label : "FILTER",
            functionName : "filter()"
          })

          var subsidiary_p = context.request.parameters.subsidiary;
          var entity_p = context.request.parameters.customers;
          var fromDate_p = context.request.parameters.fromDate;
          fromDate_p = convert(fromDate_p);
          var toDate_p = context.request.parameters.toDate;
          toDate_p = convert(toDate_p);



          form.clientScriptFileId = 22277;

 var fieldgroup = form.addFieldGroup({
    id : 'fieldgroupid',
    label : 'Filter'
});
var subsidiary = form.addField({
    id : 'custpage_textfield',
    type : serverWidget.FieldType.SELECT,
    label : 'Subsidiary',
  source:'subsidiary',
    container : 'fieldgroupid'
});
          subsidiary.defaultValue = subsidiary_p;

var customers = form.addField({
    id : 'custpage_textfield1',
    type : serverWidget.FieldType.MULTISELECT,
    label : 'Customer',
  source:'customer',
    container : 'fieldgroupid'
});
         // customers.defaultValue = entity_p;

    var fromDate = form.addField({
    id : 'custpage_textfield2',
    type : serverWidget.FieldType.DATE,
    label : 'From Date',
    container : 'fieldgroupid'
});

var toDate = form.addField({
    id : 'custpage_textfield3',
    type : serverWidget.FieldType.DATE,
    label : 'To Date',
    container : 'fieldgroupid'
});

var searchFilters = [];
          searchFilters.push(search.createFilter({
            name: 'status',operator: 'ANYOF',values: 'CustInvc:A'}));
          searchFilters.push(search.createFilter({
            name: 'mainline',operator: 'IS',values: 'T'}));
          searchFilters.push(search.createFilter({
            name: 'tranid',operator: 'ISNOTEMPTY'}));

         if(subsidiary_p ){
          searchFilters.push(search.createFilter({
            name: 'subsidiary',operator: 'IS',values: subsidiary_p}));
          }
	/*	  if(entity_p){
                      searchFilters.push(search.createFilter({
            name: 'entity',operator: 'ANYOF',values: entity_p}));
          }*/
          if(fromDate_p!= 'aN/aN/NaN'){
                      searchFilters.push(search.createFilter({
            name: 'trandate',operator: "onorafter",values: fromDate_p}));
            fromDate.defaultValue = new Date(fromDate_p);
          }
         if(toDate_p!= 'aN/aN/NaN'){
                      searchFilters.push(search.createFilter({
            name: 'trandate',operator: 'ONORBEFORE',values: toDate_p}));
           toDate_p.defaultValue = new Date(toDate_p)
          }


var myInvoiceSearch = search.create({
          type: search.Type.INVOICE,
       columns:['tranid','postingperiod','subsidiary','entity','currency','total','trandate','internalid'],
       filters: searchFilters });
          var result = myInvoiceSearch.run();
       var range = result.getRange({start:0,end:1000});
         // log.debug({title :'SearchResult ',details:JSON.stringify(range)});
       

            let sublist = form.addSublist({
                id: 'sublist',
                type: serverWidget.SublistType.LIST,
                label: 'Invoice',
              source:'custpage_openInvoice'
            });

            var chkBox = sublist.addField({
                id: 'sublist0',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'CHECKBOX'
            });
            var docNumber = sublist.addField({
                id: 'sublist1',
                type: serverWidget.FieldType.TEXT,
                label: 'Invoice Number'
            });
            var internalId = sublist.addField({
                id: 'sublist2',
                type: serverWidget.FieldType.TEXT,
                label: 'Internal ID'
            });
           var cusId = sublist.addField({
                id: 'sublist22',
                type: serverWidget.FieldType.TEXT,
                label: 'CustomerId'
            });
            var name = sublist.addField({
                id: 'sublist3',
                type: serverWidget.FieldType.TEXT,
                label: 'Customer'
            });
             var subsidiary = sublist.addField({
                id: 'sublist5',
                type: serverWidget.FieldType.TEXT,
                label: 'Subsidiary'
            });
              var amount = sublist.addField({
                id: 'sublist4',
                type: serverWidget.FieldType.TEXT,
                label: 'Amount'
            });

          for (var i=0;i<range.length && range[i].getValue({name:'internalid'}) != ' '; i++){
            sublist.setSublistValue({
               id:'sublist1',
               line:i,
               value:range[i].getValue({name:'tranid'})});
            sublist.setSublistValue({
               id:'sublist2',
               line:i,
               value:range[i].getValue({name:'internalid'})});
             sublist.setSublistValue({
               id:'sublist3',
               line:i,
               value:range[i].getText({name:'entity'})});
             sublist.setSublistValue({
               id:'sublist4',
               line:i,
               value:range[i].getValue({name:'total'})});
             sublist.setSublistValue({
               id:'sublist22',
               line:i,
               value:range[i].getValue({name:'entity'})});
             sublist.setSublistValue({
               id:'sublist5',
               line:i,
               value:range[i].getText({name:'subsidiary'})});
}
            context.response.writePage(form);
        }

      else if (context.request.method === 'POST'){

       var recObj = context.request;
        var lineCount = recObj.getLineCount({ group: "sublist" });

        var js = {};
        for(var i=0;i<lineCount;i++){
          var chechBox = recObj.getSublistValue({
group: "sublist",
name: "sublist0",
line: i
});
          if(chechBox == "T"){
           // invArr.push(
           var cus =  recObj.getSublistValue({
group: "sublist",
name: "sublist22",
line: i
});
          var inv =  recObj.getSublistValue({
group: "sublist",
name: "sublist1",
line: i
});
            js[cus] = inv;

          }

        }
        var jsObj = JSON.stringify(js);

        log.debug("js",js);
         var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE,
                                     scriptId:'customscript1853',
                                 deploymentId:'customdeploy1',
                                       params:{'custscript12':jsObj}});

        var re = mrTask.submit();
      //log.debug('re',re);
      }

function convert(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  return [ mnth, day,date.getFullYear()].join("/");
}
    }
    return {onRequest}
});