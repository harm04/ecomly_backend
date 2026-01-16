const express = require("express");
const checkoutRouter = express.Router();
const crypto = require("crypto");
const Product = require("../models/product_model");
require("dotenv").config();
const razorpay = require("razorpay");

// ===================================
// RAZORPAY CONFIGURATION
// ===================================
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===================================
// HELPER FUNCTIONS
// ===================================

/**
 * Extract user ID from JWT middleware
 */
const extractUserId = (req) => {
  if (req.auth && req.auth.id) {
    return req.auth.id;
  }
  throw new Error("User not authenticated. Please login first.");
};

/**
 * Validate request data for order creation
 */
const validateOrderRequest = (cartItems, shippingAddress) => {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart items are required and must be an array");
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
    throw new Error("Complete shipping address is required");
  }

  // Validate each cart item
  for (const cartItem of cartItems) {
    if (!cartItem.productId || !cartItem.quantity || cartItem.quantity <= 0) {
      throw new Error("Each cart item must have valid productId and quantity");
    }
  }
};

/**
 * Generate short receipt ID for Razorpay
 */
const generateReceiptId = (userId) => {
  const shortUserId = userId.toString().slice(-6);
  const timestamp = Date.now().toString().slice(-8);
  return `rcpt_${timestamp}_${shortUserId}`;
};

/**
 * Verify Razorpay payment signature
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

// ===================================
// ROUTES
// ===================================

/**
 * Create new order and Razorpay payment
 */
checkoutRouter.post("/api/create-order", async (req, res) => {
  try {
    console.log("Starting order creation process...");

    // Extract and validate user (assuming you have auth middleware)
    // const userId = extractUserId(req);
    // For now, get userId from request body
    const { userId, cartItems, shippingAddress } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate request data
    validateOrderRequest(cartItems, shippingAddress);

    // Calculate total price and validate products
    let totalPrice = 0;
    const orderItemsDetails = [];

    for (const cartItem of cartItems) {
      // Fetch product details
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with id ${cartItem.productId} not found`,
        });
      }

      // Check stock availability
      let availableStock = product.quantity;
      if (typeof availableStock === "string") {
        availableStock = parseInt(availableStock) || 0;
      }

      if (availableStock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableStock} items left in stock for ${product.productName}`,
        });
      }

      // Calculate item total
      const itemTotal = product.productPrice * cartItem.quantity;
      totalPrice += itemTotal;

      // For response
      orderItemsDetails.push({
        product: product._id,
        name: product.productName,
        price: product.productPrice,
        quantity: cartItem.quantity,
        image: product.images[0] || "",
        size: cartItem.size || null,
        color: cartItem.color || null,
      });
    }

    console.log(`Total order amount: ₹${totalPrice}`);

    // Generate receipt ID
    const shortReceipt = generateReceiptId(userId);

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        userId: userId,
        itemCount: cartItems.length,
      },
    };

    console.log("Creating Razorpay order with receipt:", shortReceipt);
    const razorpayOrder = await razorpayInstance.orders.create(
      razorpayOrderOptions
    );

    // Return success response
    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY,
      receipt: shortReceipt,
      orderDetails: orderItemsDetails,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payment order",
      error: error.message,
    });
  }
});

/**
 * Verify Razorpay payment and update product stock
 */
checkoutRouter.post("/api/verify-payment", async (req, res) => {
  try {
    console.log("Starting payment verification...");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartItems,
      userId,
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification fields",
      });
    }

    if (!cartItems || !userId) {
      return res.status(400).json({
        success: false,
        message: "Cart items and user ID are required",
      });
    }

    console.log("🔍 Verification data received:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: "present",
    });

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      console.log("❌ Payment signature verification failed");
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    console.log("✅ Payment signature verified successfully");

    // Update product stock after successful payment
    for (const cartItem of cartItems) {
      try {
        const productId = cartItem.productId;
        const quantity = cartItem.quantity;

        console.log(
          `Updating stock for product ${productId}, quantity: ${quantity}`
        );

        // Get current product data
        const product = await Product.findById(productId);
        if (!product) {
          console.log(`Product not found: ${productId}`);
          continue;
        }

        // Convert string to number if needed
        let currentStock = product.quantity;
        if (typeof currentStock === "string") {
          currentStock = parseInt(currentStock) || 0;
        }

        // Calculate new stock (ensure it doesn't go negative)
        const newStock = Math.max(0, currentStock - quantity);

        console.log(
          `Stock update: ${currentStock} - ${quantity} = ${newStock}`
        );

        // Update with explicit value
        const result = await Product.findByIdAndUpdate(
          productId,
          { quantity: newStock },
          { new: true }
        );

        if (result) {
          console.log(
            `Stock updated for product ${productId}: ${result.quantity} remaining`
          );
        } else {
          console.log(`Failed to update product: ${productId}`);
        }
      } catch (error) {
        console.error(
          `Failed to update stock for product ${cartItem.productId}:`,
          error
        );
        // Continue with other items even if one fails
      }
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
});

/**
 * Handle payment failure
 */
checkoutRouter.post("/api/payment-failure", async (req, res) => {
  try {
    console.log("Processing payment failure...");

    const { razorpay_order_id, error_description, error_code } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    console.log(`Payment failed for order: ${razorpay_order_id}`);

    return res.status(200).json({
      success: false,
      message: "Payment failed",
      error: error_description || "Payment failed",
      errorCode: error_code,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Payment failure handling error:", error);
    return res.status(500).json({
      success: false,
      message: "Error handling payment failure",
      error: error.message,
    });
  }
});

/**
 * Get Razorpay key for frontend
 */
checkoutRouter.get("/api/razorpay-key", async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("Error fetching Razorpay key:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payment configuration",
      error: error.message,
    });
  }
});

module.exports = checkoutRouter;
