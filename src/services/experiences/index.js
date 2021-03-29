const router = require("express").Router();
const { authorizeUser } = require("../../utils/auth/authMiddlewares");
const {
  addExperience,
  getExperiences,
  editExperience,
  deleteExperience,
} = require("../../controllers/experienceControllers");

router.post("/", authorizeUser, addExperience);

router.get("/:userId", getExperiences);

router.put("/:experienceId", authorizeUser, editExperience);

router.delete("/:experienceId", authorizeUser, deleteExperience);

module.exports = router;
