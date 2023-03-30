/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/runtime','N/search','N/record','N/email','N/https'],

(runtime,search,record,email,https) => {


    function getInputData(context) {
      try{
      var scriptObj = runtime.getCurrentScript().getParameter({name: 'custscript12'});
      return JSON.parse(scriptObj);
      }
      catch(ex){
        log.debug({title:"getInputData Error",details:ex});
      }

    }


    function map(context) {
      try{
      var val = context.value;
      var keyname = context.key;
      log.debug("map "+context.value);
      context.write({key:1,
                   value:val});
      }
      catch(e){
        log.debug({title:"map Error",details:e});
      }

    }


    function reduce(context) {
      try{
        var type = typeof(context.values);

        email.send({
            author: 21251,
        recipients: 21251,
           subject: 'Invoice Mail',
              body:"<style>table, th, td { border:1px solid black;}</style><table> <tr> <td>"+context.values[0]+"</td></tr><tr><td>"+context.values[1]+"</td></tr></table>"
      });
      }
      catch(er){
        log.debug({title:"map Error",details:er});
      }
    }

    function summarize(summary) {
      log.debug("summary",summary);
      log.debug("Script","The script ends here!")
    }


    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});
