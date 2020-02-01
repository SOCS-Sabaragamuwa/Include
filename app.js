
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var generator = require('generate-password');
//const bcrypt = require('bcrypt');

var accountSid = 'ACc8ba734c5fac74f49c51f9028449290d'; // Your Account SID from www.twilio.com/console
var authToken = '79efbe8f674a5fd7600ed759107234e8';   // Your Auth Token from www.twilio.com/console

var twilio = require('twilio');
var twilioClient = new twilio(accountSid, authToken);

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


app.route('/test').post(function(req,res){
   var vehicle_id;
   var officer_id;
   var route_id;

   var timetable_id = req.query.timetable_id;

   con.query("SELECT * FROM `app_timetable` WHERE `id` LIKE '"+ timetable_id + "';", function (err, result, fields) {

      console.log(result);
      vehicle_id = result[0].vehicleId;
      officer_id = result[0].officerId;
      route_id = result[0].routeId;

   });



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
         var reg = new RegExp("^(((?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#$%^&*_+=`|(){}[.?\\\-\]])).{6,8})$");
         if(!reg.test(password)){
            console.log("400: Password complexity requirement not met:" + password);
            res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
            res.end(JSON.stringify({'message':'Password complexity requirement not met', 'developerMessage':'User creation failed because password complexity requirement not met'}));
            return;
         }
      }
      pw = password;
      console.log("user given > " + pw);
   }else{
      pw = generator.generate({
         length: 10,
         numbers: true
      });
      console.log("System generated > " + pw);

      // Not tested ------------------------------------
      twilioClient.messages.create({
         body: 'Your password is ' + pw,
         to: mobile,  // Text this number
         from: '+17813280397' // From a valid Twilio number
      })
      .then((message) => console.log(message.sid));
      // -----------------------------------------------
   }

   var regNIC1 = new RegExp("^[0-9]{9}[V]$");
   var regNIC2 = new RegExp("^[0-9]{12}$");

   // NIC test
   if(!(regNIC1.test(nic) || regNIC2.test(nic) )){
      // invalid NIC
      console.log("400: Invalid NIC:" + nic);
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Nic no is not set', 'developerMessage':'User creation failed because the nic no is not set' + nic }));
      return;
   }

   var regMobile = new RegExp("^[\+][9][4][0-9]{9}$");

   // Mobile Test mobile.length!=12 ||
   if(!regMobile.test(mobile)){
      // invalid mobile
      console.log("400: Invalid mobile number :"+ mobile);
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Mobile no is not set', 'developerMessage':'User creation failed because the mobile no is not set'}));
      return;
   }

   // Add a new user
   // is user already exists

   //sql_Select('app_users','*','nic',nic,function(err, result, fields){
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

   });

   // REM: hash the password

});


// issue #8
app.route('/api/vehicles').post(function(req,res){

   const vehicle_number = req.body.vehicle_number;
   //var vehicle_number = "NE-5896";

   var regVehicleNum1 = new RegExp("^[0-9]{2}[\-][0-9]{4}$");
   var regVehicleNum2 = new RegExp("^[0-9]{3}[\-][0-9]{4}$");
   var regVehicleNum3 = new RegExp("^[A-Z]{2}[\-][0-9]{4}$");
   var regVehicleNum4 = new RegExp("^[A-Z]{3}[\-][0-9]{4}$");


   if(regVehicleNum1.test(vehicle_number) || regVehicleNum2.test(vehicle_number) || regVehicleNum3.test(vehicle_number) || regVehicleNum4.test(vehicle_number)) {
      // If number plate is passed

      con.query("SELECT * FROM `app_vehicle` WHERE `vehicleNum` LIKE '"+ vehicle_number + "'", function (err, result, fields) {

         if(result.length>=1){
            // vehicle exists

            // Write a query to get vehicle id
            con.query("SELECT * FROM `app_vehicle` WHERE `vehicleNum` LIKE '"+ vehicle_number + "';", function (err, result, fields) {
               var vehicle_id =result[0].id;

               // 409
               console.log("409: Vehicle numbr already exists");
               res.writeHead(409,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
               res.end(JSON.stringify({'message':'A vehicle with vehicle_number: '+vehicle_number+' already exists', 'developerMessage':'Vehicle creation failed because the vehicle_number: '+vehicle_number+' already exists'}));

            });

         }else{
            // Add to the database

            con.query("INSERT INTO `app_vehicle`(`vehicleNum`) VALUES ('" + vehicle_number + "');", function (err, result, fields) {

               // Write a query to get vehicle id
               con.query("SELECT * FROM `app_vehicle` WHERE `vehicleNum` LIKE '"+ vehicle_number + "';", function (err, result, fields) {
                  var vehicle_id =result[0].id;

                  // Write a query to reply
                  console.log("201: Success");
                  res.writeHead(201,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
                  res.end(JSON.stringify({'self': 'http://localhost:9090/api/vehicles/'+vehicle_id, 'vehicle_number': vehicle_number}));

               });
            });
         }
      });
   }else{
      console.log("400: Vehicle bad request");
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Bad Request', 'developerMessage':'Bad Reequest'}));
   }
});

// issue #8
app.route('/api/vehicles').get(function(req,res){
   con.query("SELECT * FROM `app_vehicle` WHERE 1;", function (err, result, fields) {

      console.log(result);
      var resp = [];

      for(i=0;i<result.length;i++){
         console.log("item" + result[i]);
         resp.push({'self':'http://localhost:9090/api/vehicles/' + result[i].id,
         'id':result[i].id, 'vehicle_number':  result[i].id});
      }

      res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'vehicles': resp}));
   });
});

//issue #10
app.route('/api/officers').post(function(req,res){
   var employment_number = req.body.employment_number;
   var role = req.body.role;
   var regEmpNumber = new RegExp("^[0-9]{5}$");

   if(!role){
      role = 'employee';
   }


   if(!regEmpNumber.test(employment_number)){
      // If number is wrong
      console.log("400: Bad Request > " + employment_number);
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Bad Request', 'developerMessage':'Bad Request'}));
      return;

   }else if(!(role=='admin' || role== 'super-admin' || role== 'employee')){
      // wrong role
      console.log("400: Bad Request > " + employment_number);
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Bad Request', 'developerMessage':'Bad Request'}));
      return;

   } else{

      //con.query("INSERT INTO `app_officers` (`id`, `emp_num`, `firstName`, `lastName`, `pass`, `email`, `role`, `mobile`, `designation`) VALUES (NULL, '"+regEmpNumber+"', 'Pasan', 'Tenne', '312343256384', 'nuwanjaliyagoda@gmail.com', 'admin', '0778891312', '');", function (err, result, fields) {

      con.query("SELECT * FROM `app_officers` WHERE `emp_num` = '"+ employment_number + "';", function (err, result, fields) {
         console.log(employment_number + " > " + result);

         if(result!=undefined && result.length>=1){
            // if already exists
            console.log("409: Officer already exists " + employment_number);
            res.writeHead(409,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
            res.end(JSON.stringify({'message':'Officer with employment_number: '+employment_number+' already exists', 'developerMessage':'Officer creation failed because the employment_number: '+employment_number+' already exists'}));
            return;

         }else{
            // Not exists

            con.query("INSERT INTO `app_officers`( `emp_num`, `role`) VALUES ('"+employment_number+"', '"+role+"');", function (err, result, fields) {

               // Write a query to get vehicle id
               con.query("SELECT * FROM `app_officers` WHERE `emp_num` LIKE '"+ employment_number + "';", function (err, result, fields) {
                  var employee_id =result[0].id;

                  // Write a query to reply
                  console.log("201: Success >" + employment_number);
                  res.writeHead(201,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
                  res.end(JSON.stringify({'self':'http://localhost:9090/api/officers/'+employee_id, 'employment_number': employment_number, 'role' : role}));
                  return;
               });
            });
         }

      });
   }
});

//issue #11
app.route('/api/officers').get(function(req,res){
   con.query("SELECT * FROM `app_officers` WHERE 1;", function (err, result, fields) {

      //console.log(result.length);
      var resp = [];

      for(i=0;i< result.length;i++){
         resp.push({'self':'http://localhost:9090/api/officers/' + result[i].id,
         'id': result[i].id ,'employment_number':result[i].emp_num, 'role':  result[i].role});
      }
      //console.log(resp);

      res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'officers': resp}));
   });
});

//issue #12
app.route('/api/routes').post(function(req,res){
   var route_name = req.body.route_name;

   // Check already exists or not
   con.query("SELECT * FROM `app_routes` WHERE `route_name` = '"+ route_name + "';", function (err, result, fields) {
      console.log(route_name + " > " + result);

      // Already exists
      if(result!=undefined && result.length>=1){
         console.log("409: Route already exists " + route_name);
         res.writeHead(409,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
         res.end(JSON.stringify({'message':'A route with route_name: ' +route_name+' already exists', 'developerMessage':'Route creation failed because the route_name: ' + route_name + ' already exists'}));
         return;
      }else{
         // Not exists

         con.query("INSERT INTO `app_routes` (`id`, `route_name`) VALUES (NULL, '"+route_name+ "');", function (err, result, fields) {

            // Write a query to get route id
            con.query("SELECT * FROM `app_routes` WHERE `route_name` LIKE '"+ route_name + "';", function (err, result, fields) {
               var route_id =result[0].id;

               // Write a query to reply
               console.log("201: Success >" + route_name);
               res.writeHead(201,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
               res.end(JSON.stringify({'self':'http://localhost:9090/api/routes/'+route_id, 'route_name': route_name}));
               return;
            });
         });

      }
   });

});

//issue #13
app.route('/api/routes').get(function(req,res){

   con.query("SELECT * FROM `app_routes` WHERE 1;", function (err, result, fields) {

      //console.log(result.length);
      var resp = [];

      for(i=0;i< result.length;i++){
         resp.push({'self':'http://localhost:9090/api/routes/' + result[i].id,
         'id': result[i].id ,'route_name':result[i].route_name});
      }
      //console.log(resp);

      res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'routes': resp}));
   });

});

app.route('/api/timetables').post(function(req,res){
   var start_time = req.body.start_time;
   var end_time = req.body.end_time;
   var day = req.body.day;
   var officer_id = req.body.officer_id;
   var vehicle_id = req.body.vehicle_id;
   var route_id = req.body.route_id;

   var regTime = new RegExp("^(2[0-3]|[01][0-9]):?([0-5][0-9]):?([0-5][0-9])$");

   if(!(officer_id && vehicle_id && route_id) || !regTime.test(start_time) || !regTime.test(end_time)){
      res.writeHead(400,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({'message':'Bad Request', 'developerMessage':'Bad Request'}));

   } else {
      //if the vehicle_id or officer_id or route_id is not set

      // Check for vehicle
      con.query("SELECT * FROM `app_vehicle` WHERE `id` LIKE '"+ vehicle_id + "'", function (err, result, fields) {

         if(result.length>=1){
            // vehicle found

            // Check for officer
            con.query("SELECT * FROM `app_officers` WHERE `id` = '"+ officer_id + "';", function (err, result, fields) {

               if(result.length>=1){
                  // officer found

                  // Check for route
                  con.query("SELECT * FROM `app_routes` WHERE `id` = '"+ route_id + "';", function (err, result, fields) {

                     if(result.length>=1){
                        // Route found

                        // create a timetable
                        // ------------------------------------------------------
                        con.query("INSERT INTO `app_timetable` (`id`, `start_time`, `end_time`, `day_name`, `officerId`, `vehicleId`, `routeId`) VALUES (NULL, '"+start_time+ "', '"+end_time+ "', '"+day+"', '"+officer_id+"', '"+vehicle_id+"', '"+route_id+"');", function (err, result, fields) {

                           // get timetable id
                           con.query("SELECT * FROM `app_timetable` WHERE (`day_name` LIKE '"+ day + "') AND (`officerId` LIKE '"+ officer_id + "') AND (`vehicleId` LIKE '"+ vehicle_id + "') AND (`routeId` LIKE '"+ route_id + "');", function (err, result, fields) {

                              console.log(result);
                              var timetable_id = result[0].id;

                              // show it
                              con.query("SELECT * FROM `app_officers` WHERE `id` = '"+officer_id+"';", function (err, result, fields) {
                                 officerAr = result[0];

                                 con.query("SELECT * FROM `app_vehicle` WHERE `id` = '"+vehicle_id+"';", function (err, result, fields) {
                                    vehicleAr = result[0];

                                    con.query("SELECT * FROM `app_routes` WHERE `id` = '"+route_id+"';", function (err, result, fields) {
                                       routeAr = result[0];

                                       res.writeHead(201,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
                                       res.end(JSON.stringify({
                                          'self': 'http://localhost:9090/api/timetables/' + timetable_id,
                                          'start_time': start_time,
                                          'end_time': end_time,
                                          'day': day,
                                          'officer': {
                                             'self': 'http://localhost:9090/api/officers/' + officer_id,
                                             'employment_number': officerAr.emp_num
                                          },
                                          'vehicle':{
                                             'self': 'http://localhost:9090/api/vehicles/'+ vehicle_id,
                                             'vehicle_number': vehicleAr.vehicleNum
                                          },
                                          'route': {
                                             'self' : 'http://localhost:9090/api/routes/' + route_id,
                                             'route_name': routeAr.route_name
                                          }
                                       }));
                                       return;
                                    });
                                 });
                              });
                           });

                           // -----------------------------------------------------
                        });
                     } else{
                        // not found error
                        res.writeHead(404,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
                        res.end(JSON.stringify({'message':'No value present timetable_id: '+timetable_id , 'developerMessage':'Timetable creation failed because no value present timetable_id: '+timetable_id}));
                        return
                     }
                  });
               }else{

                  // not found error
                  res.writeHead(404,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
                  res.end(JSON.stringify({'message':'No value present route_id: '+route_id , 'developerMessage':'Timetable creation failed because no value present route_id: '+route_id}));
                  return
               }
            });


         }else{
            // not found error
            res.writeHead(404,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
            res.end(JSON.stringify({'message':'No value present route_id: '+route_id , 'developerMessage':'Timetable creation failed because no value present route_id: '+route_id}));
            return
         }
      });
   }
});

app.route('/api/timetables/:timetable').get(function(req,res){
   var vehicle_id;
   var officer_id;
   var route_id;

   console.log(">> " + req);

   var timetable_id = req.params.timetable;
   //var timeAr;

   con.query("SELECT * FROM `app_timetable` WHERE `id` LIKE '"+ timetable_id + "';", function (err, result, fields) {
      timeAr = result[0];
      console.log(">" + result[0]);

      vehicle_id = timeAr.vehicleId;
      route_id = timeAr.routeId;
      officer_id = timeAr.officerId;

      var officerAr = [];

      con.query("SELECT * FROM `app_officers` WHERE `id` = '"+officer_id+"';", function (err, result, fields) {
         officerAr = result[0];
         con.query("SELECT * FROM `app_vehicle` WHERE `id` = '"+vehicle_id+"';", function (err, result, fields) {
            vehicleAr = result[0];
            con.query("SELECT * FROM `app_routes` WHERE `id` = '"+route_id+"';", function (err, result, fields) {
               routeAr = result[0];

               console.log(result[0]);

               res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
               res.end(JSON.stringify(
                  { 'self': 'http://localhost:9090/api/timetables/' + timetable_id,
                  'start_time': timeAr.start_time,
                  'end_time': timeAr.end_time,
                  'day': timeAr.day_name,
                  'officer': {
                     'self': 'http://localhost:9090/api/officers/' + officer_id,
                     'employment_number': officerAr.emp_num,
                     'role': officerAr.role
                  },
                  'vehicle':{
                     'self': 'http://localhost:9090/api/vehicles/'+ vehicle_id,
                     'vehicle_number': vehicleAr.vehicleNum
                  },
                  'route': {
                     'self' : 'http://localhost:9090/api/routes/' + route_id,
                     'route_name': routeAr.route_name
                  }
               }));
            });
         });

      });

      return;

   });
});

app.route('/api/timetables').get(function(req,res){

   var officer_id = req.query.officer_id;
   var vehicle_id = req.query.vehicle_id;
   var route_id = req.query.route_id;
   var sqlFilter = "";

   if(!officer_id && !vehicle_id&&  !route_id){
      sqlFilter  = "1";
   }else{
      sqlFilter = "(1 = 1)"
      if(officer_id){
         sqlFilter += "AND  (`officerId` = "+officer_id+ ")";
      }

      if(vehicle_id){
         sqlFilter += "AND (`vehicleId`="+vehicle_id +")";
      }

      if(route_id){
         sqlFilter += "AND (`routeId` = "+route_id +")";
      }
   }

   console.log(sqlFilter);

   con.query("SELECT * FROM `app_timetable` WHERE "+sqlFilter+";", function (err, result, fields) {
      var resp1 = [];

      //console.log("SELECT * FROM `app_timetable` WHERE "+sqlFilter+";");
      //console.log(result);

      for(i=0;i< result.length;i++){
         timeAr = result[0];
         console.log(timeAr);

         vehicle_id = timeAr.vehicleId;
         route_id = timeAr.routeId;
         officer_id = timeAr.officerId;

         var officerAr = [];

         con.query("SELECT * FROM `app_officers` WHERE `id` = '"+officer_id+"';", function (err, result, fields) {
            officerAr = result[0];

            con.query("SELECT * FROM `app_vehicle` WHERE `id` = '"+vehicle_id+"';", function (err, result, fields) {
               vehicleAr = result[0];

               con.query("SELECT * FROM `app_routes` WHERE `id` = '"+route_id+"';", function (err, result, fields) {
                  routeAr = result[0];
                  resp1.push({ 'self': 'http://localhost:9090/api/timetables/' + timeAr.id,
                  'start_time': timeAr.start_time,
                  'end_time': timeAr.end_time,
                  'day': timeAr.day_name,
                  'officer': {
                     'self': 'http://localhost:9090/api/officers/' + officer_id,
                     'employment_number': officerAr.emp_num,
                     'role': officerAr.role
                  },
                  'vehicle':{
                     'self': 'http://localhost:9090/api/vehicles/'+ vehicle_id,
                     'vehicle_number': vehicleAr.vehicleNum
                  },
                  'route': {
                     'self' : 'http://localhost:9090/api/routes/' + route_id,
                     'route_name': routeAr.route_name
                  }});

                  console.log(resp1);

                  res.writeHead(200,{'Content-Type' : 'application/json', 'Access-Control-Allow-Origin':'*'});
                  res.end(JSON.stringify({'timetables': resp1}));
                  return;
               });
            });
         });
      }
      console.log("-------------");
      console.log(resp1);
      console.log("-------------");

   });
});




















function getRandomArbitrary(min, max) {
   return Math.floor(Math.random() * (max - min) + min);
}

function sql_newUser(userId, nic, mobile, password){
   // REM: use promise
   //bcrypt.hash(password, 10, function(err, hash) {

   // Store hash in database
   var query = con.query("INSERT INTO `app_users` (`id`, `name`, `nic`, `mobile`, `pw_hash`, `email` ) VALUES ('" + userId +"', 'user', '" + nic +"', '" + mobile +"', '"+ password + "', '');");

   query.on('result', function(row) {
      // Nothing to do
      return true;
   });

   //});

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
function sql_Update(table,field,key,value,newValue,cb) {
   var sql = "UPDATE `" + table + "` SET `" + field +"` = '" + newValue + "' WHERE `"+key+"` = '"+value+"';";
   var query = con.query(sql);
   query.on('result', function(row) {
      cb(row);
   });
};

//q_Update("table0","lastName" ,"Id",3,"Karunaratne",function(err, result){console.log(err || result);});
function sql_Select(table,field,key,value,callback) {
   var sql = "SELECT `" + field + "` FROM `" + table+"` WHERE `"+key+"` = '"+value+"';";
   var query = con.query(sql);
   query.on('result', function(err,row) {
      callback(err, row);
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
