const router = require("express").Router();
const passport = require("passport");
const {
  authorizeUser,
  adminOnly,
  authorzieUserForViewingPatientProfile,
} = require("../../utils/auth/authMiddlewares");

const {
  getAllUsers,
  getUser,
  getUserById,
  addNewUser,
  editUser,
  deleteUser,
  loginUser,
  logOutUser,
  logOutFromAllDevices,
  userRefreshToken,
  googleAuth,
  cloudMulter,
  addProfilePicture,
  getDoctorsAndClinics,
  addRating,
  addAllowedUser,
  removeAllowedUser,
} = require("../../controllers/userControllers");

router.get("/", authorizeUser, adminOnly, getAllUsers);

router.get("/me", authorizeUser, getUser);

router.get("/doctorsAndClinics", getDoctorsAndClinics);

router.post("/register", addNewUser);

router.put("/me", authorizeUser, editUser);

router.delete("/me", authorizeUser, deleteUser);

router.post("/login", loginUser);

router.post("/logout", authorizeUser, logOutUser);

router.post("/logoutAllUsers", authorizeUser, logOutFromAllDevices);

router.post("/refreshToken", userRefreshToken);

router.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/googleRedirect", passport.authenticate("google"), googleAuth);

router.post(
  "/addProfilePic",
  authorizeUser,
  cloudMulter.single("picture"),
  addProfilePicture
);

router.post("/:userId/addRating", authorizeUser, addRating);

router.post("/:userId/addAllowedUser", authorizeUser, addAllowedUser);

router.post("/:userId/removeAllowedUser", authorizeUser, removeAllowedUser);

router.get("/:userId", authorzieUserForViewingPatientProfile, getUserById);
module.exports = router;
