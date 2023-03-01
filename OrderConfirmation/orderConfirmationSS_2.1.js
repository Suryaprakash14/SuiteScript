/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
define(["N/task","N/currentRecord","N/http",'N/runtime'], function(task,currentRecord,http,runtime)  {
  function onRequest(context) {
        if (context.request.method === 'GET'){
          const sub = context.request.parameters.total;
		  log.debug('params',sub);
          executeScheduled(sub);
    }
  }

  function executeScheduled(total) {
	  const mapReducedScript = task.create({
        taskType: task.TaskType.MAP_REDUCE
    });
	  mapReducedScript.scriptId = 'customscript1678';
    mapReducedScript.deploymentId = 'customdeploy1';
    mapReducedScript.params = {
        'custscript_total_param' : total
    };

    const scriptTaskId = mapReducedScript.submit();
    log.debug("scriptTaskId", scriptTaskId);
  }

  return {
    onRequest: onRequest,
  };
});