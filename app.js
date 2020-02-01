
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var generator = require('generate-password');


var app = express();

var con = mysql.createConnection({
   host: "localhost",
   user: "hack_user",
   password: "R7oUpm4UPQtul4LD",
   database: "letmehack"
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen(9090);

//-- API Web Server Template----------------------------------------------------


// issue#2
app.route('/api').get(function(req,res){
   // Success
   res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
   res.end(JSON.stringify({'message':'Success', 'developerMessage':'Success'}));
});


//------------------------------------------------------------------------------
//-- MySQL support functions ---------------------------------------------------
//------------------------------------------------------------------------------

function sql_getData (table, field, callback) {
   var query = con.query("SELECT `"+field+"` FROM `"+ table+"`;");
   query.on('result', function(row) {
      return row;
   });
};

//getData("table0", "lastName", function(err, result){console.log(err || result);});
function sql_Update(table,field,key,value,newValue,callback) {
   var sql = "UPDATE `" + table + "` SET `" + field +"` = '" + newValue + "' WHERE `"+key+"` = '"+value+"';";
   var query = con.query(sql);
   query.on('result', function(row) {
      callback(null, row);
   });
};

//q_Update("table0","lastName" ,"Id",3,"Karunaratne",function(err, result){console.log(err || result);});
function sql_Select(table,field,key,value,callback) {
   var sql = "SELECT `" + field + "` FROM `" + table+"` WHERE `"+key+"` = '"+value+"';";
   var query = con.query(sql);
   query.on('result', function(row) {
      callback(null, row);
   });
};

//q_Select("table0", "firstName","id",2,function(err, result){console.log(err || result);});
function sql_Delete(table,key,value,callback) {
   var sql = "DELETE FROM `" + table + "` WHERE `" + key +"` = '" + value+"';";
   var query = con.query(sql);
   query.on('result', function(row) {
      callback(null, row);
   });
};
