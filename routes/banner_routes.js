const express = require("express");
const bannerRouter = express.Router();
const Banner = require("../models/banner_model");

bannerRouter.post("/api/banner", async (req, res) => {
  try {
    const { image } = req.body;
    const banner = new Banner({ image });
    await banner.save();
    return res.status(201).send(banner);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

bannerRouter.get("/api/banner", async (req, res) => {
  try {
    const banner = await Banner.find();
    return res.status(200).send(banner);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = bannerRouter;
