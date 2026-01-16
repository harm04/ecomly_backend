const express = require("express");
const vendorRouter = require("express").Router();
const Vendor = require("../models/vendor_schema");

//route to fetch vendor by user id
vendorRouter.get("/api/vendor/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const vendor = await Vendor.findOne({ vendorUserId: userId });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    return res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

vendorRouter.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");
    return res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = vendorRouter;
