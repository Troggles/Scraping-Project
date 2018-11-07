var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000; 

var app = express();

//configuring morgan

app.use(logger("dev"));

app.use(express.urlencoded({extended: true }));

