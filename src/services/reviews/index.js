const router = require("express").Router();
const { authorizeUser } = require("../../utils/auth/authMiddlewares");
const {
  getReviewsForUser,
  addReview,
  editReview,
  deleteReview,
} = require("../../controllers/reviewControllers");

router.get("/:userId", getReviewsForUser);

router.post("/:userId", authorizeUser, addReview);

router.put("/:reviewId", authorizeUser, editReview);

router.delete("/:reviewId", authorizeUser, deleteReview);

module.exports = router;
