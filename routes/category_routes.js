const express = require("express");
const categoryRouter = express.Router();
const Category = require("../models/category_model");

categoryRouter.post("/api/category", async (req, res) => {
  try {
    const { name, image, banner } = req.body;
    const category = new Category({ name, image, banner });
    await category.save();
    return res.status(201).send(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

categoryRouter.get("/api/category", async (req, res) => {
  try {
    const category = await Category.find();
    return res.status(200).send(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});



module.exports = categoryRouter;
