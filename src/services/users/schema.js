const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    surname: {
      type: String,
      required: [
        function () {
          return this.role === "patient" || this.role === "doctor";
        },
        "Surname is required",
      ],
    },
    image: {
      type: String,
      required: true,
      default: `https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png`,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      unique: true,
      dropDups: true,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId || this.googleId === "";
        },
        "Password is required",
      ],
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "clinic", "admin"],
      default: "patient",
      required: [true, "Type of user is required"],
    },
    phone: { type: String },
    gender: { type: String, enum: ["male", "female", "Other"] },
    birthdate: { type: String },

    refreshTokens: [],
    googleId: { type: String },
    description: {
      type: String,
      minlength: [30, "Description needs to be at least 30 characters"],
    },
    languages: [{ type: String }],
    website: { type: String },
    workingHours: [
      {
        _id: false,
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startHour: { type: String },
        endHour: { type: String },
      },
    ],
    specialization: [{ type: String }],

    clinicOrHospital: {
      type: String,
      required: [
        function () {
          return this.role === "doctor";
        },
        "Clinic or hospital that user works for is required",
      ],
    },

    rating: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId },
        rate: { type: Number },
      },
    ],
    allowedUsers: [{ type: Schema.Types.ObjectId }],
    postalCode: {
      type: Number,
      minlength: [5, "Postal Code needs to be 5 characters"],
    },
    street: {
      type: String,
      minlength: [5, "Street needs to be at least 5 characters"],
    },
    city: {
      type: String,
      minlength: [3, "City needs to be at least 3 characters"],
    },
    state: {
      type: String,
      minlength: [3, "State needs to be at least 3 characters"],
    },
    height: {
      type: String,
    },
    weight: {
      type: String,
    },
    profession: { type: String },
    maritalStatus: { type: String, enum: ["Single", "Married"] },
    socialNumber: { type: String },
    foodAllergies: [{ type: String }],
    medicineAllergies: [{ type: String }],
    diabetes: {
      type: String,
      enum: ["None", "Type 1", "Type 2", "Gestational diabetes"],
      default: "None",
    },
    hypertension: {
      type: String,
      enum: ["None", "Primary", "Secondary"],
      default: "None",
    },
    surgicalInterventions: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;
  delete userObj.refreshTokens;

  return userObj;
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else return null;
};

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPw = user.password;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPw, 12);
  }

  next();
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
