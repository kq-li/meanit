var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

function generateCallback(next, exec) {
  return function (err, data) {
    if (err)
      next(err);

    exec(data);
  }
};

function clientFilter(doc, user) {
  var obj = doc.toObject();

  if (user) {
    obj.hasUpvoted = doc.hasUserUpvoted(user);
    obj.hasDownvoted = doc.hasUserDownvoted(user);
  }

  delete obj.upvoters;
  delete obj.downvoters;
  return obj;
};

function postFilter(post, user) {
  var obj = clientFilter(post, user);
  
  post.comments.forEach(function (comment, index) {
    if (typeof comment === 'mongoose.Document')
      obj.comments[index] = commentFilter(comment, user);
  });
  
  return obj;
};

function commentFilter(comment, user) {
  return clientFilter(comment, user);
};

function userFilter(user) {
  var obj = user.toObject();
  delete obj.hash;
  delete obj.salt;
  return obj;
};

function requireAuth(req, res, next) {
  var header = req.headers.authorization;

  if (!header)
    return res.status(400).json({
      message: 'Invalid token!'
    });

  var data = header.split(' ');

  if (data[0] !== 'Bearer')
    return res.status(400).json({
      message: 'Invalid token!'
    });

  jwt.verify(data[1], 'SECRET', function (err, data) {
    if (err) {
      return res.status(400).json({
        message: 'Invalid token!'
      });
    } else {
      req.payload = data;
      next();
    }
  });
};

function silentAuth(req, res, next) {
  var header = req.headers.authorization;
  
  if (header && header.split(' ')[0] == 'Bearer') 
    jwt.verify(header.split(' ')[1], 'SECRET', function (err, data) {
      if (!err)
        req.payload = data;

      next();
    });
  else
    next();
};      
  
router.get('/api/home', function (req, res, next) {
  res.render('index');
});

router.get('/api/posts', silentAuth, function (req, res, next) {
  Post.find(generateCallback(next, function (posts) {
    if (req.payload) {
      User.findUser(req.payload.username, generateCallback(next, function (user) {
        posts.forEach(function (post, index) {
          posts[index] = postFilter(post, user);
        });
        
        res.json(posts);
      }));
    } else {
      posts.forEach(function (post, index) {
        posts[index] = postFilter(post);
      });
      
      res.json(posts);
    }
  }));
});

router.post('/api/posts', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    if (!user) {
      res.status(400).json({
        message: 'Invalid user!'
      });
    } else {
      var post = new Post(req.body);
      post.author = user.username;
      post.initialize();
      
      post.save(generateCallback(next, function (post) {
        res.json(clientFilter(post));
      }));
    }
  }));
});

router.get('/api/posts/:post', silentAuth, function (req, res, next) {
  var post = req.post;
  var user;
  
  if (req.payload)
    user = req.payload.username;
  
  post.populate('comments', generateCallback(next, function (post) {
    res.json(postFilter(post, user));
  }));
});

router.put('/api/posts/:post/upvote', requireAuth, function (req, res, next) {
  var post = req.post;
  var user = req.payload.username;
  
  var cb = generateCallback(next, function (post) {
    post.populate('comments', generateCallback(next, function (post) {
      res.json(postFilter(post, user));
    }));
  });

  if (post.hasUserDownvoted(user))
    post.unvote(user, generateCallback(next, function (post) {
      post.upvote(user, cb);
    }));
  else if (post.hasUserUpvoted(user))
    post.unvote(user, cb);
  else
    post.upvote(user, cb);
});

router.put('/api/posts/:post/downvote', requireAuth, function (req, res, next) {
  var post = req.post;
  var user = req.payload.username;

  var cb = generateCallback(next, function (post) {
    post.populate('comments', generateCallback(next, function (post) {
      res.json(postFilter(post, user));
    }));
  });

  if (post.hasUserUpvoted(user))
    post.unvote(user, generateCallback(next, function (post) {
      post.downvote(user, cb);
    }));
  else if (post.hasUserDownvoted(user))
    post.unvote(user, cb);
  else
    post.downvote(user, cb);
});

router.post('/api/posts/:post/edit', requireAuth, function (req, res, next) {
  var post = req.post;
  var user = req.payload.username;
  
  if (user === post.author) 
    post.edit(req.body.body, generateCallback(next, function (post) {
      post.populate('comments', generateCallback(next, function (post) {
        res.json(postFilter(post, user));
      }));
    }));
  else
    res.status(400).json({
      message: 'You aren\'t the author of this post!'
    });
});

router.put('/api/posts/:post/delete', requireAuth, function (req, res, next) {
  var post = req.post;
  var user = req.payload.username;

  var query = {
    _id: {
      $in: post.comments
    }
  };
  
  if (user === post.author)
    Comment.remove(query, generateCallback(next, function () {
      post.deleteComments(generateCallback(next, function (post) {
        post.remove(generateCallback(next, function (post) {
          res.json(postFilter(post, user));
        }));
      }));
    }));
  else
    res.status(400).json({
      message: 'You aren\'t the author of this post!'
    });
});      

router.post('/api/posts/:post/comments', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var comment = new Comment(req.body);
    comment.post = req.post._id;
    comment.author = user.username;
    comment.initialize();
    
    comment.save(generateCallback(next, function (comment) {
      req.post.addComment(comment, generateCallback(next, function (post) {
        res.json(commentFilter(comment, user));
      }));
    }));
  }));
});

router.put('/api/posts/:post/comments/:comment/upvote', requireAuth, function (req, res, next) {
  var post = req.post;
  var comment = req.comment;
  var user = req.payload.username;
  
  var cb = generateCallback(next, function (comment) {
    res.json(commentFilter(comment, user));
  });

  if (comment.hasUserDownvoted(user))
    comment.unvote(user, generateCallback(next, function (comment) {
      comment.upvote(user, cb);
    }));
  else if (comment.hasUserUpvoted(user))
    comment.unvote(user, cb);
  else
    comment.upvote(user, cb);
});

router.put('/api/posts/:post/comments/:comment/downvote', requireAuth, function (req, res, next) {
  var post = req.post;
  var comment = req.comment;
  var user = req.payload.username;
  
  var cb = generateCallback(next, function (comment) {
    res.json(commentFilter(comment, user));
  });

  if (comment.hasUserUpvoted(user))
    comment.unvote(user, generateCallback(next, function (comment) {
      comment.downvote(user, cb);
    }));
  else if (comment.hasUserDownvoted(user))
    comment.unvote(user, cb);
  else
    comment.downvote(user, cb);
});

router.post('/api/posts/:post/comments/:comment/edit', requireAuth, function (req, res, next) {
  var post = req.post;
  var comment = req.comment;
  var user = req.payload.username;
  
  if (user === comment.author)
    comment.edit(req.body.body, generateCallback(next, function (comment) {
      res.json(commentFilter(comment, user));
    }));
  else
    res.status(400).json({
      message: 'You aren\'t the author of this comment!'
    });
});

router.put('/api/posts/:post/comments/:comment/delete', requireAuth, function (req, res, next) {
  var post = req.post;
  var comment = req.comment;
  var user = req.payload.username;
  
  if (user === comment.author)
    post.deleteComment(comment, generateCallback(next, function (post) {
      comment.remove(generateCallback(next, function (comment) {
        res.json(commentFilter(comment, user));
      }));
    }));
  else
    res.status(400).json({
      message: 'You aren\'t the author of this comment!'
    });
});

router.post('/api/register', function (req, res, next) {
  if (!req.body.username || !req.body.password) 
    return res.status(400).json({
      message: 'Please fill out all fields!'
    });

  User.findUser(req.body.username, generateCallback(next, function (user) {
    if (user) {
      res.status(400).json({
        message: 'Username is already in use!'
      });
    } else {
      var user = new User();
      user.username = req.body.username;
      user.setPassword(req.body.password);

      user.save(generateCallback(next, function (user) {
        return res.json({
          token: user.generateJWT()
        });
      }));
    }
  }));
});    

router.post('/api/login', function (req, res, next) {
  if (!req.body.username || !req.body.password)
    return res.status(400).json({
      message: 'Please fill out all fields!'
    });

  passport.authenticate('local', function (err, user, info) {
    if (err) 
      return next(err);

    if (user)
      return res.json({
        token: user.generateJWT()
      });
    else 
      return res.status(401).json(info);
  })(req, res, next);
});

router.get('/api/users/', silentAuth, function (req, res, next) {
  User.find(generateCallback(next, function (users) {
    res.json(users);
  }));
});
                
router.get('/api/users/:user', silentAuth, function (req, res, next) {
  var user;

  if (req.payload)
    user = req.payload.username;
  
  var query = {
    author: req.user.username
  };
  
  Post.find(query, generateCallback(next, function (posts) {
    Comment.find(query, generateCallback(next, function (comments) {
      var data = userFilter(req.user);
      data.posts = posts;
      data.comments = comments;

      posts.forEach(function (post, index) {
        data.posts[index] = postFilter(post, user);
      });

      comments.forEach(function (comment, index) {
        data.comments[index] = commentFilter(comment, user);
      });
      
      res.json(data);
    }));
  }));
});

router.get('*', function (req, res, next) {
  res.render('index');
});

router.param('post', function (req, res, next, id) {
  Post.findById(id, function (err, post) {
    if (err)
      return next(err);

    if (!post)
      return next(new Error('Can\'t find post!'));

    req.post = post;
    return next();
  });
});

router.param('comment', function (req, res, next, id) {
  Comment.findById(id, function (err, comment) {
    if (err)
      return next(err);

    if (!comment)
      return next(new Error('Can\'t find comment!'));

    req.comment = comment;
    return next();
  });
});

router.param('user', function (req, res, next, name) {
  User.findUser(name, function (err, user) {
    if (err)
      return next(err);
    
    if (!user)
      return next(new Error('Can\'t find user!'));

    req.user = user;
    return next();
  });
});

module.exports = router;
