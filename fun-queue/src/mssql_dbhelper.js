/**
 *sqlserver Helper
 **/
var mssql = require("mssql");
var conf = require("./config");

var MSSqlHelper=(function() {

    return function() {
            var restoreDefaults = function () {
                conf.mssqlConfig;
            };

            var getConnection = function(callback){//连接数据库
                if(!callback){
                    callback = function(){};
                }
                var con = new mssql.ConnectionPool(conf.mssqlConfig, function(err) {
                    if (err) {
                        throw err;
                    }
                    callback(con);
                });
            };

          var NonQuerySql = function (sql, params, callBack) {//写sql语句自由查询
              getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    if (params != "") {
                        for (var index in params) {
                            if (typeof params[index] == "number") {
                                ps.input(index, mssql.Int);
                            } else if (typeof params[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                            }
                        }
                    }
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(params, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };

            
            this.setConnectionFromOutSide=function(mssqlConfig){
                conf.mssqlConfig=mssqlConfig;
            };
            
            
            
            this.querySql = function (sql, params, callBack) {//写sql语句自由查询
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    if (params != "") {
                        for (var index in params) {
                            if (typeof params[index] == "number") {
                                ps.input(index, mssql.Int);
                            } else if (typeof params[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                            }
                        }
                    }
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(params, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };
            
            
            this.select = function (tableName, topNumber, whereSql, params, orderSql, callBack) {//查询该表所有符合条件的数据并可以指定前几个
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    var sql = "select * from " + tableName + " ";
                    if (topNumber != "") {
                        sql = "select top(" + topNumber + ") * from " + tableName + " ";
                    }
                    sql += whereSql + " ";
                    if (params != "") {
                        for (var index in params) {
                            if (typeof params[index] == "number") {
                                ps.input(index, mssql.Int);
                            } else if (typeof params[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                            }
                        }
                    }
                    sql += orderSql;
                    console.log(sql);
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(params, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };
            
            this.selectAll = function (tableName, callBack) {//查询该表所有数据
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    var sql = "select * from " + tableName + " ";
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute("", function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };
            
            this.add = function (addObj, tableName, callBack) {//添加数据
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    var sql = "insert into " + tableName + "(";
                    if (addObj != "") {
                        for (var index in addObj) {
                            if (typeof addObj[index] == "number") {
                                ps.input(index, mssql.Int);
                            } else if (typeof addObj[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                            }
                            sql += index + ",";
                        }
                        sql = sql.substring(0, sql.length - 1) + ") values(";
                        for (var index in addObj) {
                            if (typeof addObj[index] == "number") {
                                sql += addObj[index] + ",";
                            } else if (typeof addObj[index] == "string") {
                                sql += "'" + addObj[index] + "'" + ",";
                            }
                        }
                    }
                    sql = sql.substring(0, sql.length - 1) + ")";
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(addObj, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };
            
            this.update = function (updateObj, whereObj, tableName, callBack) 
            {//更新数据
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    var sql = "update " + tableName + " set ";
                    if (updateObj != "") {
                        for (var index in updateObj) {
                            if (typeof updateObj[index] == "number") {
                                ps.input(index, mssql.Int);
                                sql += index + "=" + updateObj[index] + ",";
                            } else if (typeof updateObj[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                                sql += index + "=" + "'" + updateObj[index] + "'" + ",";
                            }
                        }
                    }
                    sql = sql.substring(0, sql.length - 1) + " where ";
                    if (whereObj != "") {
                        for (var index in whereObj) {
                            if (typeof whereObj[index] == "number") {
                                ps.input(index, mssql.Int);
                                sql += index + "=" + whereObj[index] + " and ";
                            } else if (typeof whereObj[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                                sql += index + "=" + "'" + whereObj[index] + "'" + " and ";
                            }
                        }
                    }
                    sql = sql.substring(0, sql.length - 5);
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(updateObj, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };
            
            this.del = function (whereSql, params, tableName, callBack) {//删除数据
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    var sql = "delete from " + tableName + " ";
                    if (params != "") {
                        for (var index in params) {
                            if (typeof params[index] == "number") {
                                ps.input(index, mssql.Int);
                            } else if (typeof params[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                            }
                        }
                    }
                    sql += whereSql;
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(params, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            };
            
            
            
            this.firstRow= function (tableName, whereSql, params, orderSql, callBack) {//查询第一行，第一列
            
                 getConnection(function(connection){
                    var ps = new mssql.PreparedStatement(connection);
                    var sql = "select * from " + tableName + " ";
                    var topNumber= 1;
                    if (topNumber != "") {
                        sql = "select top(" + topNumber + ") * from " + tableName + " ";
                    }
                    sql += whereSql + " ";
                    if (params != "") {
                        for (var index in params) {
                            if (typeof params[index] == "number") {
                                ps.input(index, mssql.Int);
                            } else if (typeof params[index] == "string") {
                                ps.input(index, mssql.NVarChar);
                            }
                        }
                    }
                    sql += orderSql;
                    console.log(sql);
                    ps.prepare(sql, function (err) {
                        if (err)
                            console.log(err);
                        ps.execute(params, function (err, recordset) {
                            callBack(err, recordset);
                            ps.unprepare(function (err) {
                                if (err)
                                    console.log(err);
                            });
                        });
                    });
                });
                restoreDefaults();
            
            };
            
            this.delAsDefinedSql=function(sql,params,callBack){//按自定义语句删除数据
            
                NonQuerySql(sql,params,callBack);
                restoreDefaults();
            };
            
            this.executeSP=function (spName,paramsFormat,params,callBack){ 
                var sql=''
                if(spName=='')
                {
                    restoreDefaults();
                    callBack(true,[]);
                }
                sql='execute '+spName+' '+paramsFormat;
                
                NonQuerySql(sql,params,callBack);
            
            };
     }


})();



//export this js class into outside
// exports.config = conf.mssqlConfig;
// exports.del = del;
// exports.delAsDefinedSql=delAsDefinedSql;
// exports.select = select;
// exports.update = update;
// exports.querySql = querySql;
// exports.selectAll = selectAll;
// exports.restoreDefaults = restoreDefaults;
// exports.add = add;
// exports.firstRow=firstRow;
// exports.executeSP=executeSP;
// exports.setConnectionFromOutSide=setConnectionFromOutSide;

module.exports=MSSqlHelper;