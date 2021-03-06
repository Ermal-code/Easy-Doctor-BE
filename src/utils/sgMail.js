const moment = require("moment");
const emailMessage = (
  email,
  isDoctor,
  req,
  patient,
  doctor,
  response,
  isClinic
) => {
  const msg = {
    to: `${email}`,
    from: "easy_doctor@hotmail.com",
    subject: `Appointment for ${req.body.reason}`,
    text: `Hello from Easy Doctor. An appointment was made by ${patient.name} ${
      patient.surname
    } for Dr. ${doctor.name} ${doctor.surname} for ${req.body.reason}.
    The appointment date and time is ${moment(req.body.startDate).format(
      "LLLL"
    )}. This appointemt is going to be ${req.body.type}. ${
      req.body.type === "online"
        ? `This meeting will be held in Zoom platform ${
            isClinic
              ? "."
              : `here is your link ${
                  isDoctor === true
                    ? `${response.start_url}`
                    : `${response.join_url}`
                }`
          } `
        : ""
    } Thank you for using Easy Doctor. `,
    html: `<p>
    Hello from Easy Doctor.<br/><br/>
    An appointment was made by <strong>${patient.name} ${
      patient.surname
    }</strong> for <strong>Dr. ${doctor.name} ${
      doctor.surname
    }</strong> for <strong>${req.body.reason}</strong>.
    The appointment date and time is <strong>${moment(
      req.body.startDate
    ).format("LLLL")}</strong>. This appointemt is going to be ${
      req.body.type
    }. ${
      req.body.type === "online"
        ? `This meeting will be held in Zoom platform ${
            isClinic
              ? "."
              : `here is your link <br/> ${
                  isDoctor === true
                    ? `<a href="${response.start_url}">Click here for the link</a>`
                    : `<a href="${response.join_url}">Click here for the link</a>`
                }`
          }`
        : ""
    } <br/> <br/> Thank you for using Easy Doctor. 
        </p>`,
  };

  return msg;
};

const emailArray = (clinic, patient, doctor, req, response) => {
  let emailArray = clinic
    ? [
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
      ]
    : [
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
      ];

  return emailArray;
};

module.exports = { emailArray };
