const UserModel = require("../services/users/schema")
const { authenticateUser } = require("../utils/auth")
const { refreshToken } = require("../utils/auth")
const multer = require("multer")
const cloudinary = require("../utils/cloudinaryConfig")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile",
    },
})

const cloudMulter = multer({ storage: cloudStorage })

const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find()

        res.status(200).send(users)
    } catch (error) {
        next(error)
    }
}

const getUser = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id)
        res.status(200).send(user)
    } catch (error) {
        next(error)
    }
}

const getUserById = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.params.userId)
        if (user) {
            if (user.role === "patient" && !req.user) {
                const err = new Error()
                err.message = `You need to log in to view this profile`
                err.httpStatusCode = 403
                next(err)
            } else if (user.role === "patient" && req.user) {
                const isAllowed = await UserModel.findOne({
                    _id: req.params.userId,
                    allowedUsers: { $in: req.user._id },
                })

                if (isAllowed || user._id.toString() === req.user._id.toString()) {
                    res.status(200).send(user)
                } else {
                    const err = new Error()
                    err.message = "You are not allowed to view this profile"
                    err.httpStatusCode = 403
                    next(err)
                }
            } else {
                res.status(200).send(user)
            }
        } else {
            const err = new Error()
            err.message = `User with id: ${req.params.userId} not found`
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
}

const getDoctorsAndClinics = async (req, res, next) => {
    try {
        let users
        if (req.query && (req.query.name || req.query.specialization)) {
            const regexName = new RegExp(`^${req.query.name}`, "i")
            const regexSpecialization = new RegExp(`^${req.query.specialization}`, "i")

            users = await UserModel.find({
                $and: [
                    {
                        $or: [{ name: { $regex: regexName } }, { specialization: { $regex: regexSpecialization } }],
                    },
                    { $or: [{ role: "doctor" }, { role: "clinic" }] },
                ],
            }).collation({ locale: "en", strength: 2 })
        } else {
            users = await UserModel.find({
                $or: [{ role: "doctor" }, { role: "clinic" }],
            })
        }

        res.status(200).send(users)
    } catch (error) {
        next(error)
    }
}

const addNewUser = async (req, res, next) => {
    try {
        const newUser = new UserModel(req.body)
        await newUser.save()

        const { accessToken, refreshToken } = await authenticateUser(newUser)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            path: "/",
            secure: true,
            sameSite: "none",
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/api/users/refreshToken",
            secure: true,
            sameSite: "none",
        })
        res.status(201).send(newUser)
    } catch (error) {
        if (error.name === "ValidationError") {
            error.httpStatusCode = 400
            let errorArray = []
            const errs = Object.keys(error.errors)

            errs.forEach((err) =>
                errorArray.push({
                    message: error.errors[err].message,
                    path: error.errors[err].path,
                })
            )

            next({ httpStatusCode: error.httpStatusCode, errors: errorArray })
        } else if (error.name === "MongoError") {
            next({
                httpStatusCode: 400,
                message: `This email already has an account`,
            })
        } else {
            error.httpStatusCode = 500
            next(error)
        }
    }
}

const editUser = async (req, res, next) => {
    try {
        const updates = Object.keys(req.body)
        updates.forEach((update) => (req.user[update] = req.body[update]))
        await req.user.save()

        res.status(200).send(req.user)
    } catch (error) {
        next(error)
    }
}

const deleteUser = async (req, res, next) => {
    try {
        await req.user.deleteOne()
        res.status(203).send("User deleted")
    } catch (error) {
        next(error)
    }
}

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.findByCredentials(email, password)
        if (user) {
            const { accessToken, refreshToken } = await authenticateUser(user)

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                path: "/",
                secure: true,
                sameSite: "none",
            })

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                path: "/api/users/refreshToken",
                secure: true,
                sameSite: "none",
            })

            res.status(201).send(user)
        } else {
            const err = new Error()
            err.message = `Email or password is wrong`
            err.httpStatusCode = 404
            next(err)
        }
    } catch (error) {
        next(error)
    }
}

const logOutUser = async (req, res, next) => {
    try {
        newRefreshTokens = req.user.refreshTokens.filter((token) => token.refreshToken !== req.token.refreshToken)
        await req.user.updateOne({ refreshTokens: newRefreshTokens })

        res.clearCookie("accessToken", {
            httpOnly: true,
            path: "/",
            secure: true,
            sameSite: "none",
        })
        res.clearCookie("refreshToken", {
            httpOnly: true,
            path: "/api/users/refreshToken",
            secure: true,
            sameSite: "none",
        })

        res.send("User logged out")
    } catch (error) {
        next(error)
    }
}

const logOutFromAllDevices = async (req, res, next) => {
    try {
        req.user.refreshTokens = []

        await req.user.save()
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        res.send("Logged out")
    } catch (error) {
        next(error)
    }
}

const userRefreshToken = async (req, res, next) => {
    const oldRefreshToken = req.cookies.refreshToken

    if (!oldRefreshToken) {
        const err = new Error("Refresh token is missing")
        err.httpStatusCode = 400
        next(err)
    } else {
        try {
            const tokens = await refreshToken(oldRefreshToken)

            res.cookie("accessToken", tokens.accessToken, {
                httpOnly: true,
                path: "/",
                secure: true,
                sameSite: "none",
            })

            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                path: "/api/users/refreshToken",
                secure: true,
                sameSite: "none",
            })

            res.send("OK")
        } catch (error) {
            const err = new Error(error)
            err.httpStatusCode = 403
            next(err)
        }
    }
}

const googleAuth = async (req, res, next) => {
    try {
        res.cookie("accessToken", req.user.tokens.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        res.cookie("refreshToken", req.user.tokens.refreshToken, {
            httpOnly: true,
            path: "/api/users/refreshToken",
            secure: true,
            sameSite: "none",
        })

        res.status(200).redirect(`${process.env.FE_URL}/`)
    } catch (error) {
        if (error.name === "MongoError") {
            next({
                httpStatusCode: 400,
                message: `This email already has an account`,
            })
        } else {
            error.httpStatusCode = 500
            next(error)
        }
    }
}

const addProfilePicture = async (req, res, next) => {
    try {
        await req.user.updateOne({ image: req.file.path })

        res.status(201).send(req.user)
    } catch (error) {
        next(error)
    }
}

const addRating = async (req, res, next) => {
    try {
        const ratingExists = await UserModel.findOne({
            _id: req.params.userId,
            "rating.user": req.user._id,
        })

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
            )
            res.status(200).send(modifyRating)
        } else {
            const newRating = await UserModel.findByIdAndUpdate(
                req.params.userId,
                {
                    $push: { rating: { ...req.body, user: req.user._id } },
                },
                { runValidators: true, new: true }
            )
            res.status(201).send(newRating)
        }
    } catch (error) {
        next(error)
    }
}

const addAllowedUser = async (req, res, next) => {
    try {
        const addAllowedUsers = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
                $addToSet: { allowedUsers: req.params.userId },
            },
            { runValidators: true, new: true }
        )

        res.status(201).send(addAllowedUsers)
    } catch (error) {
        next(error)
    }
}

const removeAllowedUser = async (req, res, next) => {
    try {
        const removeAllowedUser = await UserModel.findByIdAndUpdate(req.user._id, {
            $pull: { allowedUsers: req.params.userId },
        })

        res.status(203).send(removeAllowedUser)
    } catch (error) {
        next(error)
    }
}
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
    addAllowedUser,
    removeAllowedUser,
}
