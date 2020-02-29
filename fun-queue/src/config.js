var mssqlConf = {
    user: 'sa',
    password: 'whoisboy',
    server: 'B4E62ROkd-29j',
    database: 'PerformanceTest',
    port: 2048,
    options: {
    encrypt: false // Use this if you're on Windows Azure=true
    }, 
    pool: {
        min: 0,
        max: 300,
        idleTimeoutMillis: 3000
    }
};

var mysqlConf = {

     dbConfig:{
        host: '127.0.0.1',
        user: 'root',
        port: 3306,
        password:'whoisboy',
        database: 'board_messagequeue'

     },
     onError: function(err){
        console.dir(err);
     },
     customError: null,
     timeout: 300,
     debug: false
};

var platformArch= {
    HttpMode:"http",
    QueueIndexGACTTL:128, //sec      //set after the queue's stoped for how much time, we need to delete it on current node.
    ArchTrafficShapingKb:3,    //TrafficShaping size--trafficshaping execute condition setting (by kb)
    EachQueueCapacity:15,       //each queue's capacity--capacity execute condition setting
    QueueDefaultExecuteSec:5,     //mandatory execute seconds--mandatory execute condition setting,if there is some define under node DB,then prefer to the Node DB define as first level and prefer to the platform define as second level.
    QueueParalleProcessingNum:5,  //each queue's paralle processing work item number
    QueueItemApproveErrorTimes:3,
    QueueItemTimeOut:30, //sec
    QueueMaxExtensionLiveTime:3,    //set the max queue extension live sec to define when need remove one index queue once it has been done successfully for anti high concurrency.
    MaxQueueIndexNumOnCurrentNode:100,  //set max queue index number for current node
    QueueIndexMaxLazyCreateDelayTime:2,      //set max QueueIndexCreateDelayTime to anti high concurrency during queueIndexLazyCreate
    WhetherDoMessagePersistDuringCurrentNodeRunning:true,
    DeamonThreadSecRate:{   
       ForQueueIndex:5, //sec
       ForTrafficShaping:3, //sec
       ForMessagePersist:15, //sec
       ForQueueIndexGAC:30 //sec queue GAC looping time

    },
    isKeepQueueIndexOnNodeAfterExecute:true, //whether keep the queue index on Node Db after the queue has been executed successfully
    DymaticTrafficShapingStatus:{         //the traffic shaping status number which map to the same under node DB
         inactive:0,
         actived:1,
         starting:2,
         running:3,
         success:4,
         failed:5,
         terminated:6,
         restart:7,
         nodeWait:8,
         onhold:9,
         onIce:10
     },
     MessageStatus:{
      entered:0,
      processing:1,
      success:2,
      failed:3,
      blocking:4
     },
     seekBestQueueIndexFromNodeDb:true,    //Seek the best queue index from Node DB
     seekBestQueueIndexFromNodeMemory:true, //Seek the best queue index from current Node memory,if both above and current was opened as 'true',then the server will seek from memory as first level and seek from Node DB as second level
     crystalCluster:{
        ip1:'127.0.0.1:8080',
        ip2:'127.0.0.1:8080',
        ip3:'127.0.0.1:8080',
        ip4:'127.0.0.1:8080'
     },
     defaultHttpReqTimeOut:5000,
     eachLoopPersistMessageNum:100,    //Define how many message will be persist to be executed during each deamon thread loop.
     memoryUrl:"www.boyMemory.com",
     memoryPartialUrl:"/memData",
     diskFileUrl:"www.boydiskfile.com",
     diskFilePartialUrl:"/DiskFile/CephEntry",
     diskFileBoundKey:"acebdf13572468",
     thirdPartyDllPath:"../thirdPartyDll/" 
};

exports.mssqlConfig = mssqlConf;
exports.mysqlConfig = mysqlConf;
exports.platformArch=platformArch;