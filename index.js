const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRouter = require("./routes/user_routes");
const bannerRouter = require("./routes/banner_routes");
const categoryRouter = require("./routes/category_routes");
const subCategoryRouter = require("./routes/sub_category_routes");
const productRouter = require("./routes/product_routes");
const productReviewRouter = require("./routes/product_review_routes");
const vendorRouter = require("./routes/vendor_routes");
const ordersRouter = require("./routes/orders_routes");
const checkoutRouter = require("./routes/checkout_routes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(authRouter);
app.use(bannerRouter);
app.use(categoryRouter);
app.use(subCategoryRouter);
app.use(productRouter);
app.use(productReviewRouter);
app.use(vendorRouter);
app.use(ordersRouter);
app.use(checkoutRouter);

// MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECTION_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB error:", err));

// Server (Render compatible)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
