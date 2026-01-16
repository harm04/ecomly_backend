const express = require("express");
const productReviewRouter = express.Router();
const ProductReview = require("../models/product_review_model");
const Product = require("../models/product_model");

productReviewRouter.post("/api/product-review", async (req, res) => {
  try {
    const { buyerId, email, fullName, productId, rating, review } = req.body;
    const existingReview = await ProductReview.findOne({ buyerId, productId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }
    const productReview = new ProductReview({
      buyerId,
      email,
      fullName,
      productId,
      rating,
      review,
    });
    await productReview.save();
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.totalRatings += 1;
    product.averageRating =
      (product.averageRating * (product.totalRatings - 1) + rating) /
      product.totalRatings;
    await product.save();
    return res.status(201).send(productReview);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productReviewRouter.get("/api/reviews", async (req, res) => {
  try {
    const review = await ProductReview.find();
    if (!review || review.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    } else {
      return res.status(200).json(review);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = productReviewRouter;
