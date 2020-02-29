require('date-utils');
var Queue = require('../');
//var q = Queue.Q; //内置的Promise，仿Q的API
//var QueueDbHelper= require('../src/messageQueueDBHelper.js');
var messagePromise= require('../webApi/messageQueuePromise.js');
var messageProcess= require('../webApi/messageQueueCallBack.js');
var messageCommon=require('../src/messageQueueCommon.js');
//var mQIndex=require('../src/messageQueueIndex.js');
var conf = require("./config");
var QueueDbHelper= require('../src/messageQueueDBHelper.js');
var QueueDb= new QueueDbHelper();


var TrafficShaping=(function(){
	
//Export attribute for this module,private static vars for each obj of the class
var trafficSizeCount=0;
var eachQueuetrafficSize=1024*conf.platformArch.ArchTrafficShapingKb; //流量整形中，判断多少流量组成一个队列索引 (队列统计时以Byte为单位)
var eachQueueIndexItemNumber=conf.platformArch.EachQueueCapacity;  //流量整形之后，同时判断多少个元素组成一个队列索引避免流量不足造成的阻塞                              
var eachQueueIndexItemApproveErrorTimes=conf.platformArch.QueueItemApproveErrorTimes;//当前队列索引下，单项处理的容错重试次数
var eachQueueIndexParalleProcessingNum=conf.platformArch.QueueParalleProcessingNum;//当前队列索引下的并行处理项数
var maxQueueIndexNumOnCurrentNode=conf.platformArch.MaxQueueIndexNumOnCurrentNode;//当前节点最大队列索引数
var eachQueueItemTimeOut=conf.platformArch.QueueItemTimeOut*1000; //毫秒
var eachQueueDefaultExecuteSec=conf.platformArch.QueueDefaultExecuteSec;//强制执行秒数-秒
//new Queue([并行数],<options>) 并行数必须
var queue = null;//latest全新请求时创建的“非”索引队列
var queueIndexDicObj=null;
var lastEntryDateTime=null;


return function() {
		
//--For queue work items--//
		//Define & Init Queue
		function workAdd(){
			
			console.log("向队列添加项...","队列启动状态:",(this.isStart()? "yes":"no"),"|当前队列工作项数:",this.getLength(),"|当前队列预处理整形流量数:",trafficSizeCount,' Byte'); 
			this.setState(conf.platformArch.DymaticTrafficShapingStatus.actived);//定义队列状态 
			
			//流量整形判断启动
			if(!this.isStart() && trafficSizeCount>=eachQueuetrafficSize){
				console.log(">> 触发自动运行条件-流量整形")
				//this.setCurrentTotalDataSize(trafficSizeCount);
				this.start();
				//ClearTrafficSizeCount();//流量计数器清零
			}
			//项数判断启动，以避免流量不足所造成的队列阻塞
			if(!this.isStart() && this.getLength() >= eachQueueIndexItemNumber){ //当添加了10个项后,运行队列
				console.log(">> 触发自动运行条件-队列项数")
				//this.setCurrentTotalDataSize(trafficSizeCount);
				this.start();
				//ClearTrafficSizeCount();//流量计数器清零
			}
			
		}

		function workResolve(data,obj){
			this.setState(conf.platformArch.DymaticTrafficShapingStatus.running);//定义队列状态 
			console.log('当前队列中第' + (this.getTotalCountWhenStart()-(this.getRunCount()+this.getLength())+1).toString() + '个工作项完成 - 运行中工作项数：' + this.getRunCount() + ' - 剩余：' + this.getLength())
		}
		function workReject(err,obj){
			this.setState(conf.platformArch.DymaticTrafficShapingStatus.failed);//定义队列状态 
			console.log('一个工作项执行队列状态拒绝' + err)
		}
		function workFinally(){
			this.setState(conf.platformArch.DymaticTrafficShapingStatus.success);//定义队列状态
			console.log('一个工作项执行完成')
		}

//--For queue--//
		function queueStart(){

			this.setStartTime();
			this.setLastStartTimeSpan();
			this.setState(conf.platformArch.DymaticTrafficShapingStatus.starting);//定义队列状态
			this.setCurrentTotalDataSize(trafficSizeCount);
			this.setTotalCountWhenStart(this.getLength());//记录当前队列开始时的总工作项数.
			console.log('>>>>>> 执行队列开始','>>>>>>>>>>>>>>>>>>>>>>>>当前队列将处理整形流量数:',this.getCurrentTotalDataSize(),'Byte',' >>>>>>>>>>>>>>>>>>>>>>>>')
			// //判断当前节点的队列索引数是否超出约定额度
			// if((queueIndexDicObj.GetCurrentQueueIndexDicLength()+1)>maxQueueIndexNumOnCurrentNode)
			// {
			// 	console.log('当前节点的队列索引数将超出约定额度!请及时扩容以提升当前Unit性能');	 
			// }

			// //判断当前队列是否已拥有队列索引,没有则加入队列索引池
			// if(
			// 	((queueIndexDicObj.GetCurrentQueueIndexDicLength()+1)<=maxQueueIndexNumOnCurrentNode)
			//     &&queueIndexDicObj!=null
			//     &&queueIndexDicObj.get(this.getQueueIndexGuid())===undefined
			//   ){
			// 	//this.setQueueIndexGuid();//生成队列索引
			// 	 queueIndexDicObj.put(this.getQueueIndexGuid(),this);//当前队列加入索引队列池 
			// 	}
				
				ClearTrafficSizeCount();//流量计数器清零
		}

		function queueEnd(){
			
			this.setEndTime();
			this.setLastEndTimeSpan();
			this.clearTotalCountWhenStart(); //清空当前队列开始时的总工作项数.
			//this.setState(conf.platformArch.DymaticTrafficShapingStatus.success);//定义队列状态
			require('deasync').sleep(messageCommon.GetRandomNum(1,conf.platformArch.QueueMaxExtensionLiveTime)*1000);//给队列结束一个随机延时，以防高并发
			//判断队列索引是否达到移除条件
			if(queueIndexDicObj!=null&&queueIndexDicObj.get(this.getQueueIndexGuid())!=undefined&&this.getLength()===0&&this.getRunCount()===0)
			 { 
				   
				   console.log('当前队列的执行响应结果集如下:\n',this.getQueueCmdResponseSet());
					 
				 //移除队列索引判断
				 if(conf.platformArch.isKeepQueueIndexOnNodeAfterExecute===false){ 
				    queueIndexDicObj.remove(this.getQueueIndexGuid()); 
				 }
				 

				 this.clearQueueCmdResponseSet();
				 this.clear();
				 console.log('<<<<<< 执行队列结束了','<<<<<<<<<<<<<<<<<<<<<<<<当前队列已处理整形流量数:',this.getCurrentTotalDataSize(),'Byte',' <<<<<<<<<<<<<<<<<<<<<<<<')
			 }
			
		}
 
		//Lazy create a freshest Queue during TrafficShaping process
		 function queueNewCreate(currentBodyDataSize,funCallback){

			    
				  let queue=singalQueueCreate();
				 
				  funCallback(queue);
			
				 
		}


		//get messageQueue Dymatic trafficshaping info as per given queueIndex
		function getDymaticTrafficShapingInfoByQueueIndex(queueIndex,funCallback){
			
			QueueDb.dbType='mysql';
			QueueDb.mysqlParameter.select.tableName="DymaticTrafficShaping";
			QueueDb.mysqlParameter.select.topNumber="1";
			QueueDb.mysqlParameter.select.whereSql="where queueIndexGuid=?";
			QueueDb.mysqlParameter.select.params=[queueIndex];
			QueueDb.mysqlParameter.select.orderSql="order by createTime desc";
			QueueDb.mysqlParameter.select.callBack=function(err, rows){
				if(err)
				{
						console.dir(err);  // Don't need a `conn.end`
						
				}
				else{
															
						funCallback(rows);
					}
			};
		   QueueDb.select();

		}
		
		//get all the messageQueue Dymatic trafficshaping info list
		function getDymaticTrafficShapingInfoList(funCallback){
			
			QueueDb.dbType='mysql';
			QueueDb.mysqlParameter.selectAll.tableName="DymaticTrafficShaping";
			QueueDb.mysqlParameter.selectAll.callBack=function(err, rows){
	
			 
				if(err)
				{
					console.dir(err);  // Don't need a `conn.end`      
				}
				else
				{
					funCallback(rows);
				}
					
			};
			QueueDb.selectAll();
		}

		//clear Traffic size count
		function ClearTrafficSizeCount(){
			trafficSizeCount=0;//流量计数器清零
		}
		

		//强制执行时限条件判断，确保在流量整形和队列负载条件都未被击中时，按时执行索引队列中的工作项任务。
		this.loopRunQueueAsPerDefinedExecuteLeaseTime=function(){
			
			
			let now=new Date();
			//queue has been under memory queue index but not under node DB,then use platform arch defined mandantory execute time.
			let queueIndexData=queueIndexDicObj.GetEntireQueueIndexDic();
			for (var key in queueIndexData) 
			{
				 getDymaticTrafficShapingInfoByQueueIndex(key,function(rows){
					 
							if(rows===undefined||rows.length===0)
							{

							    let mandantoryExecuteLimitedTimeForQueueFromQueueIndex=(lastEntryDateTime===null? null:lastEntryDateTime.clone()); 
								if(mandantoryExecuteLimitedTimeForQueueFromQueueIndex!=null)
								{
											  mandantoryExecuteLimitedTimeForQueueFromQueueIndex.addSeconds(eachQueueDefaultExecuteSec);//Node Db没有queue index Memory中已有队列索引流量整形info时，使用平台强制执行秒数。
								} 
								
							  	if(mandantoryExecuteLimitedTimeForQueueFromQueueIndex!=null
									&&now>mandantoryExecuteLimitedTimeForQueueFromQueueIndex
									&&queueIndexData[key]!=null&&queueIndexData[key].getState()===conf.platformArch.DymaticTrafficShapingStatus.actived
									&&queueIndexData[key].isStart()===false
									){
									   console.log(">> 触发自动运行条件-强制执行时限");
								     
								    	queueIndexData[key].start();
									   
								   }
							}

				 });

			}

			//queue has been under node DB,meanwhile under node queue index memory
			getDymaticTrafficShapingInfoList(function(rows){
	 
				for(let row of rows){
				   //符合条件时，从队列索引中取出对应队列并start it
					 //var CreateTime=new Date(row.createTime); 
					 let mandantoryExecuteLimitedTimeForQueueFromNodeDb=(lastEntryDateTime===null? null:lastEntryDateTime.clone()); 
					 if(mandantoryExecuteLimitedTimeForQueueFromNodeDb!=null){
							
						  if(row.defaultExecuteSec!=null&&row.defaultExecuteSec!=undefined&&row.defaultExecuteSec!=0){
								mandantoryExecuteLimitedTimeForQueueFromNodeDb.addSeconds(row.defaultExecuteSec); //Node Db有配置时以数据库配置的强制执行时限秒数为准
							}else{
                                mandantoryExecuteLimitedTimeForQueueFromNodeDb.addSeconds(eachQueueDefaultExecuteSec);//Node Db没有配置时以平台配置的强制执行时限秒数为准
							}
					 } 
					 
					 if(mandantoryExecuteLimitedTimeForQueueFromNodeDb!=null
						 &&now>mandantoryExecuteLimitedTimeForQueueFromNodeDb
						 &&queueIndexDicObj.get(row.queueIndexGuid)!=null&&queueIndexDicObj.get(row.queueIndexGuid).getState()===conf.platformArch.DymaticTrafficShapingStatus.actived
						 &&queueIndexDicObj.get(row.queueIndexGuid).isStart()===false
						 ){
								console.log(">> 触发自动运行条件-强制执行时限");
								queueIndexDicObj.get(row.queueIndexGuid).start();
					

					      }
					 //console.log('lastEntryDateTime:',lastEntryDateTime,' mandantoryExecuteLimitedTimeForQueueFromNodeDb:',mandantoryExecuteLimitedTimeForQueueFromNodeDb,' ',' Now:',now);
				}
	
			});
	
		}

		//set current traffic shaping lastEntryDateTime from outside invoker
		this.setLastEntryDateTime=function(NewLastEntryDateTime){
			 lastEntryDateTime=NewLastEntryDateTime;
		}
		
		//set current traffic shaping queueIndexDicObj from outside invoker
		this.setQueueIndexDicObj=function(NewQueueIndexDicObj){
			 queueIndexDicObj=NewQueueIndexDicObj;
		}

		//return back current traffic shaping queueIndexDicObj 
		this.getQueueIndexDicObj=function(){
		  return	queueIndexDicObj;
	    } 

		//return back current trafficSizeCount to outside invoker
		this.getTrafficSizeCount=function(){

			 return trafficSizeCount;
		}

		//return back current eachQueuetrafficSize which was configed for current trafficshaping obj
		this.getEachQueueTrafficSize=function(){
			return eachQueuetrafficSize;
		}

		//return back eachQueueIndexItemNumber which was configed for current trafficshaping obj
		this.getEachQueueIndexItemNumber=function(){

			return eachQueueIndexItemNumber;
		}

		//return back maxQueueIndexNumOnCurrentNode which was configed for current trafficshaping obj
		this.getMaxQueueIndexNumOnCurrentNode=function(){
			return maxQueueIndexNumOnCurrentNode;
		}

		//set current trafficSizeCount from outside invoker
		this.setTrafficSizeCount=function(NewTrafficSizeCount){

			 trafficSizeCount=NewTrafficSizeCount;
		}
		//clear Traffic size count from outside invoker
		this.ClearTrafficSizeCount=ClearTrafficSizeCount;
		
		//OutSide create for persist queue index pool from Node DB
		this.queuePersistCreate=function(indexGuid){
		
				  let queue = new Queue(eachQueueIndexParalleProcessingNum,{
						"queueStart": queueStart
						,"queueEnd": queueEnd 
						,"workResolve": workResolve
						,"workReject": workReject
						,"workFinally": workFinally
						,"retry":eachQueueIndexItemApproveErrorTimes //出错重试次数 默认0;
						,'workAdd':workAdd //workAdd只会在push/unshift方法添向项时才触发！
						,'timeout':eachQueueItemTimeOut
						});
					queue.setQueueIndexGuidFromOutSide(indexGuid);
					return queue;
		};

		//internal create a singal queue object
		this.singalQueueCreate=function(){
				
			  let queue = new Queue(eachQueueIndexParalleProcessingNum,{
				"queueStart": queueStart
				,"queueEnd": queueEnd 
				,"workResolve": workResolve
				,"workReject": workReject
				,"workFinally": workFinally
				,"retry":eachQueueIndexItemApproveErrorTimes //出错重试次数 默认0;
				,'workAdd':workAdd //workAdd只会在push/unshift方法添向项时才触发！
				,'timeout':eachQueueItemTimeOut
				});
				queue.setQueueIndexGuid();//生成队列索引
				return queue;

		};
		function singalQueueCreate(){
			
			  let queue = new Queue(eachQueueIndexParalleProcessingNum,{
				"queueStart": queueStart
				,"queueEnd": queueEnd 
				,"workResolve": workResolve
				,"workReject": workReject
				,"workFinally": workFinally
				,"retry":eachQueueIndexItemApproveErrorTimes //出错重试次数 默认0;
				,'workAdd':workAdd //workAdd只会在push/unshift方法添向项时才触发！
				,'timeout':eachQueueItemTimeOut
				});
				queue.setQueueIndexGuid();//生成队列索引
				return queue;

		};

		//Major export methods of Dymatic Traffic Shaping module 
		this.trafficShapingEntry= function(body,response){

				try{
					//1.get the body's size
					var currentBodyDataSize= messageCommon.GetByteAsObj(body); //(new Blob(body)).size;

					//2.Attach the size into trafficSizeCount
					trafficSizeCount+=currentBodyDataSize;
					
					//3.push body into queue
					//queueIndexDicObj=QueueIndexDicObj;
				  queueNewCreate(currentBodyDataSize,function(queue){
								
						    queueIndexDicObj.queueIndexLazyCreate(queue,function(result){
									
										if(result===true) //流量整形，当前队列初次加入索引队列池成功
										{ 
												messagePromise.queueInterval=1000; //设置队列处理间隔
												messageProcess.requestBodyQueueIndexGuid=queue.getQueueIndexGuid();
												lastEntryDateTime=new Date();//标记最后一次入口时间
												queueIndexDicObj.MessageInsert(JSON.parse(body),messageProcess.requestBodyQueueIndexGuid); //persist req message under Node DB to anti interupt
												queue.push(messagePromise.requestBodyPromiser,[[body,response,messageProcess.requestBodyQueueIndexGuid,queueIndexDicObj]]).then(messageProcess.requestBodyProcessor);
												
										}
								}); //lazy create一个队列索引
								
					}); //Lazy create一个新队列
				  return true;
			
			}
			catch(e){
					return false;
			}

		}

		
}

})();

 
module.exports=TrafficShaping;