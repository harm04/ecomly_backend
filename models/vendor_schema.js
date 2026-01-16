const mongoose = require("mongoose");

const vendorSchema = mongoose.Schema({
  vendorFullName: {
    type: String,
    required: true,
    trim: true,
  },
  vendorUserId:{
    type:String,
    required:true,
  },
  vendorEmail: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  locality: {
    type: String,
    default: "",
  },
  shopName: {
    type: String,
    required: true,
  },
 
  
  phone: {
    type: String,
    default: null,
    trim: true,
  },
  postalCode: { type: String, default: "" },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);
module.exports = Vendor;
