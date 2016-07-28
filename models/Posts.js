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
  }]
});

PostSchema.methods.upvote = function (cb) {
  this.rating++;
  this.save(cb);
};

PostSchema.methods.downvote = function (cb) {
  this.rating--;
  this.save(cb);
};

mongoose.model('Post', PostSchema);
