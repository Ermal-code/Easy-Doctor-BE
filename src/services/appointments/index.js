const router = require("express").Router();
const { authorizeUser } = require("../../utils/auth/authMiddlewares");

const {
  getAppointmentById,
  getAppointmentsForPatient,
  getAppointmentsForDoctorsOrClinics,
  addAppointment,
  removeAppointment,
} = require("../../controllers/appointmentControllers");

router.get("/patientAppointments", authorizeUser, getAppointmentsForPatient);
router.get(
  "/doctorOrClinicAppointments/:userId",
  authorizeUser,
  getAppointmentsForDoctorsOrClinics
);
router.get("/:appointmentId", authorizeUser, getAppointmentById);

router.post("/", authorizeUser, addAppointment);

router.delete("/:appointmentId", authorizeUser, removeAppointment);

module.exports = router;
