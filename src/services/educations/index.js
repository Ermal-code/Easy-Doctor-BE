const router = require("express").Router();
const { authorizeUser } = require("../../utils/auth/authMiddlewares");
const {
  addEducation,
  getEducations,
  editEducation,
  deleteEducation,
} = require("../../controllers/educationControllers");

router.post("/", authorizeUser, addEducation);

router.get("/:userId", getEducations);

router.put("/:educationId", authorizeUser, editEducation);

router.delete("/:educationId", authorizeUser, deleteEducation);

module.exports = router;
