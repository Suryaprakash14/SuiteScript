/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(["N/url", "N/https"], function(url, https) {
  function pageInit(context) {alert("I'm here");}

  function navigateBack() {
      const output = url.resolveScript({
          scriptId: "customscript1653",
          deploymentId: "customdeploy1"
          //params:{'details':orderDetails}
        	});
      log.debug('url', output);
      const response = https.get({
        url: output
      	});
      log.debug('response', response);
}
  return {
    pageInit: pageInit,
    navigateBack: navigateBack
  };
});