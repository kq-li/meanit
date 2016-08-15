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
  hasUpvotedComment: Boolean,
  hasDownvotedComment: Boolean
});

CommentSchema.methods.upvote = function () {
  this.rating++;
  this.save();
};

CommentSchema.methods.downvote = function () {
  this.rating--;
  this.save();
};

mongoose.model('Comment', CommentSchema);
