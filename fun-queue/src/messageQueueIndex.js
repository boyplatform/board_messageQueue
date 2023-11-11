require('date-utils');
//import header
//var Queue = require('../');
//var q = Queue.Q; //内置的Promise，仿Q的API
var QueueDbHelper= require('../src/messageQueueDBHelper.js');
var messagePromise= require('../webApi/messageQueuePromise');
var messageProcess= require('../webApi/messageQueueCallBack.js');
var messageCommon=require('../src/messageQueueCommon.js');
var commandParser = require('../src/messageQueueCommandParser.js');
//var AsyncLock=require('async-lock');
//var lock=new AsyncLock(); //声明资源锁对象
var conf = require("./config");



//队列索引初始化
var QueueIndexDic=(function() {

 
 //队列索引权重cube
 var lastBestHitQIndexCube={
  lastMaxSpeedRateQIndex:"",
  lastMinSpeedRateQIndex:"",
  lastAvergeSpeedRateQIndex:"",
  lastCurrentTotalDataSizeQIndex:"",
  lastStatusQIndex:""
 };

 //索引队列载体
 var data={}; 

 var trafficShapingObj=null;

 var QueueDb= new QueueDbHelper();

  

 return function() {
   
    
    this.put = function (key, value) {
      data[key] = value;
      this.QueueIndexDataInsert(key, value); //队列索引持久化
      PrintCurrentQueueIndexDicLength();
    };
    function put (key, value) {
      data[key] = value;   //队列索引持久化From Node DB,无需再次插入Node DB
      PrintCurrentQueueIndexDicLength();
    };

    this.remove=function (key) {
      delete data[key];
      this.QueueIndexDataDelete(key); //队列索引持久化
      PrintCurrentQueueIndexDicLength();
    };
    var remove=function (key) {
      delete data[key];
      QueueIndexDataDelete(key); //队列索引持久化
      PrintCurrentQueueIndexDicLength();
    };

    this.get = function (key) {
      return data[key];
    };
    function get(key) {
      return data[key];
    };
    
    this.GetCurrentQueueIndexDicLength = function () {
      let Length = 0;
      for (var key in data) {
        Length++;
      }
      //console.log('Current Queue Index Dic length:' + Length);
      //console.log("当前节点队列索引上限:",conf.platformArch.MaxQueueIndexNumOnCurrentNode,"|当前节点队列索引总数:",Length);
      return Length;
    };
    
    var GetCurrentQueueIndexDicLength= function () {
      let Length = 0;
      for (var key in data) {
        Length++;
      }
      return Length;
    };

    function PrintCurrentQueueIndexDicLength(){
        let Length = 0;
        for (var key in data) {
          Length++;
        }
        //console.log('Current Queue Index Dic length:' + Length);
        console.log("当前节点队列索引上限:",conf.platformArch.MaxQueueIndexNumOnCurrentNode,"|当前节点队列索引总数:",Length);
    };
    this.GetEntireQueueIndexDic = function () {
      return data;
    };
    this.isEmpty = function () {
      return data.length == 0;
    };

    //set current queue index TrafficShapingObj from outside invoker
		this.setTrafficShapingObj=function(NewTrafficShapingObj){
      trafficShapingObj=NewTrafficShapingObj;
    }

    //Action message record--message persist
    this.MessageInsert=function(messageBody,queueIndexGuid){

        //var QueueDb= new QueueDbHelper();
        QueueDb.dbType = 'mysql';
        QueueDb.mysqlParameter.common.sql = "insert into Message (queueIndexGuid,messageAction,messageActionType,messageActionStatement,state,messageActionToolType) values (?,?,?,?,?,?)";
        QueueDb.mysqlParameter.common.params = [queueIndexGuid,messageBody.messageAction,messageBody.messageActionType.toString(),JSON.stringify(messageBody.messageActionStatement),0,messageBody.messageActionToolType.toString()];
        QueueDb.mysqlParameter.common.callBack = function (err, success, insertId) {
          
            if(err)
            {
                  console.dir(err); // Don't need a `conn.end`
                  return false;
            }else
            {
              if(insertId!=undefined){
                 
                  console.log(success + '--Action message is inserted under queue index ID:' + queueIndexGuid+" successfully!");
              }

            }
          
        }
        QueueDb.add();
    };
    var MessageInsert=function(messageBody,queueIndexGuid){

          //var QueueDb= new QueueDbHelper();
          QueueDb.dbType = 'mysql';
          QueueDb.mysqlParameter.common.sql = "insert into Message (queueIndexGuid,messageAction,messageActionType,messageActionStatement,state,messageActionToolType) values (?,?,?,?,?,?)";
          QueueDb.mysqlParameter.common.params = [queueIndexGuid,messageBody.messageAction,messageBody.messageActionType.toString(),JSON.stringify(messageBody.messageActionStatement),0,messageBody.messageActionToolType.toString()];
          QueueDb.mysqlParameter.common.callBack = function (err, success, insertId) {
            
              if(err)
              {
                    console.dir(err); // Don't need a `conn.end`
                    return false;
              }else
              {
                if(insertId!=undefined){
                  
                    console.log(success + '--Action message is inserted under queue index ID:' + queueIndexGuid+" successfully!");
                }

              }
            
          }
          QueueDb.add();
    }; 

    //Action message state update--message persist
    this.MessageStateUpdate=function(messageBody,queueIndexGuid){
     
      //var QueueDb= new QueueDbHelper();
      QueueDb.dbType = 'mysql';    
      QueueDb.mysqlParameter.common.sql ="update Message set state=? where queueIndexGuid=? and messageActionStatement=?";
      QueueDb.mysqlParameter.common.params=[data[queueIndexGuid].getState()===4? 2:3,queueIndexGuid,JSON.stringify(messageBody.messageActionStatement)];
      QueueDb.mysqlParameter.common.callBack = function (err, success, affectedRows)
      {
        if (err) {
          console.dir(err); // Don't need a `conn.end`
          return false;
        }else
        {
          console.log(success + '--Message state Persist affectedRows:' + affectedRows);
         
        }

      }
      QueueDb.update();
    }
    
    var MessageStateUpdateById=function(state,messageId){
     
      //var QueueDb= new QueueDbHelper();
      QueueDb.dbType = 'mysql';    
      QueueDb.mysqlParameter.common.sql ="update Message set state=? where messageId=?";
      QueueDb.mysqlParameter.common.params=[state,messageId];
      QueueDb.mysqlParameter.common.callBack = function (err, success, affectedRows)
      {
        if (err) {
          console.dir(err); // Don't need a `conn.end`
          return false;
        }else
        {
          console.log(success + '--Message state Persist affectedRows:' + affectedRows);
         
        }

      }
      QueueDb.update();
    }

    //Action message--message persist
     this.MesssageExecutionPersist=function(){
         //var QueueDb= new QueueDbHelper();
         QueueDb.dbType = 'mysql';    
         QueueDb.mysqlParameter.select.tableName='Message';
         QueueDb.mysqlParameter.select.topNumber=conf.platformArch.eachLoopPersistMessageNum.toString();
         QueueDb.mysqlParameter.select.whereSql='where state>?';
         QueueDb.mysqlParameter.select.params=[conf.platformArch.MessageStatus.success];
         QueueDb.mysqlParameter.select.orderSql='order by timeSpan desc';
         QueueDb.mysqlParameter.select.callBack=function(err, rows)
         {
              console.log('Begin to persist existing action message from current node db')
              if(err)
              {
                console.log('Failed to persist existing action message from current node db')   
              }
              else
              {
                  for(let row of rows){
                     
                    let body={
                      "messageAction":row.messageAction,
                      "messageActionType":row.messageActionType,
                      "messageActionStatement":JSON.parse(row.messageActionStatement),
                      "messageActionToolType":row.messageActionToolType
                    }
                    commandParser.queueCommandPaser(JSON.stringify(body),function(cmdResult){
                       MessageStateUpdateById(conf.platformArch.MessageStatus.success,row.messageId);
                       console.log('MessageID:',row.messageId,' has been persist to execute successfully as below result:\n',cmdResult);
                    });
                  }
                
              }
         };
         QueueDb.select();

     }

    this.QueueIndexGAC=function(){
          
       //遍历内存中的队列索引中的队列，按照其lastStartTime and lastEndTime确认是否对其进行队列索引回收操作。
       for (var key in data) 
       {
           //如果lastStartTime和lastEndTime不为空，且当前时间>lastStartTime+平台QueueIndexGACTTL & 当前时间>lastEndTime+平台QueueIndexGACTTL
           //则执行清理操作
           if(data[key].getLastStartTimeSpan()!=null&&data[key].getLastEndTimeSpan()!=null)
           {
               let now=new Date();
               let gacTimeBaseOnStart=data[key].getLastStartTimeSpan().clone();                       
               let gacTimeBaseOnEnd=data[key].getLastEndTimeSpan().clone();
               gacTimeBaseOnStart.addSeconds(conf.platformArch.QueueIndexGACTTL);  //add QueueIndexGACTTL
               gacTimeBaseOnEnd.addSeconds(conf.platformArch.QueueIndexGACTTL);
               if(now>gacTimeBaseOnStart&&now>gacTimeBaseOnEnd&&data[key].isStart()===false){

                   console.log('>>>>>Queue index GAC was executed once>>>>>');
                   remove(key);                  
               }


           }


       }
         
    }

    this.QueueIndexDataInsert = function (key, value) {

      var IndexGuid = key;
      var queueNodeInfo = 'NodeLocalDomainIP:' + messageCommon.getCurrentServerIpAdress();
      var queueNodeIp = messageCommon.getCurrentServerIpAdress();
      //var state = '0'; //init
      var queueToolType = '0'; //queue-fun
      var maxSpeedRate = value.getMaxSpeedRate();
      var minSpeedRate = value.getMinSpeedRate();
      var avergeSpeedRate = value.getAvergeSpeedRate();
      var state = value.getState();
      var currentTotalDataSize = value.getCurrentTotalDataSize();
      var createTime = messageCommon.GetFormatDateFromTimeSpan(Date.now());
      //var QueueDb= new QueueDbHelper();
      QueueDb.dbType = 'mysql';
      //insert major table
      QueueDb.mysqlParameter.common.sql = "insert into MessageQueueIndex (indexGuid,queueNodeInfo, queueNodeIp,state,queueToolType) values (?,?,?,?,?)";
      QueueDb.mysqlParameter.common.params = [IndexGuid, queueNodeInfo, queueNodeIp, state, queueToolType];
      QueueDb.mysqlParameter.common.callBack = function (err, success, insertId) {
            
          if(err){
              console.dir(err); // Don't need a `conn.end`
              return false;
          }
          else{
                if(insertId!=undefined){
                  console.log(success + '--MessageQueueIndex is Inserted as ID:' + IndexGuid);
                }
                //insert DymaticTrafficShaping table
                QueueDb.mysqlParameter.common.sql = "insert into DymaticTrafficShaping (queueIndexGuid,maxSpeedRate, minSpeedRate,avergeSpeedRate,state,currentTotalDataSize,createTime) values (?,?,?,?,?,?,?)";
                QueueDb.mysqlParameter.common.params = [IndexGuid, maxSpeedRate, minSpeedRate, avergeSpeedRate, state, currentTotalDataSize, createTime];
                QueueDb.mysqlParameter.common.callBack = function (err, success, insertId) {
                    if (err) {
                        console.dir(err); // Don't need a `conn.end`
                        return false;
                    }
                    else {
                      if(insertId!=undefined){
                        console.log(success + '--DymaticTrafficShaping is Inserted as ID:' + IndexGuid);
                      }
                      return true;
                    }
                };
                QueueDb.add();
              }
      };
      QueueDb.add();
    };


    this.QueueIndexDataDelete = function (key) {
      //级联删除队列索引
      QueueDb.dbType = 'mysql';
      QueueDb.mysqlParameter.del.tableName = 'DymaticTrafficShaping';
      QueueDb.mysqlParameter.del.whereSql = 'where queueIndexGuid=?';
      QueueDb.mysqlParameter.del.params = [key];
      QueueDb.mysqlParameter.del.callBack = function (err, success,affectRowsCount){
        if (err) {
          console.dir(err);
          return false;
        }
        else{
            if(success){
            console.log('DymaticTrafficShaping remove affectedRows:' + affectRowsCount," QueueIndex:",key);
            }
            QueueDb.mysqlParameter.del.tableName = 'MessageQueueIndex';
            QueueDb.mysqlParameter.del.whereSql = 'where indexGuid=?';
            QueueDb.mysqlParameter.del.params = [key];
            QueueDb.mysqlParameter.del.callBack = function (err,success, affectRowsCount){
                if (err) {
                    console.dir(err);
                  return false;
                }
                else {
                  if(success){
                    console.log('MessageQueueIndex remove affectedRows:' + affectRowsCount," QueueIndex:",key);
                  }
                  return true;
                }
            };
            QueueDb.del();
          
        }
      };
      QueueDb.del();
    };
    
    var QueueIndexDataDelete = function (key) {
      //级联删除队列索引
      QueueDb.dbType = 'mysql';
      QueueDb.mysqlParameter.del.tableName = 'DymaticTrafficShaping';
      QueueDb.mysqlParameter.del.whereSql = 'where queueIndexGuid=?';
      QueueDb.mysqlParameter.del.params = [key];
      QueueDb.mysqlParameter.del.callBack = function (err, success,affectRowsCount){
        if (err) {
          console.dir(err);
          return false;
        }
        else{
            if(success){
            console.log('DymaticTrafficShaping remove affectedRows:' + affectRowsCount," QueueIndex:",key);
            }
            QueueDb.mysqlParameter.del.tableName = 'MessageQueueIndex';
            QueueDb.mysqlParameter.del.whereSql = 'where indexGuid=?';
            QueueDb.mysqlParameter.del.params = [key];
            QueueDb.mysqlParameter.del.callBack = function (err,success, affectRowsCount){
                if (err) {
                    console.dir(err);
                  return false;
                }
                else {
                  if(success){
                    console.log('MessageQueueIndex remove affectedRows:' + affectRowsCount," QueueIndex:",key);
                  }
                  return true;
                }
            };
            QueueDb.del();
          
        }
      };
      QueueDb.del();
    };


  
    var isExistQueueIndexData=function(inputParameter,funCallback)
    {
         
          var returnRs={};
          //Verify MessageQueueIndex at first
          QueueDb.mysqlParameter.select.tableName='MessageQueueIndex';
          QueueDb.mysqlParameter.select.topNumber='1';
          QueueDb.mysqlParameter.select.whereSql='where indexGuid=? and queueNodeInfo=? and queueNodeIp=? and queueToolType=?';
          QueueDb.mysqlParameter.select.params=[inputParameter.indexGuid,inputParameter.queueNodeInfo,inputParameter.queueNodeIp,inputParameter.queueToolType];
          QueueDb.mysqlParameter.select.orderSql='';
          QueueDb.mysqlParameter.select.callBack=function(err, rs1)
          {
                  if (err)
                  {
                      console.dir(err); 
                      funCallback(returnRs);
                  }
                  else
                  {
                      if(rs1===undefined||rs1.length===0)
                      {
                          returnRs['needMessageQueueIndex']=true;
                          //Verify DymaticTrafficShaping at second
                          QueueDb.dbType='mysql';
                          QueueDb.mysqlParameter.select.tableName='DymaticTrafficShaping';
                          QueueDb.mysqlParameter.select.topNumber='1';
                          QueueDb.mysqlParameter.select.whereSql='where queueIndexGuid=? and cast(maxSpeedRate as CHAR)=? and cast(minSpeedRate as CHAR)=? and cast(avergeSpeedRate as CHAR)=? and state=? and cast(currentTotalDataSize as CHAR)=? and lastStartTime=? and lastEndTime=?';
                          QueueDb.mysqlParameter.select.params=[inputParameter.indexGuid,inputParameter.maxSpeedRate,inputParameter.minSpeedRate,inputParameter.avergeSpeedRate,inputParameter.state,inputParameter.currentTotalDataSize,inputParameter.lastStartTime,inputParameter.lastEndTime];
                          QueueDb.mysqlParameter.select.orderSql='';
                          QueueDb.mysqlParameter.select.callBack=function(err, rs2)
                          { 
                                if(err)
                                {
                                    console.dir(err); 
                                    funCallback(returnRs);
                                }
                                else
                                {
                                    if(rs2===undefined||rs2.length===0)
                                    {
                                      returnRs['needDymaticTrafficShaping']=true;
                                    }
                                    else
                                    {  
                                      returnRs['needDymaticTrafficShaping']=false;
                                    }   
                                    funCallback(returnRs);
                                }
                          }
                          QueueDb.select();    
                      }
                      else
                      {
                          returnRs['needMessageQueueIndex']=false;
                          returnRs['needDymaticTrafficShaping']=false;   
                      }   
                      
                  }
          }
          QueueDb.select();
    };

    this.QueueIndexPersistFromMemoryToData = function (){
        //loop all queues under current queue index pool memory
        for (var key in data) 
        {
              var IndexGuid = key;
              var maxSpeedRate = data[key].getMaxSpeedRate();
              var minSpeedRate = data[key].getMinSpeedRate();
              var avergeSpeedRate = data[key].getAvergeSpeedRate();
              var state = data[key].getState();
              var currentTotalDataSize = data[key].getCurrentTotalDataSize();
              var queueNodeInfo = 'NodeLocalDomainIP:' + messageCommon.getCurrentServerIpAdress();
              var queueNodeIp = messageCommon.getCurrentServerIpAdress();
              var queueToolType = '0'; //queue-fun
              var createTime = messageCommon.GetFormatDateFromTimeSpan(Date.now());
              var lastStartTime=data[key].getLastStartTimeSpan(); //队列GAC的时间戳
              var lastEndTime =data[key].getLastEndTimeSpan();//队列GAC的时间戳

              QueueDb.dbType = 'mysql';
              //by insert for the data existed under Node memory but non-existed under Node DB.(if isKeepQueueIndexOnNodeAfterExecute of platformArch under conf is true)
              if(conf.platformArch.isKeepQueueIndexOnNodeAfterExecute===true)
              {
                    isExistQueueIndexData(
                    {
                        indexGuid:IndexGuid,
                        maxSpeedRate:maxSpeedRate,
                        minSpeedRate:minSpeedRate,
                        avergeSpeedRate:avergeSpeedRate,
                        state:state,
                        currentTotalDataSize:currentTotalDataSize,
                        queueNodeInfo:queueNodeInfo,
                        queueNodeIp:queueNodeIp,
                        queueToolType:queueToolType,
                        createTime:createTime,
                        lastStartTime:lastStartTime,
                        lastEndTime:lastEndTime
                    },function(result){
 
                          if(result!={}&&result["needMessageQueueIndex"]===true)
                          {
                                QueueDb.mysqlParameter.common.sql = "insert into MessageQueueIndex (indexGuid,queueNodeInfo, queueNodeIp,state,queueToolType) values (?,?,?,?,?)";
                                QueueDb.mysqlParameter.common.params = [IndexGuid, queueNodeInfo, queueNodeIp, state, queueToolType];
                                QueueDb.mysqlParameter.common.callBack = function (err, success, insertId){
                                      
                                      if (err){
                                          console.dir(err); // Don't need a `conn.end`
                                          return false;
                                      }
                                      else{
                                          
                                          if(insertId!=undefined){
                                            console.log(success + '--MessageQueueIndex is Persist-insert as ID:' + IndexGuid);
                                          }
                                          return true;
                                      }
                                }
                                QueueDb.add();
                          }
                          
                          if(result!={}&&result['needDymaticTrafficShaping']===true)
                          {
                                QueueDb.mysqlParameter.common.sql = "insert into DymaticTrafficShaping (queueIndexGuid,maxSpeedRate, minSpeedRate,avergeSpeedRate,state,currentTotalDataSize,createTime,lastStartTime,lastEndTime) values (?,?,?,?,?,?,?,?,?)";
                                QueueDb.mysqlParameter.common.params = [IndexGuid, maxSpeedRate, minSpeedRate, avergeSpeedRate, state, currentTotalDataSize,createTime,lastStartTime,lastEndTime];
                                QueueDb.mysqlParameter.common.callBack = function (err, success, insertId){
                                    if (err) {
                                        console.dir(err); // Don't need a `conn.end`
                                        return false;
                                    }
                                    else {
                                      if(insertId!=undefined){
                                        console.log(success + '--DymaticTrafficShaping is Persist-insert as ID:' + IndexGuid);
                                      }
                                      return true;
                                    }
                                };
                                QueueDb.add();
                          }  


                    });         
              }

              //persist them into node db by update for the data both existed under Node DB & Node memory
              QueueDb.mysqlParameter.common.sql = "update DymaticTrafficShaping set maxSpeedRate=?, minSpeedRate=?,avergeSpeedRate=?,state=?,currentTotalDataSize=?,lastStartTime=?,lastEndTime=? where queueIndexGuid=?";
              QueueDb.mysqlParameter.common.params = [maxSpeedRate, minSpeedRate, avergeSpeedRate, state, currentTotalDataSize,lastStartTime,lastEndTime,IndexGuid];
              QueueDb.mysqlParameter.common.callBack = function (err, success, affectedRows)
              {
                    if (err) {
                      console.dir(err); // Don't need a `conn.end`
                      return false;
                    }
                    else 
                    {
                        if(affectedRows!=undefined)
                        {
                            console.log(success + '--MessageQueueIndex-DymaticTrafficShaping Persist affectedRows:' + affectedRows);
                            QueueDb.mysqlParameter.common.sql ="update MessageQueueIndex set state=?,queueNodeInfo=?,queueNodeIp=?,queueToolType=? where indexGuid=?";
                            QueueDb.mysqlParameter.common.params=[state,queueNodeInfo,queueNodeIp,queueToolType,IndexGuid];
                            QueueDb.mysqlParameter.common.callBack = function (err, success, affectedRows){
                              if (err) {
                                    console.dir(err); // Don't need a `conn.end`
                                    return false;
                              }else{
                                  console.log(success + '--MessageQueueIndex Persist affectedRows:' + affectedRows);
                                  return true;
                              }
                            };
                            QueueDb.update();
                        }     
                    }
              };
              QueueDb.update();
        }
    };

    this.QueueIndexPersistFromDataToMemory = function (){
         //loop all the queue existed in DB but not existed under current queue index pool,persist them into current queue index pool
         QueueDb.dbType='mysql';
         QueueDb.mysqlParameter.selectAll.tableName="MessageQueueIndex";
         QueueDb.mysqlParameter.selectAll.callBack=function(err, rows)
         {
 
             console.log('Begin to persist queue index from current node db')
             if(err)
             {
               console.log('Failed to persist queue index from current node db')
             }
             else
             {
                 for(let row of rows)
                 {
                   if(get(row.indexGuid)===undefined||get(row.indexGuid)===null){
                        
                        //persist Traffic shaping info from node db to index-queue  
                        QueueDb.mysqlParameter.select.tableName='DymaticTrafficShaping';
                        QueueDb.mysqlParameter.select.topNumber='1';
                        QueueDb.mysqlParameter.select.whereSql='where queueIndexGuid=?';
                        QueueDb.mysqlParameter.select.params=[row.indexGuid];
                        QueueDb.mysqlParameter.select.orderSql='';
                        QueueDb.mysqlParameter.select.callBack=function(err, rs)
                        {
                          if(err)
                          {
                            console.dir(err);  // Don't need a `conn.end`      
                          }
                          else
                          {
                             if(rs.length>0&&rs[0].queueIndexGuid!=undefined&&rs[0].queueIndexGuid!=null)
                             {
                                let queue= trafficShapingObj.queuePersistCreate(rs[0].queueIndexGuid);
                                queue.setMaxSpeedRate(rs[0].maxSpeedRate);
                                queue.setMinSpeedRate(rs[0].minSpeedRate);
                                queue.setAvergeSpeedRateFromOutSide(rs[0].avergeSpeedRate);
                                queue.setState(rs[0].state);
                                queue.setCurrentTotalDataSize(rs[0].currentTotalDataSize);
                                queue.setLastStartTimeSpan(rs[0].lastStartTime);
                                queue.setLastEndTimeSpan(rs[0].lastEndTime);
                                put(row.indexGuid,queue);
                             }
                          }
                            
                        };
                        QueueDb.select();         
                    }
                 }
             }
                  
         };
         QueueDb.selectAll();
    };

    //队列索引机制的请求入口
    this.queueIndexEntry=function(body,response,bestQueueIndex){
       
          //1.get the body's size   
          let currentBodyDataSize= messageCommon.GetByteAsObj(body); 
        
          //2.Attach the size into trafficSizeCount
          let trafficSizeCount=trafficShapingObj.getTrafficSizeCount();
          trafficSizeCount+=currentBodyDataSize;
          trafficShapingObj.setTrafficSizeCount(trafficSizeCount);

          //3.push body into best queue
          //trafficShapingObj.setQueueIndexDicObj(this);
          let currentBestIndexQueue=get(bestQueueIndex);
          indexQueueLazyCreate(currentBestIndexQueue,currentBodyDataSize,function(queue){
                  //如果当前currentBestIndexQueue与调indexQueueLazyCreate后得到的queue索引值不同，则请求直接进入(新)queue队列，同时为queue队列lazy create一个队列索引
                if(currentBestIndexQueue.getQueueIndexGuid()!=queue.getQueueIndexGuid())
                {
                        queueIndexLazyCreate(queue,function(result){
                        
                            if(result===true) //当前队列初次加入索引队列池成功，被新建队列索引调用 
                            { 
                              messagePromise.queueInterval=1000; //设置队列处理间隔
                              messageProcess.requestBodyQueueIndexGuid=queue.getQueueIndexGuid();
                              trafficShapingObj.setLastEntryDateTime(new Date());
                              MessageInsert(JSON.parse(body),messageProcess.requestBodyQueueIndexGuid); //persist req message under Node DB to anti interupt
                              queue.push(messagePromise.requestBodyPromiser,[[body,response,messageProcess.requestBodyQueueIndexGuid,trafficShapingObj.getQueueIndexDicObj()]]).then(messageProcess.requestBodyProcessor);
                                
                            }
                        });

                }else
                {
                  //如果当前currentBestIndexQueue与调indexQueueLazyCreate后得到的queue索引值相同，则请求直接进入currentBestIndexQueue队列
                    if(currentBestIndexQueue!=undefined&&currentBestIndexQueue!=null)  
                    {
                          messagePromise.queueInterval=1000; //设置队列处理间隔
                          messageProcess.requestBodyQueueIndexGuid=currentBestIndexQueue.getQueueIndexGuid();
                          trafficShapingObj.setLastEntryDateTime(new Date());
                          MessageInsert(JSON.parse(body),messageProcess.requestBodyQueueIndexGuid); //persist req message under Node DB to anti interupt
                          currentBestIndexQueue.push(messagePromise.requestBodyPromiser,[[body,response,messageProcess.requestBodyQueueIndexGuid,trafficShapingObj.getQueueIndexDicObj()]]).then(messageProcess.requestBodyProcessor);
                    }
                }
            
          }); //lazy create一个队列从当前索引队列池中
          

    };

    //Lazy create a freshest queue index during queue-index process
    this.queueIndexLazyCreate=queueIndexLazyCreate;
    function queueIndexLazyCreate(newQueue,funCallback){

         //随机设定lazy create一个队列索引的抗并发延迟时间。
        //require('deasync').sleep(messageCommon.GetRandomNum(1,conf.platformArch.QueueIndexMaxLazyCreateDelayTime)*1000);
        //判断当前节点的队列索引数是否超出约定额度
        if((GetCurrentQueueIndexDicLength()+1)>trafficShapingObj.getMaxQueueIndexNumOnCurrentNode())
        {
           console.log('当前节点的队列索引数将超出约定额度!请及时扩容以提升当前Unit性能');	 
           funCallback(true); //当作队列初次加入索引队列池成功，被流量整形+新建队列索引调用  
        }

        //判断当前队列是否已拥有队列索引,没有则加入队列索引池
        if(
          ((GetCurrentQueueIndexDicLength()+1)<=trafficShapingObj.getMaxQueueIndexNumOnCurrentNode())
            &&get(newQueue.getQueueIndexGuid())===undefined
          ){
             trafficShapingObj.getQueueIndexDicObj().put(newQueue.getQueueIndexGuid(),newQueue);//当前队列初次加入索引队列池成功，被流量整形+新建队列索引调用 
             funCallback(true);
          }
          else{
             funCallback(false);  //当前队列未成功加入队列索引
          }
    }

    //Lazy create a freshest Queue during queue-index process
    function indexQueueLazyCreate(currentBestIndexQueue,currentBodyDataSize,funCallback)
    {
         
					if(currentBestIndexQueue===null||currentBestIndexQueue===undefined)//如果队列未声明，new一个
					{ 
            funCallback(trafficShapingObj.singalQueueCreate());
          }
          else if(currentBestIndexQueue.getCurrentTotalDataSize()+currentBodyDataSize>trafficShapingObj.getEachQueueTrafficSize()) //如果当前队列增加新工作项后将超出流量整形范围，则开起一个新的队列
          {
            funCallback(trafficShapingObj.singalQueueCreate());
					}
					else if(currentBestIndexQueue.isStart()) //如果当前队列已经开启运行，new一个新队列
					{
            funCallback(trafficShapingObj.singalQueueCreate());
					}
					else if(currentBestIndexQueue.getLength()+1>trafficShapingObj.getEachQueueIndexItemNumber())//如果当前队列增加新工作项后将超负荷，则开起一个新的队列
          {
            funCallback(trafficShapingObj.singalQueueCreate());
					}
					else
					{          //要不然直接返回老队列
            funCallback(currentBestIndexQueue);
					}
    }

    //调取流量整形模块中的队列索引字典列表,获取当前最优队列索引
    //线程安全getBestQueue
    this.getBestQueueCrushSafe=function(callBack)
    {
          
     
      //promise safe
      var promiseTime=messageCommon.GetRandomNum(1,5);
      console.log('getBestQueueCrush will be executed in '+promiseTime+'s later')
      setTimeout(() => {
        getBestQueueCrush(callBack)
         }, promiseTime*1000);
     
      
    }
     //队列索引权重运算
    var getBestQueueCrush=function(callBack)
    {
      
      //声明索引最优权重值键值对map
      var BestQueueIndexMap={};
      var bestMaxSpeedRate=0;
      var bestMinSpeedRate=0;
      var bestAvergeSpeedRate=0;
      var bestCurrentTotalDataSize=conf.platformArch.ArchTrafficShapingKb*1024;//从一个流量整形byte数值起递减，取出当前队列索引中数据负荷最小的队列索引值。
      var bestIndexGuid="";
      
          //循环遍历当前队列索引--by node db or by memory or by both base on configed rules
          if(conf.platformArch.seekBestQueueIndexFromNodeMemory===true)//by node memory
          {
             for (var key in data) 
             {
                 //data[key]
                 //1.得到maxSpeedRate当前最大的队列索引值，初始化或为其最优权重值键值对map加值
                 if(data[key].getMaxSpeedRate()>=bestMaxSpeedRate){
                  BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,data[key].getQueueIndexGuid(),0);
                  bestMaxSpeedRate=data[key].getMaxSpeedRate();
                }
                //2.得到minSpeedRate当前最大的队列索引值，初始化或为其最优权重值键值对map加值
                if(data[key].getMinSpeedRate()>=bestMinSpeedRate){
                  BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,data[key].getQueueIndexGuid(),1);
                  bestMinSpeedRate=data[key].getMinSpeedRate();
                }
                if(data[key].getAvergeSpeedRate()>=bestAvergeSpeedRate){
                  BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,data[key].getQueueIndexGuid(),2);
                  bestAvergeSpeedRate=data[key].getAvergeSpeedRate();
                }
                //4.得到currentTotalDataSize当前最小的队列索引值，初始化或为其最优权重值键值对map加值
                if(data[key].getCurrentTotalDataSize()<bestCurrentTotalDataSize){
                  BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,data[key].getQueueIndexGuid(),3);
                  bestCurrentTotalDataSize=data[key].getCurrentTotalDataSize();
                }
                //5.得到state当前在不稳定值范围内的队列索引值，初始化获为其最优权重值键值对map减值 
                if(data[key].getState()>4){
                  BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,data[key].getQueueIndexGuid(),4);
                }
             }

                //外层从索引最优权重键值对map中获取最优队列索引
                let indexWeightTemp=0;
                    
                for(let k in BestQueueIndexMap){
                  
                  if(BestQueueIndexMap[k]>=indexWeightTemp){
                    indexWeightTemp=BestQueueIndexMap[k];
                    bestIndexGuid=k;
                  }
                }

          }


          if(conf.platformArch.seekBestQueueIndexFromNodeDb===true&&bestIndexGuid==="") //by node db
          {
                //var QueueDb= new QueueDbHelper();
                QueueDb.dbType='mysql';
                QueueDb.mysqlParameter.selectAll.tableName="DymaticTrafficShaping";
                QueueDb.mysqlParameter.selectAll.callBack=function(err, rows)
                {

                  console.log('seeked queue index TrafficShaping from current node db')
                  if(err){
                            
                              console.dir(err);  // Don't need a `conn.end`
                              return callBack(bestIndexGuid);
                        }
                    else{
                        //console.log('enter else')
                        for(let row of rows)
                        {
                          //1.得到maxSpeedRate当前最大的队列索引值，初始化或为其最优权重值键值对map加值
                          if(row.maxSpeedRate>=bestMaxSpeedRate){
                            BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,row.queueIndexGuid,0);
                            bestMaxSpeedRate=row.maxSpeedRate;
                          }
                          //2.得到minSpeedRate当前最大的队列索引值，初始化或为其最优权重值键值对map加值
                          if(row.minSpeedRate>=bestMinSpeedRate){
                            BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,row.queueIndexGuid,1);
                            bestMinSpeedRate=row.minSpeedRate;
                          }
                          //3.得到avergeSpeedRate当前最大的队列索引值，初始化或为其最优权重值键值对map加值
                          if(row.avergeSpeedRate>=bestAvergeSpeedRate){
                            BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,row.queueIndexGuid,2);
                            bestAvergeSpeedRate=row.avergeSpeedRate;
                          }
                          //4.得到currentTotalDataSize当前最小的队列索引值，初始化或为其最优权重值键值对map加值
                          if(row.currentTotalDataSize<bestCurrentTotalDataSize){
                            BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,row.queueIndexGuid,3);
                            bestCurrentTotalDataSize=row.currentTotalDataSize;
                          }
                          //5.得到state当前在不稳定值范围内的队列索引值，初始化获为其最优权重值键值对map减值 
                          if(row.state>4){
                            BestQueueIndexMap=queueIndexWeightUp(BestQueueIndexMap,row.queueIndexGuid,4);
                          }
                        }
                    }
                    
                    //外层从索引最优权重键值对map中获取最优队列索引
                    let indexWeightTemp=0;
                  
                    for(let k in BestQueueIndexMap){
                      
                      if(BestQueueIndexMap[k]>=indexWeightTemp){
                        indexWeightTemp=BestQueueIndexMap[k];
                        bestIndexGuid=k;
                      }
                    }
                    
                    //return callBack(bestIndexGuid);

                };
                QueueDb.selectAll();
          }

          return callBack(bestIndexGuid);

      }



      //记权函数
      var queueIndexWeightUp=function(BestQueueIndexMap,queueIndexGuid,ruleNum){

        if(BestQueueIndexMap[queueIndexGuid]===undefined)
        {
              if(ruleNum===4)
              {
                BestQueueIndexMap[queueIndexGuid]=-1; //abnormal state queue should lost weight score here
              }
              else
              {
                BestQueueIndexMap[queueIndexGuid]=1;
              }
    
        }
        else
        {
              if(ruleNum===4)
              {
                BestQueueIndexMap[queueIndexGuid]--; //abnormal state queue should lost weight score here
              }else
              {
                BestQueueIndexMap[queueIndexGuid]++;
              }
        }
   
        switch(ruleNum){
              case 0:
                 if(lastBestHitQIndexCube.lastMaxSpeedRateQIndex!=""){
                  BestQueueIndexMap[lastBestHitQIndexCube.lastMaxSpeedRateQIndex]--; //基于规则，减去前一个最优选的权重(好的里挑更好)
                 }
   
                  lastBestHitQIndexCube.lastMaxSpeedRateQIndex=queueIndexGuid; //基于规则，登记一个新的最优选
              break;
   
              case 1:
                 if(lastBestHitQIndexCube.lastMinSpeedRateQIndex!=""){
                  BestQueueIndexMap[lastBestHitQIndexCube.lastMinSpeedRateQIndex]--;
                 }
   
                 lastBestHitQIndexCube.lastMinSpeedRateQIndex=queueIndexGuid;
              break;
   
              case 2:
                  if(lastBestHitQIndexCube.lastAvergeSpeedRateQIndex!=""){
                   BestQueueIndexMap[lastBestHitQIndexCube.lastAvergeSpeedRateQIndex]--;
                 }
   
                 lastBestHitQIndexCube.lastAvergeSpeedRateQIndex=queueIndexGuid;
              break;
   
              case 3:
                 if(lastBestHitQIndexCube.lastCurrentTotalDataSizeQIndex!=""){
                 BestQueueIndexMap[lastBestHitQIndexCube.lastCurrentTotalDataSizeQIndex]--;
                 }
   
                 lastBestHitQIndexCube.lastCurrentTotalDataSizeQIndex=queueIndexGuid;
              break;
   
              case 4:
                 /* if(lastBestHitQIndexCube.lastStatusQIndex!=""){
                 BestQueueIndexMap[lastBestHitQIndexCube.lastStatusQIndex]++; //基于规则，增加前一个最差选的权重。(差的里挑最好)
                 }
                 */
                 lastBestHitQIndexCube.lastStatusQIndex=queueIndexGuid; //基于规则，登记最后一个非正常状态queue的key
              break;
            }   
   
       return BestQueueIndexMap;
    }

  }
})();

module.exports=QueueIndexDic;
 