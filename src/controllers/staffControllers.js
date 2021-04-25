const StaffMemberModel = require("../services/staff/schema");

const addNewStaffMember = async (req, res, next) => {
  try {
    const newStaffMember = new StaffMemberModel({
      ...req.body,
      hospital: req.user._id,
    });

    await newStaffMember.save();

    res.status(201).send(newStaffMember);
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

const getHospitalStaff = async (req, res, next) => {
  try {
    const staff = await StaffMemberModel.find({
      hospital: req.params.userId,
    }).populate([
      {
        path: "doctor",
        select: "name surname image specialization",
      },
    ]);
    if (staff) {
      res.status(200).send(staff);
    } else {
      const err = new Error();
      err.message = `No staff members found for this hospital: ${req.params.userId}`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const deleteHospitalStaff = async (req, res, next) => {
  try {
    const deleteMember = await StaffMemberModel.findByIdAndDelete(
      req.params.staffId
    );
    if (deleteMember) {
      res.status(203).send("Staff member deleted");
    } else {
      const err = new Error();
      err.message = `No staff members found with id: ${req.params.staffId}`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { addNewStaffMember, getHospitalStaff, deleteHospitalStaff };
