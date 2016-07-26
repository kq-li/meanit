var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Meanit'
  });
});

router.get('/posts', function (req, res, next) {
  Post.find(function (err, posts) {
    if (err)
      return next(err);

    res.json(posts);
  });
});

router.post('/posts', function (req, res, next) {
  var post = new Post(req.body);

  post.save(function (err, post) {
    if (err)
      return next(err);

    res.json(post);
  });
});

router.get('/posts/:post', function (req, res, next) {
  req.post.populate('comments', function (err, post) {
    if (err)
      return next(err);

    res.json(post);
  });    
});

router.post('/posts/:post', function (req, res) {
  res.json(req.post);
});

router.put('/posts/:post/upvote', function (req, res) {
  req.post.upvote(function (err, post) {
    if (err)
      return next(err);

    res.json(post);
  });
});

router.post('/posts/:post/comments', function (req, res) {
  var comment = new Comment(req.body);
  comment.post = req.post;

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

router.put('/posts/:post/comments/:comment/upvote', function (req, res) {
  req.comment.upvote(function (err, comment) {
    if (err)
      return next(err);

    res.json(comment);
  });
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
