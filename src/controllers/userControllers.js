const UserModel = require("../services/users/schema");
const { authenticateUser } = require("../utils/auth");
const { refreshToken } = require("../utils/auth");
const multer = require("multer");
const cloudinary = require("../utils/cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile",
  },
});

const cloudMulter = multer({ storage: cloudStorage });

const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.find();

    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (user) {
      res.status(200).send(user);
    } else {
      const err = new Error();
      err.message = `User with id: ${req.params.userId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getDoctorsAndClinics = async (req, res, next) => {
  try {
    const users = await UserModel.find({
      $or: [{ role: "doctor" }, { role: "clinic" }],
    }).populate({ path: "reviews", select: "_id name surname image" });

    res.status(200).send(users);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addNewUser = async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();

    const { accessToken, refreshToken } = await authenticateUser(newUser);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/api/users/refreshToken",
    });
    res.status(201).send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await req.user.deleteOne();
    res.status(203).send("User deleted");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByCredentials(email, password);
    if (user) {
      const { accessToken, refreshToken } = await authenticateUser(user);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        path: "/",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/api/users/refreshToken",
      });

      res.send({ response: "Logged in" });
    } else {
      const err = new Error();
      err.message = `Email or password is wrong`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const logOutUser = async (req, res, next) => {
  try {
    newRefreshTokens = req.user.refreshTokens.filter(
      (token) => token.refreshToken !== req.token.refreshToken
    );
    await req.user.updateOne({ refreshTokens: newRefreshTokens });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.send("User logged out");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const logOutFromAllDevices = async (req, res, next) => {
  try {
    req.user.refreshTokens = [];

    await req.user.save();
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.send("Logged out");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const userRefreshToken = async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    const err = new Error("Refresh token is missing");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const tokens = await refreshToken(oldRefreshToken);

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        path: "/",
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        path: "/users/refreshToken",
      });

      res.send("OK");
    } catch (error) {
      console.log(error);
      const err = new Error(error);
      err.httpStatusCode = 403;
      next(err);
    }
  }
};

const googleAuth = async (req, res, next) => {
  try {
    res.cookie("accessToken", req.user.tokens.accessToken, {
      httpOnly: true,
    });

    res.cookie("refreshToken", req.user.tokens.refreshToken, {
      httpOnly: true,
      path: "/api/users/refreshToken",
    });

    res.status(200).redirect(`${process.env.FE_URL}/home`);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addProfilePicture = async (req, res, next) => {
  try {
    await req.user.updateOne({ image: req.file.path });

    res.status(201).send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addRating = async (req, res, next) => {
  try {
    const ratingExists = await UserModel.findOne({
      _id: req.params.userId,
      "rating.user": req.user._id,
    });
    console.log(ratingExists);
    if (ratingExists) {
      const modifyRating = await UserModel.findOneAndUpdate(
        {
          _id: req.params.userId,
          "rating.user": req.user._id,
        },
        {
          "rating.$.rate": req.body.rate,
        },
        { runValidators: true, new: true }
      );
      res.status(200).send(modifyRating);
    } else {
      const newRating = await UserModel.findByIdAndUpdate(
        req.params.userId,
        {
          $push: { rating: { ...req.body, user: req.user._id } },
        },
        { runValidators: true, new: true }
      );
      res.status(201).send(newRating);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  getUserById,
  addNewUser,
  editUser,
  deleteUser,
  loginUser,
  logOutUser,
  logOutFromAllDevices,
  userRefreshToken,
  googleAuth,
  cloudMulter,
  addProfilePicture,
  getDoctorsAndClinics,
  addRating,
};
