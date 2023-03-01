/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/task','N/record','N/log','N/format','N/search','N/runtime'],

function(task,record,format,search,runtime) {
	var RECTYPE_WORKORDER = 'workorder';
	var RECTYPE_OPTIONS = 'customrecord_pd_offer_option';
	var RECTYPE_INCENTIVES = 'customrecord_offer_incentive';
	var RECTYPE_CAMPAIGN = 'customrecord_aarp_campaign';
	var RECTYPE_OFFERPREMIUM = 'customrecord_offer_incentive';
	var RECTYPE_OFFEROPTIONRATEPLAN = 'customrecord_offer_option_rateplan';
	

    function execute(scriptContext) {
    	var searchResults = search.load({
    	    type: search.Type.TRANSACTION,
    	    id: 'customsearch_offers_create_transmit_queu'});
    	if(searchResults){
    		log.debug({title:'START - Main search length:',details:searchResults.length});
    	}
    	else
    		return;
    	for (var mainIdx = 0; mainIdx < searchResults.length; mainIdx++) {
    			var offerId = searchResults[mainIdx].id;
    			reScheduleScript();
    	        processOffer(searchResults[mainIdx]);	
    		}
    	log.debug({title:"END"});
   
    }
    function processOffer(searchResult){
    	try
    	{
    		// Get the record type and record id and user
    		var stRecType = 'workorder';
    		var stRecId = searchResult.id;
    		var stType = 'edit';
    		var recordOwner = searchResult.getValue('custbody_of_owner');
    		var revisionVersion = searchResult.getValue('custbody_revision_version_record');
    		log.debug({title:'Record: ',details: stRecType + ' | RecordID = ' + stRecId 
    			 +'stType = ' + stType + ' | recordOwner = ' + recordOwner});
    		
			// 10-22-13 - additional logic for Offer (Work Order) - Offer Option
			// 11-04-13 - additional logic for Offer (Work Order) - Offer Incentive
			var doNotPushCmpaign = searchResult.getValue('custbody_donotpush_associated_campaign');
			createAARPTransmitQueue(stType, stRecType, stRecId, recordOwner, doNotPushCmpaign, revisionVersion);
			
			var arrFilters = search.createFilter({
		                                      name: 'custrecord_pd_option_offer',
		                                      operator: search.Operator.anyof,
		                                      values: stRecId
		                                  });
			var arrResults = search.create({
	    	    type: RECTYPE_OPTIONS,
	    	    id: 'customsearch_active_offer_option',
	    	    filter:arrFilters});   
			if (arrResults != null){
				log.debug({title:'OPTIONS length:',details:arrResults.length});
				for (var i = 0; i < arrResults.length; i++)	        	{
	        		// Create a new AARP Transmit Queue custom record
	        		var stOfferOption = arrResults[i].id;
	        		//nlapiLogExecution('DEBUG', 'Offer Option = ' + stOfferOption);
	    			createAARPTransmitQueue(stType, RECTYPE_OPTIONS, stOfferOption, recordOwner, '', '' );
	        	}
				log.debug({title:"Process Options done"});
				
			}
			
			var arrFilters = search.createFilter({
                name: 'custrecord_offer',
                operator: search.Operator.anyof,
                values: stRecId
            });
			var arrResults = search.create({
					type: RECTYPE_INCENTIVES,
					id: 'customsearch_active_offer_incentive',
					filter:arrFilters});   
			if (arrResults != null){
				log.debug({title:'INCENTIVES length:',details:arrResults.length});
				for (var i = 0; i < arrResults.length; i++)	        	{
					// Create a new AARP Transmit Queue custom record
					var stOfferOption = arrResults[i].id;
					log.debug({title:'Offer Incentive = ',details:stOfferIncentive});
					createAARPTransmitQueue(stType, RECTYPE_INCENTIVES, stOfferIncentive, recordOwner, '', '' );
				}
				log.debug({title:"Process Incentives done"});

			}	
			//09/09/16 LOGIC TO SEND OFFER OPTION RATEPLAN TO KONNEX ON OFFER EDIT
			if (stType == 'edit' ){
				 var arrFilters = new Array();
				 var arrFilters = search.createFilter({
		                name: 'custrecord_oorp_offer',
		                operator: search.Operator.anyof,
		                values: stRecId
		            });
				 //custrecord_oorp_pushed_to_konnex_date
				var arrResults = search.create({
						type: RECTYPE_OFFEROPTIONRATEPLAN,
						id: 'customsearch_oorp_to_transmit',
						filter:arrFilters});
				if (arrResults != null)
				{
					log.debug({title:'OORP length:',details:arrResults.length});
					for (var i = 0; i < arrResults.length; i++)
					{
						// Create a new AARP Transmit Queue custom record
						var stOORPid= arrResults[i].id;
						createAARPTransmitQueue(stType, RECTYPE_OFFEROPTIONRATEPLAN, stOORPid, recordOwner, '', '' );
					}					
					log.debug({title:'Process Options Rateplan done'});					
				}
			}
			//ADDITIONAL LOGIC TO SEND ASSOCIATED CAMPAIGN TO KONNEX ON OFFER EDIT
			//12/18/2015 Added logic to not push associated Campaigns if the Do Not Push Campaign box is checked.
			if (stType == 'edit' && (doNotPushCmpaign!='T' && doNotPushCmpaign !='t' )){
				var arrFilters = new Array();
				if (stType == 'edit' ){
					 var arrFilters = new Array();
					 var arrFilters = search.createFilter({
			                name: 'custrecord_campaign_associated_offer',
			                operator: search.Operator.anyof,
			                values: stRecId
			            });
					 //custrecord_oorp_pushed_to_konnex_date
					var arrResults = search.create({
							type: RECTYPE_CAMPAIGN,
							filter:arrFilters});
			   if (arrResults != null)
			   {
				   log.debug({title:'CAMPAIGNS length:',details:arrResults.length});
				   for (var i = 0; i < arrResults.length; i++)
				   {
					   // Create a new AARP Transmit Queue custom record
					   var stOfferCampaign = arrResults[i].id;
					   createAARPTransmitQueue(stType, RECTYPE_CAMPAIGN, stOfferCampaign, recordOwner, '', '' );
				   }
				   log.debug({title:'Process Campaigns done'});					
			   }
		    }		
		
		return true;
			}			
    	}
    	catch(error){
        	if (error.getDetails != undefined)
            {
        		log.error({title:'Process Error',details:error.getCode() + ': ' + error.getDetails()});
                throw error;
            }
            else
            {
            	log.error({title:'Unexpected Error',details:error.toString()});
            	throw error.create({name:'99999',
            						message:error.toString()});
            }
    	}
    }
    
    /**
     * Function to create AARP Transmit Queue and update the source record
     * @param stType
     * @param stRecType
     * @param stRecId
     * @param recordOwner
     */
    function createAARPTransmitQueue(stType, stRecType, stRecId, recordOwner, doNotPushCmpaign, revisionVersion){
    	var stTempRecType = stRecType;
    	// Create a new AARP Transmit Queue custom record
    	// Get server date		
    	var stCurrentTimeStamp = getCurrentTimestamp();
    	//nlapiLogExecution('DEBUG',  'Current Timestamp = ' + stCurrentTimeStamp);
    	var recordLinkPrefix='';
    	var record ='';
    	if (stRecType == RECTYPE_WORKORDER)
    	{
    	    stTempRecType = 'workOrder';
    		recordLinkPrefix = '/app/accounting/transactions/workord.nl?id=';
    		record = 'Offer';
    	}

    	if (stRecType == RECTYPE_OPTIONS)
        {
             stTempRecType = 'Custom-85';  
    		 recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=85&id=';
    		 record = 'OfferOptions';
        }
        
    	if (stRecType == RECTYPE_CAMPAIGN)
        {
            stTempRecType = 'Custom-80';  
    		recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=80&id=';
    		record = 'Campaign';
        }

    	if (stRecType == RECTYPE_OFFERPREMIUM)
        {
            stTempRecType = 'Custom-98';  
    		recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=98&id=';
    		record = 'OfferIncentive';
         }	
        if (stRecType == RECTYPE_OFFEROPTIONRATEPLAN)
        {
            //stTempRecType = 'Custom-167'; //QA 
    		//stTempRecType = 'Custom-163';  //UAT
            //stTempRecType = 'Custom-169';//DEV
            stTempRecType = 'Custom-164';//PROD
    		//recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=167&id=';//QA
            //recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=169&id=';//DEV
    		//recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=163&id=';//UAT
            recordLinkPrefix = '/app/common/custom/custrecordentry.nl?rectype=164&id=';//PROD 
    		record = 'offeroptionrateplan';
        }
        var recAARPTransmitQueue = record.create({
            type: 'customrecord_aarp_transmit_queue',
            isDynamic: true,
        });
        recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_record_type',value:stTempRecType});
        recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_internalid_of_rectype',value:stRecId});
        recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_email',value:stCurrentTimeStamp});
        try{
        	var isOwnerActive = search.lookupFields({
            type: search.Type.EMPLOYEE,
            id: recordOwner,
            columns: ['isinactive']
        });
        	if(isOwnerActive.isinactive!='T' && isOwnerActive.isinactive!='t')
    			recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_owner', 
    				value:recordOwner});
        }
        catch(err){
        	log.error({title:'Inactive Owner'});
        }
        recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_record_link', value:recordLinkPrefix + stRecId});	
    	recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_record', value:record});
    	
    	if (stType == 'create')
    	{	
    		recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_action',value: 'A'});
    	}
    	else if (stType == 'edit')
    	{
    		recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_action', value:'E'});
    	}

    	if (stType == 'xedit')
    	{
    		recAARPTransmitQueue.setValue({fieldId:'custrecord_aarp_tq_action',value: 'E'});
    	}
    	var stAARPTransmitQueue = recAARPTransmitQueue.save({enableSourcing: true,
    														 ignoreMandatoryFields: true});      
    	log.debug({title:'created Transmit Queue record; ' + stRecType+':'+stRecId + 'TransmitQueue Id:' + stAARPTransmitQueue});
    	
    	
    	if (stRecType == RECTYPE_WORKORDER){
    		
    		record.submitFields({
    		    type: stRecType,
    		    id: stRecId,
    		    values: {
    		        'custbody_aarp_push_to_integration': 'F',
    		        'custbody_donotpush_associated_campaign':'F',
    		        'custbody_run_tr_sche_script':'F'
    		    }
    		});
    		if((doNotPushCmpaign == 't'|| doNotPushCmpaign=='T') && revisionVersion){
    			record.submitFields({
        		    type: stRecType,
        		    id: revisionVersion,
        		    values: {
        		        'custbody_donotpush_associated_campaign': 'F'
        		    }
        		});
    	}else if(stRecType == RECTYPE_OFFEROPTIONRATEPLAN)
			record.submitFields({
    		    type: stRecType,
    		    id: stRecId,
    		    values: {
    		        'custrecord_oorp_pushed_to_konnex_date': 'F'
    		    }
    		});
			record.submitFields({
    		    type: stRecType,
    		    id: stRecId,
    		    values: {
    		        'custrecord_oorp_pushed_to_konnex_date': format.parse({value:new Date(), type:format.type.STRING})
    		    }
    		});
    }
    }
    /**
     * 
     * Get current timestamp. E.g. returns 5/17/2013  5:33:00 am
     * 
     * @returns {String}
     */
    function getCurrentTimestamp() 
    {
    	var today = new Date();
    	var fullDate = format.parse({value:today,type:format.type.STRING});
    	
    	var intMins = today.getMinutes();
    	
    	var intHours = today.getHours();	
    	if (intHours > 12)
    	{
    		intHours = intHours - 12;
    	}	
       //08/20/18 Add logic not to set 00 as the hours in the time stamp field.
        if (intHours == 0)
        {
            intHours = 12;
        }
        return (fullDate + ' ' + (intHours < 10 ? "0" + intHours : intHours) + ":" + intMins + ":00" + " " + (intHours < 12 ? 'am' : 'pm'));
    }


    /**
     * Check if a string is empty
     * @param stValue (string) value to check
     * @returns {Boolean}
     */
    function isEmpty (stValue) {
        if ((stValue == '') || (stValue == null) || (stValue == undefined)) {
             return true;
        }

        return false;
   }
   function reScheduleScript(){
   	try {
   		var currentContext = runtime.getCurrentScript();
   		var remainingUnits = currentContext.getRemainingUsage();
   		if (remainingUnits < 500) {
   			
   			var status = task.create({    
   					taskType: task.TaskType.MAP_REDUCE,
   					scriptId: currentContext.getScriptId(),
   					deploymentId: currentContext.getDeploymentId()});
   			var taskSubmit = status.submit();
   			var taskStatus = task.checkStatus(taskSubmit);
   			log.debug({title:'SCRIPT RESCHEDULED',details:'status =  '+ taskStatus});
   			if (taskStatus.status == 'COMPLETE')
   				return true;
   		}
   	} catch (err) {
   		errorDetailMsg = logExecutionMsg(err, "Error scheduling script. ");
   		log.error({title:"Error scheduling script. ",details:errorDetailMsg});
   		return false;
   	}
   }
    return {
        execute: execute
    };
    
});
