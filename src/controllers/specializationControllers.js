const SpecializationModel = require("../services/specializations/schema");

const getSpecializations = async (req, res, next) => {
  try {
    const specializations = await SpecializationModel.find();
    res.status(200).send(specializations);
  } catch (error) {
    next(error);
  }
};

const addSpecialization = async (req, res, next) => {
  try {
    const newSpecialization = new SpecializationModel(req.body);

    await newSpecialization.save();

    res.status(201).send(newSpecialization);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSpecializations, addSpecialization };
