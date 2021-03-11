const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    name: { type: String, require: true },
    surname: { type: String, require: true },
    image: {
      type: String,
      require: true,
      default: `https://lh3.googleusercontent.com/proxy/GjZL2aHCfzXqLnTGNtp9ZyY7DmRmOI7qe0jD8w0ugk5gNLvH8w3j2rpy4CGTMe8t2Qnhqo62y5d2lnUzLTYG2IEt4pgNmQ0PgJJHmnia_Tr0RdCFJC8q9Jo9QRKrxWw`,
    },
    email: {
      type: String,
      require: "Email is required",
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      unique: true,
      dropDups: true,
    },
    password: { type: String },
    role: {
      type: String,
      enum: ["patient", "doctor", "clinic", "admin"],
      default: "patient",
      required: true,
    },
    phone: { type: String },
    gender: { type: String, require: true, enum: ["male", "female"] },
    birthdate: { type: String },
    documentId: { type: String },
    refreshTokens: [],
    googleId: { type: String },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;

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
