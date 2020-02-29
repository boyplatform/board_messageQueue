const interfaces=require('os').networkInterfaces();
const QueueHttpHelper=require('../src/messageQueueHttpHelper.js')
var conf = require("./config");

//获取当前服务节点公网/域内IP
var getCurrentServerIpAdress=function(){
  let IPAdress='';
  for(var devName in interfaces){
      var iface=interfaces[devName];
      for(var i=0;i<iface.length;i++){
          var alias=iface[i];
          if(alias.family === 'IPv4' && alias.address!=='127.0.0.1'&& !alias.internal){

          	IPAdress=alias.address;
          }

      }

  }

  if(IPAdress!=='')
  {
  	return IPAdress;

  }else{

  	return '127.0.0.1';
  }

}


//获取当前服务节点内网IP
var getCurrentServerLocalIpAdress=function(){
    let IPAdress='';
    for(var devName in interfaces){
        var iface=interfaces[devName];
        for(var i=0;i<iface.length;i++){
            var alias=iface[i];
            if(alias.family === 'IPv4' && alias.address!=='127.0.0.1'&& alias.internal===true){

              IPAdress=alias.address;
            }

        }

    }

    if(IPAdress!=='')
    {
      return IPAdress;

    }else{

      return '127.0.0.1';
    }
}


//设置定时执行的守护线程
var setDeamonThreadJob=function(fun,intervalSeconds){
   setInterval(fun,intervalSeconds*1000,"Deamon Thread was started for function:"+fun.toString());
}


//获取随机数
var GetRandomNum=function(Min,Max){

     var Range=Max-Min;
     var Rand=Math.random();
     return (Min+Math.round(Rand*Range));

}

//判断当前字符串的存储容量为多少byte
var GetByteAsObj=function(str)
{
     var bf=new Buffer(str);
     return bf.length;
}

//判断当前字符串的存储容量为多少KB
var GetKBAsObj=function(str)
{
    return GetByteAsObj(str)/1024;
}

//判断当前字符串的存储容量为多少MB
var GetMBAsObj=function(str)
{
  return GetKBAsObj(str)/1024;
}

//时间戳转yyyy-MM-dd hh:mm:ss
var GetFormatDateFromTimeSpan=function(timeSpan){
     var date=new Date(timeSpan);
     var year=date.getFullYear();
     var month=date.getMonth()+1;
     var day=date.getDate();
     var hour=date.getHours();
     var minute=date.getMinutes();
     var sec=date.getSeconds();
     month=month<10? "0"+month:month;
     day=day<10? "0"+day:day;
     return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+sec;
}

//生成唯一标识符时加的timespan后缀
var GetUUIDTimeSpan=function(timeSpan){
    var date=new Date(timeSpan);
    var year=date.getFullYear();
    var month=date.getMonth()+1;
    var day=date.getDate();
    var hour=date.getHours();
    var minute=date.getMinutes();
    var sec=date.getSeconds();
    month=month<10? "0"+month:month;
    day=day<10? "0"+day:day;
    return year+month+day+hour+minute+sec;
}

//对象深拷贝
var deepCloneObject=function(src)
{
       var dest={};
       if(src===null)
       {
         return null;
       }
       for(var key in src){
           if(typeof src ==="object"){
             dest[key]=deepCloneObject(src[key]);
           }else{
             dest[key]=src[key];
           }
       }

      return dest;
}

//获取节点内存
var getCurrentNodeMem=function(){

     var mem=process.memoryUsage();
     var format=function(bytes){

         return (bytes/1024/1024).toFixed(2);
     };//format to MB
     var rs={
         totalHeap:format(mem.heapTotal),
         usedHeap:format(mem.heapUsed),
         totalForCurrentProcess:format(mem.rss),
         totalOnV8EngineUsing:format(mem.external),
         usedMemRate:((format(mem.heapUsed)/format(mem.heapTotal)).toFixed(2)*100)+"%"

     };

     return rs;
}

//获取节点电池信息
var getCurrentNodeBattery=function(){
    let battery=Navigator.battery||Navigator.webkitBattery||Navigator.mozBattery;
    var rs={
        isPlugin:battery.charging,
        batteryLevel:battery.level,
        batteryUsedTime:battery.dischargingTime
    };

    return rs;    
}

//获取crystal cluster中所有节点的性能信息
var getCurrentCrystalCluster=async function(resp){
   
   let Rs={};
   
   for(let ip in conf.platformArch.crystalCluster){
     var httpType="http";
     var domainUrl=conf.platformArch.crystalCluster[ip];
     var partialUrl="/readMe";
     var qs=""
     var timeout=conf.platformArch.defaultHttpReqTimeOut;
     var body={
               'type':'mem'  
              };
     let res=await QueueHttpHelper.apiSimpleRequest(httpType,domainUrl,partialUrl,qs,body,timeout);
     Rs[ip]=res;
   }
   //console.log(Rs);
   resp.end(JSON.stringify(Rs));
 
}
 


exports.getCurrentServerIpAdress=getCurrentServerIpAdress;
exports.getCurrentServerLocalIpAdress=getCurrentServerLocalIpAdress;
exports.setDeamonThreadJob=setDeamonThreadJob;
exports.GetRandomNum=GetRandomNum;
exports.GetByteAsObj=GetByteAsObj;
exports.GetKBAsObj=GetKBAsObj;
exports.GetMBAsObj=GetMBAsObj;
exports.GetFormatDateFromTimeSpan=GetFormatDateFromTimeSpan;
exports.deepCloneObject=deepCloneObject;
exports.getCurrentNodeMem=getCurrentNodeMem;
exports.getCurrentNodeBattery=getCurrentNodeBattery;
exports.getCurrentCrystalCluster=getCurrentCrystalCluster;
exports.GetUUIDTimeSpan=GetUUIDTimeSpan;
