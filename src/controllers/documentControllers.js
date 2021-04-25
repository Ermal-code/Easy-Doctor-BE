const DocumentModel = require("../services/documents/schema");
const multer = require("multer");
const cloudinary = require("../utils/cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "documents",
  },
});

const cloudMulter = multer({ storage: cloudStorage });

const getPatientDocuments = async (req, res, next) => {
  try {
    const documents = await DocumentModel.find({
      patient: req.params.patientId,
    });

    if (documents) {
      res.status(200).send(documents);
    } else {
      const err = new Error();
      err.message = `Documents for patient with id: ${req.params.patientId} were not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const addDocument = async (req, res, next) => {
  try {
    const newDocument = new DocumentModel({
      ...req.body,
      patient: req.user._id,
    });
    await newDocument.save();

    res.status(201).send(newDocument);
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

const addFileForDocument = async (req, res, next) => {
  try {
    const addFile = await DocumentModel.findByIdAndUpdate(
      req.params.documentId,
      {
        $set: { file: req.file.path },
      }
    );

    if (addFile) {
      res.status(201).send(addFile);
    } else {
      const err = new Error();
      err.message = `Document with Id: ${req.params.documentId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const editDocument = async (req, res, next) => {
  try {
    const editedDocument = await DocumentModel.findByIdAndUpdate(
      req.params.documentId,
      req.body,
      { runValidators: true, new: true }
    );
    if (editedDocument) {
      res.status(200).send(editedDocument);
    } else {
      const err = new Error();
      err.message = `Document with Id: ${req.params.documentId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const deletedDocument = await DocumentModel.findByIdAndDelete(
      req.params.documentId,
      req.body
    );
    if (deletedDocument) {
      res.status(203).send({ response: "Document is deleted successfuly" });
    } else {
      const err = new Error();
      err.message = `Document with Id: ${req.params.documentId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientDocuments,
  cloudMulter,
  addDocument,
  addFileForDocument,
  editDocument,
  deleteDocument,
};
