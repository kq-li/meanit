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
  hasUpvotedPost: Boolean,
  hasDownvotedPost: Boolean
});

PostSchema.methods.upvote = function () {
  this.rating++;
  this.save();
};

PostSchema.methods.downvote = function () {
  this.rating--;
  this.save();
};

PostSchema.methods.addComment = function (comment, cb) {
  this.comments.push(comment);
  this.save(cb);
};

PostSchema.methods.deleteComment = function (comment, cb) {
  this.comments.splice(this.comments.indexOf(comment));
  comment.remove()
  this.save(cb);
};

PostSchema.methods.deleteComments = function (cb) {
  for (var i = 0; i < this.comments.length; i++)
    this.comments[i].remove();

  this.comments = [];
  this.save(cb);
};

mongoose.model('Post', PostSchema);
