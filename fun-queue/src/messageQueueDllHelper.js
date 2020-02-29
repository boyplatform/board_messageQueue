'use strict'
var conf = require("./config");
const path = require('path');
let ffi = require('ffi');

function MessageQueueDllHelper(){
   
   
};

MessageQueueDllHelper.prototype.constructor=MessageQueueDllHelper;

MessageQueueDllHelper.prototype.dllInvoker=function(dllPath,dllName,methodName,methodIOParameterFormat,methodIOParameterStr,callback){
    let currentDll = path.join(dllPath,dllName);
    let methodName=methodName.toString();
    let dll= ffi.Library(currentDll,{
        methodName:methodIOParameterFormat
    });
    
    if(dll){
        eval('dll.'+methodName+methodIOParameterStr);
        callback(true);
    }else{
        callback(false);
    }
};

module.exports=MessageQueueDllHelper;