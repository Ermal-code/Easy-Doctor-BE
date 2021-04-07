const { Schema, model } = require("mongoose");

const DocumentSchema = new Schema({
  title: {
    type: String,
    required: [true, "A title for the document is required"],
  },
  file: { type: String },
  description: { type: String },
  patient: { type: Schema.Types.ObjectId, ref: "User" },
});

const DocumentModel = model("Document", DocumentSchema);

module.exports = DocumentModel;
