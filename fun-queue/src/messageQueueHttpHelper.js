'use strict'

const lodash= require('lodash');
const debug= require('debug');
const promiseRequest= require('request-promise-native');

const {name}=require('../package');

const dbg= tag =>debug('${name}:${tag}');

const debg=dbg('utils');

module.exports.createErrMandatory= param=>'Required parameter: ${param}';

//Abstract the parameters addition to the url request, optsAllowed=opts allowed to be optional url query parameter for each third party web API funtion
module.exports.buildQs = (qs,url,opsTypeValidMap,optsAllowed, opts={})=>{
   
    lodash.each(opts,(value,objkey)=>{
          //Drop non valid parameters 
          if(optsAllowed.indexOf(objkey)!== -1){
                lodash.each(opsTypeValidMap,(v,k)=>{

                        if(lodash.includes(k,objkey))
                        {
                            //optional parameter selection
                            if(typeof value!==v){
                                throw new Error(validTypeName+"expected:${objkey}");
                            }
                        }      

                });
                
                qs[objkey] = value;
          }
    });

    return qs;
};

//Here makes get or post request to the third party web api
module.exports.apiRequest= async (apiSection,domainName,partialUrl,qs,timeout,body,httpType,funCallback)=>{
            
         debg('passed args',{
                apiSection,
                domainName,
                partialUrl,
                qs,
                timeout,
                body,
                httpType,
            });

            const config={
                uri:httpType+"://"+apiSection+"."+domainName+partialUrl,
                json: true,
                qs,
                timeout: timeout || 5000,
            };

            let method ='get';

            if(!qs.key){

                throw new Error('You must provide a valid　Api key');
            }

            // In case of post a request
            if(body){
                method='post';
                config.body=body;
            }

            debg('Making the http request',{method,config});
            
            let res;
            try{
                res= await promiseRequest[method](config);
            }catch(err){
                //throw new Error('request.${method}: ${err.message}');
                console.dir(err.message); 
            }

            //in maintenance
            if(/maintenance/.exec(res)){

                throw new Error('Your request API is undergoing maintenance');
            }

            //console.log(res);
            funCallback(res);

};

module.exports.apiSimpleRequest= async (httpType,domainUrl,partialUrl,qs,body,timeout)=>{

    debg('passed args',{
        domainUrl,
        partialUrl,
        qs,
        timeout,
        body,
        httpType,
    });

    const config={
        uri:httpType+"://"+domainUrl+partialUrl,
        json: true,
        qs,
        timeout: timeout || 5000,
    };
    let method ='get';

    if(body){
        config.headers={"content-type":"application/json"};
        method='post';
        config.body=body;
    }

    debg('Making the http request',{method,config});

    let res;
    try{
        res= await promiseRequest[method](config);
        //console.log(res);
        //funCallback(domainUrl,res);
    }catch(err){
        //throw new Error('request.${method}: ${err.message}');
        console.dir(err.message); 
    }

    if(/Wrong/.exec(res)){

        throw new Error('Wrong Command type!Please double check your command.');
    }
   
    return res;
    
}

//application/json
module.exports.apiSimpleRequestWithCallBack= async (httpType,domainUrl,partialUrl,qs,body,timeout,callback)=>{

    debg('passed args',{
        domainUrl,
        partialUrl,
        qs,
        timeout,
        body,
        httpType,
    });

    const config={
        uri:httpType+"://"+domainUrl+partialUrl,
        json: true,
        qs,
        timeout: timeout || 5000,
    };
    let method ='get';

    if(body){
        config.headers={"content-type":"application/json"};
        method='post';
        config.body=body;
    }

    debg('Making the http request',{method,config});

    let res;
    try{
        res= await promiseRequest[method](config);
        //console.log(res);
        //funCallback(domainUrl,res);
    }catch(err){
        //throw new Error('request.${method}: ${err.message}');
        console.dir(err.message); 
    }

    if(/Wrong/.exec(res)){

        throw new Error('Wrong Command type!Please double check your command.');
    }
   
    callback(res);
    
}

module.exports.apiSimpleRequestWithCallBackAndForwardUrl= async (forwardUrl,qs,form,body,contentType,timeout,callback)=>{

    debg('passed args',{
        forwardUrl,
        qs,
        timeout,
        body,
        form 
    });

    const config={
        uri:forwardUrl,
        json: true,
        qs,
        timeout: timeout || 5000,
    };
    let method ='get';
    config.headers={"content-type":contentType};
    
    if(body){
      
        method='post';
        //application/json
        config.body=body;
       
    }

    if(form){
        method='post';
        //application/x-www-form-urlencoded
        config.form=form;
    }

    debg('Making the http request',{method,config});

    let res;
    try{
        res= await promiseRequest[method](config);
        //console.log(res);
        //funCallback(domainUrl,res);
    }catch(err){
        //throw new Error('request.${method}: ${err.message}');
        console.dir(err.message); 
    }

    if(/Wrong/.exec(res)){

        throw new Error('Wrong Command type!Please double check your command.');
    }
   
    callback(res);
    
}

 