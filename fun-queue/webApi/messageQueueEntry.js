//import section
var express= require('express');
var app=express();
var bodyParser = require('body-parser');
var http=require('http');
var Queue = require('../');
var q = Queue.Q; //内置的Promise，仿Q的API
var QueueDbHelper= require('../src/messageQueueDBHelper.js');
var mQIndex=require('../src/messageQueueIndex.js');
var queueIndexDicObj=new mQIndex();

var mQDymaticTrafficShaping=require('../src/messageQueueDymaticTrafficShaping.js');
var TrafficShapingObj=new mQDymaticTrafficShaping();

var QueueValidation=require('../src/messageQueueValidation.js');
var QueueValidationObj=new QueueValidation();

var messageCommon=require('../src/messageQueueCommon.js');
var conf=require('../src/config.js');



//install midware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


//Programe Entry
var server=app.listen(8080,function(){
 
     console.log('Intelligent Index boy-messageQueue is running on current crystal node at:'+(new Date()).toLocaleString());
       
     //依赖注入
     TrafficShapingObj.setQueueIndexDicObj(queueIndexDicObj);
     queueIndexDicObj.setTrafficShapingObj(TrafficShapingObj);
     //-----------打开队列索引守护线程---------------------------
     //--节点队列索引+流量整形Node DB持久化--
     messageCommon.setDeamonThreadJob(queueIndexDicObj.QueueIndexPersistFromMemoryToData,conf.platformArch.DeamonThreadSecRate.ForQueueIndex);//定时执行时间单位为“秒”
     //--队列消息持久化--
     if(conf.platformArch.WhetherDoMessagePersistDuringCurrentNodeRunning){  //判断是否进行队列消息的运行时持久化
        //运行时队列消息持久化
        queueIndexDicObj.MesssageExecutionPersist();
        messageCommon.setDeamonThreadJob(queueIndexDicObj.MesssageExecutionPersist,(conf.platformArch.DeamonThreadSecRate.ForMessagePersist+conf.platformArch.defaultHttpReqTimeOut/1000+conf.platformArch.QueueDefaultExecuteSec+conf.platformArch.QueueItemTimeOut)*10);//定时执行时间单位为“秒”
     }else{
        //启动时队列消息持久化
        queueIndexDicObj.MesssageExecutionPersist();
     }
     //--节点队列索引+流量整形内存持久化--
     queueIndexDicObj.QueueIndexPersistFromDataToMemory();//启动时初始化NODE DB中残存的索引队列

     //--节点索引队列强制执行守护线程--
     messageCommon.setDeamonThreadJob(TrafficShapingObj.loopRunQueueAsPerDefinedExecuteLeaseTime,conf.platformArch.DeamonThreadSecRate.ForTrafficShaping);//定时执行时间单位为“秒”,定时执行符合"强制执行时限条件"的未启动队列
     
     //--节点队列索引GAC守护线程--
     messageCommon.setDeamonThreadJob(queueIndexDicObj.QueueIndexGAC,conf.platformArch.DeamonThreadSecRate.ForQueueIndexGAC);//定时执行时间单位为“秒”

})


app.post('/',async function(req,res){

       //入口参数验证
       let validationRs=await QueueValidationObj.InputValidator(req.body,'/');
       if(validationRs.Result===false){
          
            res.end(JSON.stringify(validationRs));
            return;
       }
       
       //进入执行入口
        if(req.body!=null&&req.body!=undefined){
           mainEntry(JSON.stringify(req.body),res);
        }
})

//readme api
app.post('/readMe',async function(req,res){
    
        //入口参数验证
       let validationRs=await QueueValidationObj.InputValidator(req.body,'/readMe');
       if(validationRs.Result===false){
          
            res.end(JSON.stringify(validationRs));
            return;
       } 

       //进入执行入口
        let jsonBody=req.body; 
        switch(jsonBody.type.toString()){
             case 'mem':
                res.end(JSON.stringify(messageCommon.getCurrentNodeMem()));
                break;
             case 'battery':
                res.end(JSON.stringify(messageCommon.getCurrentNodeBattery()));
                break;
             case 'crystalCluster':
                messageCommon.getCurrentCrystalCluster(res);
                break;
             default:
                res.end('Wrong Command type!Please double check your command.')
        }
   

})

//teachKnowledgeAPI



//learnKnowledgeAPI(take&pull)


//platformOpsIncretionAPI


//modilityFriendSensorAPI--verify,add,remove,weightSetting,role&task allocation vote for cluster/friend node

//modilityKnowSelfBadAPI--get bad report from cluster/friend node 




function mainEntry (body,response) 
{    

        var commonMessageQueueResult={
            status:false,
            msg:""
        };

        

         //res may need input into deep level module,if use select queue
         //队列索引  
        function QueueIndexProcess(callback){  
           
               queueIndexDicObj.getBestQueueCrushSafe(function(bestIndexGuid){
            
                    console.log("Current best Index guid:"+bestIndexGuid)
                if(bestIndexGuid!=null && bestIndexGuid!='' && typeof(bestIndexGuid)!='undefined'){
                        
                    queueIndexDicObj.queueIndexEntry(body,response,bestIndexGuid);
                        
                    console.log('Req go to index-queue successfully base on existing queue-index!');
                    return true;
                }
                else
                {
                   return callback();
                }
                 
              
          
            }) 
           
         }
        
         //流量整形
         function TrafficShapingProcess(){

            console.log("TrafficShaping is started")
            if(TrafficShapingObj.trafficShapingEntry(body,response)){
                        
                console.log('Req go to TrafficShaping queue successfully');
                return true;
            }else{

                return false;
            }
         }
         
         //启动队列处理流程
         if(QueueIndexProcess(TrafficShapingProcess)===false){

            commonMessageQueueResult.msg="Req was failed to be processed in messageQueue.";
                                        
            response.end(JSON.stringify(commonMessageQueueResult));     
     


         }
         
     
  
}