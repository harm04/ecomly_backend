const express = require("express");
const subCategoryRouter = express.Router();
const SubCategory = require("../models/sub_category_model");

subCategoryRouter.post("/api/subcategory", async (req, res) => {
  try {
    const { categoryId, categoryName, image, subCategoryName } = req.body;
    const subCategory = new SubCategory({
      categoryId,
      categoryName,
      image,
      subCategoryName,
    });
    await subCategory.save();
    return res.status(201).send(subCategory);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

subCategoryRouter.get(
  "/api/category/:categoryName/subcategory",
  async (req, res) => {
    try {
      const { categoryName } = req.params;
      const subCategory = await SubCategory.find({
        categoryName: categoryName,
      });
      if (!subCategory || subCategory.length === 0) {
        return res.status(404).json({ message: "SubCategories not found" });
      }
     else{
       return res.status(200).json(subCategory);
     }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = subCategoryRouter;
