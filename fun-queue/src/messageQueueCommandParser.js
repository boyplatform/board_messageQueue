//import header
var QueueDbHelper= require('../src/messageQueueDBHelper.js');
var QueueDb= new QueueDbHelper();
const QueueHttpHelper=require('../src/messageQueueHttpHelper.js')
const conf=require('./config');
var QueueDllHelper=require('../src/messageQueueDllHelper');
var QueueDll= new QueueDllHelper();
//Define data-structure
if(typeof ActionTypeEnum=='undefined')
{
      var ActionTypeEnum={
      diskdb:0,
			diskFile:1,
			Memory:2,
			thirdPartyWebApi:3,
			thirdPartyDllApi:4,
			others:5
      };
}

if(typeof ActionToolTypeEnum=='undefined')
{
      var ActionToolTypeEnum={
       mssql:0,
			 mysql:1,
			 oracle:2,
			 ceph:3,
			 mem:4,
			 httpRequest:6,
			 dllRequest:7,
			 httpsRequest:8
      };
}

if(typeof opEnum=='undefined')
{
      var opEnum={
       add:0,
			 update:1,
			 select:2,
			 del:3,
			 sp:4,
			 memSet:5,
			 memGet:6,
			 mount:7,
			 vim:8,
			 cat:9,
			 rename:10,
			 rm:11,
			 addDocType:12,
			 seekDocType:13,
			 addFileExt:14,
			 seekFileExt:15,
			 addDocTypeFileExtRelation:16,
			 seekDocTypeFileExtRelation:17
      };
}




//Make function
var queueCommandPaser=function(body,funCallback)
{

  //1.Body parse to json object
	var jsonBody=JSON.parse(body);


	//2.Get message detail action from body json object
	var messageAction=jsonBody.messageAction;
	var messageActionType=jsonBody.messageActionType;
  var messageActionStatement=jsonBody.messageActionStatement;
	var messageActionToolType=jsonBody.messageActionToolType;
	
  //3.Doing processing
   toDoProcessing(jsonBody,messageActionType,messageActionToolType,messageActionStatement,funCallback);

};


var toDoProcessing=function(jsonBody,messageActionType,messageActionToolType,messageActionStatement,funCallback){

       //1.Take ActionToolType enum as per tool type number
     switch(messageActionType){
	   	 //2.select diff action function as per ActionType
           case ActionTypeEnum.diskdb.toString():
              toDoDataBaseAction(messageActionToolType,messageActionStatement,funCallback);
             break;

           case ActionTypeEnum.diskFile.toString():
					    toDoFileDiskAction(jsonBody,messageActionToolType,messageActionStatement,funCallback);
             break;

           case ActionTypeEnum.Memory.toString():
					    toDoMemoryAction(messageActionToolType,messageActionStatement,funCallback);
             break;

           case ActionTypeEnum.thirdPartyWebApi.toString():
					    toDoThirdPartyApiAction(messageActionToolType,messageActionStatement,funCallback);

             break;

           case ActionTypeEnum.thirdPartyDllApi.toString():
					    toDoThirdPartyApiAction(messageActionToolType,messageActionStatement,funCallback);

             break;

           case ActionTypeEnum.others.toString():

             break;

	   }
     

       //3.Make db log as per messageAction


};


var toDoDataBaseAction=function(messageActionToolType,messageActionStatement,funCallback){

			 try 
			 {
					  switch(messageActionToolType)
						{
							     
										case ActionToolTypeEnum.mssql.toString():
									   toDoDataBaseActionAsOp.forMssql(messageActionStatement,funCallback);
										break;

										case ActionToolTypeEnum.mysql.toString():
												
										 toDoDataBaseActionAsOp.forMysql(messageActionStatement,funCallback);
										break;

										case ActionToolTypeEnum.oracle.toString():
										 funCallback(false);
										break;

						}	
						//return true;
			 }catch(e)
			 {
						console.log(e.toString());
						funCallback(false);
			 }
        

};


var toDoDataBaseActionAsOp={
          forMysql:function(messageActionStatement,funCallback){
                     
	                    console.log('当前被调用的工具是:',messageActionStatement.dbType);
	                    QueueDb.dbType=messageActionStatement.dbType;
	                    if(messageActionStatement.dbConf!=null && messageActionStatement.dbConf!="")
	                    {
												messageActionStatement.dbConf.onError=function(err){console.dir(err);}

	                      QueueDb.mysqlParameter.common.dbConf=messageActionStatement.dbConf;
	                    }

		                switch(messageActionStatement.op)
		               {
		               	   case 'add':
															  var currentSql='INSERT INTO '+messageActionStatement.targetTable+'('+messageActionStatement.columnOrSetString+') VALUES (';
																var columnLength=messageActionStatement.columnOrSetString.split(',').length;
																for(var i=0;i<columnLength;i++)
																{  
																	if(i+1!=columnLength)
																	{
																		  currentSql+="?,";
																	}else if(i+1==columnLength)
																	{
																			currentSql+="?)";
																	}
																}

																//verify whether process original-sql for complex insert
																if(messageActionStatement.originalSql!=''){
																		console.log('excuting:'+messageActionStatement.originalSql);
																		QueueDb.mysqlParameter.common.sql=messageActionStatement.originalSql;
																	}else{
																		console.log('excuting:'+currentSql);
																		QueueDb.mysqlParameter.common.sql=currentSql;
																	}

													
																QueueDb.mysqlParameter.common.params=messageActionStatement.params;
																QueueDb.mysqlParameter.common.callBack= function(err, success){
															if(err){
																	console.dir(err);  // Don't need a `conn.end`
																	funCallback(false) ;
															}
															else{
																// Do other things and don't forget close the connection
																//console.log(success);
																funCallback(success);
															} 
														};
															QueueDb.add();
															break;	
					        
					        		case 'update':
													var currentSql="update "+messageActionStatement.targetTable+" set "+messageActionStatement.columnOrSetString;
													if(messageActionStatement.whereSql!='')
													{
														currentSql+=messageActionStatement.whereSql;
													}
													//verify whether process original-sql for complex update
													if(messageActionStatement.originalSql!=''){
																			console.log('excuting:'+messageActionStatement.originalSql);
																			QueueDb.mysqlParameter.common.sql=messageActionStatement.originalSql;
													}else{
														console.log('excuting:'+currentSql);
														QueueDb.mysqlParameter.common.sql=currentSql;
													}
														
													QueueDb.mysqlParameter.common.params=messageActionStatement.params;
													QueueDb.mysqlParameter.common.callBack=function(err, success, affectedRows){
											
													if(err){
																		console.dir(err);  // Don't need a `conn.end`
																		funCallback(false);
															}
													else{
																//console.log(success+' affectedRows:'+affectedRows);
																funCallback(success);
													}
												};
												QueueDb.update();
												break;
							 
							 				case 'delete':						   
													if(messageActionStatement.originalSql!=''){
																				console.log('excuting:'+messageActionStatement.originalSql);
																				QueueDb.mysqlParameter.common.sql=messageActionStatement.originalSql;
																				QueueDb.mysqlParameter.common.params=messageActionStatement.params;
																				QueueDb.mysqlParameter.common.callBack=function(err,success,affectRowsCount){
																					if(err){
																									console.dir(err);  // Don't need a `conn.end`
																									funCallback(false);
																								}
																					else{
																							//console.log(success+' affectRowsCount:'+affectRowsCount);
																							funCallback(success);
																						}
														
											     							};
																				QueueDb.delAsDefinedSql();
													}
													else{
																	var currentSql="delete from "+messageActionStatement.targetTable+" ";
																	if(messageActionStatement.whereSql!='')
																		{
																			currentSql+=messageActionStatement.whereSql;
																			QueueDb.mysqlParameter.del.whereSql=messageActionStatement.whereSql;
																		}
																		console.log('excuting:'+currentSql); //print out current execute DEL SQL
															    	
																		QueueDb.mysqlParameter.del.params=messageActionStatement.params;
																		QueueDb.mysqlParameter.del.tableName=messageActionStatement.targetTable;
																		QueueDb.mysqlParameter.del.callBack=function(err,success,affectRowsCount){
																					if(err){
																					  console.dir(err);  // Don't need a `conn.end`
																						funCallback(false);
																					}
																					else{
																						//console.log(success+' affectRowsCount:'+affectRowsCount);
																						funCallback(success);
																					}
																			};
																		QueueDb.del();
														}
													  break;

                        case 'select':	
                                 
                                 QueueDb.mysqlParameter.select.tableName=messageActionStatement.targetTable;
                                 QueueDb.mysqlParameter.select.topNumber=messageActionStatement.topNum;
                                 QueueDb.mysqlParameter.select.whereSql=messageActionStatement.whereSql;
                                 QueueDb.mysqlParameter.select.params=messageActionStatement.params;
                                 QueueDb.mysqlParameter.select.orderSql=messageActionStatement.orderSql;
                                 QueueDb.mysqlParameter.select.callBack=function(err, res){
                                 	       if(err)
                                 	       {
						                  	  					console.dir(err);  // Don't need a `conn.end`
						                  	  					funCallback(false);
																				 }
																				 else{
																					 
																					  funCallback(res);
									       									}
																};
                                QueueDb.select();
																break;
												
												case 'sp':
																QueueDb.mysqlParameter.executeSP.spName=messageActionStatement.targetSP;
																QueueDb.mysqlParameter.executeSP.paramsFormat=messageActionStatement.paramsFormat;
																QueueDb.mysqlParameter.executeSP.params=messageActionStatement.params;
																QueueDb.mysqlParameter.executeSP.callBack=function(err, res){
																		if(err)
																		{
																			console.dir(err);  // Don't need a `conn.end`
																			funCallback(false);
																		}
																		else{
																	 
																			//console.log(res);
																			funCallback(res);
																		}
																};
																QueueDb.SpExecute();
																break;

	                 }
          		  },
							
				   forMssql:function(messageActionStatement,funCallback){
                      console.log('当前被调用的工具是:',messageActionStatement.dbType);
	                    QueueDb.dbType=messageActionStatement.dbType;
                      if(messageActionStatement.dbConfig!=null && messageActionStatement.dbConfig!="")
	                    {
												QueueDb.mssqlParameter.common.dbConf=messageActionStatement.dbConfig;
	                      QueueDb.mssqlParameter.add.dbConf=messageActionStatement.dbConfig;
	                      QueueDb.mssqlParameter.update.dbConf=messageActionStatement.dbConfig;
	                      QueueDb.mssqlParameter.del.dbConf=messageActionStatement.dbConfig;
												QueueDb.mssqlParameter.select.dbConf=messageActionStatement.dbConfig;
												
	                    }
                       switch(messageActionStatement.op)
		                  {
                          case 'add':
																QueueDb.mssqlParameter.add.addObj=messageActionStatement.parameterObj;
																QueueDb.mssqlParameter.add.tableName=messageActionStatement.targetTable;
																QueueDb.mssqlParameter.add.callBack=function(err, result){
																			if(err)
																			{
																						console.dir(err);  // Don't need a `conn.end`
																						funCallback(false);
																					
																			}
																			else{
																						//console.log(result);
																						funCallback(result);
																			}
																};

																QueueDb.add();
																break;	
														
												  case 'update':
																QueueDb.mssqlParameter.update.updateObj=messageActionStatement.parameterObj;
																QueueDb.mssqlParameter.update.whereObj=messageActionStatement.whereSql;
																QueueDb.mssqlParameter.update.tableName=messageActionStatement.targetTable;
																QueueDb.mssqlParameter.update.callBack=function(err, result){
																		if(err){
																					console.dir(err);  // Don't need a `conn.end`
																					funCallback(false);
																				
																		}
																		else{
																					//console.log(result);
																					funCallback(result);

																		}
																};
																QueueDb.update();
                                break;
													
													case 'delete':
															if(messageActionStatement.originalSql!=''){
																	console.log('excuting:'+messageActionStatement.originalSql);
																	QueueDb.mssqlParameter.common.sql=messageActionStatement.originalSql;
																	QueueDb.mssqlParameter.common.params=messageActionStatement.parameterObj;
																	QueueDb.mssqlParameter.common.callBack=function(err, result){
																		if(err){
																						console.dir(err);  // Don't need a `conn.end`
																						funCallback(false);
																	  }
																		else{
																				//console.log(result);
																				funCallback(result);
																		}
											
																	};
																	QueueDb.delAsDefinedSql();
														 }
														 else
														 {
																	QueueDb.mssqlParameter.del.whereSql=messageActionStatement.whereSql;
																	QueueDb.mssqlParameter.del.params=messageActionStatement.parameterObj;
																	QueueDb.mssqlParameter.del.tableName=messageActionStatement.targetTable;
																	QueueDb.mssqlParameter.del.callBack=function(err, result){
																	if(err)
																		{
																					console.dir(err);  // Don't need a `conn.end`
																					funCallback(false);
																				
																		}
																		else{
																					//console.log(result);
																					funCallback(result);

																		}
																	};
																	QueueDb.del();
														}
													  break;
													
													case 'select':	
                              QueueDb.mssqlParameter.select.tableName=messageActionStatement.targetTable;
                              QueueDb.mssqlParameter.select.topNumber=messageActionStatement.topNumber;
                              QueueDb.mssqlParameter.select.whereSql=messageActionStatement.whereSql;
                              QueueDb.mssqlParameter.select.params=messageActionStatement.parameterObj;
                              QueueDb.mssqlParameter.select.orderSql=messageActionStatement.orderSql;
                              QueueDb.mssqlParameter.select.callBack=function(err, result){
																	if(err)
																	{
																				console.dir(err);  // Don't need a `conn.end`
																				funCallback(false);
																			 
																			
																	}
																	else{
																				//console.log(result.recordsets);
																				funCallback(result.recordsets);
																	}
    						  					};
														 QueueDb.select();
														 break;
													
													 case 'sp':
													 QueueDb.mssqlParameter.executeSP.spName=messageActionStatement.targetSP;
													 QueueDb.mssqlParameter.executeSP.paramsFormat=messageActionStatement.paramsFormat;
													 QueueDb.mssqlParameter.executeSP.params=messageActionStatement.parameterObj;
													 QueueDb.mssqlParameter.executeSP.callBack=function(err, result){
																if(err)
																{
																			console.dir(err);  // Don't need a `conn.end`
																			funCallback(false);
																		
																}
																else{
																	  //console.log(result.recordsets);
																		//console.log(result.recordset);
																		funCallback(result);
																}
													};
														QueueDb.SpExecute();
														break;
													
											}
 
           } 
}


var toDoFileDiskAction=function(jsonBody,messageActionToolType,messageActionStatement,funCallback){
          switch(messageActionToolType)
          {
                 case ActionToolTypeEnum.ceph.toString():
                  toDoFileDiskActionOp.forCeph(jsonBody,messageActionStatement,funCallback);
                 break;

                

          }

};

var toDoFileDiskActionOp={
	 
	 forCeph:function(jsonBody,messageActionStatement,funCallback){
 
		  switch(messageActionStatement.op)
		  {
					case opEnum.addDocType.toString():
							var diskFileUrl=undefined;
							if(messageActionStatement.diskFileUrl===undefined||messageActionStatement.diskFileUrl===""){
								  diskFileUrl=conf.platformArch.diskFileUrl;
							}else{
								  diskFileUrl=messageActionStatement.diskFileUrl;
							}
							var qs=messageActionStatement.qs;
							var timeout=messageActionStatement.timeout;
							var body={
								'docTypeName':messageActionStatement.docTypeName,
								'docTypeDesc':messageActionStatement.docTypeDesc,
								'maxFileSize':messageActionStatement.maxFileSize,
								'fileShareFolder':messageActionStatement.fileShareFolder, 
								'comment':messageActionStatement.comment,
								'isActive':messageActionStatement.isActive 
							};
							QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,diskFileUrl,conf.platformArch.diskFilePartialUrl+"/addDocType",qs,body,timeout,function(res){

								funCallback(res);
							});
					break;

					case opEnum.seekDocType.toString():
							var diskFileUrl=undefined;
							if(messageActionStatement.diskFileUrl===undefined||messageActionStatement.diskFileUrl===""){
									diskFileUrl=conf.platformArch.diskFileUrl;
							}else{
									diskFileUrl=messageActionStatement.diskFileUrl;
							}
							var qs=messageActionStatement.qs;
							var timeout=messageActionStatement.timeout;
							var body={};
							QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,diskFileUrl,conf.platformArch.diskFilePartialUrl+"/seekDocType",qs,body,timeout,function(res){

								funCallback(res);
							});
					break;

					case opEnum.addFileExt.toString():
									var diskFileUrl=undefined;
											if(messageActionStatement.diskFileUrl===undefined||messageActionStatement.diskFileUrl===""){
													diskFileUrl=conf.platformArch.diskFileUrl;
											}else{
													diskFileUrl=messageActionStatement.diskFileUrl;
											}
						    	var qs=messageActionStatement.qs;
									var timeout=messageActionStatement.timeout;
									var body={
										"fileExtName":messageActionStatement.fileExtName
									};
									QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,diskFileUrl,conf.platformArch.diskFilePartialUrl+"/addFileExt",qs,body,timeout,function(res){

										funCallback(res);
									});
					break;

					case opEnum.seekFileExt.toString():
								var diskFileUrl=undefined;
								if(messageActionStatement.diskFileUrl===undefined||messageActionStatement.diskFileUrl===""){
										diskFileUrl=conf.platformArch.diskFileUrl;
								}else{
										diskFileUrl=messageActionStatement.diskFileUrl;
								}
								var qs=messageActionStatement.qs;
								var timeout=messageActionStatement.timeout;
								var body={};
								QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,diskFileUrl,conf.platformArch.diskFilePartialUrl+"/seekFileExt",qs,body,timeout,function(res){

									funCallback(res);
								});

					break;

					case opEnum.addDocTypeFileExtRelation.toString():
							var diskFileUrl=undefined;
							if(messageActionStatement.diskFileUrl===undefined||messageActionStatement.diskFileUrl===""){
									diskFileUrl=conf.platformArch.diskFileUrl;
							}else{
									diskFileUrl=messageActionStatement.diskFileUrl;
							}
							var qs={};
							var timeout=conf.platformArch.defaultHttpReqTimeOut;
							var contentType="application/x-www-form-urlencoded";
							var forWardUrl=conf.platformArch.HttpMode+"://"+diskFileUrl+conf.platformArch.diskFilePartialUrl+"/addDocTypeFileExtRelation";
						  var form={
								"docTypeId":messageActionStatement.docTypeId,
								"fileExtID":messageActionStatement.fileExtID
							};
							QueueHttpHelper.apiSimpleRequestWithCallBackAndForwardUrl(forWardUrl,qs,form,{},contentType,timeout,function(res){

									funCallback(res);
							});
					break;

					case opEnum.seekDocTypeFileExtRelation.toString():
							var diskFileUrl=undefined;
									if(messageActionStatement.diskFileUrl===undefined||messageActionStatement.diskFileUrl===""){
											diskFileUrl=conf.platformArch.diskFileUrl;
									}else{
											diskFileUrl=messageActionStatement.diskFileUrl;
									}
							var qs=messageActionStatement.qs;
							var timeout=messageActionStatement.timeout;
							var body={};
										QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,diskFileUrl,conf.platformArch.diskFilePartialUrl+"/seekDocTypeFileExtRelation",qs,body,timeout,function(res){

											funCallback(res);
										});
					break;

					case opEnum.mount.toString():
									
									var qs=messageActionStatement.qs;
									var timeout=messageActionStatement.timeout;
									var body={
										'username':messageActionStatement.username,
										'monIp':messageActionStatement.monIp,
										'userKey':messageActionStatement.userKey,
										'mountPath':messageActionStatement.mountPath 
								  };
								  QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,conf.platformArch.diskFileUrl,conf.platformArch.diskFilePartialUrl+"/mount",qs,body,timeout,function(res){

										funCallback(res);
						    	});
					 break;
					case opEnum.vim.toString():
								var qs={};
								var timeout=conf.platformArch.defaultHttpReqTimeOut;
								var contentType="multipart/form-data; boundary=-------------------------"+conf.platformArch.diskFileBoundKey.trim();
								var forWardUrl=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/vim";
							
								QueueHttpHelper.apiSimpleRequestWithCallBackAndForwardUrl(forWardUrl,qs,{},jsonBody,contentType,timeout,function(res){

									  funCallback(res);
								});
					 break;
					case opEnum.cat.toString():
					      
					     if(messageActionStatement.catType==="download"){

								  var returnRs={};
							    if(messageActionStatement.userGuid!==undefined&&messageActionStatement.docTypeId!==undefined&&messageActionStatement.platformfileExtID!==undefined&&messageActionStatement.fileName!==undefined&&messageActionStatement.catType!==undefined&&messageActionStatement.isBig!==undefined){
										var body="userGuid="+messageActionStatement.userGuid+"&docTypeId="+messageActionStatement.docTypeId+"&platformfileExtID="+messageActionStatement.platformfileExtID+"&fileName="+messageActionStatement.fileName+"&catType="+messageActionStatement.catType+"&isBig="+messageActionStatement.isBig;
										returnRs["redirectUrl"]=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/cat?"+body;
										funCallback(returnRs);
									}else{
                    funCallback("diskFile url parameter is wrong!");
									}
							 
								}else if(messageActionStatement.catType==="seekCached"){
							 
									var returnRs={};
									if(messageActionStatement.userGuid!==undefined&&messageActionStatement.docTypeId!==undefined&&messageActionStatement.platformfileExtID!==undefined&&messageActionStatement.fileName!==undefined&&messageActionStatement.catType!==undefined&&messageActionStatement.isBig!==undefined){
										var body="userGuid="+messageActionStatement.userGuid+"&docTypeId="+messageActionStatement.docTypeId+"&platformfileExtID="+messageActionStatement.platformfileExtID+"&fileName="+messageActionStatement.fileName+"&catType="+messageActionStatement.catType+"&isBig="+messageActionStatement.isBig;
										returnRs["redirectUrl"]=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/cat?"+body;
										funCallback(returnRs);
									}else{
                    funCallback("diskFile url parameter is wrong!");
									}

							 }else if(messageActionStatement.catType==="getStaticUrl"){

							 
									var returnRs={};
									if(messageActionStatement.userGuid!==undefined&&messageActionStatement.docTypeId!==undefined&&messageActionStatement.platformfileExtID!==undefined&&messageActionStatement.fileName!==undefined&&messageActionStatement.catType!==undefined&&messageActionStatement.isBig!==undefined&&messageActionStatement.viewerCacheLength!==undefined){
										var body="userGuid="+messageActionStatement.userGuid+"&docTypeId="+messageActionStatement.docTypeId+"&platformfileExtID="+messageActionStatement.platformfileExtID+"&fileName="+messageActionStatement.fileName+"&catType="+messageActionStatement.catType+"&isBig="+messageActionStatement.isBig+"&viewerCacheLength="+messageActionStatement.viewerCacheLength;
										returnRs["redirectUrl"]=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/cat?"+body;
										funCallback(returnRs);
									}else{
                    funCallback("diskFile url parameter is wrong!");
									}
								 
							 }else if(messageActionStatement.catType==="redirectToStaticUrl"){
									var returnRs={};
									if(messageActionStatement.userGuid!==undefined&&messageActionStatement.docTypeId!==undefined&&messageActionStatement.platformfileExtID!==undefined&&messageActionStatement.fileName!==undefined&&messageActionStatement.catType!==undefined&&messageActionStatement.isBig!==undefined&&messageActionStatement.viewerCacheLength!==undefined){
										var body="userGuid="+messageActionStatement.userGuid+"&docTypeId="+messageActionStatement.docTypeId+"&platformfileExtID="+messageActionStatement.platformfileExtID+"&fileName="+messageActionStatement.fileName+"&catType="+messageActionStatement.catType+"&isBig="+messageActionStatement.isBig+"&viewerCacheLength="+messageActionStatement.viewerCacheLength;
										returnRs["redirectUrl"]=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/cat?"+body;
										funCallback(returnRs);
									}else{
										funCallback("diskFile url parameter is wrong!");
									}
							}
					 break;
					case opEnum.rm.toString():					
								 
								var returnRs={};
								if(messageActionStatement.userGuid!==undefined&&messageActionStatement.fileName!==undefined&&messageActionStatement.platformfileExtID!==undefined&&messageActionStatement.docTypeId!==undefined){
									var body="userGuid="+messageActionStatement.userGuid+"&fileName="+messageActionStatement.fileName+"&platformfileExtID="+messageActionStatement.platformfileExtID+"&docTypeId="+messageActionStatement.docTypeId;
									returnRs["redirectUrl"]=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/rm?"+body;
									funCallback(returnRs);
								}else{
									funCallback("diskFile url parameter is wrong!");
								}
								 
					 break;
					case opEnum.rename.toString():
						 
								var returnRs={};
								if(messageActionStatement.userGuid!==undefined&&messageActionStatement.oldFileName!==undefined&&messageActionStatement.newFileName!==undefined&&messageActionStatement.platformfileExtID!==undefined&&messageActionStatement.docTypeId!==undefined){
									var body="userGuid="+messageActionStatement.userGuid+"&oldFileName="+messageActionStatement.oldFileName+"&newFileName="+messageActionStatement.newFileName+"&platformfileExtID="+messageActionStatement.platformfileExtID+"&docTypeId="+messageActionStatement.docTypeId;
									returnRs["redirectUrl"]=conf.platformArch.HttpMode+"://"+conf.platformArch.diskFileUrl+conf.platformArch.diskFilePartialUrl+"/rename?"+body;
									funCallback(returnRs);
								}else{
									funCallback("diskFile url parameter is wrong!");
								}
							 
					 break;
		  }
	 }
};


var toDoMemoryAction=function(messageActionToolType,messageActionStatement,funCallback){

         switch(messageActionToolType)
         {
                 case ActionToolTypeEnum.mem.toString():
                     toDoMemoryActionAsOp.forMem(messageActionStatement,funCallback);
                 break;
 
         }
};
var toDoMemoryActionAsOp={
	
	    forMem:function(messageActionStatement,funCallback){
				switch(messageActionStatement.op)
				{
						case opEnum.memSet.toString():
							var domainUrl=conf.platformArch.memoryUrl;
							var partialUrl=conf.platformArch.memoryPartialUrl;
							var qs=messageActionStatement.qs;
							var body=messageActionStatement.body;
							var timeout=messageActionStatement.timeout;
						
							QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,domainUrl,partialUrl,qs,body,timeout,function(res){

										funCallback(res);
							});

						case opEnum.memGet.toString():
						  var domainUrl=conf.platformArch.memoryUrl;
							var partialUrl=conf.platformArch.memoryPartialUrl;
							var qs=messageActionStatement.qs;
							var body=messageActionStatement.body;
							var timeout=messageActionStatement.timeout;
						
							QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,domainUrl,partialUrl,qs,body,timeout,function(res){

										funCallback(res);
							});
			 }
		} 
		  
};

var toDoThirdPartyApiAction=function(messageActionToolType,messageActionStatement,funCallback){
       switch(messageActionToolType)
             {
                 case ActionToolTypeEnum.httpRequest.toString():
								   toDoThirdPartyApiActionAsOp.forHttp(messageActionStatement,funCallback);
                 break;
								 
								 case ActionToolTypeEnum.httpsRequest.toString(): 
								   toDoThirdPartyApiActionAsOp.forHttps(messageActionStatement,funCallback);
                 break;
                
                 case ActionToolTypeEnum.dllRequest.toString():
								   toDoThirdPartyApiActionAsOp.forDll(messageActionStatement,funCallback); 
                 break;
                 
             }


};

var toDoThirdPartyApiActionAsOp={


	forHttp:function(messageActionStatement,funCallback){

			var domainUrl=messageActionStatement.domainUrl;
			var partialUrl=messageActionStatement.partialUrl;
			var qs=messageActionStatement.qs;
			var body=messageActionStatement.body;
			var timeout=messageActionStatement.timeout;
		
			QueueHttpHelper.apiSimpleRequestWithCallBack(conf.platformArch.HttpMode,domainUrl,partialUrl,qs,body,timeout,function(res){

						funCallback(res);
			});
			
	},
	forHttps:function(messageActionStatement,funCallback){

	},
	forDll:function(messageActionStatement,funCallback){

		var dllName=messageActionStatement.dllName;
		var methodName=messageActionStatement.methodName;
		var methodIOParameterFormat=eval(messageActionStatement.methodIOParameterFormat);
		var methodIOParameterStr=messageActionStatement.methodIOParameterStr;
		QueueDll.dllInvoker(conf.platformArch.thirdPartyDllPath,dllName,methodName,methodIOParameterFormat,methodIOParameterStr,function(result){
			funCallback(result);
		})
	}




}
 


exports.queueCommandPaser=queueCommandPaser;
