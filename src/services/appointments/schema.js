const { Schema, model } = require("mongoose");

const AppointmentSchema = new Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ["online", "on-site"], required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clinic: { type: Schema.Types.ObjectId, ref: "User" },
    patient: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const AppointmentModel = model("Appointment", AppointmentSchema);

module.exports = AppointmentModel;
