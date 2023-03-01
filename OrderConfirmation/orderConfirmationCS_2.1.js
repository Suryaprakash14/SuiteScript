/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/url", "N/https"], function(url, https) {
  function pageInit(context) {alert("I'm here");}
 
  function showPassedValueFunc(orderDetails) {
      const output = url.resolveScript({
          scriptId: "customscript1679",
          deploymentId: "customdeploy1",
          params:{'details':orderDetails}
        	});
      log.debug('url', output);
      const response = https.get({
        url: output
      	});
      log.debug('response', response);
}
  return {
    pageInit: pageInit,
    showPassedValueFunc: showPassedValueFunc
  };
});