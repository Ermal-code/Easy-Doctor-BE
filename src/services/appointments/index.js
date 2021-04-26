const router = require("express").Router();
const { authorizeUser } = require("../../utils/auth/authMiddlewares");

const {
  getAppointmentById,
  getAppointmentsForPatient,
  getAppointmentsForDoctorsOrClinics,
  getDoctorsOrClinicAppointmentsByPatient,
  addAppointment,
  removeAppointment,
} = require("../../controllers/appointmentControllers");

router.get(
  "/patientAppointments/:filterAppointments",
  authorizeUser,
  getAppointmentsForPatient
);
router.get(
  "/doctorOrClinicAppointments/:userId/:filterAppointments",
  authorizeUser,
  getAppointmentsForDoctorsOrClinics
);

router.get(
  "/doctorOrClinicAppointmentsByPatient/:patientId/:filterAppointments",
  authorizeUser,
  getDoctorsOrClinicAppointmentsByPatient
);

router.get("/:appointmentId", authorizeUser, getAppointmentById);

router.post("/", authorizeUser, addAppointment);

router.delete("/:appointmentId", authorizeUser, removeAppointment);

module.exports = router;
