## Easy Doctor backend

### Summary

<p>Easy Doctor is an app that you can use to find different doctors and make appointments with them. Appointments can be held on-site or online through the Zoom platform. You can also leave reviews for your doctor or clinic. You can add information about yourself and view your profile and depending on what type of user you are you can view other users profile</p>
<p>This repo is for the backend of the project, which was done using NodeJs, expressJs. Also for image upload I used cloudinary and for the online appointments I used the Zoom API. </p>
<details>

<summary><b> Users endpoint </b></summary>
<br/>

<p>In this project there are 4 types of users: admin, patients, doctors and clinics/hospitals. All of these users use the same mongo schema. Also this app includes auth/oauth implementation using jwt token strategy. Cookies are used to save the access token and refresh token.</p>
<p>If the user is a patient his/her profile can be viewed only by the users he/she allows.</p>
<p>User schema: </p>

```javascript
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
    specialization: {
      type: Array,
      required: [
        function () {
          return this.role === "doctor" || this.role === "clinic";
        },
        "Specialization is required",
      ],
      validate: {
        validator: function (array) {
          return array.every((v) => typeof v === "string");
        },
        message: "Specialization is required",
      },
    },

    clinicOrHospital: {
      type: String,
      required: [
        function () {
          return this.role === "doctor";
        },
        "Hospital or clinic is required",
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
    maritalStatus: {
      type: String,
      enum: ["Single", "Married"],
      default: "Single",
    },
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
```

</details>
