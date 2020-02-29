//import head
var Queue = require('../');
var q = Queue.Q; //内置的Promise，仿Q的API

//export vars setting
var queueInterval=1000;

//从队列中定时取出请求obj的方法
var requestBodyPromiser= function (reqObj){
	var deferred = q.defer();
	setTimeout(function(){
		if(reqObj=="Qerr"){
			deferred.reject(new Error("err is " + i))
		}else{
			deferred.resolve(reqObj)
		}
	},queueInterval)
	return deferred.promise;
}



exports.requestBodyPromiser=requestBodyPromiser;
exports.queueInterval=queueInterval;