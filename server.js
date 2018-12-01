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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//made my public folder already
app.use(express.static("public"));
//setting up local db with mongo
mongoose.connect("mongodb://localhost/Scraping-Project", {useNewUrlParser: true});



//deployment route // connects to DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

//get routes for scraping
app.get("/scrape", function(req, res) {
    //grabbing the body 
    axios.get("http://www.echojs.com/").then(function(response) {
        var $ = cheerio.load(response.data);
        //h2 grab
        $("article h2").each(function(i, element) {
            //creating the result object
            var result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    return res.json(err);
                });

        });

        //upon scraping completion
        res.send("Scrape Complete");

    });
});

app.get("/articles", function(req, res) {
    db.Article.find({})
        .then(function(dbArticle){
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

//grab article by id - add note too
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true } );
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err){
            res.json(err);
        });
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on part %d in %s mode", this.address().port, app.settings.env);
});

// app.listen(PORT, function() {
//     console.log("App running on port " + PORT + "!");
// });


