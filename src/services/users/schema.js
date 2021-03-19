const { Schema, model, SchemaTypes } = require("mongoose");
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
      default: `https://lh3.googleusercontent.com/proxy/GjZL2aHCfzXqLnTGNtp9ZyY7DmRmOI7qe0jD8w0ugk5gNLvH8w3j2rpy4CGTMe8t2Qnhqo62y5d2lnUzLTYG2IEt4pgNmQ0PgJJHmnia_Tr0RdCFJC8q9Jo9QRKrxWw`,
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
    phone: { type: String, required: [true, "Phone number is required"] },
    gender: { type: String, enum: ["male", "female", "non-binary"] },
    birthdate: { type: String },
    documentId: { type: String },
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
    specialization: [
      {
        type: Schema.Types.ObjectId, // required to be fixed
        ref: "Specialization",
        required: [
          function () {
            return this.role === "doctor" || this.role === "clinic";
          },
          "Specialization is required",
        ],
      },
    ],

    // education: {}, create education routes
    // experience: {},create experience routes
    // range of provided services routes to be created
    // address to be added
    rating: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId },
        rate: { type: Number },
      },
    ],
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
