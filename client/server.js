'use strict';

// var http = require('http')
var request = require('request');
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
const express = require('express');

// Constants
const PORT = 8080;
const mongoURL = 'mongodb://progpaint_mongo:27017/progpaint'

var db = {};

// App
const app = express();

var requestSettings = {
    url: 'http://progpaint_media:8081/full/4c69f9c4462041bc200b6485e79a10e1bbac160d.jpg',
    method: 'GET',
    encoding: null
};

var getPosts = function(callback) {
  findDocuments(db, function(posts) {
        // don't do this here, reshape the posts in a separate R container
        var ps = []
        posts.forEach(function(p) {
            var p2 = {}
            p2["_id"] = p["_id"];
            p2["text"] = p["text"];
            p2["ts"] = p["ts"];
            p2["url"] = "http://localhost:8081/" + p["images"][0]["path"];
            ps.push(p2);
        });
        // res.send(ps);
		callback(ps);
      }, 'posts');
}

var findDocuments = function(db, callback, collection_name) {
  // Get the documents collection
  var collection = db.collection(collection_name);
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

var returnWebpage = function(dynamicContent) {
  return '<html><body><p>' + dynamicContent + '</p></body></html>';
}

app.get('/', function(req,res) {
  getPosts(function(posts) {
    var dc = "";
    posts.forEach(function(p) {
		dc += "<div>"
		dc += "<img src='" + p["url"] + " '>"		
		dc += "</div>"
    });
	res.send(returnWebpage(dc));
  });
});

app.get('/testrequest', function (req, res) {
  request(requestSettings, function(err, res2, body) {
    res.set('Content-Type', 'image/jpeg');
    console.log(err);
    res.send(body);
  });
});

app.get('/post', function(req, res) {
   MongoClient.connect(mongoURL, function(err, db) {
      assert.equal(null, err);
      findDocuments(db, function(posts) {
		// don't do this here, reshape the posts in a separate R container
		var ps = []
        posts.forEach(function(p) {
			var p2 = {}
			p2["_id"] = p["_id"];
			p2["text"] = p["text"];
			p2["ts"] = p["ts"];
			p2["url"] = "http://progpaint_media:8081/" + p["images"][0]["path"];
			ps.push(p2);
		});
  		res.send(ps);
      }, 'posts');
      db.close();
    });
});

MongoClient.connect(mongoURL, function(err, db_) {
  if (err) {
    console.log(err);
    return;
  }

  db = db_;

  app.listen(PORT);
  console.log('Running on http://localhost:' + PORT);

});

