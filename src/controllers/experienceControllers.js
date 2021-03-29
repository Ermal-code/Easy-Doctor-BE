const ExperienceModel = require("../services/experiences/schema");

const addExperience = async (req, res, next) => {
  try {
    const newExperience = new ExperienceModel({
      ...req.body,
      user: req.user._id,
    });

    await newExperience.save();

    res.status(201).send(newExperience);
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

const getExperiences = async (req, res, next) => {
  try {
    const experiences = await ExperienceModel.find({ user: req.params.userId });

    if (experiences) {
      res.status(200).send(experiences);
    } else {
      const err = new Error();
      err.message = `Experiences for user: ${req.params.userId} not found !`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editExperience = async (req, res, next) => {
  try {
    const modifiedExperience = await ExperienceModel.findByIdAndUpdate(
      req.params.experienceId,
      req.body,
      { runValidators: true, new: true }
    );
    if (modifiedExperience) {
      res.status(200).send(modifiedExperience);
    } else {
      const err = new Error();
      err.message = `Experience with id: ${req.params.experienceId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteExperience = async (req, res, next) => {
  try {
    const deletedExperience = await ExperienceModel.findByIdAndDelete(
      req.params.experienceId
    );
    if (deletedExperience) {
      res.status(203).send("Experience is deleted");
    } else {
      const err = new Error();
      err.message = `Experience with id: ${req.params.experienceId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  addExperience,
  getExperiences,
  editExperience,
  deleteExperience,
};
