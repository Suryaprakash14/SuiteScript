/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
/**
 * Module Description 
 * Script will restrict users from deleting a record after pushing to transmit queue.
 * User Event script deployed to the following Records. 
    Offer
    Campaign
    Offer Option
    Offer Incentive
    Offer Option Rateplan
    Rateplan
    Assembly Item
    Product - Inv & Non-inv
 * Version Date Author Remarks 1.00 11/29/16
 * ialan
 * 
 */
/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, delete, xedit approve, reject,
 *            cancel (SO, ER, Time Bill, PO & RMA only) pack, ship (IF)
 *            markcomplete (Call, Task) reassign (Case) editforecast (Opp,
 *            Estimate)
 * @returns {Void}
 */

define(['N/search','N/error'],

function(search,error) {
   
    function beforeSubmitPreventDelete(scriptContext) {
        if (scriptContext.type == 'delete') {
        var newRec = scriptContext.newRecord;
        var recordType = newRec.type;
        var recordId = newRec.id;
        log.debug({title:'recordType'+recordType + 'recordId:'+recordId});
        if(getTransmitQueueRecords(recordId, recordType))
        	var cutError = error.create({
        		name:'DELETE_ERR',
        		message:'You are not allowed to delete this record.'
        		});
        }
    }
function getTransmitQueueRecords(recInternalId, recType){
	var tqRecordType = getTQrecordType(recType);
	log.debug({title:'recType:'+recType +'tqRecordType:'+tqRecordType});
	var filters = [];
	filters.push(search.createFilter({name:'custrecord_aarp_tq_internalid_of_rectype',operator:search.Operator.EQUALTO,values:recInternalId}));
	filters.push(search.createFilter({name:'custrecord_aarp_tq_record',operator:search.Operator.IS,values:tqRecordType}));
	var columns = [];
	var tqRecords = search.create({type:'customrecord_aarp_transmit_queue',
								   columns:columns,
								   filters:filters});
	log.debug({title:'tqRecords',details:tqRecords});
	return tqRecords;	
}
function  getTQrecordType(recType){
    var tqRecordType='';
    if (recType=="customrecord_exit_mapping")   tqRecordType="exitmapping";
    if (recType=="customrecord_aarp_rate_plan")   tqRecordType="rateplan";
    if (recType=="customrecord_offer_option_rateplan")   tqRecordType="offeroptionrateplan";
    if (recType=="customrecord_aarp_campaign")   tqRecordType="Campaign";
    if (recType=="customrecord_pd_offer_option")   tqRecordType="OfferOptions";
    if (recType=="customrecord_offer_incentive")   tqRecordType="OfferIncentive";
    if (recType=="noninventoryitem")   tqRecordType="Product";
    if (recType=="inventoryitem")   tqRecordType="Product";
    if (recType=="workorder")   tqRecordType="Offer";
    if (recType=="assemblyitem")   tqRecordType="Bundle";
    return tqRecordType;
}
    
    return {
        beforeSubmit: beforeSubmitPreventDelete
    };
    
});
