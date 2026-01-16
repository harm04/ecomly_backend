const express = require("express");
const productRouter = express.Router();
const Product = require("../models/product_model");
const Vendor = require("../models/vendor_schema");

productRouter.post("/api/add-product", async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      quantity,
      description,
      category,
      vendorId,
      vendorFullName,

      images,
    } = req.body;
    const product = new Product({
      productName,
      productPrice,
      quantity,
      description,
      category,
      vendorId,
      vendorFullName,

      images,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/popular-products", async (req, res) => {
  try {
    const product = await Product.find({ popular: true });
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No popular products found" });
    } else {
      return res.status(200).json(product);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/recommend-products", async (req, res) => {
  try {
    const product = await Product.find({ recommend: true });
    if (!product || product.length === 0) {
      return res.status(404).json({ message: "No recommended products found" });
    } else {
      return res.status(200).json(product);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/products-by-category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category });
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: `No products found in this ${category}` });
    } else {
      return res.status(200).json(products);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/related-products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    } else {
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: productId },
      })
        .limit(10)
        .then((products) => {
          return res.status(200).json(products);
        });
      if (!relatedProducts || relatedProducts.length === 0) {
        return res.status(404).json({ message: "No related products found" });
      }
      return res.status(200).json(relatedProducts);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/search-products", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found matching the query" });
    }
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

productRouter.get("/api/product/vendor/:vendorId", async (req, res) => {
  try {
    const {vendorId} = req.params;
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const products = await Product.find({ vendorId: vendorId });
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this vendor" });
    }
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = productRouter;
