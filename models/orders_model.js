const mongoose = require("mongoose");
const orderSchema = mongoose.Schema({
  buyerFullName: {
    type: String,
    required: true,
  },
  buyerEmail: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  buyerId: {
    type: String,
    required: true,
  },
  vendorId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    required: true,
  },
  buyerState: {
    type: String,
    default: "",
  },
  productDescription: {
    type: String,
    required: true,
  },
  buyerCity: {
    type: String,
    default: "",
  },
  buyerLocality: {
    type: String,
    default: "",
  },
  buyerPhone: {
    type: String,
    default: null,
    trim: true,
  },
  buyerPostalCode: { type: String, default: "" },
 productPrice:{
    type: Number,
    required: true,
 },
 processing:{
    type: Boolean,
    default: true,
 },
 delivered:{
    type: Boolean,
    default: false,
 },
  cancelled:{
    type: Boolean,
    default: false,
 },
});
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
