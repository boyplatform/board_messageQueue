var utils = require("./utils");
var uuid= require('node-uuid');
var messageCommon=require('../src/messageQueueCommon.js');
var conf=require('../src/config.js');

function use(Promise){
	var _Promise;
	setPromise(Promise);

	var ONERROR = function(err){
		console.error(err);
	};

	/**
	 * 运行函数，使其始终返回promise对像
	 * @param {function} fn 
	 * @return {Promise}
	 */
	var runFn = function(fn){
		return utils.runFn2Promise(_Promise,fn);
	}

	/**
	 * 设置内部使用的Promise
	 * @param {Promise} Promise 
	 */
	function setPromise(Promise){
		_Promise = Queue.Q = Queue.Promise = utils.extendPromise(Promise);
	};
	
	/**
	 * 队列类
	 * @param {Number} max 队列最大并行数
	 * @param {Number} options 队列其他配置
	 */
	function Queue(max,options) {
		var self = this;

		var def = {
			"queueStart"  : null     //队列开始
			,"queueEnd"   : null     //队列完成
			,"workAdd"    : null     //有执行项添加进执行单元后执行
			,"workResolve": null     //成功
			,"workReject" : null     //失败
			,"workFinally": null     //一个执行单元结束后
			,"retry"      : 0        //执行单元出错重试次数
			,"retryIsJump": false    //重试模式 false:搁置执行(插入队列尾部重试),true:优先执行 (插入队列头部重试)
			,"timeout"    : 0        //执行单元超时时间(毫秒)
		}
        

		var _queue = [];
		var _max = utils.getPositiveInt(max);
		var _runCount = 0;
		var _isStart = false;
		var _isStop = 0;
		//--Add in dymatic traffic shaping vars --added by boy--
		var _queueIndexGuid="";
        var _maxSpeedRate=0;    //单项处理最大速率=Max(单项容量/(单项处理开始时间-单项处理结束时间))
        var _minSpeedRate=conf.platformArch.ArchTrafficShapingKb*1024;    //单项处理最小速率=Min(单项容量/(单项处理开始时间-单项处理结束时间))
        var _avergeSpeedRate=0;  //整队列平均速率=当前队列总数据量/(整队列开始时间-整队列结束时间)
        var _state=0; //队列状态
        var _currentTotalDataSize=0;//当前队列总数据流量
        var _startTime=null; //整队列开始时间
		var _endTime=null; //整队列结束时间
		var _QueueCmdResponseSet={}//当前队列所有的响应结果集map
		var _totalCountWhenStart=0; //当队列开始时的总工作项数。
		var _lastStartTimeSpan=null; //当前队列的最后一次启动时间戳--用于队列GAC
		var _lastEndTimeSpan=null;//当前队列的最后一次结束时间戳--用于队列GAC
        //--Add in dymatic traffic shaping vars --added by boy--

		this._options = def
		this.onError = ONERROR;

		if(utils.isObject(options)){
			for(var i in options){
				if(def.hasOwnProperty(i)) def[i] = options[i]
			}
		}


		//--Add in dymatic traffic shaping vars' set,get method--added by boy--
		this.getQueueIndexGuid= function(){
			return _queueIndexGuid;
		}
		this.setQueueIndexGuid= function(){
			_queueIndexGuid=uuid.v1()+'-'+messageCommon.GetUUIDTimeSpan(Date.now());
		}

		this.setQueueIndexGuidFromOutSide= function(IndexGuid){
			_queueIndexGuid=IndexGuid;
		}


		this.getMaxSpeedRate = function(){
			return _maxSpeedRate;
		}
        this.setMaxSpeedRate = function(compareSpeedRate){
        	
        	if(compareSpeedRate>_maxSpeedRate){
				_maxSpeedRate=compareSpeedRate;
		 	}
		}

		this.getMinSpeedRate = function(){
			return _minSpeedRate;
		}
        
        this.setMinSpeedRate= function(compareSpeedRate){
			
			if(compareSpeedRate<_minSpeedRate) //_minSpeedRate初始值为最大的trafficShaping流量设定值转byte
			{
				_minSpeedRate=compareSpeedRate;
			}

		}


		this.getAvergeSpeedRate = function(){

			return _avergeSpeedRate;
		}
        this.setAvergeSpeedRate = function(){

        	_avergeSpeedRate=(this.getCurrentTotalDataSize()/(this.getEndTime()-this.getStartTime()));
		}
		this.setAvergeSpeedRateFromOutSide= function(NewAvergeSpeedRate){

        	_avergeSpeedRate=NewAvergeSpeedRate;
        }


		this.getState = function(){
			return _state;
		}
		this.setState = function(state){

			 _state=state;
		}

		this.getCurrentTotalDataSize = function(){

			return _currentTotalDataSize;
		}
		this.setCurrentTotalDataSize = function(trafficSizeCount){

			_currentTotalDataSize=trafficSizeCount;//messageCommon.GetByteAsObj(_queue)//(new Blob(this)).size;
		}



		this.getStartTime= function(){
			return _startTime;
		}
		 
        this.setStartTime= function(){
        	_startTime=process.uptime()*1000;
        }


		this.getEndTime = function()
		{
			return _endTime;
		}		 

        this.setEndTime = function(){
			_endTime=process.uptime()*1000;
			this.setAvergeSpeedRate();
        }

		this.getLastEntireQueueDuration = function()
		{
			return (_startTime-_endTime);
		}

		this.setIntoQueueCmdResponseSet=function(CmdResponse){
			
			_QueueCmdResponseSet[new Date().toLocaleString()]=CmdResponse;
		}
		this.getQueueCmdResponseSet=function(){
			return _QueueCmdResponseSet;
		}
		this.clearQueueCmdResponseSet=function(){
			_QueueCmdResponseSet={};
		}
		this.setTotalCountWhenStart=function(totalCountWhenStart){
			_totalCountWhenStart=totalCountWhenStart;
		}
		this.getTotalCountWhenStart=function(){
			return _totalCountWhenStart;
		}
		this.clearTotalCountWhenStart=function(){
			_totalCountWhenStart=0;
		}

		this.setLastStartTimeSpan=function(inputTimeSpan=new Date(messageCommon.GetFormatDateFromTimeSpan(Date.now()))){   //用于队列GAC
			//console.log(inputTimeSpan);
			_lastStartTimeSpan=inputTimeSpan;
		}
		this.getLastStartTimeSpan=function(){  //用于队列GAC

			return _lastStartTimeSpan;
		}

		this.setLastEndTimeSpan=function(inputTimeSpan=new Date(messageCommon.GetFormatDateFromTimeSpan(Date.now()))){  //用于队列GAC
			//console.log(inputTimeSpan);
			_lastEndTimeSpan=inputTimeSpan;
		}
		this.getLastEndTimeSpan=function(){ //用于队列GAC
 
			return _lastEndTimeSpan;
		}
	  //--Add in dymatic traffic shaping vars' get method--added by boy--
	  
		//最大并行数
		this.getMax = function(){
			return _max;
		}
		this.setMax = function(max){
			try{
				_max = utils.getPositiveInt(max);
				if(!_isStop && _runCount) self.start();
			}catch(e){
				onError.call(self,e)
			}
		}
		//正在排队的项数
		this.getLength = function(){
			return _queue.length;
		}
		//正在运行的项数
		this.getRunCount = function(){
			return _runCount;
		}
		//队列是否已开始运行
		this.isStart = function(){
			return !!_isStart;
		}

		/**
		 * 向队列插入执行单元
		 * @param {queueUnit} unit 执行单元对像
		 * @param {bool} stack  是否以栈模式(后进先出)插入
		 * @param {bool} start  是否启动队列
		 * @param {bool} noAdd  是否调用队列workAdd方法 (重试模式不调用需要)
		 */
		this._addItem = function(unit,stack,start,noAdd){
			if(!(unit instanceof QueueUnit)) throw new TypeError('"unit" is not QueueUnit')
			if(stack){
				_queue.unshift(unit);
			}else{
				_queue.push(unit);
			}
			noAdd || runAddEvent.call(self,unit);
			if(start){
				self.start();
			}else{
				_isStart && queueRun();
			}
		}
		
		//执行下一项
		function next(){
			if(_runCount < _max && !_isStop && _queue.length > 0){
				var unit = _queue.shift()
				//if(unit){
					var xc_timeout
						,_mark=0
					var timeout = +getOption('timeout',unit,self)
						,retryNo = getOption('retry',unit,self)
						,retryType = getOption('retryIsJump',unit,self)
						,_self = unit._options.self
					var fix = function(){
						if(xc_timeout) clearTimeout(xc_timeout)
						xc_timeout = 0;
						if(_mark++) return true;
						_runCount--;
					}



					var afinally = function(){
						autoRun(unit,self,'workFinally',self,self,unit)
						// if(runEvent.call(unit,'workFinally',self,self,unit) !== false){
						// 	onoff && runEvent.call(self,'workFinally',self,self,unit);
						// }
					}

					var issucc = function(data){
						if(fix()) return;
						unit.defer.resolve(data);  //通知执行单元,成功
						autoRun(unit,self,'workResolve',self,data,self,unit)
						// if(runEvent.call(unit,'workResolve',self,data,self,unit) !== false){
						// 	onoff && runEvent.call(self,'workResolve',self,data,self,unit);
						// }
						afinally();
					}

					var iserr = function(err){
						if(fix()) return;
						if(retryNo > unit._errNo++){
							self._addItem(unit,retryType,true,false)
						}else{
							unit.defer.reject(err);  //通知执行单元,失败
							autoRun(unit,self,'workReject',self,err,self,unit)
							// if(runEvent.call(unit,'workReject',self,err,self,unit) !== false){
							// 	onoff && runEvent.call(self,'workReject',self,err,self,unit);
							// }
						}
						afinally();			
					};

					//队列开始执行事件
					if(_runCount == 0 && !_isStart){
						_isStart = true;
						runEvent.call(self,'queueStart',self,self);
					}

					var nextp = runFn(function(){
						return unit.fn.apply((_self || null),unit.regs)
					}).then(issucc,iserr).then(function(){
						if(_queue.length>0){
							queueRun();
						}else if(_runCount == 0 && _isStart){//队列结束执行事件
							_isStart = false;
							runEvent.call(self,'queueEnd',self,self);
							 
						}
					});
					_runCount += 1;
					//nextp.then(defer.resolve,defer.reject)
					if(timeout > 0){
						xc_timeout = setTimeout(function(){
							iserr("timeout")
						},timeout)
					}
					//return;
				//}
				return;
			}
			return true;
		}

		function queueRun(){
			while(!next()){}
			// if(_isStop) return;
			// do{
			// 	next();
			// }while(_queue.length && _runCount < _max)
		}
		/**队列控制**/
		
		//开始执行队列
		this.start = function(){
			_isStop = 0;
			queueRun();
		}

		this.stop = function(){
			//console.log('on stop')
			_isStop = 1;
		}
		
		//清空执行队列
		this.clear = function(err){
			while(_queue.length){
				var unit = _queue.shift();
				unit.defer.reject(err);
			}
		}
	}

	/**
	 * 队列执行单元类
	 * @param {Function} fn  运行函数
	 * @param {Array}    args 运行函数的参数,可省略
	 * @param {Object}   options 其他配置
	 */
	function QueueUnit(fn, args, options){
		var def = {
			'workResolve' : true
			,'workReject' : true
			,'workFinally' : true
			,'queueEventTrigger' : true
			,'regs':[]
			,'self':null
		}
		var oNames = [
			'workResolve'    //是否执行队列workResolve事件
			,'workReject'    //是否执行队列workReject事件
			,'workFinally'   //是否执行队列workFinally事件
			,'queueEventTrigger'    //队列事件开关
			,'retry'                //重试次数
			,'retryIsJump'           //重试模式
			,'timeout'              //超时
			,'self'                 //运行函数self
		];
		var oi = 1;
		if(!utils.isFunction(fn)){
			throw new TypeError("Queues only support function, '" + fn + "' is not function")
		}
		this.fn = fn;
		this._errNo = 0;
		this.defer = _Promise.defer();
		if(utils.isArray(args)){
			this.regs = args;
			oi++;
		}

		function inOptions(name){
			for(var i = 0; i<oNames.length; i++){
				if(name === oNames[i]) return true;
			}
			return false;
		}

		this._options = def;
		var configObj = arguments[oi];
		//console.log(configObj);
		if(utils.isObject(configObj)){
			for(var i in configObj){
				if(inOptions(i)){
					def[i] = configObj[i];
				}
			}
		}
	}

	function getOption(name,qobj,queue){
		if(name in qobj._options){
			return qobj._options[name];
		}else{
			return queue._options[name];
		}
	}

	function runEvent(eventName,self){
		var event = this._options[eventName]
			,arg = utils.arg2arr(arguments,2);
		if(utils.isFunction(event)){
			try{
				return event.apply(self,arg)
			}catch(e){
				onError.call(self,e);
			}
		}else{
			return !!event;
		}
	}

	function autoRun(unit,queue){
		var onoff = unit._options.queueEventTrigger;
		var args = utils.arg2arr(arguments,2);
		if(runEvent.apply(unit,args) !== false){
			onoff && runEvent.apply(queue,args);
		}
	}

	function runAddEvent(unit){
		runEvent.call(this,'workAdd',this,unit,this);
	}

	//构建执行单元对象
	function getQueueUnit(fn,args,options){
		// try{
			return new QueueUnit(fn,args,options);
		// }catch(e){
		// 	if(utils.isFunction(this.onError)){
		// 		this.onError(e)
		// 	}
		// }
	}

	function onError(err){
		if(utils.isFunction(this.onError)){
			this.onError.call(this,err)
		}
	}

	function getAddArgs(data,fn,con,each){
		var isArray = utils.isArray(data);
		var rdata  = isArray ? [] : {};
		function fill(k){
			var args = each ? utils.toArray([data[k]],[k],[data]) : utils.toArray(data[k]);
			rdata[k] = [fn,args,con];
		}
		if(isArray){
			for(var i=0; i<data.length; i++){
				fill(i);
			}
		}else{
			for(var k in data){
				fill(k);
			}
		}
		return rdata;
	}

	function getBatchArgs(array,fn,con){
		var baseN = 2,_con,start,jump;
		if(utils.isObject(con)){
			_con = con;
			baseN++;
		}
		return {
			con : _con,
			start : arguments[baseN],
			jump : arguments[++baseN]
		}
	}

	function AddBatch(data,fn){
		var queue = this.queue
			,map = this.map
			,each = this.each
		var addArgs;
		var args = getBatchArgs.apply(null,arguments)
		addArgs = getAddArgs(data,fn,args.con,each)
		if(map){
			return queue.addProps(addArgs,args.start,args.jump);
		}else{
			return queue.addArray(addArgs,args.start,args.jump);
		}
	}

    //定义QUEUE类的动态对象函数
	Queue.prototype = {
		//获取/设置配置
		option: function(name){
			if(arguments.length == 1){
				return this._options[name];
			}else if(arguments.length > 1){
				this._options[name] = arguments[1]
			}
		}
		
		//向队列尾部增加执行项,若队列未启动，暂时不会被执行
		,'push' : function(){ 
			var o = this , unit = getQueueUnit.apply(o,arguments);
			o._addItem(unit,false);
			return unit.defer.promise;
		}
		//向队列头部增加执行项,若队列未启动，暂时不会被执行
		,'unshift': function(){
			var o = this , unit = getQueueUnit.apply(o,arguments);
			o._addItem(unit,true);
			return unit.defer.promise;
		}
		//添加执行项，并会启动队列
		,go: function(){
			var o = this , unit = getQueueUnit.apply(o,arguments);
			o._addItem(unit,false,true);
			return unit.defer.promise;
		}
		//在队列头部插入并执行项
		,jump: function(){
			var o = this , unit = getQueueUnit.apply(o,arguments);
			o._addItem(unit,true,true);
			return unit.defer.promise;
		}
		,add: function(fn,options){//fn,*options*,*start*,*jump*
			var o = this, _fun, _i = 1, unitArgs, start, jump, promise;
			if(!utils.isFunction(fn)) throw new TypeError("Queues only support function, '" + fn + "' is not function")
			_fun = function(){
				var defer = _Promise.defer();
				fn(defer.resolve,defer.reject);
				return defer.promise
			}
			unitArgs = [_fun]
			if(utils.isObject(options)){
				unitArgs.push(options);
				_i++;
			}
			start = !!arguments[_i]
			jump = !!arguments[_i+1];
			promise = jump ? o.unshift.apply(o,unitArgs) : o.push.apply(o,unitArgs);
			if(start) o.start();
			return promise;
		}
		,addArray: function(array,start,jump){
			var parrs = [];
			var o = this;
			for(var i = 0;i<array.length;i++){
				+function(){
					var _i = i;
					var unitArgs = utils.toArray(array[_i]);
					var _p = jump ? o.unshift.apply(o,unitArgs) : o.push.apply(o,unitArgs);
					parrs.push(_p);
				}()
			}
			var nextP = _Promise.defer();
			_Promise.all(parrs).then(function(data){nextP.resolve(data)},function(err){nextP.reject(err)})
			if(start) o.start();
			return nextP.promise;
		}
		,addProps: function(props,start,jump){
			var parrs = {};
			var o = this;
			for(var k in props){
				+function(){
					var _k = k;
					var unitArgs = utils.toArray(props[_k]);
					var _p = jump ? o.unshift.apply(o,unitArgs) : o.push.apply(o,unitArgs);
					parrs[_k] = _p;
				}()
			}
			var nextP = _Promise.defer();
			_Promise.allMap(parrs).then(function(data){nextP.resolve(data)},function(err){nextP.reject(err)})
			if(start) o.start();
			return nextP.promise;
		}
		,addLikeArray: function(array,fn,con){
			return AddBatch.apply({queue:this},arguments);
		}
		,addLikeProps: function(props,fn,con){
			return AddBatch.apply({queue:this,map:true},arguments);
		}
		,addLikeArrayEach: function(array,fn,con){
			return AddBatch.apply({queue:this,each:true},arguments);
		}
		,addLikePropsEach: function(array,fn,con){
			return AddBatch.apply({queue:this,each:true,map:true},arguments);
		}
	};

	Queue.use = setPromise;
	Queue.createUse = use;
	return Queue;
};

module.exports = use;