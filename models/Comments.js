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
  upvoters: [
    String
  ],
  downvoters: [
    String
  ]
});

CommentSchema.methods.upvote = function (user, cb) {
  if (this.hasDownvoted(user)) 
    this.unvote(user);

  this.upvoters.push(user);
  this.rating++;
  this.save(cb);
};

CommentSchema.methods.unvote = function (user, cb) {
  if (this.hasUpvoted(user)) {
    this.upvoters.splice(this.upvoters.indexOf(user));
    this.rating--;
  }

  if (this.hasDownvoted(user)) {
    this.downvoters.splice(this.downvoters.indexOf(user));
    this.rating++;
  }

  this.save(cb);
};

CommentSchema.methods.downvote = function (user, cb) {
  if (this.hasUpvoted(user))
    this.unvote(user);

  this.downvoters.push(user);
  this.rating--;
  this.save(cb);
};

CommentSchema.methods.hasUpvoted = function (user) {
  return this.upvoters.indexOf(user) != -1;
};

CommentSchema.methods.hasDownvoted = function (user) {
  return this.downvoters.indexOf(user) != -1;
};

mongoose.model('Comment', CommentSchema);
