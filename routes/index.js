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
    });
  
  next();
};      
  
router.get('/api/home', function (req, res, next) {
  res.render('index');
});

router.get('/api/posts', silentAuth, function (req, res, next) {
  Post.find(generateCallback(next, function (posts) {
    if (req.payload)
      User.findUser(req.payload.username, generateCallback(next, function (user) {
        posts.forEach(function (post, index) {
          post.hasUpvotedPost = user.hasUpvotedPost(post);
          post.hasDownvotedPost = user.hasDownvotedPost(post);
        });

        res.json(posts);
      }));
    else
      res.json(posts);
  }));
});

router.post('/api/posts', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var post = new Post(req.body);
    post.author = req.payload.username;
    post.hasUpvotedPost = false;
    post.hasDownvotedPost = false;
    
    post.save(generateCallback(next, function (post) {
      user.addPost(post, generateCallback(next, function (user) {
        res.json(post);
      }));
    }));
  }));
});

router.get('/api/posts/:post', silentAuth, function (req, res, next) {
  req.post.populate('comments', generateCallback(next, function (post) {
    if (req.payload)
      User.findUser(req.payload.username, generateCallback(next, function (user) {
        post.comments.forEach(function (comment, index) {
          post.comments[index].hasUpvotedComment = user.hasUpvotedComment(comment);
          post.comments[index].hasDownvotedComment = user.hasDownvotedComment(comment);
        });

        res.json(post);
      }));
    else
      res.json(post);
  }));
});

router.put('/api/posts/:post/upvote', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var post = req.post;
    
    var cb = generateCallback(next, function (user) {
      post.hasUpvotedPost = user.hasUpvotedPost(post);
      post.hasDownvotedPost = user.hasDownvotedPost(post);
      res.json(post);
    });

    if (user.hasDownvotedPost(post))
      user.unvotePost(post, generateCallback(next, function (user) {
        user.upvotePost(post, cb);
      }));
    else if (!user.hasUpvotedPost(post))
      user.upvotePost(post, cb);
    else if (user.hasUpvotedPost(post))
      user.unvotePost(post, cb);
  }));
});

router.put('/api/posts/:post/downvote', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var post = req.post;
    
    var cb = generateCallback(next, function (user) {
      post.hasUpvotedPost = user.hasUpvotedPost(post);
      post.hasDownvotedPost = user.hasDownvotedPost(post);
      res.json(post);
    });

    if (user.hasUpvotedPost(post))
      user.unvotePost(post, generateCallback(next, function (user) {
        user.downvotePost(post, cb);
      }));
    else if (!user.hasDownvotedPost(post))
      user.downvotePost(post, cb);
    else if (user.hasDownvotedPost(post))
      user.unvotePost(post, cb);
  }));
});

router.post('/api/posts/:post/edit', requireAuth, function (req, res, next) {
  if (req.payload.username === req.post.author)
    req.post.edit(req.body.body, function () {
      res.json(req.post);
    });
  else
    res.status(400).json({
      message: 'You aren\'t the author of this post!'
    });
});

router.post('/api/posts/:post/comments', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    comment.author = req.payload.username;
    comment.hasUpvotedComment = false;
    comment.hasDownvotedComment = false;
    
    comment.save(generateCallback(next, function (comment) {
      user.addComment(comment, generateCallback(next, function (user) {
        comment.post.addComment(comment, generateCallback(next, function (post) {
          res.json(comment);
        }));
      }));
    }));
  }));
});

router.put('/api/posts/:post/comments/:comment/upvote', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var comment = req.comment;

    var cb = generateCallback(next, function (user) {
      comment.hasUpvotedComment = user.hasUpvotedComment(comment);
      comment.hasDownvotedComment = user.hasDownvotedComment(comment);
      res.json(comment);
    });

    if (user.hasDownvotedComment(comment))
      user.unvoteComment(comment, generateCallback(next, function (user) {
        user.upvoteComment(comment, cb);
      }));
    else if (!user.hasUpvotedComment(comment))
      user.upvoteComment(comment, cb);
    else if (user.hasUpvotedComment(comment))
      user.unvoteComment(comment, cb);
  }));
});

router.put('/api/posts/:post/comments/:comment/downvote', requireAuth, function (req, res, next) {
  User.findUser(req.payload.username, generateCallback(next, function (user) {
    var comment = req.comment;

    var cb = generateCallback(next, function (user) {
      comment.hasUpvotedComment = user.hasUpvotedComment(comment);
      comment.hasDownvotedComment = user.hasDownvotedComment(comment);
      res.json(comment);
    });

    if (user.hasUpvotedComment(comment))
      user.unvoteComment(comment, generateCallback(next, function (user) {
        user.downvoteComment(comment, cb);
      }));
    else if (!user.hasDownvotedComment(comment))
      user.downvoteComment(comment, cb);
    else if (user.hasDownvotedComment(comment))
      user.unvoteComment(comment, cb);
  }));
});

router.post('/api/posts/:post/comments/:comment/edit', requireAuth, function (req, res, next) {
  if (req.payload.username === req.comment.author)
    req.comment.edit(req.body.body, function () {
      res.json(req.comment);
    });
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

router.get('/api/users/', function (req, res, next) {
  User.find(generateCallback(next, function (users) {
    res.json(users);
  }));
});

router.get('/api/users/:user', function (req, res, next) {
  req.user.populate('posts', generateCallback(next, function (user) {
    user.populate('comments', generateCallback(next, function (user) {
      res.json(user);
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
