const express = require("express");
const ordersRouter = express.Router();
const Order = require("../models/orders_model");

ordersRouter.post("/api/orders", async (req, res) => {
  try {
    const {
      buyerFullName,
      buyerEmail,
      buyerState,
      buyerCity,
      buyerLocality,
      productName,
      productPrice,
      quantity,
      category,
      image,
      vendorId,
      buyerId,
      buyerPostalCode,
      buyerPhone,
      productDescription,
    } = req.body;
    const createdAt = new Date().getMilliseconds();
    const order = new Order({
      buyerFullName,
      buyerEmail,
      buyerState,
      buyerCity,
      buyerLocality,
      productName,
      productPrice,
      quantity,
      category,
      image,
      vendorId,
      buyerId,
      createdAt,
      buyerPostalCode,
      buyerPhone,
      productDescription,
    });
    await order.save();
    return res.status(201).json(order);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

ordersRouter.get("/api/orders/buyer/:buyerId", async (req, res) => {
  try {
    const { buyerId } = req.params;
    const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

ordersRouter.get("/api/orders/vendor/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;
    const orders = await Order.find({ vendorId }).sort({ createdAt: -1 });
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this vendor" });
    }
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

ordersRouter.patch("/api/orders/:id/delivered", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { delivered: true, processing: false },

      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    } else {
      return res.status(200).json(updatedOrder);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


ordersRouter.patch("/api/orders/:id/cancelled", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { cancelled: true, processing: false },

      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    } else {
      return res.status(200).json(updatedOrder);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

ordersRouter.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = ordersRouter;
