var async = require('async');

var EMAIL_PARSER = /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

module.exports = function(graph, callback) {

  var posts = [];

  graph.get('parent.buy.together/posts?limit=100', function(err, res) {
    if (err) {
      throw new Error('error:' + err.message);
    }

    res.data.forEach(function(post) {
      var p = {
        id: post.id,
        link: post.link,
        message: post.message,
        picture: post.picture,
      };

      posts.push(p);
    });

    async.forEach(posts, function(post, cb) {
      graph.get(post.id + '/comments', function(err, res) {
        
        post.comments = [];
        
        res.data.forEach(function(comment) {

          var c = {
            id: comment.id,
            from: comment.from,
            message: comment.message,
            created_time: comment.created_time,
          };

          var _ = EMAIL_PARSER.exec(c.message);
          if (_) {
            c.email = _[0];
            console.log('found email:', c.email);
          }

          post.comments.push(c);

          return cb();
        });
      });
    }, function(err) {
      console.log(posts);
      return callback(err, posts);
    });
  });
}