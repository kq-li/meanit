var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  author: String,
  body: String,
  rating: {
    type: Number,
    default: 0
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  upvoters: [{
    type: String,
    unique: true
  }],
  downvoters: [{
    type: String,
    unique: true
  }]
});

CommentSchema.methods.initialize = function () {
  this.upvoters = [];
  this.downvoters = [];
};

CommentSchema.methods.upvote = function (user, cb) {
  this.upvoters.push(user);
  this.rating++;
  this.save(cb);
};

CommentSchema.methods.downvote = function (user, cb) {
  this.downvoters.push(user);
  this.rating--;
  this.save(cb);
};

CommentSchema.methods.unvote = function (user, cb) {
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

CommentSchema.methods.edit = function (body, cb) {
  this.body = body;
  this.save(cb);
};

CommentSchema.methods.hasUserUpvoted = function (user) {
  return this.upvoters.indexOf(user) !== -1;
};

CommentSchema.methods.hasUserDownvoted = function (user) {
  return this.downvoters.indexOf(user) !== -1;
};

mongoose.model('Comment', CommentSchema);
