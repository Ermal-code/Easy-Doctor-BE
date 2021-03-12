const router = require("express").Router();

const usersRouter = require("./users");
const reviewsRouter = require("./reviews");

router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);

module.exports = router;
