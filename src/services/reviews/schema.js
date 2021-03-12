const { Schema, model } = require("mongoose");

const ReviewSchema = new Schema(
  {
    reviewedUser: { type: Schema.Types.ObjectId, required: true },
    reviewUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const ReviewModel = model("Review", ReviewSchema);

module.exports = ReviewModel;
