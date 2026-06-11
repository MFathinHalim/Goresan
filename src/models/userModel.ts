import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  profilePicture: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    default: "",
    maxlength: 250,
  },

  age: {
    type: Number,
    default: null,
  },

  allowNSFW: {
    type: Boolean,
    default: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },
  interactions: [
    {
      tag: { type: String, lowercase: true },
      score: { type: Number, default: 0 }
    }
  ],

  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,

  verifyToken: String,
  verifyTokenExpiry: Date,
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
