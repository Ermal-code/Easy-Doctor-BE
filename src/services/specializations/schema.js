const { Schema, model } = require("mongoose");

const SpecializationSchema = new Schema({
  specialization: {
    type: String,
    required: [true, "Specialization is required"],
  },
});

const SpecializationModel = model("Specialization", SpecializationSchema);

module.exports = SpecializationModel;
