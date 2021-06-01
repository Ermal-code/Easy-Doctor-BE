## Easy Doctor backend

### Summary

<p>Easy Doctor is an app that you can use to find different doctors and make appointments with them. Appointments can be held on-site or online through the Zoom platform. You can also leave reviews for your doctor or clinic. You can add information about yourself and view your profile and depending on what type of user you are you can view other users profile</p>
<p>This repo is for the backend of the project, which was done using NodeJs, expressJs. Also for image upload I used cloudinary and for the online appointments I used the Zoom API. </p>
<details>

<summary><b> Users endpoints </b></summary>
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

<details>

<summary><b> Staff endpoints </b></summary>

<p>It's a basic CRUD for clinics or hospital to add doctors as their staff members.</p>

<p>Staff schema: </p>

```javascript
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
```

</details>

<details>

<summary><b> Review endpoints </b></summary>

<p>Through these endpoints users can add, remove, edit or delete their review.</p>

<p>Review schema: </p>

```javascript
const ReviewSchema = new Schema(
  {
    reviewedUser: { type: Schema.Types.ObjectId, required: true },
    reviewUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);
```

</details>

<details>

<summary><b> Experience endpoints </b></summary>

<p>Through these endpoints doctors can add, remove, edit or delete their experiences.</p>

<p>Experience schema: </p>

```javascript
const ExperienceSchema = new Schema({
  role: { type: String, required: [true, "Role that you had is required"] },
  company: { type: String, required: [true, "Hospital or clinic is required"] },
  startDate: { type: Date, required: [true, "Start date is required"] },
  endDate: { type: Date },
  area: { type: String },
  user: { type: Schema.Types.ObjectId, required: true },
});
```

</details>

<details>

<summary><b> Education endpoints </b></summary>

<p>Through these endpoints doctors can add, remove, edit or delete their education.</p>

<p>Education schema: </p>

```javascript
const EducationSchema = new Schema({
  type: {
    type: String,
    required: [true, "Type of education is required"],
    enum: ["High school", "University", "Specialization"],
  },
  school: { type: String, required: [true, "Name of school is required"] },
  startDate: { type: Date, required: [true, "Start date is required"] },
  endDate: { type: Date },
  degree: { type: String },
  area: { type: String },
  user: { type: Schema.Types.ObjectId, required: true },
});
```

</details>

<details>

<summary><b> Document endpoints </b></summary>

<p>Through these endpoints patient can add, remove, edit or delete their documents. Cloudinary is used for storage of the documents and multer is used as a middleware for uploading documents as images</p>

<p>Document schema: </p>

```javascript
const DocumentSchema = new Schema({
  title: {
    type: String,
    required: [true, "A title for the document is required"],
  },
  file: { type: String },
  description: { type: String },
  patient: { type: Schema.Types.ObjectId, ref: "User" },
});
```

</details>

<summary><b> Appointment endpoints </b></summary>

<p>Through these endpoints patient can make an appointment. On the moments that appointment is booked successfuly patient,doctor and clinc will recieve an email with details. Emails are send using sandgrid. If the appointment is online it will be held on Zoom using Zoom API. You can find email and zoom configurations under utils folder!</p>

<p>Appointment schema: </p>

```javascript
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
```

</details>
