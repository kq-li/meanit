var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var jwt = require('express-jwt');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = jwt({
  secret: 'SECRET',
  userProperty: 'payload'
});

function findByUsername(username, cb) {
  User.findOne({
    username: username
  }, function (err, user) {
    if (err)
      throw err;

    if (!user)
      throw new Error('Can\'t find user!');

    cb(user);
  });
};

router.get('/api/home', function (req, res, next) {
  res.render('index', {
    title: 'Meanit'
  });
});

router.get('/api/posts', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err)
      return next(err);
    
    res.json(posts);
  });
});

router.post('/api/posts', auth, function (req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;
  
  post.save(function (err, post) {
    if (err)
      return next(err);

    res.json(post);
  });
});

router.get('/api/posts/:post', function (req, res, next) {
  req.post.populate('comments', function (err, post) {
    if (err)
      return next(err);

    res.json(post);
  });    
});

router.put('/api/posts/:post/upvote', auth, function (req, res) {
  var post = req.post;
  var user = req.payload.username;
  
  var cb = function (err, post) {
    if (err)
      return next(err);

    res.json(post);
  };
    
  if (post.hasDownvoted(user)|| !post.hasUpvoted(user)) 
    post.upvote(user, cb);
  else if (post.hasUpvoted(user)) 
    post.unvote(user, cb);
});

router.put('/api/posts/:post/downvote', auth, function (req, res) {
  var post = req.post;
  var user = req.payload.username;

  var cb = function (err, post) {
    if (err)
      return next(err);
    
    res.json(post);
  };
    
  if (post.hasUpvoted(user) || !post.hasDownvoted(user))
    post.downvote(user, cb);
  else if (post.hasDownvoted(user))
    post.unvote(user, cb);
});

router.post('/api/posts/:post/comments', auth, function (req, res) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;

  comment.save(function (err, comment) {
    if (err)
      return next(err);

    req.post.comments.push(comment);
    req.post.save(function (err, post) {
      if (err)
        return next(err);

      res.json(comment);
    });
  });
});

router.put('/api/posts/:post/comments/:comment/upvote', auth, function (req, res) {
  var comment = req.comment;
  var user = req.payload.username;

  var cb = function (err, comment) {
    if (err)
      return next(err);

    res.json(comment);
  };

  if (comment.hasDownvoted(user) || !comment.hasUpvoted(user))
    comment.upvote(user, cb);
  else if (comment.hasUpvoted(user))
    comment.unvote(user, cb);
});

router.put('/api/posts/:post/comments/:comment/downvote', auth, function (req, res) {
  var comment = req.comment;
  var user = req.payload.username;

  var cb = function (err, comment) {
    if (err)
      return next(err);

    res.json(comment);
  };

  if (comment.hasUpvoted(user) || !comment.hasDownvoted(user))
    comment.downvote(user, cb);
  else if (comment.hasDownvoted(user))
    comment.unvote(user, cb);
});

router.post('/api/register', function (req, res, next) {
  if (!req.body.username || !req.body.password) 
    return res.status(400).json({
      message: 'Please fill out all fields!'
    });

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function (err) {
    if (err)
      return next(err);

    return res.json({
      token: user.generateJWT()
    });
  });
});    

router.post('/api/login', function (req, res, next) {
  if (!req.body.username || !req.body.password)
    return res.status(400).json({
      message: 'Please fill out all fields!'
    });

  passport.authenticate('local', function (err, user, info) {
    if (err) 
      return next(err);

    if (user && user.validPassword(req.body.password))
      return res.json({
        token: user.generateJWT()
      });
    else 
      return res.status(401).json({
        message: 'Incorrect username or password!'
      });
  })(req, res, next);
});

router.get('*', function (req, res, next) {
  res.redirect('/api/home');
});

router.param('post', function (req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function (err, post) {
    if (err)
      return next(err);

    if (!post)
      return next(new Error('Can\'t find post!'));

    req.post = post;
    return next();
  });
});

router.param('comment', function (req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment) {
    if (err)
      return next(err);

    if (!comment)
      return next(new Error('Can\'t find comment!'));

    req.comment = comment;
    return next();
  });
});


module.exports = router;
