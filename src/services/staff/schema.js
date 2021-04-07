const { Schema, model } = require("mongoose");

const StaffMemberSchema = new Schema({
  hospital: {
    type: Schema.Types.ObjectId,
    required: [true, "Hospital id is required"],
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Doctor is required"],
  },
});

const StaffMemberModel = model("StaffMember", StaffMemberSchema);

module.exports = StaffMemberModel;
