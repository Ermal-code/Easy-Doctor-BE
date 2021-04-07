const {
  addDocument,
  cloudMulter,
  addFileForDocument,
  editDocument,
  deleteDocument,
  getPatientDocuments,
} = require("../../controllers/documentControllers");
const { authorizeUser } = require("../../utils/auth/authMiddlewares");

const router = require("express").Router();

router.get("/:patientId", authorizeUser, getPatientDocuments);

router.post("/", authorizeUser, addDocument);

router.put("/:documentId", authorizeUser, editDocument);

router.delete("/:documentId", authorizeUser, deleteDocument);

router.post(
  "/:documentId/addFile",
  authorizeUser,
  cloudMulter.single("document"),
  addFileForDocument
);

module.exports = router;
