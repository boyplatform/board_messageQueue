# messageQueue
messageQueue,One repo of boy distribute modality platform. Support timeout, retry,queue index,trafficshaping,queue index persist,trafficshaping persist,message persist and so on.


#license policy
"license": "MPL(Mozilla Public License2.0)"
"comments": "Any unauthoritied using risk won't be charged to current platform developper-boybian. Meanwhile,thanks each every person who pushed this platform to be built"

#Why messageQueue
1.If you want to anti request concurrency for your platform's database node, you can use this micro-service role.
2.If you want to anti request concurrency for one third party web-api for your platform, you can use this micro-service role.
3.If you want to anti request concurrency for your IOT device sensor's DLL API(or any third party DLL API), you can use this micro-service role and deploy it with your IOT lower computer.
4.If you want to anti request concurrency for memory of boyplatform, you can use this micro-service role.
5.If you want to anti request concurrency for diskFile of boyplatform, you can use this micro-service role.

#Current bussiness DB type supported by this micro-service role
MySql,MSSQL


#如何使用[how to use]
1.首先请在你将部署本微服务的容器/虚拟机/IOT下位机中配置安装nodejs环境以及mysql，mysql将作为该微服务的localDB用于微服务运行数据与逻辑数据的存储与处理。
1.First of all, Please install nodejs environment and mysql into the container/virtual machine/IOT lower computer which you want to deploy this micro-service to, the mysql will be used as current micro-service's localDB to store and process operation data & logical data of current micro-service node.

2.接下来请在部署目标容器/虚拟机/IOT下位机中的mysql上运行repo中mysql localDB的初始化脚本。
2.Then, Please run the sql script under current github repo to init mysql localDB's structure on your deployment-target service container/virtual machine/ IOT lower computer .

3.如果你想在开发环境中调试本微服务，你可手动复制整个项目到测试使用的容器/虚拟机/IOT下位机中,同时根据你项目的实际情况配置src中的config文件，运行npm install初始化依赖模块后进入webApi目录并运行node messageQueueEntry.js启动整个微服务。
   如果你想在生产环境中使用本微服务并且你拥有一个devops团队，你可将预部署的容器/虚拟机/IOT下位机 IP及端口配置到ansible的主机清单中，同时为src的config文件制作一个ansible jinjia2的模板并把常用配置参数配在ansible的var中，最后为你的部署目标服务器写一个playbook，在playbook最后的任务里进入webApi目录并运行node messageQueueEntry.js启动整个微服务，最后把该部署动作整合到你jenkins的deployment pipeline中。
   如果你需要负载均衡以及更安全的内外网服务器分离，你可以将ansible主机清单中的终端IP配置给一台nginx服务作为集群的反向代理服务出口。
3.If you want to debug or try this micro-service on your dev environment,you can copy entire project to your deployment-target service container/virtual machine/ IOT lower computer，meanwhile config the config file under src folder per your actual project's requirements,then run 'npm install' to init node modules and go into webApi folder and run 'node messageQueueEntry.js' to lauch the mirco-service.
   If you want to use this micro-service on your prod environment and you have a devops team,you can put your pre deploy service container/virtual machine/ IOT lower computer’s IP into ansible inventory host file, meanwhile prepare an ansible jinjia2 template for the config file under src and prepare its config-var under ansible var, then you can prepare a playbook to deploy it to your deployment-target services,at last task of the playbook you can go into webApi folder and run 'node messageQueueEntry.js' to lauch the mirco-service.
   At last,you can integrate this deployment action into your Jenkins deployment pipeline.
   If you need load-balance and isolate interal and external network for your security, you can config the terminal IPs of your ansible inventory into a nginx service and let it be exit of your messageQueue cluster.
   
4.如果你想调试这个微服务的整套restful API，可使用fiddler尝试运行如下报文。
4.If you want to debug this micro-service's restful API,you can use fiddler to run below post message to related API.
 
  
  (1)通过该队列调用第三方数据库服务器并进行操作：
  (1)operation third party database via this messageQueue:
  
  ---- 用于调用MSSQL(For MSSQL) ----
  
    POST http://127.0.0.1:8080/ HTTP/1.1
	User-Agent: Fiddler
	Host: 127.0.0.1:8080
	Content-Length: 476
	content-type: application/json
	
	
  --增(Add)
    body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"0",
	  "messageActionStatement":{
		 "dbType":"mssql",
		 "op":"add", 
		 "targetTable":"Student",
		 "parameterObj":{"stuName":"tester001"},
		 "whereSql":"",
		 "originalSql":"",
		 "dbConfig":{
		   "user": "sa",
		   "password": "xxxxxxxx",
		   "server": "B4E62ROkd-29j",
		   "database": "PerformanceTest",
		   "port": 2048,
		   "options":{
				  "encrypt": false
					},
		   "pool":{
			 "min":"0",
			 "max":"300",
			 "idleTimeoutMillis": "3000" 
		   }
		 }
	  }

	}
	
	--更新(update)
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"0",
	  "messageActionStatement":{
		 "dbType":"mssql",
		 "op":"update", 
		 "targetTable":"Student",
		 "parameterObj":{"stuName":"tester000"},
		 "whereSql":{"stuID":3},
		 "originalSql":"",
		 "dbConfig":{
		   "user": "sa",
		   "password": "xxxxxxxx",
		   "server": "B4E62ROkd-29j",
		   "database": "PerformanceTest",
		   "port": 2048,
		   "options":{
				  "encrypt": false
					},
		   "pool":{
			 "min":"0",
			 "max":"300",
			 "idleTimeoutMillis": "3000" 
		   }
		 }
	  }

	}
	
	--删除(delete)
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"0",
	  "messageActionStatement":{
		 "dbType":"mssql",
		 "op":"delete", 
		 "targetTable":"Student",
		 "parameterObj":{"stuID":2},
		 "whereSql":"where stuID=@stuID",
		 "originalSql":"",
		 "dbConfig":{
		   "user": "sa",
		   "password": "xxxxxxxx",
		   "server": "B4E62ROkd-29j",
		   "database": "PerformanceTest",
		   "port": 2048,
		   "options":{
				  "encrypt": false
					},
		   "pool":{
			 "min":"0",
			 "max":"300",
			 "idleTimeoutMillis": "3000" 
		   }
		 }
	  }

	}
	
	或者(Or)
	
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"0",
	  "messageActionStatement":{
		 "dbType":"mssql",
		 "op":"delete", 
		 "targetTable":"",
		 "parameterObj":{"stuID":2},
		 "whereSql":"",
		 "originalSql":"delete from Student where stuID=@stuID",
		 "dbConfig":{
		   "user": "sa",
		   "password": "xxxxxxxx",
		   "server": "B4E62ROkd-29j",
		   "database": "PerformanceTest",
		   "port": 2048,
		   "options":{
				  "encrypt": false
					},
		   "pool":{
			 "min":"0",
			 "max":"300",
			 "idleTimeoutMillis": "3000" 
		   }
		 }
	  }

	}
	
	--调用存储过程(SP)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"0",
	  "messageActionStatement":{
		 "dbType":"mssql",
		 "op":"sp", 
		 "targetSP":"testAddStudent",
		 "paramsFormat":"@stuName,@outPutRs",
		 "parameterObj":{"stuName":"test002","outPutRs":"0"},
		 "dbConfig":{
		   "user": "sa",
		   "password": "xxxxxxxx",
		   "server": "B4E62ROkd-29j",
		   "database": "PerformanceTest",
		   "port": 2048,
		   "options":{
				  "encrypt": false
					},
		   "pool":{
			 "min":"0",
			 "max":"300",
			 "idleTimeoutMillis": "3000" 
		   }
		 }
	  }

	}
	
	--查询(Select)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"0",
	  "messageActionStatement":{
		 "dbType":"mssql",
		 "op":"select", 
		 "targetTable":"Student",
		 "topNumber":"5",
		 "whereSql":"where stuID<@stuID1",
		 "parameterObj":{"stuID1":15},
		 "orderSql":"order by stuID desc",
		 "dbConfig":{
		   "user": "sa",
		   "password": "xxxxxxxx",
		   "server": "B4E62ROkd-29j",
		   "database": "PerformanceTest",
		   "port": 2048,
		   "options":{
				  "encrypt": false
					},
		   "pool":{
			 "min":"0",
			 "max":"300",
			 "idleTimeoutMillis": "3000" 
		   }
		 }
	  }

	}
	
	---- 用于调用MySql(For MySql) ----  
	POST http://127.0.0.1:8080/ HTTP/1.1
	User-Agent: Fiddler
	Host: 127.0.0.1:8080
	Content-Length: 476
	content-type: application/json
	
	--增(Add)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"1",
	  "messageActionStatement":{
			 "dbType":"mysql",
			 "op":"add", 
			 "targetTable":"student",
			 "columnOrSetString":"stuName",
			 "whereSql":"",
			 "originalSql":"",
			 "params":["test001"],
			 "dbConf":{
			   "dbConfig":{
				  "host": "127.0.0.1",
				  "user": "root",
				  "port": 3306,
				  "password":"xxxxxxxx",
				  "database": "test"
			   },
			   "onError":null,
			   "customError": null,
			   "timeout": 20,
			   "debug": false
			 }
	  }
	}
	
	--更新(update)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"1",
	  "messageActionStatement":{
			 "dbType":"mysql",
			 "op":"update", 
			 "targetTable":"student",
			 "columnOrSetString":"stuName=?",
			 "whereSql":"where stuID=?",
			 "originalSql":"",
			 "params":["test001#updated",2470],
			 "dbConf":{
			   "dbConfig":{
				  "host": "127.0.0.1",
				  "user": "root",
				  "port": 3306,
				  "password":"xxxxxxxx",
				  "database": "test"
			   },
			   "onError":null,
			   "customError": null,
			   "timeout": 20,
			   "debug": false
			 }
	  }
	}
	
	--按条件删除(Delete by condition)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"1",
	  "messageActionStatement":{
			 "dbType":"mysql",
			 "op":"delete", 
			 "targetTable":"student",
			 "columnOrSetString":"",
			 "whereSql":"where stuID=?",
			 "originalSql":"",
			 "params":[2471],
			 "dbConf":{
			   "dbConfig":{
				  "host": "127.0.0.1",
				  "user": "root",
				  "port": 3306,
				  "password":"xxxxxxxx",
				  "database": "test"
			   },
			   "onError":null,
			   "customError": null,
			   "timeout": 20,
			   "debug": false
			 }
	  }
	}
	
	--删除全部(Delete All)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"1",
	  "messageActionStatement":{
			 "dbType":"mysql",
			 "op":"delete", 
			 "targetTable":"student",
			 "columnOrSetString":"",
			 "whereSql":"where stuID<>''",
			 "originalSql":"",
			 "params":[""],
			 "dbConf":{
			   "dbConfig":{
				  "host": "127.0.0.1",
				  "user": "root",
				  "port": 3306,
				  "password":"xxxxxxxx",
				  "database": "test"
			   },
			   "onError":null,
			   "customError": null,
			   "timeout": 20,
			   "debug": false
			 }
	  }
	}
	
	--调用存储过程(SP)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"1",
	  "messageActionStatement":{
			 "dbType":"mysql",
			 "op":"sp", 
			 "targetSP":"testAddStudent",
			 "paramsFormat":"?",
			 "whereSql":"",
			 "originalSql":"",
			 "params":["test002"],
			 "dbConf":{
			   "dbConfig":{
				  "host": "127.0.0.1",
				  "user": "root",
				  "port": 3306,
				  "password":"xxxxxxxx",
				  "database": "test"
			   },
			   "onError":null,
			   "customError": null,
			   "timeout": 20,
			   "debug": false
			 }
	  }
	}
	
	--查询(Select)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"0",
	  "messageActionToolType":"1",
	  "messageActionStatement":{
			 "dbType":"mysql",
			 "op":"select", 
			 "targetTable":"student",
			 "topNum":"3",
			 "whereSql":"where stuID<?",
			 "orderSql":"order by stuID desc",
			 "params":[2471],
			 "dbConf":{
			   "dbConfig":{
				  "host": "127.0.0.1",
				  "user": "root",
				  "port": 3306,
				  "password":"xxxxxxxx",
				  "database": "test"
			   },
			   "onError":null,
			   "customError": null,
			   "timeout": 20,
			   "debug": false
			 }
	  }
	}
	
	(2)通过该队列调用第三方WebApi或Dll Api：
    (2)Invoke third party WebApi/Dll Api via this messageQueue:
	 ---- 调用第三方WebApi(Invoke third party webApi) ----
	    POST http://127.0.0.1:8080/ HTTP/1.1
		User-Agent: Fiddler
		Host: 127.0.0.1:8080
		Content-Length: 31
		content-type: application/json 
		
		--Get访问(invoke by get)-- 
		body message:
		{
		  "messageAction":"0",
		  "messageActionType":"3",
		  "messageActionToolType":"6",
		  "messageActionStatement":{
			  "domainUrl":"r.qzone.qq.com",
			  "partialUrl":"/cgi-bin/user/cgi_personal_card",
			  "qs":{"uin":"12345","key":"testKey"},
			  "timeout":"3000",
			  "body":false
		   }
		  
		}
		
		--Post访问(invoke by post)--
		body message:
		{
		  "messageAction":"0",
		  "messageActionType":"3",
		  "messageActionToolType":"6",
		  "messageActionStatement":{
			  "domainUrl":"r.qzone.qq.com",
			  "partialUrl":"/cgi-bin/user/cgi_personal_card",
			  "qs":{},
			  "timeout":"3000",
			  "body":{"key":"true"}
		   }
		  
		}
	---- 调用第三方Dll(Invoke third party Dll) ----
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"4",
	  "messageActionToolType":"7",
	  "messageActionStatement":{
			   "dllName":"helloworld.dll",
			   "methodName":"helloworld",
			   "methodIOParameterFormat":"['int', ['int']]",
			   "methodIOParameterStr":"(1)"
	   }
	  
	}
	
    (3)通过该队列调用平台下的memory微服务的restful API：
    (3)Invoke restful API of boyplatform's memory mirco-service repo via this messageQueue:
	---- 写入缓存(set mem) ----
	User-Agent: Fiddler
	Host: 127.0.0.1:8080
	Content-Length: 31
	content-type: application/json
	
	--(diskData区块验证模式)blockVerify
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"2",
	  "messageActionToolType":"4",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "body":
		  {
			  "messageAction":"write",
			  "targetDbName":"test",
			  "writeSql":"insert into student(stuName) values (#stuName)",
			  "writeSqlParameter":{"#stuName":"'test057'"},
			  "blockVerifyOrNot":true,
			  "reqStorageClusterDbType":0  // 0=For mysql diskData cluster; 1=For mssql diskData cluster

		  },
		  "timeout":"3000",
		  "op":"5"
	   }
	  
	}
    
	--(diskData非区块验证模式)Non-blockVerify
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"2",
	  "messageActionToolType":"4",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "body":
		  {
			  "messageAction":"write",
			  "targetDbName":"test",
			  "writeSql":"insert into student(stuName) values (#stuName)",
			  "writeSqlParameter":{"#stuName":"'test057'"},
			  "blockVerifyOrNot":false,
			  "reqStorageClusterDbType":0  // 0=For mysql diskData cluster; 1=For mssql diskData cluster

		  },
		  "timeout":"3000",
		  "op":"5"
	   }
	  
	}
	
	---- 读取缓存(get mem) ----
	User-Agent: Fiddler
	Host: 127.0.0.1:8080
	Content-Length: 31
	content-type: application/json
	
	body message:
	 {
		  "messageAction":"0",
		  "messageActionType":"2",
		  "messageActionToolType":"4",
		  "messageActionStatement":{
			  "qs":{},
			  "body":
			  {
				 "messageAction":"read",
				 "targetDbName":"test",
				 "keyObjName":"student",
				 "keyObjType":"2",
				 "cacheGenMethod":"3",
				 "ttl":"100",
				 "querySql":"select stuName from student where stuName='#stuName'",
				 "querySqlParameter":{"#stuName":"test057"},
			     "reqStorageClusterDbType":0  // 0=For mysql diskData cluster; 1=For mssql diskData cluster 

			  },
			  "timeout":"3000",
			  "op":"6"
		   }
		  
	 }
	 
    (4)通过该队列调用平台下的diskFile微服务的restful API：
    (4)Invoke restful API of boyplatform's diskFile mirco-service repo via this messageQueue:
	---- 调用diskFile的API(Invoke diskFile's restful API) ----
	User-Agent: Fiddler
	Host: 127.0.0.1:8080
	Content-Length: 31
	content-type: application/json
	
	--增加文件类型(diskFile addDocType)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{

	    "op":"12",
	    "diskFileUrl":"www.boydiskfile.com",
		"docTypeName":"For test APP groups2",
		"docTypeDesc":"test2",
		"maxFileSize":10 ,
		"fileShareFolder":"target/uploadFileCache/",
		"comment":"test comment2",
		"isActive":true

		}
  
    }
	
	--查询文件类型(diskFile seekDocType)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{

			"op":"13",
			"diskFileUrl":"www.boydiskfile.com"    
		}
  
    }
	
	--增加文件扩展名(diskFile addFileExt)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{

			"op":"14",
			"fileExtName":"xml",
			"diskFileUrl":"www.boydiskfile.com"  
		}
  
	}
	
	--查询文件扩展名(diskFile seekFileExt)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{

			"op":"15", 
			"diskFileUrl":"www.boydiskfile.com"  
		}
	  
	}
	
	--增加文件类型与扩展名关系(diskFile addDocTypeFileExtRelation)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{

			"op":"16",
		"docTypeId":"21",
		"fileExtID":"22",
			"diskFileUrl":"www.boydiskfile.com" //option
		}
  
	}
	
	--查询文件类型与扩展名关系(diskFile seekDocTypeFileExtRelation)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{

			"op":"17",
			"diskFileUrl":"www.boydiskfile.com" //option 
		 
		}
  
	}
	
	--ceph集群挂载(diskFile mount)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "username":"",
		  "monIp":"",
		  "userKey":"",
		  "mountPath":"",
		  "timeout":"3000",
		  "op":"7"
	   }
	  
	}
	
	--ceph集群文件获取(diskFile cat)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "userGuid":"",
		  "docTypeId":"",
		  "platformfileExtID":"",
		  "fileName":"",
		  "catType":"download",
		  "isBig":"0",
		  "timeout":"3000",
		  "op":"9"
	   }
  
	}

	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "userGuid":"",
		  "docTypeId":"",
		  "platformfileExtID":"",
		  "fileName":"",
		  "catType":"seekCached",
		  "isBig":"0",
		  "timeout":"3000",
		  "op":"9"
	   }
	  
	}

	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "userGuid":"",
		  "docTypeId":"",
		  "platformfileExtID":"",
		  "fileName":"",
		  "catType":"getStaticUrl",
		  "isBig":"0",
		  "timeout":"3000",
		  "op":"9"
	   }
	  
	}

	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "userGuid":"",
		  "docTypeId":"",
		  "platformfileExtID":"",
		  "fileName":"",
		  "catType":"redirectToStaticUrl",
		  "isBig":"0",
		  "timeout":"3000",
		  "op":"9"
	   }
	  
	}
	
	--ceph集群文件删除(diskFile rm)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "userGuid":"",
		  "fileName":"",
		  "platformfileExtID":"",
		  "docTypeId":"",
		  "timeout":"3000",
		  "op":"11"
	   }
	  
	}
	
	--ceph集群文件重命名(diskFile rename)--
	body message:
	{
	  "messageAction":"0",
	  "messageActionType":"1",
	  "messageActionToolType":"3",
	  "messageActionStatement":{
		  
		  "qs":{},
		  "userGuid":"",
		  "oldFileName":"",
		  "newFileName":"",
		  "platformfileExtID":"",
		  "docTypeId":"",
		  "timeout":"3000",
		  "op":"10"
	   }
	  
	}
	