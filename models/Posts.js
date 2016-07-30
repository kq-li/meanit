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
  upvoters: [
    String
  ],
  downvoters: [
    String
  ]
});

PostSchema.methods.upvote = function (user, cb) {
  if (this.hasDownvoted(user)) 
    this.unvote(user);

  this.upvoters.push(user);
  this.rating++;
  this.save(cb);
};

PostSchema.methods.unvote = function (user, cb) {
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

PostSchema.methods.downvote = function (user, cb) {
  if (this.hasUpvoted(user))
    this.unvote(user);

  this.downvoters.push(user);
  this.rating--;
  this.save(cb);
};

PostSchema.methods.hasUpvoted = function (user) {
  return this.upvoters.indexOf(user) != -1;
};

PostSchema.methods.hasDownvoted = function (user) {
  return this.downvoters.indexOf(user) != -1;
};

mongoose.model('Post', PostSchema);
