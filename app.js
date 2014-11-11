/* IPD-web
 * 11/1/14
 * Authors: Naomi Dudley, Derek Redfern
 *
 */

// Module imports
var dotenv = require('dotenv');
var express = require('express');
var app = express();
var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/ipd");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("Open!");
    var lovedOneSchema = mongoose.Schema({
        lat: String,        // latitude of loved one
        lon: String,        // longitude of loved one
        address: String,    // address of loved one
        updated: Date       // date/time this item was last updated
    });
    var lovedOneModel = mongoose.model('Loved One Data',lovedOneSchema);
    var lovedOneData = new lovedOneModel({updated:Date.now});

    var caregiverSchema = mongoose.Schema({
        lat: String,        // latitude of caregiver
        lon: String,        // longitude of caregiver
        reldir: Number,     // compass direction between 0 and 359
        updated: Date,      // date/time this item was last updated

    });
    var caregiverModel = mongoose.model('Caregiver Data',caregiverSchema);
    var caregiverData = new lovedOneModel({updated:Date.now});
});

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
    res.send("Function is not implemented yet.");
});

app.post("/caregiver",function(req,res){
    // post the caregiver's current coordinates and orientation
    res.send("Function is not implemented yet.");
});


// Get the server up and running!
var server = app.listen(process.env.PORT || 5000, function() {
    console.log('Listening on port %d', server.address().port);
});
