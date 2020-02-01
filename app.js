
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

app.route('/template').post(function(req,res){
   if(1){

      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Mobile no is not set', 'developerMessage':'User creation failed because the mobile no is not set'}));
   }else{
      // Bad Request
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Bad Request', 'developerMessage':'Bad Reequest'}));
   }

});

// issue#2
app.route('/api').get(function(req,res){
   // Success
   res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
   res.end(JSON.stringify({'message':'Success', 'developerMessage':'Success'}));
});

// issue#3
app.route('/api/users').post(function(req,res){

   const nic = req.body.nic;
   const mobile = req.body.mobile;
   const password = req.body.password;

   if(!mobile) {
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Mobile no is not set', 'developerMessage':'User creation failed because the mobile no is not set'}));
      return;
   }
   else if(!nic) {
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Nic no is not set', 'developerMessage':'User creation failed because the nic no is not set'}));
      return;
   }

   // Password check
   if(password) {
      // Have password
      if(password.length < 6 || password.length >8 ){
         console.log("400: Password complexity requirement not met:" + password);
         res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
         res.end(JSON.stringify({'message':'Password complexity requirement not met', 'developerMessage':'User creation failed because password complexity requirement not met'}));
         return;
      }else{
         var reg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#\$%\^&\*\+\=\`])(?=.{6,8})");
         if(!reg.test(password)){
            console.log("400: Password complexity requirement not met:" + password);
            res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
            res.end(JSON.stringify({'message':'Password complexity requirement not met', 'developerMessage':'User creation failed because password complexity requirement not met'}));
            return;
         }
      }

   // is user already exists
   con.query("SELECT * FROM `app_users` WHERE `nic` LIKE '"+ nic + "'", function (err, result, fields) {
      if (err) throw err;
      console.log(result.length);

      if(result.length>=1){
         // user exists
         res.writeHead(409,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
         res.end(JSON.stringify({'message':'A user with nic: ' + nic + ' already exists', 'developerMessage':'User creation failed because the nic: ' + nic + ' already exists'}));
         return;
         
      }else{
         // User not exists

         userId = getRandomArbitrary(10000,99999);
         sql_newUser(userId, nic, mobile, pw);

         // Need to check is user already exists
         respData = {
            'self': 'http://localhost:9090/api/users/' + userId,
            'nic': nic,
            'mobile':  mobile
         }

         res.writeHead(201,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
         res.end(JSON.stringify(respData));
         return;
      }      

   }else{
     
   }

   // REM: hash the password

});

function getRandomArbitrary(min, max) {
   return Math.floor(Math.random() * (max - min) + min);
}

function sql_newUser(userId, nic, mobile, password){
   var query = con.query("INSERT INTO `app_users` (`id`, `name`, `nic`, `mobile`, `pw_hash`, `email` ) VALUES ('" + userId +"', 'user', '" + nic +"', '" + mobile +"', '', '');");

   query.on('result', function(row) {
      // Nothing to do
      return true;
   });
}




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
