const moment = require("moment");
const AppointmentModel = require("../services/appointments/schema");
const { createMeeting } = require("../utils/zoomMeetingCreation");

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
    console.log(error);
    next(error);
  }
};

const getAppointmentsForPatient = async (req, res, next) => {
  const appointments = await AppointmentModel.find({
    patient: req.user._id,
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
    err.message = `This patient's appointments not found`;
    err.httpStatusCode = 404;
    next(err);
  }
};

const getAppointmentsForDoctorsOrClinics = async (req, res, next) => {
  try {
    const appointments = await AppointmentModel.find({
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
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addAppointment = async (req, res, next) => {
  try {
    const newAppointment = new AppointmentModel({
      ...req.body,
      patient: req.user._id,
      startDate: moment(req.body.startDate).format(),
      endDate: moment(req.body.startDate).add(30, "minutes").format(),
    });

    await newAppointment.save();

    let response;
    if (req.body.type === "online") {
      response = await createMeeting(
        "ermal.aa@live.com",
        req.body.reason,
        moment(req.body.startDate).format()
      );
    }

    res.status(201).send({ newAppointment, response });
  } catch (error) {
    console.log(error);
    next(error);
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
    console.log(error);
    next(error);
  }
};

module.exports = {
  getAppointmentById,
  getAppointmentsForPatient,
  getAppointmentsForDoctorsOrClinics,
  addAppointment,
  removeAppointment,
};
