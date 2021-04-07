const router = require("express").Router();

const usersRouter = require("./users");
const reviewsRouter = require("./reviews");
const appointmentsRouter = require("./appointments");
const specializationsRouter = require("./specializations");
const experiencesRouter = require("./experiences");
const educationsRouter = require("./educations");
const staffRouter = require("./staff");
const documentsRouter = require("./documents");

router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/specializations", specializationsRouter);
router.use("/experiences", experiencesRouter);
router.use("/educations", educationsRouter);
router.use("/staff", staffRouter);
router.use("/documents", documentsRouter);

module.exports = router;
