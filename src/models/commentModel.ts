import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
      default: null,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comment =
  mongoose.models.comments ||
  mongoose.model("comments", commentSchema);

export default Comment;