//import head
//var co = require('co');
//var thunkify = require('thunkify');
//var mQDymaticTrafficShaping = require('../src/messageQueueDymaticTrafficShaping.js');
//var TrafficShapingObj=new mQDymaticTrafficShaping();
var commandParser = require('../src/messageQueueCommandParser.js');
var messageCommon=require('../src/messageQueueCommon.js');
var uuid= require('node-uuid');

//Major call back function which will be used during message processing
var requestBodyProcessor=function(reqObj){

	    //console.log('queue sleeping'); require('deasync').sleep(20000); //for test sleep
		  
		//1. set up analysis start time point of current queue item
		 var t1=process.uptime()*1000;
		
		//2.As per message detail action , to do db,filedisk,memory cache or third party　API under commandParser
		//reqObj[3].MessageInsert(JSON.parse(reqObj[0]),reqObj[2]);  
	     commandParser.queueCommandPaser(reqObj[0],function(cmdResult){

			//3.Analysis speed rate to current queue
				var t2=process.uptime()*1000;
				var compareSpeedRate=messageCommon.GetByteAsObj(reqObj[0])/(t2-t1);//
				var indexQueue=reqObj[3].get(reqObj[2]);
				if(typeof(indexQueue)!="undefined")
				{
					indexQueue.setMaxSpeedRate(compareSpeedRate); //判断是否为单项最大速率，并按结果设置
					indexQueue.setMinSpeedRate(compareSpeedRate);//判断是否为单项最小速率，并按结果设置
				}
			//4.get response	
				
				reqObj[3].MessageStateUpdate(JSON.parse(reqObj[0]),reqObj[2]);//更新Node DB既存message再次执行后的状态。

				indexQueue.setIntoQueueCmdResponseSet(cmdResult); //push current cmd execution result to queue CmdResponseSet
				if(typeof cmdResult==='object')
				{
						if(cmdResult.push!=undefined){  //回参是json列表
							cmdResult.push({RequestResponseId:uuid.v4()+'-'+messageCommon.GetUUIDTimeSpan(Date.now())}); //打上请求响应唯一标识号
						}
						else //回参是json map
						{  
							if(cmdResult["redirectUrl"]!==undefined){
								reqObj[1].redirect(cmdResult["redirectUrl"]);
							}
						   cmdResult["RequestResponseId"]=uuid.v4()+'-'+messageCommon.GetUUIDTimeSpan(Date.now());
						   
						}
						reqObj[1].end(JSON.stringify(cmdResult)); 
				}
				else
				{
				   let cmdResultBuild=[];
				   cmdResultBuild.push({RequestResponseId:uuid.v4()+'-'+messageCommon.GetUUIDTimeSpan(Date.now()),Result:cmdResult}); //打上请求响应唯一标识号
				   reqObj[1].end(JSON.stringify(cmdResultBuild)); 
				}
				  	
				
		 });
}



exports.requestBodyProcessor=requestBodyProcessor;
//exports.requestBodyQueueIndexGuid=requestBodyQueueIndexGuid;