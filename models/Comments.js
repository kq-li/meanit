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
  }
});

CommentSchema.methods.upvote = function (cb) {
  this.rating++;
  this.save(cb);
};

CommentSchema.methods.downvote = function (cb) {
  this.rating--;
  this.save(cb);
};

mongoose.model('Comment', CommentSchema);
