const {
  addNewStaffMember,
  getHospitalStaff,
  deleteHospitalStaff,
} = require("../../controllers/staffControllers");
const { authorizeUser } = require("../../utils/auth/authMiddlewares");

const router = require("express").Router();

router.post("/", authorizeUser, addNewStaffMember);

router.get("/:userId", getHospitalStaff);

router.delete("/:staffId", authorizeUser, deleteHospitalStaff);

module.exports = router;
