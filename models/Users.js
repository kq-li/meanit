var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true
  },
  hash: String,
  salt: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    unique: true
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    unique: true
  }],
  upvotedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    unique: true
  }],
  upvotedComments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    unique: true
  }],
  downvotedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    unique: true
  }],
  downvotedComments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    unique: true
  }]
});

UserSchema.statics.findUser = function (username, cb) {
  this.findOne({
    username: username
  }, cb);
};

UserSchema.methods.setPassword = function (password, cb) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
  return crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex') === this.hash;
};

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, 'SECRET');
};

UserSchema.methods.addPost = function (post, cb) {
  this.posts.push(post);
  this.save(cb);
};

UserSchema.methods.addComment = function (comment, cb) {
  this.comments.push(comment);
  this.save(cb);
};

UserSchema.methods.upvotePost = function (post, cb) {
  this.upvotedPosts.push(post);
  post.upvote();
  this.save(cb);
};

UserSchema.methods.unvotePost = function (post, cb) {
  if (this.hasUpvotedPost(post)) {
    this.upvotedPosts.splice(this.upvotedPosts.indexOf(post));
    post.downvote();
  }

  if (this.hasDownvotedPost(post)) {
    this.downvotedPosts.splice(this.downvotedPosts.indexOf(post));
    post.upvote();
  }

  this.save(cb);
};

UserSchema.methods.downvotePost = function (post, cb) {
  this.downvotedPosts.push(post);
  post.downvote();
  this.save(cb);
};

UserSchema.methods.upvoteComment = function (comment, cb) {
  this.upvotedComments.push(comment);
  comment.upvote();
  this.save(cb);
};

UserSchema.methods.unvoteComment = function (comment, cb) {
  if (this.hasUpvotedComment(comment)) {
    this.upvotedComments.splice(this.upvotedComments.indexOf(comment));
    comment.downvote();
  }
  
  if (this.hasDownvotedComment(comment)) {
    this.downvotedComments.splice(this.downvotedComments.indexOf(comment));
    comment.upvote();
  }

  this.save(cb);
};

UserSchema.methods.downvoteComment = function (comment, cb) {
  this.downvotedComments.push(comment);
  comment.downvote();
  this.save(cb);
};

UserSchema.methods.hasUpvotedPost = function (post) {
  return this.upvotedPosts.indexOf(post._id) != -1;
};

UserSchema.methods.hasDownvotedPost = function (post) {
  return this.downvotedPosts.indexOf(post._id) != -1;
};

UserSchema.methods.hasUpvotedComment = function (comment) {
  return this.upvotedComments.indexOf(comment._id) != -1;
};

UserSchema.methods.hasDownvotedComment = function (comment) {
  return this.downvotedComments.indexOf(comment._id) != -1;
};

mongoose.model('User', UserSchema);
