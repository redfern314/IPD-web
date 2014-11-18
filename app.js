/* IPD-web
 * 11/1/14
 * Authors: Naomi Dudley, Derek Redfern
 *
 */

// Global Mongo Models
var caregiverModel;
var lovedOneModel;

// Module imports
var dotenv = require('dotenv');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var request = require('request');

// Function defines
var relDirection = function (lat1str,lon1str,lat2str,lon2str) {
    var lat1 = parseFloat(lat1str)*Math.PI/180;
    var lon1 = parseFloat(lon1str)*Math.PI/180;
    var lat2 = parseFloat(lat2str)*Math.PI/180;
    var lon2 = parseFloat(lon2str)*Math.PI/180;
    var y = Math.sin(lon2-lon1) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) -
        Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
    var bearing = ((Math.atan2(y, x)*180/Math.PI) + 360) % 360;
    console.log(bearing);
    return bearing;
}

var revGeocode = function (lat,lon) {
    url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+
        lat+","+lon+"&key="+process.env.googleAPI+"&result_type=street_address";
    request(url,function (error,response,body) {
        result = JSON.parse(body).results[0];
        var number;
        var street;
        var town;
        var state;
        for (var i = 0; i < result.address_components.length; i++) {
            var component = result.address_components[i];
            if (component.types.indexOf("street_number") != -1)
                number = component.short_name;
            if (component.types.indexOf("route") != -1)
                street = component.short_name;
            if (component.types.indexOf("locality") != -1)
                town = component.short_name;
            if (component.types.indexOf("administrative_area_level_1") != -1)
                state = component.short_name;
        }
        var address = number+" "+street+"\n"+town+" "+state;
        console.log(address);
        lovedOneModel.find(function (err,data) {
            if (err) return console.error(err);
            obj = data[0];
            obj.lat = lat;
            obj.lon = lon;
            obj.address = address;
            obj.updated = Date.now();
            obj.save();
        });
    });
}

mongoose.connect("mongodb://localhost/ipd");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var lovedOneSchema = mongoose.Schema({
    lat: String,        // latitude of loved one
    lon: String,        // longitude of loved one
    address: String,    // address of loved one
    updated: Date       // date/time this item was last updated
});
lovedOneModel = mongoose.model('lovedone',lovedOneSchema);
// var lovedOneData = new lovedOneModel({updated:Date.now()});
// lovedOneData.save();

var caregiverSchema = mongoose.Schema({
    lat: String,        // latitude of caregiver
    lon: String,        // longitude of caregiver
    reldir: Number,     // compass direction between 0 and 359
    updated: Date,      // date/time this item was last updated

});
caregiverModel = mongoose.model('caregiver',caregiverSchema);
// var caregiverData = new caregiverModel({updated:Date.now()});
// caregiverData.save();

// Load the environment variables from the .env file
dotenv.load();

// Jade is our default rendering engine; use public for static files
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.locals.pretty = true; // prettify HTML

// HTTP endpoints
app.get("/",function(req,res){
    // render some default text
    res.send("IPD Team 3 - Backend Web Server");
});

app.get("/lovedone",function(req,res){
    // get the loved one's current address and relative direction
    res.send("Function is not implemented yet.");
});

app.post("/lovedone",function(req,res){
    // post the loved one's current coordinates
    console.log(req.query);
    var lovedonelat = req.query.latitude;
    var lovedonelon = req.query.longitude;
    revGeocode(lovedonelat,lovedonelon);

    caregiverModel.find(function (err,data) {
        if (err) return console.error(err);
        obj = data[0];
        var caregiverlat = obj.lat;
        var caregiverlon = obj.lon;
        obj.reldir = relDirection(caregiverlat,caregiverlon,lovedonelat,lovedonelon);
        obj.updated = Date.now();
        obj.save();
    });

    res.send("");
});

app.post("/caregiver",function(req,res){
    // post the caregiver's current coordinates and orientation
    caregiverModel.find(function (err,data) {
        if (err) return console.error(err);
        obj = data[0];
        obj.lat = req.query.latitude;
        obj.lon = req.query.longitude;
        obj.reldir = relDirection(caregiverlat,caregiverlon,lovedonelat,lovedonelon);
        obj.updated = Date.now();
        obj.save();
    });
});

// Get the server up and running!
var server = app.listen(process.env.PORT || 5000, function() {
    console.log('Listening on port %d', server.address().port);
});
