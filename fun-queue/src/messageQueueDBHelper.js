//Global Portal DBHelper for MessageQueue
var MysqlHelper= require('./mysql_dbhelper');
var mysqlServer=new MysqlHelper();

var MSSqlHelper= require('./mssql_dbhelper');
var mssqlServer= new MSSqlHelper();

var conf = require("./config");

var QueueDbHelper=function(){

         this.mysqlParameter={

            common:{
               sql:'', 
               params:[""], 
               callBack:null,
               dbConf:conf.mysqlConfig //set for internal node DB invoking
      
            },
            select:{
               tableName:'', 
               topNumber:'', 
               whereSql:'', 
               params:[""], 
               orderSql:'', 
               callBack:null,
               dbConf:null
      
            },
            selectAll:{
      
               tableName:'',
               callBack:null,
               dbConf:null
      
            },
            del:{
               whereSql:'', 
               params:[""], 
               tableName:'', 
               callBack:null,
               dbConf:null
      
            },
            executeSP:{
               spName:'',
               paramsFormat:'',
               params:[""],
               callBack:null,
               dbConf:null
   
            }

      };
      
      this.mssqlParameter={
         common:{
               sql:'', 
               params:'', 
               callBack:null,
               dbConf:null
      
            },
         add:{
            addObj:'', 
            tableName:'', 
            callBack:null,
            dbConf:null
      
         },
         select:{
            tableName:'',
            topNumber:'', 
            whereSql:'',
            params:'', 
            orderSql:'', 
            callBack:null,
            dbConf:null
      
         },
         selectAll:{
      
            tableName:'',
            callBack:null,
            dbConf:null
         },
         update:
         {
            updateObj:'',
            whereObj:'', 
            tableName:'', 
            callBack:null,
            dbConf:null
      
         },
         del:
         {
            whereSql:'',
            params:'', 
            tableName:'', 
            callBack:null,
            dbConf:null
      
         },
         firstRow:
         {
            tableName:'', 
            whereSql:'', 
            params:'', 
            orderSql:'', 
            callBack:null,
            dbConf:null
      
         },
         executeSP:{
            spName:'',
            paramsFormat:'',
            params:'',
            callBack:null,
            dbConf:null

         }
      };
      
      
      
      this.dbType='mysql';

            //verify db type and do action
      this.add = function(){

         switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            mysqlServer.add(this.mysqlParameter.common.sql,this.mysqlParameter.common.params,this.mysqlParameter.common.callBack);
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.add.dbConf!=null&&this.mssqlParameter.add.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.add.dbConf);
            }
            mssqlServer.add(this.mssqlParameter.add.addObj,this.mssqlParameter.add.tableName,this.mssqlParameter.add.callBack);
            break;
         }     

      };



      this.del= function(){

         switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection(); 
            mysqlServer.del(this.mysqlParameter.del.whereSql,this.mysqlParameter.del.params,this.mysqlParameter.del.tableName,this.mysqlParameter.del.callBack);
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.del.dbConf!=null&&this.mssqlParameter.del.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.del.dbConf);
            }
            mssqlServer.del(this.mssqlParameter.del.whereSql,this.mssqlParameter.del.params,this.mssqlParameter.del.tableName,this.mssqlParameter.del.callBack);
            break;
         }     
      };


      this.delAsDefinedSql=function(){

         switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection(); 
            mysqlServer.delAsDefinedSql(this.mysqlParameter.common.sql,this.mysqlParameter.common.params,this.mysqlParameter.common.callBack);
            break;
            
            case 'mssql':
            if(this.mssqlParameter.common.dbConf!=null&&this.mssqlParameter.common.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.common.dbConf);
            }
            mssqlServer.delAsDefinedSql(this.mssqlParameter.common.sql,this.mssqlParameter.common.params,this.mssqlParameter.common.callBack);
            break;
         }     

      };


      this.update =function(){

         switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            mysqlServer.update(this.mysqlParameter.common.sql,this.mysqlParameter.common.params,this.mysqlParameter.common.callBack);
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.update.dbConf!=null&&this.mssqlParameter.update.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.update.dbConf);
            }
            mssqlServer.update(this.mssqlParameter.update.updateObj,this.mssqlParameter.update.whereObj,this.mssqlParameter.update.tableName,this.mssqlParameter.update.callBack);
            break;
         }  
      };


      this.querySql=function(){

         switch(this.dbType)
         {
            case 'mysql':
               //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            mysqlServer.querySql(this.mysqlParameter.common.sql,this.mysqlParameter.common.params,this.mysqlParameter.common.callBack);
            break;

            case 'mssql':
               //外部连接注入
            if(this.mssqlParameter.common.dbConf!=null&&this.mssqlParameter.common.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.common.dbConf);
            }
            mssqlServer.querySql(this.mssqlParameter.common.sql,this.mssqlParameter.common.params,this.mssqlParameter.common.callBack);
            break;


         }

      };


      this.select=function(){
      switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            mysqlServer.select(this.mysqlParameter.select.tableName,this.mysqlParameter.select.topNumber,this.mysqlParameter.select.whereSql,this.mysqlParameter.select.params,this.mysqlParameter.select.orderSql,this.mysqlParameter.select.callBack);
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.select.dbConf!=null&&this.mssqlParameter.select.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.select.dbConf);
            }
            mssqlServer.select(this.mssqlParameter.select.tableName,this.mssqlParameter.select.topNumber,this.mssqlParameter.select.whereSql,this.mssqlParameter.select.params,this.mssqlParameter.select.orderSql,this.mssqlParameter.select.callBack);
            break;
         }
      };

      this.selectAll=function(){
      switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            mysqlServer.selectAll(this.mysqlParameter.selectAll.tableName,this.mysqlParameter.selectAll.callBack);
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.selectAll.dbConf!=null&&this.mssqlParameter.selectAll.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.selectAll.dbConf);
            }
            mssqlServer.selectAll(this.mssqlParameter.selectAll.tableName,this.mssqlParameter.selectAll.callBack);
            break;
         }
      };


      this.firstRow=function()
      {
      switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            mysqlServer.firstRow(this.mysqlParameter.common.sql,this.mysqlParameter.common.params,this.mysqlParameter.common.callBack);
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.firstRow.dbConf!=null&&this.mssqlParameter.firstRow.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.firstRow.dbConf);
            }
            mssqlServer.firstRow(this.mssqlParameter.firstRow.tableName,this.mssqlParameter.firstRow.whereSql,this.mssqlParameter.firstRow.params,this.mssqlParameter.firstRow.orderSql,this.mssqlParameter.firstRow.callBack);
            break;
         }

      };


      this.scalar=function()
      {
         switch(this.dbType)
            {
               case 'mysql':
               //外部连接注入
               if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
               {
                     mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
               }
               mysqlServer.getConnection();
               mysqlServer.scalar(this.mysqlParameter.common.sql,this.mysqlParameter.common.params,this.mysqlParameter.common.callBack);
               break;
         
            }

      };

      this.SpExecute=function(){
         
         switch(this.dbType)
         {
            case 'mysql':
            //外部连接注入
            if(this.mysqlParameter.common.dbConf!=null&&this.mysqlParameter.common.dbConf!="")
            {
                  mysqlServer.setConnectionFromOutSide(this.mysqlParameter.common.dbConf);
            }
            mysqlServer.getConnection();
            //execute invoke
            mysqlServer.executeSP(this.mysqlParameter.executeSP.spName,
                                  this.mysqlParameter.executeSP.paramsFormat,
                                  this.mysqlParameter.executeSP.params,
                                  this.mysqlParameter.executeSP.callBack
                                  );
            break;

            case 'mssql':
            //外部连接注入
            if(this.mssqlParameter.common.dbConf!=null&&this.mssqlParameter.common.dbConf!="")
            {
                  mssqlServer.setConnectionFromOutSide(this.mssqlParameter.common.dbConf);
            }
            //execute invoke
            mssqlServer.executeSP(this.mssqlParameter.executeSP.spName,
                                  this.mssqlParameter.executeSP.paramsFormat,
                                  this.mssqlParameter.executeSP.params,
                                  this.mssqlParameter.executeSP.callBack
                                  );
            break;
      
         }

      };


}


 

module.exports=QueueDbHelper;





