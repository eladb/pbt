var path = require('path');
var fs = require('fs');
var express = require('express');

var server = express.createServer();

var posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample.json')));

server.use(express.static(path.join(__dirname, 'public')));

server.get('/products', function(req, res) {
  res.send(posts);
});

server.get('/products/:id', function(req, res) {
  var found = posts.filter(function(post) {
    return post.id == req.params.id;
  });

  if (!found || found.length === 0) {
    return res.send(404);
  }

  return res.send(found[0]);
});

server.listen(5000);