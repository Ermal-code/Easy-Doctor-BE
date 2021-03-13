const router = require("express").Router();

const usersRouter = require("./users");
const reviewsRouter = require("./reviews");
const appointmentsRouter = require("./appointments");

router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);
router.use("/appointments", appointmentsRouter);

module.exports = router;
