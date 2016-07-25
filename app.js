/**
    Enertalk API Using node js
    Authored by JuYoungAhn
    https://github.com/JuYoungAhn
**/

var express = require('express');
var bodyParser = require('body-parser')
var multer = require('multer');
var upload = multer({dest:'uploads/'})
var moment = require('moment');
var http = require('http');
var querystring = require('querystring');
var url = require('url')
var request = require('request')
var app = express();

app.locals.pretty = true;
app.set('view engine', 'jade');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}))

app.get('/', function(req, res){
    res.render('enertalk');
});
app.get('/enertalk', function(req, res){
  res.render('enertalk');
})
app.get('/callback', function(req, res){
  var url = req.url;
  var authCode = url.split("code=")[1];
  res.render('callback', {code : authCode})
})
app.get('/codeSubmit', function(req, res){
  var accessToken = null;
  var refreshToken = null;
  var headersUuid = {}
  var uuid = null;

  // Get Access Token from Code
  function getAccessToken(callback){
    var headers = {
        'User-Agent':       'Super Agent/0.0.1',
        'Content-Type':     'application/json'
    }

    var options = {
        url: 'http://enertalk-auth.encoredtech.com/token',
        method: 'POST',
        headers: headers,
        form: {
          'client_id': 'ank5MzYzMEBuYXZlci5jb21faW1yYw==', // insert your client_id
          "client_secret": "x410y4ls6xz80w4zh66l4th3gk7f29z761d13d6", // insert your client_secret
          "grant_type" : "authorization_code",
          "code": req.param('code')
        }
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            console.log("Get Access Token")
            console.log("Good")
            accessToken = JSON.parse(body)["access_token"];
            refreshToken = JSON.parse(body)["refresh_token"];
            headersUuid = {'Authorization':'Bearer '+accessToken}
            callback();
        }
        else {
          console.log("Get Access Token")
          console.log("Fail")
        }
    })
  }

  // Get Access Token and Get UUID via callback function */
  getAccessToken(function(){
    var optionsUuid = {
        url: 'https://enertalk-auth.encoredtech.com/uuid',
        method: 'GET',
        headers: headersUuid,
    }

    request(optionsUuid, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("Get UUID")
            console.log("good")
            uuid = JSON.parse(body)["uuid"]
            console.log("uuid : "+uuid)
            res.redirect('/dashboard?uuid='+uuid+'&accessToken='+accessToken)
        }
        else {
          console.log("Get UUID")
          console.log("fail")
        }
    })
  })
})
app.get('/realtimeUsage', function(req, res){
  var accessToken = req.param('accessToken')
  var uuid = req.param('uuid')

  var options = {
      url: 'https://api.encoredtech.com/1.2/devices/'+uuid+'/realtimeUsage',
      method: 'GET',
      headers: { 'Authorization' : 'Bearer '+accessToken },
  }

  console.log(options)

  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          console.log("Good")
      }
      else {
        console.log(response.statusCode)
      }
  })
});
app.get('/dashboard', function(req, res){
  var accessToken = req.param('accessToken')
  var uuid = req.param('uuid')

  res.render('dashboard', {accessToken : accessToken, uuid : uuid})
})
app.listen(3000, function(){
    console.log('Conneted 3000 port!');
});
