// Modules
var express = require('express');
var path = require('path');
var request = require('request');

var fs = require("fs");
var config = JSON.parse(fs.readFileSync("config.json"));
// Create app
var app = express();
var port = config.port;

//time
var moment = require('moment');

//mongo db
var mongo = require("mongodb");
var dbhost = config.mongo_host;
var dbport = config.mongo_port;
var db = new mongo.Db("homeSensors", new mongo.Server(dbhost, dbport, {}));
var sensordataCollection;
db.open(function(error){
	console.log("We are connected! " + dbhost + ":" + dbport);

	db.collection("sensordata", function(error, collection){
		sensordataCollection = collection;
	});

});

cores = {
  sensor_core: config.particle_id
};
console.log(cores);
// Token
access_token = config.token;

// City
city =  'waltham,usa';

// Base address
address = 'https://api.particle.io/v1/devices/';
weather_address = 'http://api.openweathermap.org/data/2.5/weather?q='

// Set views
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Serve files
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/interface.html')
});

// API access
app.get("/get", function(req, res){

  // Request options
  var options = {timeout: 6000, json: true};

    // Make request
    command = address + cores[req.query['core']] + req.query['command'] + '?access_token=' + access_token ;
    request(command, options, function (error, response, body) {
    if (!error){
      console.log(body);
      res.json(body);
    }
    else {
      console.log("Core offline");
      res.json({coreInfo: {connected: false}});
    }
  });
});

// API access
app.get("/getweather", function(req, res){
  var options = {timeout: 6000, json: true};
    // Make request
    command = weather_address + city ;
    request(command, options, function (error, response, body) {
    if (!error){
      res.json(body);
    }
    else {
      console.log("Weather offline");
//      res.json({coreInfo: {connected: false}});
    }
  });
});

app.get("/post", function(req, res){
  // Command
  command = address + cores[req.query['core']] + req.query['command'];
  // Make request
  request(command,
    {headers: {'Content-type': 'application/x-www-form-urlencoded'},
      method: 'POST',
      json: true,
      body: "access_token=" + access_token + "&args=" + req.query['params'],
      timeout: 5000}, function (error, response, body) {
    if (!error){
//      console.log(body);
      res.json(body);
    }
    else {
      console.log("Core offline");
      res.json({coreInfo: {connected: false}});
    }
  });
});

app.post("/sensordata/*", function(req, res){
res.status(200).send("Query Posted");
console.log("pathname" + req._parsedUrl.pathname);
console.log("sensordat:a" + req.body);
//var jsonReq = JSON.parse(req.query.json);
//console.log("temprature" + jsonReq.temp);
//sensordataCollection.insert(
//  {

//  }
//);
});

app.post("*", function(req, res){
res.status(200).send("Query Posted");
//var jsonReq = JSON.parse(req.query);
console.log(req.query.json);
});


// Start server
app.listen(port);
console.log("Listening on port " + port);
