const { Schema, model } = require("mongoose");

const ExperienceSchema = new Schema({
  role: { type: String, required: [true, "Role that you had is required"] },
  company: { type: String, required: [true, "Hospital or clinic is required"] },
  startDate: { type: Date, required: [true, "Start date is required"] },
  endDate: { type: Date },
  area: { type: String },
  user: { type: Schema.Types.ObjectId, required: true },
});

const ExperienceModel = model("Experience", ExperienceSchema);

module.exports = ExperienceModel;
