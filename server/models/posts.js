const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
  contributor: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  likes: [{
    type: String,
    ref: 'User'
  }],

  userId: {
    type: String,
    ref: 'User', 
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;