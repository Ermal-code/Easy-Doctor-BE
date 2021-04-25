const EducationModel = require("../services/educations/schema");

const addEducation = async (req, res, next) => {
  try {
    const newEducation = new EducationModel({
      ...req.body,
      user: req.user._id,
    });

    await newEducation.save();

    res.status(201).send(newEducation);
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

const getEducations = async (req, res, next) => {
  try {
    const educations = await EducationModel.find({ user: req.params.userId });

    if (educations) {
      res.status(200).send(educations);
    } else {
      const err = new Error();
      err.message = `Education for user: ${req.params.userId} not found !`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const editEducation = async (req, res, next) => {
  try {
    const modifiedEducation = await EducationModel.findByIdAndUpdate(
      req.params.educationId,
      req.body,
      { runValidators: true, new: true }
    );
    if (modifiedEducation) {
      res.status(200).send(modifiedEducation);
    } else {
      const err = new Error();
      err.message = `Experience with id: ${req.params.educationId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const deleteEducation = async (req, res, next) => {
  try {
    const deletedEducation = await EducationModel.findByIdAndDelete(
      req.params.educationId
    );
    if (deletedEducation) {
      res.status(203).send("Education is deleted");
    } else {
      const err = new Error();
      err.message = `Education with id: ${req.params.educationId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEducation,
  getEducations,
  editEducation,
  deleteEducation,
};
