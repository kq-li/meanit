var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  link: String,
  author: String,
  body: String,
  rating: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  upvoters: [{
    type: String,
    unique: true
  }],
  downvoters: [{
    type: String,
    unique: true
  }]
});

PostSchema.methods.initialize = function () {
  this.comments = [];
  this.upvoters = [];
  this.downvoters = [];
};

PostSchema.methods.upvote = function (user, cb) {
  this.upvoters.push(user);
  this.rating++;
  this.save(cb);
};

PostSchema.methods.downvote = function (user, cb) {
  this.downvoters.push(user);
  this.rating--;
  this.save(cb);
};

PostSchema.methods.unvote = function (user, cb) {
  if (this.hasUserUpvoted(user)) {
    this.upvoters.splice(this.upvoters.indexOf(user));
    this.rating--;
  }

  if (this.hasUserDownvoted(user)) {
    this.downvoters.splice(this.downvoters.indexOf(user));
    this.rating++;
  }

  this.save(cb);
};

PostSchema.methods.edit = function (body, cb) {
  this.body = body;
  this.save(cb);
};

PostSchema.methods.hasUserUpvoted = function (user) {
  return this.upvoters.indexOf(user) !== -1;
};

PostSchema.methods.hasUserDownvoted = function (user) {
  return this.downvoters.indexOf(user) !== -1;
};

PostSchema.methods.addComment = function (comment, cb) {
  this.comments.push(comment);
  this.save(cb);
};

PostSchema.methods.deleteComment = function (comment, cb) {
  this.comments.splice(this.comments.indexOf(comment));
  this.save(cb);
};

PostSchema.methods.deleteComments = function (cb) {
  this.comments = [];
  this.save(cb);
};

mongoose.model('Post', PostSchema);
