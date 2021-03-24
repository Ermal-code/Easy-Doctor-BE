const router = require("express").Router();
const {
  getSpecializations,
  addSpecialization,
} = require("../../controllers/specializationControllers");

router.get("/", getSpecializations);
router.post("/", addSpecialization);

module.exports = router;
