const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const oauth = require("./utils/auth/oAuth");

const {
  notFoundErrorHandler,
  unauthorizedErrorHandler,
  badRequestErrorHandler,
  forbiddenErrorHandler,
  catchAllErrorHandler,
} = require("./errorHandling");

const services = require("./services");

const server = express();

const port = process.env.PORT || 3003;

const whitelist = [`${process.env.FE_URL}`];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

server.use(cors(corsOptions));
server.use(helmet());
server.use(express.json());
server.use(cookieParser());
server.use(passport.initialize());

server.use("/api", services);

server.use(badRequestErrorHandler);
server.use(notFoundErrorHandler);
server.use(forbiddenErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(catchAllErrorHandler);

console.log(listEndpoints(server));

mongoose.set("debug", true);

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(server.listen(port, () => console.log("Running on port", port)))
  .catch((err) => console.log(err));
