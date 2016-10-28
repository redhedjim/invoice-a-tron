/* jshint undef: true, unused: false */
/* globals require: true */

var express = require('express'); //call express
var app = express(); //define our app using express
var bodyParser = require('body-parser'); //get body-parser
var morgan = require('morgan'); //used to see requests
var path = require('path');
var config = require('./app/config/config.js');
var Bookshelf = require('./app/config/bookshelf')(config);//for talking with our database
var _ = require("underscore"); //Underscore
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var crypto = require('crypto'); //Encryptes passwords
//helper functions

app.set('isJSON', function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
});
//end of helper functions

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));    
app.use(express.static(__dirname + '/public'));//expose public directory
app.set('superSecret', config.harvest.secret); //Secret variable
// required for passport
app.use(function(req,res,next) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    }
});


//API ROUTES ---------------------------------
var apiRoutes = require('./app/routes/api.js')(app, express, jwt, bodyParser, Bookshelf, _);
app.use('/api', apiRoutes);

//START THE SERVER
//=================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);