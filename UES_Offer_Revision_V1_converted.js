/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/runtime'],

function(record,runtime) {
  
    function beforeLoad_offer(scriptContext) {
    	var obj = scriptContext.newRecord;
    	var type = scriptContext.type;
    	var form = scriptContext.form;
    	var revision_checkbox = obj.getValue({fieldId :'custbody_revision_check_status'});
    	log.debug({title:"beforeLoad_offer",details:"revison_checkbox = "+revison_checkbox});
    	
    	var revison_version1 = obj.getValue({fieldId :'custbody_revision_version'});
    	log.debug({title:"beforeLoad_offer",details:"revison_version1 = "+revison_version1});    	

    	
    	if(type=='create' || (revison_checkbox=='F' && revison_version1==""))
    	{
        	var revison_version = obj.getValue({fieldId :'custbody_revision_version'});
        	log.debug({title:"beforeLoad_offer",details:"revison_version1 = "+revison_version});
        	revison_version.isDisplay = false;
    	}
    	if(type=='edit' || type=='view')
    	{
    		   var versionSubList = form.getSubList({id:'recmachcustrecord_version_link'});
    		   log.debug({title:'beforeLoad_offer',details:"versionSubList ="+versionSubList});
    	        if (versionSubList != null) 
    	        {	
    	        	versionSubList .removeButton('attach');
    	        	versionSubList .removeButton('newrecrecmachcustrecord_version_link');
    	        }
    	}
    	log.debug({title:'beforeLoad_offer',details:"channel approver ="+obj.getValue({fieldId:'custbody_of_channel_approval_status'})});

    }



    function afterSubmit_offer(scriptContext) {
    	try
    	{
    			var obj = scriptContext.newRecord;
    			var executionContext = runtime.executionContext;  
    			log.debug({title:'afterSubmitRecord',details:'executionContext == '+executionContext})

    		
    			if(scriptcontext.type=='edit' && executionContext=='userinterface' && obj.getValue({fieldId :'custbody_of_channel_approval_status'})=='3')
    			{
    				var revision = obj.getValue({fieldId :'custbody_revision_version'});
    				log.debug({title:'afterSubmit_offer',details:"revision ="+revision});
    				
    				var update_reason = obj.getValue({fieldId :'custbody_of_revision_reason'});
    				//nlapiLogExecution('debug','afterSubmit_offer',"update_reason ="+update_reason);
    					
    				var update_comment = obj.getValue({fieldId :'custbody_of_updated_reason'});
    				//nlapiLogExecution('debug','afterSubmit_offer',"update_comment ="+update_comment);
    				
    				var offer_Id = obj.getValue({fieldId :'tranid'});
    				//nlapiLogExecution('debug','afterSubmit_offer',"offer_Id ="+offer_Id);
    				
    				var TempArray = revision.split(".");
    				log.debug({title:afterSubmit_offer,details:"TempArray[0] ="+TempArray[0]});
    				log.debug({title:afterSubmit_offer,details:"TempArray[1] ="+TempArray[1]});
    				
    				/* I'm sorry na nalla mari tha keta wish panalanu ne yen tension aagara seri convey my wishes to
    				 that bro seriya, Indhu unuda kovathula niyam iruku tha, sorry ma ini epdi la pesa mata promise 
    				 konjama, lite ah, romba konjama consider pani start to excuse me Indhu kastama iruku atha,, Odambuku
    				 paravala than pola, mail padichu ketila, ethachu positive reply kudutha paravala aanupu pa seriya
    				 aporo odambu nalla aairuchu nu assalt ah irukatha take care.... I MISS YOU INDHUUUUUU */ 
    				
    				var direct_edit = checkDirectFieldsOnOffer(scriptContext);
    				log.debug({title:'afterSubmit_bundle',details:"direct_edit ="+direct_edit});
    				
    				var Check_revision= Check_Revision();
    				log.debug({title:'afterSubmit_bundle',details:"Check_revision ="+Check_revision});
    				
    				
    				if(direct_edit==true && revision=="")
    				{
    					log.debug({title:'afterSubmit_offer',details:"i m in if ="})
    					record.submitFields({type:'workorder',
    					    			  id: record.id,
    					    			  values: {
    					    				  'custbody_revision_version': 0.01}});
    					
    					first_edit ="0.01";
    					createVersionHistoryRecord(update_reason,update_comment,offer_Id,first_edit); 
    				}
    				if(direct_edit==true && revision!="" && Check_revision==false)
    				{
    					 var newRevisionNum=(parseFloat(revision,10)+parseFloat(0.01,10)).toFixed(2);
    					 log.debug({title:'afterSubmit_bundle',details:"newRevisionNum="+newRevisionNum});
    	                // revision=revision+"."+revisionToParse;
    	                 //nlapiLogExecution('debug','afterSubmit_bundle',"revision="+revision);

    					 record.submitFields({type:'workorder',
    						 			   id:record.id,
    						 			   values: {'custbody_revision_version' : newRevisionNum}});
    					
    					createVersionHistoryRecord(update_reason,update_comment,offer_Id,newRevisionNum);
    					
    				}
    				if(revision=="" && Check_revision==true)
    				{
   					 	record.submitFields({type:'workorder',
   					 					  id:record.id,
   					 					  values: {'custbody_revision_version' : 1.0}});
    					
    					first_revision ="1.0";
    					createVersionHistoryRecord(update_reason,update_comment,offer_Id,first_revision);
    					
    				}
    				if(revision!="" && Check_revision==true)
    				{
    					//nlapiLogExecution('debug','afterSubmit_offer',"i m in else =");
    					
    					log.debug({title:'afterSubmit_offer',details:"TempArray[0]="+TempArray[0]})
    					revision=parseInt(TempArray[0],10)+1;
    					log.debug({title:'afterSubmit_offer',details:"revision="+revision})
    				    //nlapiSetFieldValue('custbody_revision_version',revision);
    					
    					record.submitFields({type:'workorder',
   					 					  id:record.id,
   					 					  values: {'custbody_revision_version' : revision}});
    					
    					createVersionHistoryRecord(update_reason,update_comment,offer_Id,revision); 
    					
    					
    				}
    			}
    		
    		
    	}
    	catch(e)
    	{
    		log.debug({title:'afterSubmit_offer',details:"error=="+e});
    	}
    }
    function checkDirectFieldsOnOffer(scriptContext)
    {
    	var validationRequiredFields = ["custbody_of_internal_description","custbody_of_internal_name","tranid","custbody_of_effective_date","custbody_status_description","custbody_of_in_market_status","custbody_of_owner","custbody_of_line_of_business","custbody_offer_family","custbody_offer_category","custbody_offer_type","custbody_of_offer_tag","custbody_qc_approver","custbody_options_approver","custbody_of_channel_approver","custbody_of_offer_channel","custbody_contact_center_upgrade","custbody_of_offer_web_name","custbody_of_offer_header","custbody_of_sign_up_form_header","custbody_of_sign_up_button_language","custbody_of_offer_long_description","custbody_of_key_benefits_statement","custbody_of_offer_summary","custbody_of_marketing_inventive_descri","custbody_of_logo_alt_text","custbody_of_logo_image_url","custbody_of_offer_image_url_big","custbody_of_offer_image_url_small","custbody_of_co_branding_image_url","custbody_of_co_branding_alt_text","custbody_of_image_big_alt_text","custbody_of_image_small_alt_text","custbody_of_logo_image","custbody_of_co_branding_image","custbody_of_image_big","custbody_of_image_small","custbody_contact_center_offer_desc"];
    	log.debug({title:'checkDirectFieldsOnOffer',details:"validationRequiredFields=="+validationRequiredFields.length});
    	
    	var old_record = scriptContext.oldRecord;
    	var new_record = scriptContext.newRecord;
    	
    	var flag=false;
    	
    	for ( var i =0; i < validationRequiredFields.length; i++) 
    	{
    		var old_Field_Value = old_record.getValue({id: validationRequiredFields[i]});
    		log.debug({title:'checkDirectFieldsOnOffer',details:"old_Field_Value=="+old_Field_Value});
    		
    		var new_Field_Value = new_record.getValue({id:validationRequiredFields[i]});
    		log.debug({title:'checkDirectFieldsOnOffer',details:"new_Field_Value=="+new_Field_Value});
    		
    		if((old_Field_Value!=new_Field_Value) &&(old_Field_Value !=null || new_Field_Value!="") )
    		{
    			log.debug({title:'checkDirectFieldsOnBundle',details:"field name=="+validationRequiredFields[i]});
    			flag=true;
    			return flag;
    		}
    		
    	}
    	return flag;
    }
    function Check_Revision()
    {
    	
    	var revision_check_Status = record.getValue({id:'custbody_revision_check_status'});
    	log.debug({title:'Check_Revision',details:"revision_check_Status ="+revision_check_Status});
    	
    	if(revision_check_Status=='T')
    	{
    		var record_object = record.load({type:'workorder',id:record.id});
    		log.debug({title:'afterSubmit_bundle',details:"record_object ="+record_object});
    		
    		record.setValue({fieldId: 'custbody_of_qc_approval_status',value: '6'});
    		record.setValue({fieldId: 'custbody_of_options_approval_status',value: '6'});
    		record.setValue({fieldId: 'custbody_of_channel_approval_status',value: '6'});
    		
    		record.setValue({fieldId: 'custbody_qc_check',value: 'F'});
    		record.setValue({fieldId: 'custbody_submit_for_approval',value: 'F'});
    		record.setValue({fieldId: 'custbody_channel_check',value: 'F'});
    		record.setValue({fieldId: 'custbody_option_check',value: 'F'});
    		
    		record.setValue({fieldId: 'custbody_revision_check_status',value: 'F'});
    		record.setValue({fieldId: 'custbody_push_to_konnex_status',value: 'l'});
    		
    		record.setValue({fieldId: 'custbody_aarp_push_to_konnex',value: 'F'});
    		record.setValue({fieldId: 'custbody_published',value: 'F'});
    		
    		
    		var record_Id = record_object.save;
    		log.debug({title:'afterSubmit_offer',details:"record_Id ="+record_Id});
    		
    		return true;
    	}
    	else
    		return false;
    	
    }
    
    function createVersionHistoryRecord(update_reason,update_comment,offer_Id,revision)
    {

    	log.debug({title:'afterSubmit_offer',details:"revision ="+revision});
    	
    	var custom_Offer_record = record.create({type:'customrecord_offer_version_history'});
    	log.debug({title:'afterSubmit_offer',details:"custom_Offer_record ="+custom_Offer_record});
    	
    	record.setValue({fieldId: 'custrecord_update_reason',value: update_reason});
    	record.setValue({fieldId: 'custrecord_update_comment',value: update_comment});
    	record.setValue({fieldId: 'custrecord_offer_version_number',value: revision});
    	record.setValue({fieldId: 'custrecord_version_link',value: offer_Id});
    	
    	//var date = nlapiDateToString(date_time,'datetimet'); 
       // custom_Offer_record.setFieldValue('custrecord_aarp_offer_version_date',date_time);
    	
    	var id = custom_Offer_record.save({enableSourcing: true});
    	log.debug({title:'afterSubmitRecord',details:"id ="+id});
    }

    return {
        beforeLoad: beforeLoad_offer,
        afterSubmit: afterSubmit_offer
    };
    
});
