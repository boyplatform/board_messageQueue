'use strict'
var validator=require('validator');
var uuid= require('node-uuid');
 
var QueueValidator=(function(){
    
    
    
    
    return function() {
         
        this.InputValidator=function(body,router){
            
            let validatorResult=[];
            switch(router)
            {
              case '/':
                //结构验证
                if(body.messageAction===undefined||body.messageActionType===undefined||body.messageActionToolType===undefined||body.messageActionStatement===undefined)
                {
                    validatorResult.push({RequestResponseId:uuid.v4(),Result:false,Description:'报文结构错误,请检查核对!'})
                }else{
                    validatorResult.push({Result:true});
                }
                break;
              case '/readMe':
                //结构验证
                if(body.type===undefined)
                {
                    validatorResult.push({RequestResponseId:uuid.v4(),Result:false,Description:'报文结构错误,请检查核对!'})
                }else{
                    validatorResult.push({Result:true});
                }
                break;

            }

            return validatorResult[0];
        }


    
    }
})();

module.exports=QueueValidator;