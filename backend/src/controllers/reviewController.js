import Review from '../models/Review.js';

export const createReview = async (req, res) => {
  try {
    const { reviewee, rating, comment, images } = req.body;
    const r = await Review.create({ reviewer: req.user._id, reviewee, rating, comment, images });
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createReview, getReviewsForUser };
