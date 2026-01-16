const express = require("express");
const User = require("../models/user_schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Vendor = require("../models/vendor_schema");
const sendWelcomeEmail = require("../helpers/send_email");

// Create Router
const userRouter = express.Router();

// Signup Route
userRouter.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    } else {
      if (password.length < 8) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let newUser = User({ fullName, email, password: hashedPassword });
      newUser = await newUser.save();
      res.status(201).json(newUser);
      sendWelcomeEmail(email);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//signIn Route
userRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist" });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      } else {
        const token = jwt.sign({ id: user._id }, "passwordKey");
        const { password, ...userData } = user._doc;
        return res.status(200).json({ token, user: userData });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.put("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { state, city, locality, phone, postalCode } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { state, city, locality, phone, postalCode },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update user isvendor to true and create vendor profile
userRouter.post("/api/switch-to-vendor/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isVendor: true } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const {
      vendorFullName,
      vendorEmail,
      state,
      city,
      postalCode,
      locality,
      phone,
      shopName,
    } = req.body;
    const vendor = new Vendor({
      vendorFullName,
      vendorUserId: userId,
      vendorEmail,
      state,
      city,
      postalCode,
      locality,
      phone,
      shopName,
    });
    await vendor.save();

    return res.status(200).json({ updatedUser, vendor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.get("/api/users", async (req, res) => {
  try {
    //find users with isVendor false and isadmin false
    const users = await User.find({ isVendor: false, isAdmin: false }).select(
      "-password"
    );
    return res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = userRouter;
