import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },

  title: { type: String, required: true },

  desc: {
    type: String,
    default: "",
  },

  img: {
    type: String,
    required: true,
  },

  tags: [{ type: String }],

  time: { type: String },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  like: {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },

  commentCount: {
    type: Number,
    default: 0,
  },
});

const Post = mongoose.models.posts || mongoose.model("posts", postSchema);

export default Post;