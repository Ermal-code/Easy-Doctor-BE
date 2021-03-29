const { Schema, model } = require("mongoose");

const EducationSchema = new Schema({
  type: {
    type: String,
    required: [true, "Type of education is required"],
    enum: ["High school", "University", "Specialization"],
  },
  school: { type: String, required: [true, "Name of school is required"] },
  startDate: { type: Date, required: [true, "Start date is required"] },
  endDate: { type: Date },
  area: { type: String },
  user: { type: Schema.Types.ObjectId, required: true },
});

const EducationModel = model("Education", EducationSchema);

module.exports = EducationModel;
