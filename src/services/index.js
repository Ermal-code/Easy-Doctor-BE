const router = require("express").Router();

const usersRouter = require("./users");
const reviewsRouter = require("./reviews");
const appointmentsRouter = require("./appointments");
const specializationsRouter = require("./specializations");
const experiencesRouter = require("./experiences");
const educationsRouter = require("./educations");

router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/specializations", specializationsRouter);
router.use("/experiences", experiencesRouter);
router.use("/educations", educationsRouter);

module.exports = router;
