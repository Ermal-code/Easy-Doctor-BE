const ReviewModel = require("../services/reviews/schema");

const getReviewsForUser = async (req, res, next) => {
  try {
    const reviews = await ReviewModel.find({
      reviewedUser: req.params.userId,
    }).populate({ path: "reviewUser", select: "_id name surname image" });
    if (reviews.length > 0) {
      res.status(200).send(reviews);
    } else {
      const err = new Error();
      err.message = `Could not find reviews for user with id: ${req.params.userId}`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const newReview = {
      reviewedUser: req.params.userId,
      reviewUser: req.user._id,
      text: req.body.text,
    };
    const review = new ReviewModel(newReview);
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editReview = async (req, res, next) => {
  try {
    const reviewToEdit = await ReviewModel.findByIdAndUpdate(
      req.params.reviewId,
      req.body,
      { runValidators: true, new: true }
    );
    if (reviewToEdit) {
      res.status(200).send(reviewToEdit);
    } else {
      const err = new Error();
      err.message = `Review with id: ${req.params.reviewId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const deletedReview = await ReviewModel.findByIdAndDelete(
      req.params.reviewId
    );
    if (deletedReview) {
      res.status(203).send("Review is deleted");
    } else {
      const err = new Error();
      err.message = `Review with id: ${req.params.reviewId} not found`;
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports = {
  getReviewsForUser,
  addReview,
  editReview,
  deleteReview,
};
