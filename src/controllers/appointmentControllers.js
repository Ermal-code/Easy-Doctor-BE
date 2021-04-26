const moment = require("moment");
const AppointmentModel = require("../services/appointments/schema");
const UserModel = require("../services/users/schema");
const { createMeeting } = require("../utils/zoomMeetingCreation");
const sgMail = require("@sendgrid/mail");
const { emailMessage } = require("../utils/sgMail");
const q2m = require("query-to-mongo");

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await AppointmentModel.findById(
      req.params.appointmentId
    ).populate([
      { path: "patient", select: "_id name surname image" },
      { path: "doctor", select: "_id name surname image" },
      { path: "clinic", select: "_id name  image" },
    ]);
    if (appointment) {
      res.status(200).send(appointment);
    } else {
      const err = new Error();
      err.message = `Appointment with id: ${req.params.appointmentId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const getAppointmentsForPatient = async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const today = moment();

    if (req.params.filterAppointments === "Upcoming") {
      query.criteria = {
        patient: req.user._id,
        startDate: { $gte: today.toDate() },
      };
    } else if (req.params.filterAppointments === "Past") {
      query.criteria = {
        patient: req.user._id,
        startDate: { $lt: today.toDate() },
      };
    } else {
      query.criteria = {
        patient: req.user._id,
      };
    }
    const appointments = await AppointmentModel.find(
      query.criteria,
      query.options.fields
    )
      .populate([
        { path: "patient", select: "_id name surname image" },
        { path: "doctor", select: "_id name surname image" },
        { path: "clinic", select: "_id name  image" },
      ])
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort({ startDate: 1 });

    const total = await AppointmentModel.countDocuments(query.criteria);

    if (appointments.length > 0) {
      res.status(200).send({
        links: query.links(
          `/patientAppointments/${req.params.filterAppointments}`,
          total
        ),
        appointments,
      });
    } else {
      const err = new Error();
      err.message = `This patient's appointments not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const getAppointmentsForDoctorsOrClinics = async (req, res, next) => {
  try {
    const query = q2m(req.query);
    const today = moment();
    let appointments;
    if (req.params.filterAppointments === "none") {
      appointments = await AppointmentModel.find({
        $or: [{ doctor: req.params.userId }, { clinic: req.params.userId }],
      })
        .populate([
          { path: "patient", select: "_id name surname image" },
          { path: "doctor", select: "_id name surname image" },
          { path: "clinic", select: "_id name  image" },
        ])
        .sort({ startDate: 1 });
      if (appointments.length > 0) {
        res.status(200).send(appointments);
      } else {
        const err = new Error();
        err.message = `No appointments found for id ${req.params.userId}`;
        err.httpStatusCode = 404;
        next(err);
      }
    } else {
      if (!req.user || (req.user && req.user._id !== req.params.userId)) {
        const err = new Error();
        err.httpStatusCode = 403;
        err.message = `You are not allowed to view these appointments`;
        next(err);
      } else {
        if (req.params.filterAppointments === "Upcoming") {
          query.criteria = {
            $or: [{ doctor: req.params.userId }, { clinic: req.params.userId }],
            startDate: { $gte: today.toDate() },
          };
        } else if (req.params.filterAppointments === "Past") {
          query.criteria = {
            $or: [{ doctor: req.params.userId }, { clinic: req.params.userId }],
            startDate: { $lt: today.toDate() },
          };
        } else if (req.params.filterAppointments === "All") {
          query.criteria = {
            $or: [{ doctor: req.params.userId }, { clinic: req.params.userId }],
          };
        }
        appointments = await AppointmentModel.find(
          query.criteria,
          query.options.fields
        )
          .populate([
            { path: "patient", select: "_id name surname image" },
            { path: "doctor", select: "_id name surname image" },
            { path: "clinic", select: "_id name  image" },
          ])
          .skip(query.options.skip)
          .limit(query.options.limit)
          .sort({ startDate: 1 });

        const total = await AppointmentModel.countDocuments(query.criteria);

        if (appointments.length > 0) {
          res.status(200).send({
            links: query.links(
              `/doctorOrClinicAppointments/${req.params.userId}/${req.params.filterAppointments}`,
              total
            ),
            appointments,
          });
        } else {
          const err = new Error();
          err.message = `No appointments found for id ${req.params.userId}`;
          err.httpStatusCode = 404;
          next(err);
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

// const getDoctorsOrClinicAppointmentsByPatient = async (req, res, next) => {
//   try {
//     const query = q2m(req.query);
//     const today = moment();

//     if (req.params.filterAppointments === "Upcoming") {
//       query.criteria = {
//         $or: [{ doctor: req.user._id }, { clinic: req.user._id }],
//         patient: req.params.patientId,
//         startDate: { $gte: today.toDate() },
//       };
//     } else if (req.params.filterAppointments === "Past") {
//       query.criteria = {
//         $or: [{ doctor: req.user._id }, { clinic: req.user._id }],
//         patient: req.params.patientId,
//         startDate: { $lt: today.toDate() },
//       };
//     } else {
//       query.criteria = {
//         $or: [{ doctor: req.user._id }, { clinic: req.user._id }],
//         patient: req.params.patientId,
//       };
//     }

//     const appointments = await AppointmentModel.find(
//       query.criteria,
//       query.options.fields
//     )
//       .populate([
//         { path: "patient", select: "_id name surname image" },
//         { path: "doctor", select: "_id name surname image" },
//         { path: "clinic", select: "_id name  image" },
//       ])
//       .skip(query.options.skip)
//       .limit(query.options.limit)
//       .sort({ startDate: 1 });

//     const total = await AppointmentModel.countDocuments(query.criteria);

//     if (appointments.length > 0) {
//       res.status(200).send({
//         links: query.links(
//           `/doctorOrClinicAppointmentsByPatient/${req.params.patientId}/${req.params.filterAppointments}`,
//           total
//         ),
//         appointments,
//       });
//     } else {
//       const err = new Error();
//       err.message = `This patient's appointments not found`;
//       err.httpStatusCode = 404;
//       next(err);
//     }
//   } catch (error) {
//     next(error);
//   }
// };

const addAppointment = async (req, res, next) => {
  try {
    const newAppointment = new AppointmentModel({
      ...req.body,
      patient: req.user._id,
      startDate: moment(req.body.startDate).format(),
      endDate: moment(req.body.startDate).add(30, "minutes").format(),
    });

    await newAppointment.save();

    const patient = await UserModel.findById(req.user._id);

    const doctor = await UserModel.findById(req.body.doctor);

    const clinic = req.body.clinic
      ? await UserModel.findById(req.body.clinic)
      : null;

    if (patient && doctor) {
      let response;
      if (req.body.type === "online") {
        response = await createMeeting(
          "easy_doctor@hotmail.com",
          req.body.reason,
          moment(req.body.startDate).format()
        );
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send([
        emailMessage(
          patient.email,
          false,
          req,
          patient,
          doctor,
          response,
          false
        ),
        emailMessage(doctor.email, true, req, patient, doctor, response, false),
        emailMessage(clinic.email, false, req, patient, doctor, response, true),
      ]);

      res.status(201).send({ newAppointment, response });
    } else {
      const err = new Error();
      err.message = "Doctor and patient not found";
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      error.httpStatusCode = 400;
      let errorArray = [];
      const errs = Object.keys(error.errors);

      errs.forEach((err) =>
        errorArray.push({
          message: error.errors[err].message,
          path: error.errors[err].path,
        })
      );

      next({ httpStatusCode: error.httpStatusCode, errors: errorArray });
    } else {
      error.httpStatusCode = 500;
      next(error);
    }
  }
};

const removeAppointment = async (req, res, next) => {
  try {
    const deletedAppointment = await AppointmentModel.findByIdAndDelete(
      req.params.appointmentId
    );
    if (deletedAppointment) {
      res.status(203).send("Appointment is removed");
    } else {
      const err = new Error();
      err.message = `Appointment with id: ${req.params.appointmentId}`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointmentById,
  getAppointmentsForPatient,
  getAppointmentsForDoctorsOrClinics,
  // getDoctorsOrClinicAppointmentsByPatient,
  addAppointment,
  removeAppointment,
};
