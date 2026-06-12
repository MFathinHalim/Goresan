import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "posts", required: true },
  reason: {
    type: String,
    required: true,
    enum: ["nsfw_unmarked", "spam", "harassment", "false_nsfw", "false_ai", "other"], // Sudah disesuaikan
  },
  customReason: { type: String, default: "" },
  status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.models.reports || mongoose.model("reports", reportSchema);

export default Report;
