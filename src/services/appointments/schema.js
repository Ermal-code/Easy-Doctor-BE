const { Schema, model } = require("mongoose");

const AppointmentSchema = new Schema(
  {
    startDate: { type: Date, required: "Start time is required" },
    endDate: { type: Date, required: true },
    type: {
      type: String,
      enum: ["online", "on-site"],
      required: "Type of appointment is required",
    },
    doctor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clinic: { type: Schema.Types.ObjectId, ref: "User" },
    patient: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: "Reason for visit is required" },
  },
  { timestamps: true }
);

const AppointmentModel = model("Appointment", AppointmentSchema);

module.exports = AppointmentModel;
