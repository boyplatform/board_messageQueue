/**
 *mySql Helper
 **/
var conf = require("./config");

var MysqlHelper=(function() {

   var dbHelper = require("mysql-dbhelper")(conf.mysqlConfig);
   var conn = null; 
      
   return function() {

            var restoreDefaults = function () {
                conf.mysqlConfig;
            };
             
            this.setConnectionFromOutSide=function(mysqlConfig){

                dbHelper=require("mysql-dbhelper")(mysqlConfig);
            }
            
            this.setConnectionToCurrentNode=function(){
                dbHelper =require("mysql-dbhelper")(conf.mysqlConfig);
            }
            
            
            this.getConnection = function(){//连接数据库
              
            
                  conn = dbHelper.createConnection();
                
            }
            
            this.closeConnection = function(){//连接数据库
                if(conn!=null)
                {
                      conn.end();
                }
            }
            
            
           
            
            
            this.querySql = function (sql, params, callBack) {//写sql语句自由查询
              
              conn.$execute(sql, params, callBack);
              restoreDefaults();
            
            
            };
            
            this.add = function (sql, params, callBack) {//添加数据
            
              conn.$insert(sql, params, callBack);
              restoreDefaults();
            
            
            };
            
            
            this.update = function (sql, params, callBack) {//更新数据
              
              conn.$update(sql,params,callBack);
              restoreDefaults();
            };
            
            
            
            this.select = function (tableName, topNumber, whereSql, params, orderSql, callBack) {//查询该表所有符合条件的数据并可以指定前几个
            
              var sql = "select * from " + tableName + " ";
                  
                    sql +=whereSql + " ";
                    
                    sql += orderSql+ " ";

                    if (topNumber != "") {
                      sql +="limit 0,"+topNumber;
                    }
                    
                    //console.log(sql);
            
                    conn.$execute(sql, params, callBack);
                    restoreDefaults();
            }
            
            
            this.selectAll = function (tableName, callBack) {//查询该表所有数据
            
                var sql = "select * from " + tableName + " ";
            
                  conn.$execute(sql, callBack);
                  restoreDefaults();
            
            };
            
            
            
            this.del = function (whereSql, params, tableName, callBack) {//按条件删除数据
                var sql = "delete from " + tableName ;
                if(whereSql!=""&&whereSql!=undefined&&whereSql!=null){
                  sql +=" "+whereSql;
                }
            
                conn.$executeNonQuery(sql, params, callBack);
                restoreDefaults();
            };
            
            this.delAsDefinedSql=function(sql,params,callBack){//按自定义语句删除数据
            
            
                conn.$executeNonQuery(sql, params, callBack);
            
            
                restoreDefaults();
            };
            
            
            this.scalar= function (sql, params, callBack) {//查询第一行，第一列
            
              conn.$executeScalar(sql, params, callBack);
              restoreDefaults();
            
            };
            
            
            this.firstRow= function (sql, params, callBack) {//查询第一行数据
            
              conn.$executeFirstRow(sql, params, callBack);
              restoreDefaults();
            
            };
            
            this.executeSP=function (spName,paramsFormat,params,callBack){
            
                  var sql=''
                  if(spName=='')
                  {
                    restoreDefaults();
                    callBack(true,[]);
                  }
                  sql='call '+spName;
                  sql+='(';
                  if(paramsFormat!=""){
                        sql+=paramsFormat;
                    }
                  sql+=')';
                  conn.$execute(sql, params, callBack);
            
                  restoreDefaults();
            
            };

    }  
 


})();






//export this js class into outside
module.exports=MysqlHelper;
